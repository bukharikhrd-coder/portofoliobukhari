-- Add show_link column to projects table
ALTER TABLE public.projects ADD COLUMN show_link boolean DEFAULT true;

-- Create footer_social_links table
CREATE TABLE public.footer_social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_social_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read footer social links" 
ON public.footer_social_links 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage footer social links" 
ON public.footer_social_links 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_footer_social_links_updated_at
BEFORE UPDATE ON public.footer_social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default social links
INSERT INTO public.footer_social_links (platform, url, icon_name, is_active, order_index) VALUES
('LinkedIn', '', 'Linkedin', true, 0),
('GitHub', '', 'Github', true, 1),
('Instagram', '', 'Instagram', true, 2),
('Twitter', '', 'Twitter', true, 3);