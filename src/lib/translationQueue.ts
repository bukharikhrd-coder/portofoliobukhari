import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache
export const translationCache = new Map<string, string>();

// Request queue for rate limiting
interface QueuedRequest {
  texts: string[];
  language: string;
  resolve: (translations: string[]) => void;
  reject: (error: Error) => void;
}

class TranslationQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minInterval = 2000; // Min 2s between requests
  private retryDelay = 5000; // Wait 5s before retry on rate limit
  private consecutiveErrors = 0;
  private backoffMultiplier = 1;

  async addRequest(texts: string[], language: string): Promise<string[]> {
    // Filter out texts that are already cached
    const uncachedTexts: string[] = [];
    const cachedResults: Map<number, string> = new Map();
    
    texts.forEach((text, idx) => {
      const cacheKey = `${language}:${text}`;
      if (translationCache.has(cacheKey)) {
        cachedResults.set(idx, translationCache.get(cacheKey)!);
      } else {
        uncachedTexts.push(text);
      }
    });

    // If all texts are cached, return immediately
    if (uncachedTexts.length === 0) {
      return texts.map((text, idx) => cachedResults.get(idx) || text);
    }

    return new Promise((resolve) => {
      this.queue.push({ 
        texts: uncachedTexts, 
        language, 
        resolve: (translations) => {
          // Merge cached and new translations
          const result: string[] = [];
          let uncachedIdx = 0;
          texts.forEach((text, idx) => {
            if (cachedResults.has(idx)) {
              result.push(cachedResults.get(idx)!);
            } else {
              result.push(translations[uncachedIdx++] || text);
            }
          });
          resolve(result);
        }, 
        reject: () => resolve(texts) // Fallback to original on error
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // Apply exponential backoff based on consecutive errors
    const currentInterval = this.minInterval * this.backoffMultiplier;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < currentInterval) {
      await this.sleep(currentInterval - timeSinceLastRequest);
    }

    // Get all pending requests for the same language and batch them together
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

    // Combine all texts from batched requests
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

    // Limit batch size to prevent timeout
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
          
          // Requeue all requests
          this.queue = [...batchRequests, ...this.queue];
          await this.sleep(this.retryDelay * this.backoffMultiplier);
          this.isProcessing = false;
          this.processQueue();
          return;
        }
        throw error;
      }

      // Success - reset backoff
      this.consecutiveErrors = 0;
      this.backoffMultiplier = 1;

      const translations = data?.translations || textsToSend;

      // Cache all translations
      textsToSend.forEach((text, idx) => {
        const translated = translations[idx] || text;
        translationCache.set(`${currentLanguage}:${text}`, translated);
      });

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
      
      // Return original texts on error
      batchRequests.forEach(req => req.resolve(req.texts));
    }

    this.isProcessing = false;

    // Process remaining queue with delay
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), this.minInterval);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const translationQueue = new TranslationQueue();
