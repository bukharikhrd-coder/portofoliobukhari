import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TranslatedText } from "@/components/TranslatedText";
import { supabase } from "@/integrations/supabase/client";
import { icons } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
}

const FooterModern = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data } = await supabase
        .from("footer_social_links")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      if (data) setSocialLinks(data.filter((l) => l.url?.trim()));
    };
    fetchSocialLinks();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  return (
    <footer className="py-10 md:py-14 border-t border-border/50 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display text-sm">
                B
              </div>
              <span className="font-body font-semibold text-foreground">
                Bukhari <span className="text-primary">S.Kom</span>
              </span>
            </Link>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    whileHover={{ y: -2, scale: 1.1 }}
                    className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    title={link.platform}>
                    {renderIcon(link.icon_name)}
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <p className="text-muted-foreground text-xs md:text-sm">
              © {new Date().getFullYear()} <TranslatedText>All Rights Reserved</TranslatedText>
            </p>
            <motion.button onClick={scrollToTop} whileHover={{ y: -4 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <span className="text-xs md:text-sm"><TranslatedText>Back to Top</TranslatedText></span>
              <ArrowUp size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterModern;
