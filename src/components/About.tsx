import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import profilePhoto from "@/assets/profile-photo.png";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

interface AboutContent {
  section_label: string | null;
  headline_1: string | null;
  headline_2: string | null;
  description_1: string | null;
  description_2: string | null;
  stat_1_number: string | null;
  stat_1_label: string | null;
  stat_2_number: string | null;
  stat_2_label: string | null;
  stat_3_number: string | null;
  stat_3_label: string | null;
}

interface Skill {
  id: string;
  name: string;
}

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [content, setContent] = useState<AboutContent | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  useEffect(() => {
    const fetchData = async () => {
      const [contentRes, skillsRes, settingsRes] = await Promise.all([
        supabase.from("about_content").select("*").limit(1).maybeSingle(),
        supabase.from("skills").select("*").order("order_index"),
        supabase.from("site_settings").select("*").eq("key", "about_image_url").maybeSingle()
      ]);
      if (contentRes.data) setContent(contentRes.data);
      if (skillsRes.data) setSkills(skillsRes.data);
      if (settingsRes.data?.value) setProfileImageUrl(settingsRes.data.value);
    };
    fetchData();
  }, []);

  const { items: translatedSkills } = useTranslatedContent(skills, ["name"]);

  const aboutData = content || {
    section_label: "About Me",
    headline_1: "PASSIONATE ABOUT",
    headline_2: "DIGITAL CRAFT",
    description_1: "Saya adalah seorang Creative Developer & Designer dengan passion dalam menciptakan pengalaman digital yang memorable.",
    description_2: "Fokus utama saya adalah web development, desain grafis, dan pengembangan tools yang membantu meningkatkan produktivitas.",
    stat_1_number: "5+",
    stat_1_label: "Years Experience",
    stat_2_number: "50+",
    stat_2_label: "Projects Done",
    stat_3_number: "30+",
    stat_3_label: "Happy Clients",
  };

  const stats = [
    { number: aboutData.stat_1_number, label: aboutData.stat_1_label || "" },
    { number: aboutData.stat_2_number, label: aboutData.stat_2_label || "" },
    { number: aboutData.stat_3_number, label: aboutData.stat_3_label || "" },
  ];

  return (
    <section id="about" className="py-16 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-16 items-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
            style={{ y: imageY }}
          >
            <div className="relative max-w-xs mx-auto lg:max-w-none">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={profileImageUrl || profilePhoto}
                  alt="About Bukhari"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-16 md:w-24 h-16 md:h-24 border-l-2 border-t-2 border-primary" />
              <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-16 md:w-24 h-16 md:h-24 border-r-2 border-b-2 border-primary" />
            </div>
          </motion.div>

          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TranslatedText className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
                {aboutData.section_label || "About Me"}
              </TranslatedText>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 md:mt-4 leading-tight">
                <TranslatedText>{aboutData.headline_1 || ""}</TranslatedText>
                <br />
                <TranslatedText className="text-gradient">{aboutData.headline_2 || ""}</TranslatedText>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3 md:space-y-4"
            >
              <TranslatedText as="p" className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {aboutData.description_1 || ""}
              </TranslatedText>
              <TranslatedText as="p" className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {aboutData.description_2 || ""}
              </TranslatedText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-foreground font-medium mb-3 md:mb-4 text-sm md:text-base">
                <TranslatedText>Skills & Expertise</TranslatedText>
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {translatedSkills.map((skill, index) => (
                  <motion.span
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-secondary text-secondary-foreground text-xs md:text-sm border border-border hover:border-primary transition-colors duration-300"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-border"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl md:text-4xl text-primary">{stat.number}</p>
                  <TranslatedText as="p" className="text-muted-foreground text-xs md:text-sm mt-1">
                    {stat.label}
                  </TranslatedText>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
