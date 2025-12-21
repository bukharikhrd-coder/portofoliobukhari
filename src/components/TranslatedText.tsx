import { ReactNode, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache
const translationCache = new Map<string, string>();

interface TranslatedTextProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const TranslatedText = ({ children, as: Component = "span", className }: TranslatedTextProps) => {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

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
    supabase.functions
      .invoke("translate", {
        body: { texts: [children], targetLanguage: language },
      })
      .then(({ data, error }) => {
        if (!error && data?.translations?.[0]) {
          translationCache.set(cacheKey, data.translations[0]);
          setTranslated(data.translations[0]);
        }
      })
      .finally(() => setIsLoading(false));
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
    
    // Batch translate
    supabase.functions
      .invoke("translate", {
        body: {
          texts: textsToTranslate.map((t) => t.text),
          targetLanguage: language,
        },
      })
      .then(({ data, error }) => {
        if (!error && data?.translations) {
          const finalResult = [...initialResult];
          
          textsToTranslate.forEach((item, idx) => {
            const translated = data.translations[idx];
            if (translated) {
              translationCache.set(`${language}:${item.text}`, translated);
              (finalResult[item.itemIndex] as any)[item.key] = translated;
            }
          });

          setTranslatedItems(finalResult);
        } else {
          setTranslatedItems(initialResult);
        }
      })
      .finally(() => setIsTranslating(false));
  }, [items, language, keys.join(",")]);

  return { items: translatedItems, isTranslating };
};
