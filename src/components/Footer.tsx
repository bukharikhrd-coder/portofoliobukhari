import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TranslatedText } from "./TranslatedText";
import { supabase } from "@/integrations/supabase/client";
import { icons } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
}

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data } = await supabase
        .from("footer_social_links")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (data) {
        setSocialLinks(data.filter((link) => link.url && link.url.trim() !== ""));
      }
    };
    fetchSocialLinks();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = icons[iconName as keyof typeof icons];
    if (!IconComponent) return null;
    return <IconComponent size={20} />;
  };

  return (
    <footer className="py-8 md:py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6 lg:gap-8">
            <Link to="/" className="font-display text-xl md:text-2xl tracking-tight">
              BUKHARI<span className="text-gradient">, S.KOM</span>
            </Link>
            
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2, scale: 1.1 }}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    title={link.platform}
                  >
                    {renderIcon(link.icon_name)}
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <p className="text-muted-foreground text-xs md:text-sm text-center">
              © {new Date().getFullYear()} <TranslatedText>All Rights Reserved</TranslatedText>
            </p>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -4 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <span className="text-xs md:text-sm tracking-wide"><TranslatedText>Back to Top</TranslatedText></span>
              <ArrowUp size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
