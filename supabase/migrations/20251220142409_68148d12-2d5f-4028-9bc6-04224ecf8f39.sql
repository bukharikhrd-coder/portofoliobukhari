-- Add separate about image URL key
INSERT INTO public.site_settings (key, value) 
VALUES ('about_image_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- Create work journey gallery table
CREATE TABLE public.work_journey_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  year TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_journey_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read work journey gallery" 
ON public.work_journey_gallery 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage work journey gallery" 
ON public.work_journey_gallery 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_work_journey_gallery_updated_at
BEFORE UPDATE ON public.work_journey_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();