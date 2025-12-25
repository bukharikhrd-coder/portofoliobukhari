import { useState, useEffect, useCallback } from "react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { translationCache, translationQueue } from "@/lib/translationQueue";

const getCacheKey = (text: string, targetLang: Language): string => {
  return `${targetLang}:${text}`;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || language === "en") return text;

    const cacheKey = getCacheKey(text, language);
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const translations = await translationQueue.addRequest([text], language);
      return translations[0] || text;
    } catch (err) {
      console.error("Translation error:", err);
      return text;
    }
  }, [language]);

  const translateTexts = useCallback(async (texts: string[]): Promise<string[]> => {
    if (!texts.length || language === "en") return texts;

    setIsTranslating(true);
    try {
      const translations = await translationQueue.addRequest(texts, language);
      return translations;
    } catch (err) {
      console.error("Batch translation error:", err);
      return texts;
    } finally {
      setIsTranslating(false);
    }
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

    translationQueue.addRequest([originalText], language)
      .then(([translated]) => setTranslatedText(translated || originalText))
      .catch(() => setTranslatedText(originalText));
  }, [originalText, language]);

  return translatedText;
};
