-- Add profile_image_url to site_settings if not exists
INSERT INTO public.site_settings (key, value)
VALUES ('profile_image_url', NULL)
ON CONFLICT (key) DO NOTHING;