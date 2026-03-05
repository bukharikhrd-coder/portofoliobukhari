
ALTER TABLE public.work_experience ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.video_tools ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
