import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Loader2, Code2 } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "./TranslatedText";

interface TechItem {
  id: string;
  name: string;
  category: string | null;
  icon_name: string | null;
  order_index: number | null;
}

const TechStack = () => {
  const { data: technologies, isLoading } = useQuery({
    queryKey: ["tech_stack"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_stack")
        .select("*")
        .order("category")
        .order("order_index");
      
      if (error) throw error;
      return data as TechItem[];
    }
  });

  // Translate categories - only when technologies are loaded
  const { items: translatedTech } = useTranslatedContent(
    technologies && technologies.length > 0 ? technologies : undefined, 
    ["category"]
  );

  // Use translated tech if available, otherwise use original
  const displayTech = translatedTech.length > 0 ? translatedTech : (technologies || []);

  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return Code2;
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) {
      return icon as LucideIcon;
    }
    return Code2;
  };

  if (isLoading) {
    return (
      <section id="tech" className="py-20">
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-center min-h-[200px]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }

  if (!technologies || technologies.length === 0) return null;

  return (
    <section id="tech" className="py-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">
            <TranslatedText>Technologies</TranslatedText>
          </span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">
            <TranslatedText>SKILLS</TranslatedText> & <span className="text-gradient"><TranslatedText>STACK</TranslatedText></span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            <TranslatedText>Technologies and tools I use to bring ideas to life</TranslatedText>
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayTech.map((tech, index) => {
            const IconComponent = getIcon(tech.icon_name);
            
            return (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                viewport={{ once: true, margin: "-20px" }}
                className="group"
              >
                <div className="relative p-8 bg-card border border-border hover:border-primary transition-all duration-500 card-hover rounded-lg">
                  {/* Icon */}
                  <div className="mb-6">
                    <IconComponent 
                      size={40} 
                      className="text-muted-foreground group-hover:text-primary transition-colors duration-300" 
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                      {tech.name}
                    </h3>
                    <p className="text-xs text-muted-foreground tracking-wide uppercase">
                      {tech.category}
                    </p>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-primary/0 border-l-[40px] border-l-transparent group-hover:border-t-primary/20 transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            <TranslatedText>Always learning and exploring new technologies to deliver the best solutions</TranslatedText>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
