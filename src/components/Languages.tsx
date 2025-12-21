import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

const proficiencyColors: Record<string, string> = {
  Native: "bg-primary text-primary-foreground",
  Professional: "bg-primary/80 text-primary-foreground",
  Advanced: "bg-primary/60 text-primary-foreground",
  Intermediate: "bg-primary/40 text-primary-foreground",
  Basic: "bg-primary/20 text-foreground",
};

const Languages = () => {
  const { data: languages, isLoading } = useQuery({
    queryKey: ["language_skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("language_skills")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { items: translatedLanguages } = useTranslatedContent(
    languages,
    ["proficiency_level"]
  );

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse flex gap-4 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-40 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="languages" className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <TranslatedText className="text-primary text-sm tracking-[0.3em] uppercase">
            Languages
          </TranslatedText>
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            <TranslatedText>LANGUAGE</TranslatedText> <span className="text-gradient"><TranslatedText>SKILLS</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {translatedLanguages?.map((lang, index) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-primary" size={24} />
                <h3 className="text-lg font-semibold text-foreground">
                  {lang.language_name}
                </h3>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  proficiencyColors[languages?.find(l => l.id === lang.id)?.proficiency_level || ""] || proficiencyColors.Intermediate
                }`}
              >
                {lang.proficiency_level}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Languages;
