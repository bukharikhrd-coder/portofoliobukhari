import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import profilePhoto from "@/assets/profile-photo.png";
import { TranslatedText } from "@/components/TranslatedText";

interface HeroContent {
  headline_1: string;
  headline_2: string;
  subtitle: string;
  description: string | null;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  cta_secondary_text: string | null;
  cta_secondary_link: string | null;
  date_display: string | null;
  brand_name: string | null;
}

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<HeroContent | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  useEffect(() => {
    const fetchContent = async () => {
      const [heroRes, settingsRes] = await Promise.all([
        supabase.from("hero_content").select("*").limit(1).maybeSingle(),
        supabase.from("site_settings").select("*").eq("key", "hero_image_url").maybeSingle()
      ]);
      if (heroRes.data) setContent(heroRes.data);
      if (settingsRes.data?.value) setProfileImageUrl(settingsRes.data.value);
    };
    fetchContent();
  }, []);

  const heroData = content || {
    headline_1: "BUKHARI",
    headline_2: "S.KOM",
    subtitle: "Creative Developer & Designer",
    description: "Crafting digital experiences through clean code, thoughtful design, and creative innovation.",
    cta_primary_text: "VIEW WORKS",
    cta_primary_link: "#works",
    cta_secondary_text: "GET IN TOUCH",
    cta_secondary_link: "#contact",
    date_display: "DECEMBER / 2025",
    brand_name: "WIXBIHUB",
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      <motion.div className="absolute inset-0 opacity-5" style={{ y }}>
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-foreground" />
        <div className="absolute left-2/4 top-0 bottom-0 w-px bg-foreground" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-foreground" />
      </motion.div>

      <motion.div 
        className="container mx-auto px-6 lg:px-12 relative z-10"
        style={{ opacity, scale }}
      >
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-px bg-primary" />
              <TranslatedText className="text-muted-foreground text-sm tracking-[0.3em] uppercase">
                {heroData.subtitle}
              </TranslatedText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="font-display text-[clamp(3rem,12vw,10rem)] leading-[0.85] tracking-tight">
                <span className="block text-foreground">{heroData.headline_1}</span>
                <span className="block text-gradient">{heroData.headline_2}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TranslatedText as="p" className="text-muted-foreground text-lg max-w-md leading-relaxed">
                {heroData.description || ""}
              </TranslatedText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <a
                href={heroData.cta_primary_link || "#works"}
                className="px-8 py-4 bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-all duration-300"
              >
                <TranslatedText>{heroData.cta_primary_text || "VIEW WORKS"}</TranslatedText>
              </a>
              <a
                href={heroData.cta_secondary_link || "#contact"}
                className="px-8 py-4 border border-border text-foreground font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300"
              >
                <TranslatedText>{heroData.cta_secondary_text || "GET IN TOUCH"}</TranslatedText>
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -top-8 right-0 lg:top-0 lg:right-0 text-right z-20"
            >
              <p className="text-muted-foreground text-sm tracking-[0.2em]">{heroData.date_display}</p>
              <p className="text-foreground font-medium mt-1">{heroData.brand_name}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mt-16 lg:mt-12"
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={profileImageUrl || profilePhoto}
                  alt="Bukhari S.Kom - Creative Developer"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 -z-10" />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <TranslatedText className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Scroll</TranslatedText>
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
