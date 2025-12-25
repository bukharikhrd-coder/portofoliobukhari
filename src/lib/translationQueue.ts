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
  private minInterval = 500; // Min 500ms between requests
  private retryDelay = 2000; // Wait 2s before retry on rate limit

  async addRequest(texts: string[], language: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.queue.push({ texts, language, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // Ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await this.sleep(this.minInterval - timeSinceLastRequest);
    }

    // Get all pending requests for the same language and batch them
    const currentLanguage = this.queue[0]?.language;
    const batchRequests: QueuedRequest[] = [];
    const remainingQueue: QueuedRequest[] = [];

    for (const req of this.queue) {
      if (req.language === currentLanguage && batchRequests.length < 5) {
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

    try {
      this.lastRequestTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: allTexts, targetLanguage: currentLanguage },
      });

      if (error) {
        // Check if it's a rate limit error
        if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
          console.log("Rate limited, requeueing requests...");
          // Requeue all requests and wait
          this.queue = [...batchRequests, ...this.queue];
          await this.sleep(this.retryDelay);
          this.isProcessing = false;
          this.processQueue();
          return;
        }
        throw error;
      }

      const translations = data?.translations || allTexts;

      // Distribute translations back to original requests
      textIndexMap.forEach(({ requestIndex, startIndex, count }) => {
        const requestTranslations = translations.slice(startIndex, startIndex + count);
        batchRequests[requestIndex].resolve(requestTranslations);
      });

    } catch (error) {
      console.error("Translation queue error:", error);
      // Return original texts on error
      batchRequests.forEach(req => req.resolve(req.texts));
    }

    this.isProcessing = false;

    // Process remaining queue
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const translationQueue = new TranslationQueue();
