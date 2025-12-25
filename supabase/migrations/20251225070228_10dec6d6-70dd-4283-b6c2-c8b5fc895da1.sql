-- Create table to cache translations
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(original_text, target_language)
);

-- Create index for fast lookups
CREATE INDEX idx_translations_lookup ON public.translations(original_text, target_language);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read translations (for caching)
CREATE POLICY "Translations are readable by everyone" 
ON public.translations 
FOR SELECT 
USING (true);

-- Anyone can insert translations (for caching new ones)
CREATE POLICY "Anyone can insert translations" 
ON public.translations 
FOR INSERT 
WITH CHECK (true);