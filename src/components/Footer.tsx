import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TranslatedText } from "./TranslatedText";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-2xl tracking-tight">
              BUKHARI<span className="text-gradient">, S.KOM</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} <TranslatedText>All Rights Reserved</TranslatedText>
            </p>
          </div>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -4 }}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <span className="text-sm tracking-wide"><TranslatedText>Back to Top</TranslatedText></span>
            <ArrowUp size={16} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
