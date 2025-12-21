import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// In-memory cache for translations
const translationCache = new Map<string, string>();

const getCacheKey = (text: string, targetLang: Language): string => {
  return `${targetLang}:${text}`;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingTranslations = useRef<Map<string, Promise<string>>>(new Map());

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || language === "en") return text;

    const cacheKey = getCacheKey(text, language);
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // Check if translation is already pending
    if (pendingTranslations.current.has(cacheKey)) {
      return pendingTranslations.current.get(cacheKey)!;
    }

    // Create translation promise
    const translationPromise = (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("translate", {
          body: { texts: [text], targetLanguage: language },
        });

        if (error) throw error;

        const translated = data?.translations?.[0] || text;
        translationCache.set(cacheKey, translated);
        return translated;
      } catch (err) {
        console.error("Translation error:", err);
        return text;
      } finally {
        pendingTranslations.current.delete(cacheKey);
      }
    })();

    pendingTranslations.current.set(cacheKey, translationPromise);
    return translationPromise;
  }, [language]);

  const translateTexts = useCallback(async (texts: string[]): Promise<string[]> => {
    if (!texts.length || language === "en") return texts;

    const results: string[] = [];
    const textsToTranslate: { index: number; text: string }[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const cacheKey = getCacheKey(texts[i], language);
      if (translationCache.has(cacheKey)) {
        results[i] = translationCache.get(cacheKey)!;
      } else {
        textsToTranslate.push({ index: i, text: texts[i] });
        results[i] = texts[i]; // placeholder
      }
    }

    if (textsToTranslate.length === 0) return results;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { 
          texts: textsToTranslate.map(t => t.text), 
          targetLanguage: language 
        },
      });

      if (error) throw error;

      const translations = data?.translations || [];
      textsToTranslate.forEach((item, idx) => {
        const translated = translations[idx] || item.text;
        translationCache.set(getCacheKey(item.text, language), translated);
        results[item.index] = translated;
      });
    } catch (err) {
      console.error("Batch translation error:", err);
    } finally {
      setIsTranslating(false);
    }

    return results;
  }, [language]);

  return {
    language,
    translateText,
    translateTexts,
    isTranslating,
  };
};

// Hook for translating static content with automatic re-translation on language change
export const useTranslatedText = (originalText: string): string => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText);
  const { translateText } = useTranslation();

  useEffect(() => {
    if (language === "en") {
      setTranslatedText(originalText);
      return;
    }

    const cacheKey = getCacheKey(originalText, language);
    if (translationCache.has(cacheKey)) {
      setTranslatedText(translationCache.get(cacheKey)!);
      return;
    }

    translateText(originalText).then(setTranslatedText);
  }, [originalText, language, translateText]);

  return translatedText;
};
