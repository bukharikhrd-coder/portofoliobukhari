-- Create site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hero content table
CREATE TABLE public.hero_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline_1 TEXT NOT NULL DEFAULT 'BUKHARI',
  headline_2 TEXT NOT NULL DEFAULT 'S.KOM',
  subtitle TEXT NOT NULL DEFAULT 'Creative Developer & Designer',
  description TEXT,
  cta_primary_text TEXT DEFAULT 'VIEW WORKS',
  cta_primary_link TEXT DEFAULT '#works',
  cta_secondary_text TEXT DEFAULT 'GET IN TOUCH',
  cta_secondary_link TEXT DEFAULT '#contact',
  date_display TEXT DEFAULT 'DECEMBER / 2025',
  brand_name TEXT DEFAULT 'WIXBIHUB',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create about content table
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_label TEXT DEFAULT 'About Me',
  headline_1 TEXT DEFAULT 'PASSIONATE ABOUT',
  headline_2 TEXT DEFAULT 'DIGITAL CRAFT',
  description_1 TEXT,
  description_2 TEXT,
  stat_1_number TEXT DEFAULT '5+',
  stat_1_label TEXT DEFAULT 'Years Experience',
  stat_2_number TEXT DEFAULT '50+',
  stat_2_label TEXT DEFAULT 'Projects Done',
  stat_3_number TEXT DEFAULT '30+',
  stat_3_label TEXT DEFAULT 'Happy Clients',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'project',
  description TEXT,
  image_url TEXT,
  year TEXT,
  demo_url TEXT,
  github_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project tags table
CREATE TABLE public.project_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tech stack table
CREATE TABLE public.tech_stack (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Development',
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact content table
CREATE TABLE public.contact_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_label TEXT DEFAULT 'Get in Touch',
  headline_1 TEXT DEFAULT 'LET''S WORK',
  headline_2 TEXT DEFAULT 'TOGETHER',
  description TEXT,
  email TEXT DEFAULT 'hello@bukhari.dev',
  location TEXT DEFAULT 'Indonesia',
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Public read policies for portfolio display
CREATE POLICY "Public can read hero content" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Public can read about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Public can read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public can read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public can read project tags" ON public.project_tags FOR SELECT USING (true);
CREATE POLICY "Public can read tech stack" ON public.tech_stack FOR SELECT USING (true);
CREATE POLICY "Public can read contact content" ON public.contact_content FOR SELECT USING (true);
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can manage hero content" ON public.hero_content FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage about content" ON public.about_content FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage skills" ON public.skills FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage project tags" ON public.project_tags FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage tech stack" ON public.tech_stack FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage contact content" ON public.contact_content FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage admin users" ON public.admin_users FOR ALL USING (public.is_admin(auth.uid()));

-- Public can insert contact messages
CREATE POLICY "Public can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Insert default data
INSERT INTO public.hero_content (headline_1, headline_2, subtitle, description, date_display, brand_name)
VALUES ('BUKHARI', 'S.KOM', 'Creative Developer & Designer', 'Crafting digital experiences through clean code, thoughtful design, and creative innovation.', 'DECEMBER / 2025', 'WIXBIHUB');

INSERT INTO public.about_content (description_1, description_2)
VALUES (
  'Saya adalah seorang Creative Developer & Designer dengan passion dalam menciptakan pengalaman digital yang memorable. Dengan latar belakang di bidang teknologi informasi, saya menggabungkan keahlian teknis dengan sense estetika untuk menghasilkan produk digital berkualitas.',
  'Fokus utama saya adalah web development, desain grafis, dan pengembangan tools yang membantu meningkatkan produktivitas. Setiap project yang saya kerjakan selalu mengutamakan clean code, performa optimal, dan user experience yang seamless.'
);

INSERT INTO public.contact_content (description)
VALUES ('Have a project in mind? Let''s discuss how we can bring your ideas to life. I''m always open for new opportunities and collaborations.');

-- Insert default skills
INSERT INTO public.skills (name, order_index) VALUES
('React / Next.js', 1),
('TypeScript', 2),
('Node.js', 3),
('UI/UX Design', 4),
('Figma', 5),
('Tailwind CSS', 6),
('Python', 7),
('Database Design', 8);

-- Insert default tech stack
INSERT INTO public.tech_stack (name, category, order_index) VALUES
('React', 'Frontend', 1),
('Next.js', 'Frontend', 2),
('TypeScript', 'Frontend', 3),
('Tailwind CSS', 'Frontend', 4),
('Node.js', 'Backend', 5),
('PostgreSQL', 'Backend', 6),
('Figma', 'Design', 7),
('Adobe XD', 'Design', 8);

-- Insert default projects
INSERT INTO public.projects (title, category, description, image_url, year, order_index) VALUES
('E-Commerce Platform', 'website', 'Full-stack e-commerce solution with modern UI', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', '2025', 1),
('Brand Identity Design', 'design', 'Complete brand identity for tech startup', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop', '2025', 2),
('Task Automation Tool', 'tools', 'Productivity tool for workflow automation', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', '2024', 3),
('Portfolio Website', 'website', 'Creative portfolio for photographer', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop', '2024', 4),
('Mobile App UI', 'design', 'Finance app interface design', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop', '2024', 5),
('Content Management System', 'project', 'Custom CMS for media company', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop', '2024', 6);

-- Insert default project tags
INSERT INTO public.project_tags (project_id, tag)
SELECT p.id, t.tag
FROM public.projects p
CROSS JOIN (
  SELECT 'React' as tag UNION SELECT 'Node.js' UNION SELECT 'MongoDB'
) t
WHERE p.title = 'E-Commerce Platform';

INSERT INTO public.project_tags (project_id, tag)
SELECT p.id, t.tag
FROM public.projects p
CROSS JOIN (
  SELECT 'Branding' as tag UNION SELECT 'Figma' UNION SELECT 'Illustrator'
) t
WHERE p.title = 'Brand Identity Design';

INSERT INTO public.project_tags (project_id, tag)
SELECT p.id, t.tag
FROM public.projects p
CROSS JOIN (
  SELECT 'Python' as tag UNION SELECT 'Automation' UNION SELECT 'API'
) t
WHERE p.title = 'Task Automation Tool';

INSERT INTO public.project_tags (project_id, tag)
SELECT p.id, t.tag
FROM public.projects p
CROSS JOIN (
  SELECT 'Next.js' as tag UNION SELECT 'Framer Motion' UNION SELECT 'Tailwind'
) t
WHERE p.title = 'Portfolio Website';

INSERT INTO public.project_tags (project_id, tag)
SELECT p.id, t.tag
FROM public.projects p
CROSS JOIN (
  SELECT 'UI/UX' as tag UNION SELECT 'Figma' UNION SELECT 'Prototype'
) t
WHERE p.title = 'Mobile App UI';

INSERT INTO public.project_tags (project_id, tag)
SELECT p.id, t.tag
FROM public.projects p
CROSS JOIN (
  SELECT 'TypeScript' as tag UNION SELECT 'PostgreSQL' UNION SELECT 'React'
) t
WHERE p.title = 'Content Management System';

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hero_content_updated_at
BEFORE UPDATE ON public.hero_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at
BEFORE UPDATE ON public.about_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_content_updated_at
BEFORE UPDATE ON public.contact_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();