import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import profilePhoto from "@/assets/profile-photo.png";
import { supabase } from "@/integrations/supabase/client";
import { useSectionConfig } from "@/hooks/useSectionConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sectionNavMap: Record<string, { href: string; label: string }> = {
  about: { href: "#about", label: "About" },
  works: { href: "#works", label: "Works" },
  contact: { href: "#contact", label: "Contact" },
  experience: { href: "#experience", label: "Experience" },
  education: { href: "#education", label: "Education" },
  trainings: { href: "#trainings", label: "Training" },
  languages: { href: "#languages", label: "Languages" },
  videoportfolio: { href: "#videoportfolio", label: "Video Portfolio" },
  techstack: { href: "#techstack", label: "Tech Stack" },
  softwaretools: { href: "#softwaretools", label: "Tools" },
  workjourney: { href: "#workjourney", label: "Work Journey" },
};

const coreSectionKeys = ["about", "works", "contact"];

const NavbarModern = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const { user, isAdmin } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isServicesPage = location.pathname.startsWith("/services");

  useEffect(() => {
    const fetchProfileImage = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "hero_image_url").maybeSingle();
      if (data?.value) setProfileImageUrl(data.value);
    };
    fetchProfileImage();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (!isHomePage) return;
      const sections = [...coreNavItems, ...moreNavItems].map(item => item.href.replace("#", ""));
      let current = "";
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = sectionId;
          }
        }
      }
      if (window.scrollY < 100) current = "";
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (!isHomePage && href.startsWith("#")) {
      navigate("/" + href);
      return;
    }
    if (href === "#" || href === "/#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.querySelector(href.replace("/#", "#"));
    if (element) {
      const navHeight = 80;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - navHeight,
        behavior: "smooth",
      });
    }
  }, [isHomePage, navigate]);

  useEffect(() => {
    if (location.hash && isHomePage) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 80,
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
        isScrolled
          ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/50"
          : ""
      }`}
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - rounded, modern */}
          <Link
            to="/"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3"
          >
            <img
              src={profileImageUrl || profilePhoto}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
            />
            <span className="font-body font-semibold text-lg text-foreground">
              Bukhari <span className="text-primary">S.Kom</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-4">
            <Link
              to="/"
              onClick={(e) => {
                if (isHomePage) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`px-3 py-2 text-sm rounded-full transition-all duration-300 ${
                isHomePage && activeSection === "" && !isServicesPage
                  ? "text-foreground bg-secondary/80 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              Home
            </Link>

            {coreNavItems.map((link) => {
              const sectionId = link.href.replace("#", "");
              const isActive = isHomePage && activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={isHomePage ? link.href : `/${link.href}`}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`px-3 py-2 text-sm rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-foreground bg-secondary/80 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            {isHomePage && (
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-1 px-3 py-2 text-sm rounded-full transition-all ${
                  moreNavItems.some(item => activeSection === item.href.replace("#", ""))
                    ? "text-foreground bg-secondary/80 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}>
                  More <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px] rounded-xl">
                  {moreNavItems.map((link) => {
                    const sectionId = link.href.replace("#", "");
                    const isActive = activeSection === sectionId;
                    return (
                      <DropdownMenuItem
                        key={link.href}
                        onClick={(e) => handleSmoothScroll(e, link.href)}
                        className={`cursor-pointer rounded-lg ${isActive ? "bg-accent font-medium" : ""}`}
                      >
                        {link.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Link
              to="/services"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all shadow-md shadow-primary/20 ${
                isServicesPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/80 text-primary-foreground hover:bg-primary"
              }`}
            >
              Services
            </Link>

            {user && isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/80 transition-all">
                <Settings size={14} /> Admin
              </Link>
            )}

            {!user && (
              <Link to="/auth" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/80 transition-all">
                Login
              </Link>
            )}

            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-full transition-all" aria-label="Toggle theme">
                  <ThemeIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px] rounded-xl">
                <DropdownMenuItem onClick={() => setThemeMode("dark")} className={`rounded-lg ${themeMode === "dark" ? "bg-accent" : ""}`}>
                  <Moon size={14} className="mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeMode("light")} className={`rounded-lg ${themeMode === "light" ? "bg-accent" : ""}`}>
                  <Sun size={14} className="mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeMode("system")} className={`rounded-lg ${themeMode === "system" ? "bg-accent" : ""}`}>
                  <Monitor size={14} className="mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 sm:hidden">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-foreground rounded-full" aria-label="Toggle theme">
                  <ThemeIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px] rounded-xl">
                <DropdownMenuItem onClick={() => setThemeMode("dark")} className={`rounded-lg ${themeMode === "dark" ? "bg-accent" : ""}`}>
                  <Moon size={14} className="mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeMode("light")} className={`rounded-lg ${themeMode === "light" ? "bg-accent" : ""}`}>
                  <Sun size={14} className="mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeMode("system")} className={`rounded-lg ${themeMode === "system" ? "bg-accent" : ""}`}>
                  <Monitor size={14} className="mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground" aria-label="Toggle menu">
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
            className="sm:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="container mx-auto px-3 py-4 space-y-2">
              <Link to="/" onClick={() => { setIsOpen(false); if (isHomePage) window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="block px-4 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors">
                Home
              </Link>
              {coreNavItems.map((link) => (
                <a key={link.href} href={isHomePage ? link.href : `/${link.href}`}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="block px-4 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors">
                  {link.label}
                </a>
              ))}
              {isHomePage && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 px-4 uppercase tracking-wider">More</p>
                  <div className="grid grid-cols-2 gap-1">
                    {moreNavItems.map((link) => (
                      <a key={link.href} href={link.href} onClick={(e) => handleSmoothScroll(e, link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-secondary/50 transition-colors">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-border/50">
                <Link to="/services" onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-lg text-primary font-medium hover:bg-primary/10 rounded-xl transition-colors">
                  Services →
                </Link>
              </div>
              {user && isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-muted-foreground text-lg hover:text-foreground hover:bg-secondary/50 rounded-xl">
                  <Settings size={18} /> Admin
                </Link>
              )}
              {!user && (
                <Link to="/auth" onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavbarModern;
