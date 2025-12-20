import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, MapPin, Calendar } from "lucide-react";

const Education = () => {
  const { data: educations, isLoading } = useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">
            Education
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            ACADEMIC <span className="text-gradient">BACKGROUND</span>
          </h2>
        </motion.div>

        <div className="grid gap-6">
          {educations?.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-primary" size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {edu.degree} {edu.field_of_study && `- ${edu.field_of_study}`}
                    </h3>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="text-primary font-medium">{edu.institution}</span>
                    {edu.location && (
                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {edu.location}
                      </span>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
