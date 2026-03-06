
ALTER TABLE public.language_skills ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.video_portfolio ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.tech_stack ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
