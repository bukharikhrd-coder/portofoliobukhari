import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Award, Calendar, Building2, ExternalLink } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

const Trainings = () => {
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { items: translatedTrainings } = useTranslatedContent(
    trainings,
    ["title", "description"]
  );

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="trainings" className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <TranslatedText className="text-xs md:text-sm font-medium tracking-widest text-primary mb-3 md:mb-4 block">
            PROFESSIONAL DEVELOPMENT
          </TranslatedText>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <TranslatedText>TRAINING &</TranslatedText> <span className="text-primary"><TranslatedText>CERTIFICATIONS</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {translatedTrainings?.map((training, index) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-card border border-border/50 rounded-2xl p-4 md:p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 group-hover:text-primary transition-colors">
                    {training.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                    {training.organization && (
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Building2 className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{training.organization}</span>
                      </div>
                    )}
                    {training.year && (
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{training.year}</span>
                      </div>
                    )}
                  </div>

                  {training.description && (
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {training.description}
                    </p>
                  )}

                  {training.certificate_url && (
                    <a
                      href={training.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 md:gap-1.5 mt-2 md:mt-3 text-xs md:text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                      <TranslatedText>View Certificate</TranslatedText>
                    </a>
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

export default Trainings;
