import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Loader2, Wrench } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "./TranslatedText";

interface ToolItem {
  id: string;
  name: string;
  icon_name: string | null;
  proficiency_level: string | null;
  order_index: number | null;
}

const SoftwareTools = () => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["video_tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tools")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as ToolItem[];
    },
  });

  // Translate proficiency levels - only when tools are loaded
  const { items: translatedTools } = useTranslatedContent(
    tools && tools.length > 0 ? tools : undefined, 
    ["proficiency_level"]
  );

  // Use translated tools if available, otherwise use original
  const displayTools = translatedTools.length > 0 ? translatedTools : (tools || []);

  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return Wrench;
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) {
      return icon as LucideIcon;
    }
    return Wrench;
  };

  const getProficiencyColor = (level: string | null) => {
    switch (level) {
      case "Expert":
        return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
      case "Advanced":
        return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
      case "Intermediate":
        return "from-amber-500/20 to-amber-500/5 border-amber-500/30";
      case "Beginner":
        return "from-slate-500/20 to-slate-500/5 border-slate-500/30";
      default:
        return "from-primary/20 to-primary/5 border-primary/30";
    }
  };

  const getProficiencyBadgeColor = (level: string | null) => {
    switch (level) {
      case "Expert":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Advanced":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Intermediate":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Beginner":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  // Find original proficiency to get correct color
  const getOriginalProficiency = (toolId: string) => {
    return tools?.find(t => t.id === toolId)?.proficiency_level || null;
  };

  if (isLoading) {
    return (
      <section id="software-tools" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }

  if (!tools || tools.length === 0) return null;

  return (
    <section id="software-tools" className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-8 md:mb-12"
        >
          <span className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
            <TranslatedText>Software Mastery</TranslatedText>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 md:mt-4">
            <TranslatedText>TOOLS</TranslatedText> & <span className="text-gradient"><TranslatedText>SOFTWARE</TranslatedText></span>
          </h2>
          <p className="text-muted-foreground mt-3 md:mt-4 max-w-2xl text-sm md:text-base">
            <TranslatedText>Professional tools and software I use for design, development, and multimedia production</TranslatedText>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {displayTools.map((tool, index) => {
            const IconComponent = getIcon(tool.icon_name);
            const originalProficiency = getOriginalProficiency(tool.id);
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                viewport={{ once: true, margin: "-20px" }}
                className="group"
              >
                <div className={`relative bg-gradient-to-br ${getProficiencyColor(originalProficiency)} backdrop-blur-sm border rounded-xl p-4 md:p-6 text-center hover:scale-105 hover:shadow-lg transition-all duration-300`}>
                  {/* Icon */}
                  <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 bg-background/80 rounded-xl flex items-center justify-center shadow-inner group-hover:shadow-md transition-all">
                    <IconComponent className="text-foreground group-hover:text-primary transition-colors w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-medium text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors text-sm md:text-base">
                    {tool.name}
                  </h3>
                  
                  {/* Proficiency Badge */}
                  <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium rounded-full border ${getProficiencyBadgeColor(originalProficiency)}`}>
                    {tool.proficiency_level}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SoftwareTools;
