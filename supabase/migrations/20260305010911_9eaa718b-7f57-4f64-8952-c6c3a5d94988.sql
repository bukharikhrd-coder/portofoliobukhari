
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.work_journey_gallery ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
