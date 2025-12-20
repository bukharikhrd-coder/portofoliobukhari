import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, Film, Tv, Smartphone, Play, Clapperboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Video: Video,
  Film: Film,
  Tv: Tv,
  Smartphone: Smartphone,
  Play: Play,
  Clapperboard: Clapperboard,
};

const VideoTools = () => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["video_tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tools")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="video-tools" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">
            Tools
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            VIDEO <span className="text-gradient">DESIGN TOOLS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {tools?.map((tool, index) => {
            const IconComponent = iconMap[tool.icon_name || "Video"] || Video;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-card border border-border p-6 text-center hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="text-primary" size={32} />
                </div>
                <h3 className="font-medium text-foreground mb-2">{tool.name}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {tool.proficiency_level}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VideoTools;
