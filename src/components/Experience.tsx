import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

const Experience = () => {
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["work_experience"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { items: translatedExperiences } = useTranslatedContent(
    experiences,
    ["position", "description"]
  );

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-background">
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
    <section id="experience" className="py-16 md:py-24 px-4 md:px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16"
        >
          <TranslatedText className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
            Career
          </TranslatedText>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 md:mt-4">
            <TranslatedText>WORK</TranslatedText> <span className="text-gradient"><TranslatedText>EXPERIENCE</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 md:left-8 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8 md:space-y-12">
            {translatedExperiences?.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-10 md:pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-1 md:left-6 top-2 w-4 h-4 bg-primary rounded-full border-4 border-background" />

                <div className="bg-card border border-border p-4 md:p-6 hover:border-primary/50 transition-colors duration-300">
                  <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                      {exp.position}
                    </h3>
                    <span className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {exp.start_date} - {exp.is_current ? <TranslatedText>Present</TranslatedText> : exp.end_date}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    <span className="flex items-center gap-2">
                      <Briefcase size={14} className="text-primary" />
                      {exp.company_name}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        {exp.location}
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {exp.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
