import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

const ExperienceModern = () => {
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["work_experience"],
    queryFn: async () => {
      const { data, error } = await supabase.from("work_experience").select("*").eq("is_visible", true).order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { items: translatedExperiences } = useTranslatedContent(experiences, ["position", "description"]);

  if (isLoading) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="py-12 md:py-24 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-10 md:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-full tracking-wide">
            <TranslatedText>Career</TranslatedText>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-4">
            <TranslatedText>WORK</TranslatedText> <span className="text-primary"><TranslatedText>EXPERIENCE</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="space-y-4 md:space-y-6">
          {translatedExperiences?.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border/50 rounded-2xl p-5 md:p-7 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex flex-col gap-2 mb-3">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">{exp.position}</h3>
                <span className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Calendar size={14} className="text-primary" />
                  {exp.start_date} - {exp.is_current ? <TranslatedText>Present</TranslatedText> : exp.end_date}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3">
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
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{exp.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceModern;
