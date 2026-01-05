import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, MapPin, Calendar } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

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

  const { items: translatedEducations } = useTranslatedContent(
    educations,
    ["degree", "field_of_study", "description"]
  );

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
    <section id="education" className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16"
        >
          <TranslatedText className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
            Education
          </TranslatedText>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 md:mt-4">
            <TranslatedText>ACADEMIC</TranslatedText> <span className="text-gradient"><TranslatedText>BACKGROUND</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:gap-6">
          {translatedEducations?.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border p-4 md:p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-primary" size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 md:gap-2 mb-2">
                    <h3 className="text-base md:text-xl font-semibold text-foreground">
                      {edu.degree} {edu.field_of_study && `- ${edu.field_of_study}`}
                    </h3>
                    <span className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Calendar size={12} />
                      {edu.start_year} - {edu.is_current ? <TranslatedText>Present</TranslatedText> : edu.end_year}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                    <span className="text-primary font-medium">{edu.institution}</span>
                    {edu.location && (
                      <span className="flex items-center gap-1 md:gap-2">
                        <MapPin size={12} />
                        {edu.location}
                      </span>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-muted-foreground leading-relaxed text-xs md:text-base">
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
