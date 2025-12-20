-- Work Experience Table
CREATE TABLE public.work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read work experience" ON public.work_experience
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage work experience" ON public.work_experience
  FOR ALL USING (is_admin(auth.uid()));

CREATE TRIGGER update_work_experience_updated_at
  BEFORE UPDATE ON public.work_experience
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Education Table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_year TEXT NOT NULL,
  end_year TEXT,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read education" ON public.education
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage education" ON public.education
  FOR ALL USING (is_admin(auth.uid()));

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON public.education
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Language Skills Table
CREATE TABLE public.language_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_name TEXT NOT NULL,
  proficiency_level TEXT NOT NULL DEFAULT 'Intermediate',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.language_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read language skills" ON public.language_skills
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage language skills" ON public.language_skills
  FOR ALL USING (is_admin(auth.uid()));

-- Video Tools Table
CREATE TABLE public.video_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT,
  proficiency_level TEXT DEFAULT 'Intermediate',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read video tools" ON public.video_tools
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage video tools" ON public.video_tools
  FOR ALL USING (is_admin(auth.uid()));

-- Video Portfolio Table
CREATE TABLE public.video_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  platform TEXT DEFAULT 'youtube',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read video portfolio" ON public.video_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage video portfolio" ON public.video_portfolio
  FOR ALL USING (is_admin(auth.uid()));

CREATE TRIGGER update_video_portfolio_updated_at
  BEFORE UPDATE ON public.video_portfolio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Visitor Analytics Table
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert visitor analytics" ON public.visitor_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read visitor analytics" ON public.visitor_analytics
  FOR SELECT USING (is_admin(auth.uid()));

-- Analytics Summary View
CREATE TABLE public.analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_pageviews BIGINT DEFAULT 0,
  total_unique_visitors BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read analytics summary" ON public.analytics_summary
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage analytics summary" ON public.analytics_summary
  FOR ALL USING (is_admin(auth.uid()));

-- Insert initial analytics summary
INSERT INTO public.analytics_summary (total_pageviews, total_unique_visitors) VALUES (0, 0);

-- Insert sample data for work experience
INSERT INTO public.work_experience (company_name, position, start_date, end_date, is_current, description, location, order_index)
VALUES 
  ('WIXBIHUB', 'Creative Developer', '2023', NULL, true, 'Developing creative web solutions and digital experiences', 'Indonesia', 1),
  ('Freelance', 'Web Designer', '2020', '2023', false, 'Designed and developed websites for various clients', 'Remote', 2);

-- Insert sample education data
INSERT INTO public.education (institution, degree, field_of_study, start_year, end_year, is_current, description, location, order_index)
VALUES 
  ('Universitas', 'S.Kom', 'Teknik Informatika', '2018', '2022', false, 'Graduated with honors in Computer Science', 'Indonesia', 1);

-- Insert sample language skills
INSERT INTO public.language_skills (language_name, proficiency_level, order_index)
VALUES 
  ('Bahasa Indonesia', 'Native', 1),
  ('English', 'Professional', 2),
  ('Arabic', 'Basic', 3);

-- Insert sample video tools
INSERT INTO public.video_tools (name, icon_name, proficiency_level, order_index)
VALUES 
  ('Adobe After Effects', 'Video', 'Advanced', 1),
  ('Adobe Premiere Pro', 'Film', 'Advanced', 2),
  ('DaVinci Resolve', 'Tv', 'Intermediate', 3),
  ('CapCut', 'Smartphone', 'Expert', 4);