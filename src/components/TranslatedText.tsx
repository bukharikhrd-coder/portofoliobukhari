import { useState, useEffect, ElementType, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translationCache, translationQueue } from "@/lib/translationQueue";

interface TranslatedTextProps {
  children: string;
  as?: ElementType;
  className?: string;
}

// Debounce translations to batch multiple requests
const pendingTranslations = new Map<string, {
  texts: Set<string>;
  callbacks: Map<string, ((translation: string) => void)[]>;
  timer: NodeJS.Timeout | null;
}>();

const debouncedTranslate = (text: string, language: string, callback: (translation: string) => void) => {
  const key = language;
  
  if (!pendingTranslations.has(key)) {
    pendingTranslations.set(key, {
      texts: new Set(),
      callbacks: new Map(),
      timer: null,
    });
  }

  const pending = pendingTranslations.get(key)!;
  pending.texts.add(text);
  
  if (!pending.callbacks.has(text)) {
    pending.callbacks.set(text, []);
  }
  pending.callbacks.get(text)!.push(callback);

  // Clear existing timer and set new one
  if (pending.timer) {
    clearTimeout(pending.timer);
  }

  pending.timer = setTimeout(async () => {
    const textsToTranslate = Array.from(pending.texts);
    const callbacksMap = new Map(pending.callbacks);
    
    // Clear the pending state
    pendingTranslations.delete(key);

    if (textsToTranslate.length === 0) return;

    try {
      const translations = await translationQueue.addRequest(textsToTranslate, language);
      
      textsToTranslate.forEach((originalText, idx) => {
        const translated = translations[idx] || originalText;
        translationCache.set(`${language}:${originalText}`, translated);
        
        const textCallbacks = callbacksMap.get(originalText) || [];
        textCallbacks.forEach(cb => cb(translated));
      });
    } catch (error) {
      console.error("Translation batch error:", error);
      // Call back with original text on error
      textsToTranslate.forEach(originalText => {
        const textCallbacks = callbacksMap.get(originalText) || [];
        textCallbacks.forEach(cb => cb(originalText));
      });
    }
  }, 150); // Wait 150ms to batch multiple requests
};

export const TranslatedText = ({ children, as: Component = "span", className }: TranslatedTextProps) => {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(children);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (language === "en" || !children) {
      setTranslated(children);
      return;
    }

    const cacheKey = `${language}:${children}`;
    if (translationCache.has(cacheKey)) {
      setTranslated(translationCache.get(cacheKey)!);
      return;
    }

    setIsLoading(true);
    
    debouncedTranslate(children, language, (result) => {
      if (mountedRef.current) {
        setTranslated(result);
        setIsLoading(false);
      }
    });
  }, [children, language]);

  return (
    <Component className={className} style={{ opacity: isLoading ? 0.7 : 1, transition: "opacity 0.2s" }}>
      {translated}
    </Component>
  );
};

// For batch translating arrays of content
export const useTranslatedContent = <T extends Record<string, any>>(
  items: T[] | undefined,
  keys: (keyof T)[]
): { items: T[]; isTranslating: boolean } => {
  const { language } = useLanguage();
  const [translatedItems, setTranslatedItems] = useState<T[]>(items || []);
  const [isTranslating, setIsTranslating] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) {
      setTranslatedItems([]);
      return;
    }

    if (language === "en") {
      setTranslatedItems(items);
      return;
    }

    // Collect all texts that need translation
    const textsToTranslate: { itemIndex: number; key: keyof T; text: string }[] = [];
    const cachedResults: Map<string, Map<keyof T, string>> = new Map();

    items.forEach((item, itemIndex) => {
      keys.forEach((key) => {
        const text = item[key];
        if (typeof text === "string" && text) {
          const cacheKey = `${language}:${text}`;
          if (translationCache.has(cacheKey)) {
            if (!cachedResults.has(String(itemIndex))) {
              cachedResults.set(String(itemIndex), new Map());
            }
            cachedResults.get(String(itemIndex))!.set(key, translationCache.get(cacheKey)!);
          } else {
            textsToTranslate.push({ itemIndex, key, text });
          }
        }
      });
    });

    // Apply cached results first
    const initialResult = items.map((item, idx) => {
      const cached = cachedResults.get(String(idx));
      if (cached) {
        const newItem = { ...item };
        cached.forEach((value, key) => {
          (newItem as any)[key] = value;
        });
        return newItem;
      }
      return item;
    });

    if (textsToTranslate.length === 0) {
      setTranslatedItems(initialResult);
      return;
    }

    setIsTranslating(true);

    // Use the queue for batch translation
    translationQueue
      .addRequest(textsToTranslate.map((t) => t.text), language)
      .then((translations) => {
        if (!mountedRef.current) return;

        const finalResult = [...initialResult];

        textsToTranslate.forEach((item, idx) => {
          const translated = translations[idx];
          if (translated) {
            translationCache.set(`${language}:${item.text}`, translated);
            (finalResult[item.itemIndex] as any)[item.key] = translated;
          }
        });

        setTranslatedItems(finalResult);
      })
      .catch(() => {
        if (mountedRef.current) {
          setTranslatedItems(initialResult);
        }
      })
      .finally(() => {
        if (mountedRef.current) {
          setIsTranslating(false);
        }
      });
  }, [items, language, keys.join(",")]);

  return { items: translatedItems, isTranslating };
};
