import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache (session-only)
export const translationCache = new Map<string, string>();

// Request queue for rate limiting
interface QueuedRequest {
  texts: string[];
  language: string;
  resolve: (translations: string[]) => void;
  reject: (error: Error) => void;
}

// Load translations from database into memory cache
const loadFromDatabase = async (texts: string[], language: string): Promise<Map<string, string>> => {
  const results = new Map<string, string>();
  
  if (texts.length === 0) return results;
  
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("original_text, translated_text")
      .eq("target_language", language)
      .in("original_text", texts);

    if (!error && data) {
      data.forEach((row) => {
        results.set(row.original_text, row.translated_text);
        // Also update memory cache
        translationCache.set(`${language}:${row.original_text}`, row.translated_text);
      });
    }
  } catch (err) {
    console.error("Error loading translations from database:", err);
  }
  
  return results;
};

// Save translations to database
const saveToDatabase = async (translations: { original: string; translated: string }[], language: string) => {
  if (translations.length === 0) return;
  
  try {
    const records = translations.map((t) => ({
      original_text: t.original,
      translated_text: t.translated,
      target_language: language,
    }));

    // Use upsert to avoid duplicates
    await supabase
      .from("translations")
      .upsert(records, { 
        onConflict: "original_text,target_language",
        ignoreDuplicates: true 
      });
  } catch (err) {
    console.error("Error saving translations to database:", err);
  }
};

class TranslationQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minInterval = 2000;
  private retryDelay = 5000;
  private consecutiveErrors = 0;
  private backoffMultiplier = 1;

  async addRequest(texts: string[], language: string): Promise<string[]> {
    // Step 1: Check memory cache
    const uncachedTexts: string[] = [];
    const memCachedResults: Map<number, string> = new Map();
    
    texts.forEach((text, idx) => {
      const cacheKey = `${language}:${text}`;
      if (translationCache.has(cacheKey)) {
        memCachedResults.set(idx, translationCache.get(cacheKey)!);
      } else {
        uncachedTexts.push(text);
      }
    });

    // If all in memory cache, return immediately
    if (uncachedTexts.length === 0) {
      return texts.map((text, idx) => memCachedResults.get(idx) || text);
    }

    // Step 2: Check database cache for uncached texts
    const dbCached = await loadFromDatabase(uncachedTexts, language);
    
    // Update what we still need to translate
    const stillUncached: string[] = [];
    uncachedTexts.forEach((text) => {
      if (!dbCached.has(text)) {
        stillUncached.push(text);
      }
    });

    // If all found in database, return results
    if (stillUncached.length === 0) {
      return texts.map((text, idx) => {
        if (memCachedResults.has(idx)) return memCachedResults.get(idx)!;
        const cacheKey = `${language}:${text}`;
        return translationCache.get(cacheKey) || text;
      });
    }

    // Step 3: Queue API request for remaining texts
    return new Promise((resolve) => {
      this.queue.push({ 
        texts: stillUncached, 
        language, 
        resolve: (apiTranslations) => {
          // Combine all results
          const result: string[] = [];
          let uncachedIdx = 0;
          let apiIdx = 0;
          
          texts.forEach((text, idx) => {
            if (memCachedResults.has(idx)) {
              result.push(memCachedResults.get(idx)!);
            } else {
              const cacheKey = `${language}:${text}`;
              if (translationCache.has(cacheKey)) {
                result.push(translationCache.get(cacheKey)!);
              } else if (stillUncached.includes(text)) {
                result.push(apiTranslations[apiIdx++] || text);
              } else {
                result.push(text);
              }
            }
          });
          resolve(result);
        }, 
        reject: () => resolve(texts)
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    const currentInterval = this.minInterval * this.backoffMultiplier;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < currentInterval) {
      await this.sleep(currentInterval - timeSinceLastRequest);
    }

    const currentLanguage = this.queue[0]?.language;
    const batchRequests: QueuedRequest[] = [];
    const remainingQueue: QueuedRequest[] = [];

    for (const req of this.queue) {
      if (req.language === currentLanguage) {
        batchRequests.push(req);
      } else {
        remainingQueue.push(req);
      }
    }

    this.queue = remainingQueue;

    if (batchRequests.length === 0) {
      this.isProcessing = false;
      return;
    }

    const allTexts: string[] = [];
    const textIndexMap: { requestIndex: number; startIndex: number; count: number }[] = [];

    batchRequests.forEach((req, reqIdx) => {
      textIndexMap.push({
        requestIndex: reqIdx,
        startIndex: allTexts.length,
        count: req.texts.length,
      });
      allTexts.push(...req.texts);
    });

    const maxBatchSize = 30;
    const textsToSend = allTexts.slice(0, maxBatchSize);

    try {
      this.lastRequestTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: textsToSend, targetLanguage: currentLanguage },
      });

      if (error) {
        const errorMsg = error.message || "";
        if (errorMsg.includes("429") || errorMsg.includes("Rate limit")) {
          console.log("Rate limited, increasing backoff and requeueing...");
          this.consecutiveErrors++;
          this.backoffMultiplier = Math.min(8, Math.pow(2, this.consecutiveErrors));
          
          this.queue = [...batchRequests, ...this.queue];
          await this.sleep(this.retryDelay * this.backoffMultiplier);
          this.isProcessing = false;
          this.processQueue();
          return;
        }
        throw error;
      }

      this.consecutiveErrors = 0;
      this.backoffMultiplier = 1;

      const translations = data?.translations || textsToSend;

      // Save to database and memory cache
      const toSave: { original: string; translated: string }[] = [];
      textsToSend.forEach((text, idx) => {
        const translated = translations[idx] || text;
        translationCache.set(`${currentLanguage}:${text}`, translated);
        if (translated !== text) {
          toSave.push({ original: text, translated });
        }
      });

      // Save to database in background
      saveToDatabase(toSave, currentLanguage);

      // Distribute translations back to original requests
      textIndexMap.forEach(({ requestIndex, startIndex, count }) => {
        const requestTranslations: string[] = [];
        for (let i = 0; i < count; i++) {
          const globalIdx = startIndex + i;
          if (globalIdx < translations.length) {
            requestTranslations.push(translations[globalIdx]);
          } else {
            requestTranslations.push(batchRequests[requestIndex].texts[i]);
          }
        }
        batchRequests[requestIndex].resolve(requestTranslations);
      });

    } catch (error) {
      console.error("Translation queue error:", error);
      this.consecutiveErrors++;
      this.backoffMultiplier = Math.min(8, Math.pow(2, this.consecutiveErrors));
      batchRequests.forEach(req => req.resolve(req.texts));
    }

    this.isProcessing = false;

    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), this.minInterval);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const translationQueue = new TranslationQueue();
