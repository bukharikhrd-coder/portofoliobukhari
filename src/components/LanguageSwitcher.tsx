import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, Language, languageLabels, languageFlags } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const languages: Language[] = ["en", "id", "zh", "ar"];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          aria-label="Change language"
        >
          <Globe size={18} />
          <span className="text-sm hidden lg:inline">{languageFlags[language]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang ? "bg-accent" : ""
            }`}
          >
            <span className="text-base">{languageFlags[lang]}</span>
            <span className="text-sm">{languageLabels[lang]}</span>
            {language === lang && (
              <motion.div
                layoutId="activeLanguage"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
