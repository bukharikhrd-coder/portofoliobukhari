import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
}

const HeroModern = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

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
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-3 sm:px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Text side */}
          <motion.div 
            className="space-y-4 md:space-y-6 order-2 lg:order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-1 md:space-y-2">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg sm:text-2xl md:text-3xl text-foreground/80 font-body"
              >
                Halo 👋 <TranslatedText>Saya</TranslatedText>
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display leading-[0.9] text-primary"
              >
                {heroData.headline_1}
                <br />
                {heroData.headline_2}
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <TranslatedText as="p" className="text-muted-foreground text-sm md:text-lg max-w-lg leading-relaxed">
                {heroData.description || ""}
              </TranslatedText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap gap-2 sm:gap-3 pt-2"
            >
              <a
                href={heroData.cta_primary_link || "#works"}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                <TranslatedText>{heroData.cta_primary_text || "VIEW WORKS"}</TranslatedText>
              </a>
              <a
                href={heroData.cta_secondary_link || "#contact"}
                className="px-6 py-3 border-2 border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <TranslatedText>{heroData.cta_secondary_text || "GET IN TOUCH"}</TranslatedText>
              </a>
            </motion.div>
          </motion.div>

          {/* Photo side */}
          <motion.div
            className="relative order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="relative">
              {/* Background gradient circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5 rounded-[2rem] -rotate-3 scale-105" />
              <div className="relative overflow-hidden rounded-[2rem] aspect-[4/5] max-w-md w-full shadow-2xl">
                <img
                  src={profileImageUrl || profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating decorative elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-2xl backdrop-blur-sm flex items-center justify-center text-2xl"
              >
                💻
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 w-14 h-14 bg-primary/20 rounded-2xl backdrop-blur-sm flex items-center justify-center text-xl"
              >
                🎨
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroModern;
