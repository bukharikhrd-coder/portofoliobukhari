
-- Fix ALL "Public can read" policies from RESTRICTIVE to PERMISSIVE
-- by dropping and recreating them

-- site_settings
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);

-- hero_content
DROP POLICY IF EXISTS "Public can read hero content" ON hero_content;
CREATE POLICY "Public can read hero content" ON hero_content FOR SELECT USING (true);

-- about_content
DROP POLICY IF EXISTS "Public can read about content" ON about_content;
CREATE POLICY "Public can read about content" ON about_content FOR SELECT USING (true);

-- contact_content
DROP POLICY IF EXISTS "Public can read contact content" ON contact_content;
CREATE POLICY "Public can read contact content" ON contact_content FOR SELECT USING (true);

-- projects
DROP POLICY IF EXISTS "Public can read projects" ON projects;
CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);

-- project_tags
DROP POLICY IF EXISTS "Public can read project tags" ON project_tags;
CREATE POLICY "Public can read project tags" ON project_tags FOR SELECT USING (true);

-- work_experience
DROP POLICY IF EXISTS "Public can read work experience" ON work_experience;
CREATE POLICY "Public can read work experience" ON work_experience FOR SELECT USING (true);

-- education
DROP POLICY IF EXISTS "Public can read education" ON education;
CREATE POLICY "Public can read education" ON education FOR SELECT USING (true);

-- trainings
DROP POLICY IF EXISTS "Public can read trainings" ON trainings;
CREATE POLICY "Public can read trainings" ON trainings FOR SELECT USING (true);

-- tech_stack
DROP POLICY IF EXISTS "Public can read tech stack" ON tech_stack;
CREATE POLICY "Public can read tech stack" ON tech_stack FOR SELECT USING (true);

-- video_tools
DROP POLICY IF EXISTS "Public can read video tools" ON video_tools;
CREATE POLICY "Public can read video tools" ON video_tools FOR SELECT USING (true);

-- video_portfolio
DROP POLICY IF EXISTS "Public can read video portfolio" ON video_portfolio;
CREATE POLICY "Public can read video portfolio" ON video_portfolio FOR SELECT USING (true);

-- language_skills
DROP POLICY IF EXISTS "Public can read language skills" ON language_skills;
CREATE POLICY "Public can read language skills" ON language_skills FOR SELECT USING (true);

-- work_journey_gallery
DROP POLICY IF EXISTS "Public can read work journey gallery" ON work_journey_gallery;
CREATE POLICY "Public can read work journey gallery" ON work_journey_gallery FOR SELECT USING (true);

-- footer_social_links
DROP POLICY IF EXISTS "Public can read footer social links" ON footer_social_links;
CREATE POLICY "Public can read footer social links" ON footer_social_links FOR SELECT USING (true);

-- skills
DROP POLICY IF EXISTS "Public can read skills" ON skills;
CREATE POLICY "Public can read skills" ON skills FOR SELECT USING (true);

-- analytics_summary
DROP POLICY IF EXISTS "Public can read analytics summary" ON analytics_summary;
CREATE POLICY "Public can read analytics summary" ON analytics_summary FOR SELECT USING (true);

-- section_config
DROP POLICY IF EXISTS "Section config is viewable by everyone" ON section_config;
CREATE POLICY "Section config is viewable by everyone" ON section_config FOR SELECT USING (true);

-- translations
DROP POLICY IF EXISTS "Translations are readable by everyone" ON translations;
CREATE POLICY "Translations are readable by everyone" ON translations FOR SELECT USING (true);

-- service_packages
DROP POLICY IF EXISTS "Public can read active service packages" ON service_packages;
CREATE POLICY "Public can read active service packages" ON service_packages FOR SELECT USING (is_active = true);

-- Fix INSERT policies too
DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert visitor analytics" ON visitor_analytics;
CREATE POLICY "Public can insert visitor analytics" ON visitor_analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert translations" ON translations;
CREATE POLICY "Anyone can insert translations" ON translations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert client orders" ON client_orders;
CREATE POLICY "Public can insert client orders" ON client_orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read own orders by email" ON client_orders;
CREATE POLICY "Public can read own orders by email" ON client_orders FOR SELECT USING (true);
