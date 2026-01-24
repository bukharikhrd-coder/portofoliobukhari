import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Core navigation items (always visible)
const coreNavItems = [
  { href: "#about", label: "About" },
  { href: "#works", label: "Works" },
  { href: "#contact", label: "Contact" },
];

// More menu items (grouped in dropdown)
const moreNavItems = [
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#trainings", label: "Training" },
  { href: "#languages", label: "Languages" },
  { href: "#videoportfolio", label: "Video Portfolio" },
  { href: "#techstack", label: "Tech Stack" },
  { href: "#softwaretools", label: "Tools" },
  { href: "#workjourney", label: "Work Journey" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    // If not on home page, navigate to home first then scroll
    if (!isHomePage && href.startsWith("#")) {
      navigate("/" + href);
      return;
    }
    
    if (href === "#" || href === "/#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = href.replace("/#", "#");
    const element = document.querySelector(targetId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  }, [isHomePage, navigate]);

  // Handle scroll after navigation from another page
  useEffect(() => {
    if (location.hash && isHomePage) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          const navHeight = 80;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - navHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [location.hash, isHomePage]);

  const ThemeIcon = () => {
    if (themeMode === "system") return <Monitor size={18} />;
    return theme === "dark" ? <Sun size={18} /> : <Moon size={18} />;
  };

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
          {/* Logo */}
          <Link 
            to="/"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="font-display text-2xl tracking-tight"
          >
            BUKHARI<span className="text-gradient">, S.KOM</span>
          </Link>

          {/* Desktop & Tablet Navigation */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-6">
            {/* Home */}
            <Link
              to="/"
              onClick={(e) => {
                if (isHomePage) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline tracking-wide"
            >
              Home
            </Link>

            {/* Core nav items */}
            {coreNavItems.map((link) => (
              <a
                key={link.href}
                href={isHomePage ? link.href : `/${link.href}`}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline tracking-wide"
              >
                {link.label}
              </a>
            ))}

            {/* More dropdown - only show on homepage */}
            {isHomePage && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide">
                  More
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {moreNavItems.map((link) => (
                    <DropdownMenuItem
                      key={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="cursor-pointer"
                    >
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Services - external page */}
            <Link
              to="/services"
              className="text-xs lg:text-sm text-primary hover:text-primary/80 transition-colors duration-300 link-underline tracking-wide font-medium"
            >
              Services
            </Link>

            {/* Admin link */}
            {user && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <Settings size={14} />
                Admin
              </Link>
            )}

            {/* Login link */}
            {!user && (
              <Link
                to="/auth"
                className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Login
              </Link>
            )}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                  aria-label="Toggle theme"
                >
                  <ThemeIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem 
                  onClick={() => setThemeMode("dark")}
                  className={themeMode === "dark" ? "bg-accent" : ""}
                >
                  <Moon size={14} className="mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setThemeMode("light")}
                  className={themeMode === "light" ? "bg-accent" : ""}
                >
                  <Sun size={14} className="mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setThemeMode("system")}
                  className={themeMode === "system" ? "bg-accent" : ""}
                >
                  <Monitor size={14} className="mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 sm:hidden">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-foreground" aria-label="Toggle theme">
                  <ThemeIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem 
                  onClick={() => setThemeMode("dark")}
                  className={themeMode === "dark" ? "bg-accent" : ""}
                >
                  <Moon size={14} className="mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setThemeMode("light")}
                  className={themeMode === "light" ? "bg-accent" : ""}
                >
                  <Sun size={14} className="mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setThemeMode("system")}
                  className={themeMode === "system" ? "bg-accent" : ""}
                >
                  <Monitor size={14} className="mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 space-y-3">
              {/* Home */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
              >
                <Link
                  to="/"
                  onClick={() => {
                    setIsOpen(false);
                    if (isHomePage) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </motion.div>

              {/* Core nav items */}
              {coreNavItems.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={isHomePage ? link.href : `/${link.href}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 1) * 0.05 }}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}

              {/* More items (collapsed on mobile - show all) */}
              {isHomePage && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2 border-t border-border"
                >
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">More Sections</p>
                  <div className="grid grid-cols-2 gap-2">
                    {moreNavItems.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleSmoothScroll(e, link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-2 border-t border-border"
              >
                <Link
                  to="/services"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Services →
                </Link>
              </motion.div>

              {/* Admin/Login */}
              {user && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-muted-foreground text-lg hover:text-foreground"
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
                  transition={{ delay: 0.3 }}
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
