import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinks = [
  { href: "#", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#languages", label: "Languages" },
  { href: "#works", label: "Works" },
  { href: "#techstack", label: "Tech" },
  { href: "#video-tools", label: "Video" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : ""
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <a 
            href="#" 
            onClick={(e) => handleSmoothScroll(e, "#")}
            className="font-display text-2xl tracking-tight"
          >
            BUKHARI<span className="text-gradient">, S.KOM</span>
          </a>

          {/* Desktop & Tablet Navigation - hidden only on small phones */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline tracking-wide"
              >
                {link.label}
              </a>
            ))}
            {user && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm tracking-wide transition-colors duration-300"
              >
                <Settings size={16} />
                Admin
              </Link>
            )}
            {!user && (
              <Link
                to="/auth"
                className="text-muted-foreground hover:text-foreground text-sm tracking-wide transition-colors duration-300"
              >
                Login
              </Link>
            )}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </button>
          </div>

          {/* Mobile Menu Button - only on small phones */}
          <div className="flex items-center gap-1 sm:hidden">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-6 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="block text-lg text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </motion.a>
              ))}
              {user && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-primary text-lg"
                  >
                    <Settings size={18} />
                    Admin
                  </Link>
                </motion.div>
              )}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
