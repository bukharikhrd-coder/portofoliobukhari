import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Loader2, Code2 } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

interface TechItem {
  id: string;
  name: string;
  category: string | null;
  icon_name: string | null;
  order_index: number | null;
}

const TechStackModern = () => {
  const { data: technologies, isLoading } = useQuery({
    queryKey: ["tech_stack"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tech_stack").select("*").eq("is_visible", true).order("category").order("order_index");
      if (error) throw error;
      return data as TechItem[];
    },
  });

  const { items: translatedTech } = useTranslatedContent(
    technologies && technologies.length > 0 ? technologies : undefined, ["category"]
  );
  const displayTech = translatedTech.length > 0 ? translatedTech : (technologies || []);

  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return Code2;
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) return icon as LucideIcon;
    return Code2;
  };

  if (isLoading) {
    return <section id="tech" className="py-20"><div className="container mx-auto px-6 flex items-center justify-center min-h-[200px]"><Loader2 className="animate-spin text-primary" size={32} /></div></section>;
  }
  if (!technologies || technologies.length === 0) return null;

  return (
    <section id="tech" className="py-8 md:py-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 25, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} viewport={{ once: true, margin: "-50px" }} className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-full tracking-wide">
            <TranslatedText>Technologies</TranslatedText>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-4">
            <TranslatedText>SKILLS</TranslatedText> & <span className="text-primary"><TranslatedText>STACK</TranslatedText></span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm md:text-base">
            <TranslatedText>Technologies and tools I use to bring ideas to life</TranslatedText>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {displayTech.map((tech, index) => {
            const IconComponent = getIcon(tech.icon_name);
            return (
              <motion.div key={tech.id} initial={{ opacity: 0, y: 25, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.25, 0.1, 0.25, 1] }} viewport={{ once: true, margin: "-20px" }} className="group">
                <div className="relative p-4 md:p-8 bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 rounded-2xl hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="text-primary transition-colors duration-300 w-5 h-5 md:w-7 md:h-7" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300 text-sm md:text-base">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground tracking-wide uppercase">{tech.category}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }} className="mt-8 md:mt-12 text-center">
          <p className="text-muted-foreground text-sm md:text-base">
            <TranslatedText>Always learning and exploring new technologies to deliver the best solutions</TranslatedText>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackModern;
