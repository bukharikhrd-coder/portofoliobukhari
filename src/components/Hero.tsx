import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import profilePhoto from "@/assets/profile-photo.png";

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
        supabase.from("site_settings").select("*").eq("key", "profile_image_url").maybeSingle()
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
      
      {/* Background text - BUKHARI S.KOM */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{ y }}
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-[clamp(4rem,20vw,18rem)] font-bold tracking-tighter whitespace-nowrap text-foreground/20"
        >
          {heroData.headline_1} {heroData.headline_2}
        </motion.h1>
      </motion.div>

      <motion.div 
        className="container mx-auto px-6 lg:px-12 relative z-10"
        style={{ opacity, scale }}
      >
        {/* Date and brand - top right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute top-8 right-6 lg:right-12 text-right z-20"
        >
          <p className="text-muted-foreground text-sm tracking-[0.2em]">{heroData.date_display}</p>
          <p className="text-foreground font-medium mt-1">{heroData.brand_name}</p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-screen py-20">
          {/* Left text content */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-px bg-primary" />
              <span className="text-muted-foreground text-sm tracking-[0.3em] uppercase">
                {heroData.subtitle}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted-foreground text-sm lg:text-base leading-relaxed"
            >
              {heroData.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-3 pt-4"
            >
              <a
                href={heroData.cta_primary_link || "#works"}
                className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-primary/90 transition-all duration-300"
              >
                {heroData.cta_primary_text}
              </a>
              <a
                href={heroData.cta_secondary_link || "#contact"}
                className="px-6 py-3 border border-border text-foreground text-sm font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300"
              >
                {heroData.cta_secondary_text}
              </a>
            </motion.div>
          </div>

          {/* Center - Profile Image (in front of background text) */}
          <div className="lg:col-span-4 relative order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-10"
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
            >
              <div className="relative aspect-[3/4] overflow-hidden mx-auto max-w-[350px] lg:max-w-[400px]">
                <img
                  src={profileImageUrl || profilePhoto}
                  alt="Bukhari S.Kom - Creative Developer"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
            </motion.div>
          </div>

          {/* Right text content - empty for balance or add more info */}
          <div className="lg:col-span-4 order-3 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-right"
            >
              <p className="text-muted-foreground text-sm leading-relaxed">
                Crafting digital experiences through clean code, thoughtful design, and creative innovation. Building the future, one project at a time.
              </p>
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
            <span className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
