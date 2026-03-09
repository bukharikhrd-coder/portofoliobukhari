ALTER TABLE public.video_tools ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
ALTER TABLE public.tech_stack ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;