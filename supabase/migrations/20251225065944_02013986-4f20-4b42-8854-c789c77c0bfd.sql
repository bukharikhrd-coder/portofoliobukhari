-- Create table to store section order and visibility configuration
CREATE TABLE public.section_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.section_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read section config (for displaying sections)
CREATE POLICY "Section config is viewable by everyone" 
ON public.section_config 
FOR SELECT 
USING (true);

-- Only admins can update section config
CREATE POLICY "Only admins can update section config" 
ON public.section_config 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Only admins can insert section config
CREATE POLICY "Only admins can insert section config" 
ON public.section_config 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_section_config_updated_at
BEFORE UPDATE ON public.section_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections in order (excluding Navbar and Hero)
INSERT INTO public.section_config (section_key, section_name, order_index, is_visible) VALUES
  ('about', 'About Me', 0, true),
  ('techstack', 'Tech Stack', 1, true),
  ('experience', 'Work Experience', 2, true),
  ('education', 'Education', 3, true),
  ('trainings', 'Training & Certification', 4, true),
  ('languages', 'Language Skills', 5, true),
  ('works', 'Works / Projects', 6, true),
  ('videoportfolio', 'Video Portfolio', 7, true),
  ('softwaretools', 'Software Tools', 8, true),
  ('workjourney', 'Work Journey Gallery', 9, true),
  ('contact', 'Contact', 10, true);