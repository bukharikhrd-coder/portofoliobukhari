import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type ThemeMode = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";
type ColorTheme = "amber" | "blue" | "green" | "purple" | "red" | "pink" | "cyan" | "orange";
type UITemplate = "editorial" | "modern-blue";

interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  uiTemplate: UITemplate;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ColorTheme) => void;
  setUITemplate: (template: UITemplate) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

export const COLOR_THEMES: { id: ColorTheme; label: string; hue: number; saturation: number }[] = [
  { id: "amber", label: "Amber (Default)", hue: 38, saturation: 92 },
  { id: "blue", label: "Blue", hue: 217, saturation: 91 },
  { id: "cyan", label: "Cyan", hue: 189, saturation: 94 },
  { id: "green", label: "Green", hue: 142, saturation: 71 },
  { id: "purple", label: "Purple", hue: 262, saturation: 83 },
  { id: "pink", label: "Pink", hue: 330, saturation: 81 },
  { id: "red", label: "Red", hue: 0, saturation: 84 },
  { id: "orange", label: "Orange", hue: 24, saturation: 95 },
];

export const UI_TEMPLATES: { id: UITemplate; label: string; description: string }[] = [
  { id: "editorial", label: "Editorial Dark", description: "Tema gelap editorial dengan layout magazine-style, font bold, dan aksen emas" },
  { id: "modern-blue", label: "Modern Blue", description: "Tema cerah modern dengan gradien biru, rounded corners, dan feel yang friendly" },
];

  const hexToHSL = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const applyCustomColorsFromSettings = (settings: Record<string, string>) => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark") || !root.classList.contains("light");

    const bgHex = isDark ? settings.custom_bg_dark : settings.custom_bg_light;
    if (bgHex) {
      const hsl = hexToHSL(bgHex);
      root.style.setProperty("--background", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }

    const fgHex = isDark ? settings.custom_font_dark : settings.custom_font_light;
    if (fgHex) {
      const hsl = hexToHSL(fgHex);
      root.style.setProperty("--foreground", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty("--card-foreground", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }

    if (settings.custom_accent_hex) {
      const hsl = hexToHSL(settings.custom_accent_hex);
      root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty("--accent", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty("--ring", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("themeMode") as ThemeMode;
      if (stored && ["dark", "light", "system"].includes(stored)) {
        return stored;
      }
    }
    return "dark"; // Default to dark theme
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("colorTheme") as ColorTheme;
      if (stored && COLOR_THEMES.some(t => t.id === stored)) {
        return stored;
      }
    }
    return "amber"; // Default to amber
  });

  const [uiTemplate, setUITemplateState] = useState<UITemplate>("editorial");

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themeMode === "system") {
      return getSystemTheme();
    }
    return themeMode as ResolvedTheme;
  });

  // Fetch settings from database on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["color_theme", "ui_template", "custom_bg_dark", "custom_bg_light", "custom_font_dark", "custom_font_light", "custom_accent_hex"]);
        
        if (data) {
          const settings: Record<string, string> = {};
          for (const s of data) {
            if (s.value) settings[s.key] = s.value;
          }
          
          if (settings.color_theme && COLOR_THEMES.some(t => t.id === settings.color_theme)) {
            setColorThemeState(settings.color_theme as ColorTheme);
            localStorage.setItem("colorTheme", settings.color_theme);
          }
          if (settings.ui_template && UI_TEMPLATES.some(t => t.id === settings.ui_template)) {
            setUITemplateState(settings.ui_template as UITemplate);
          }

          // Apply custom colors after a tick so the theme class is set
          setTimeout(() => {
            applyCustomColorsFromSettings(settings);
          }, 150);
        }
      } catch (error) {
        console.error("Error fetching theme settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Update resolved theme when mode changes
  useEffect(() => {
    if (themeMode === "system") {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(themeMode as ResolvedTheme);
    }
  }, [themeMode]);

  // Apply theme to document with smooth transition
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove no-transition class to enable smooth transitions
    requestAnimationFrame(() => {
      root.classList.remove("no-transition");
    });
    
    if (resolvedTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [resolvedTheme]);

  // Apply color theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colorConfig = COLOR_THEMES.find(t => t.id === colorTheme);
    
    if (colorConfig) {
      const { hue, saturation } = colorConfig;
      const lightness = resolvedTheme === "dark" ? 50 : 45;
      const gradientEnd = hue > 10 ? hue - 10 : hue + 350;
      
      root.style.setProperty("--primary", `${hue} ${saturation}% ${lightness}%`);
      root.style.setProperty("--accent", `${hue} ${saturation}% ${lightness}%`);
      root.style.setProperty("--ring", `${hue} ${saturation}% ${lightness}%`);
      root.style.setProperty("--gradient-gold", `linear-gradient(135deg, hsl(${hue} ${saturation}% ${lightness}%) 0%, hsl(${gradientEnd} ${saturation}% ${lightness - 5}%) 100%)`);
      root.style.setProperty("--shadow-glow", `0 0 60px hsl(${hue} ${saturation}% ${lightness}% / ${resolvedTheme === "dark" ? 0.15 : 0.2})`);
    }
  }, [colorTheme, resolvedTheme]);

  // Add no-transition class on initial load to prevent flash
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-transition");
    
    // Remove it after a short delay
    const timer = setTimeout(() => {
      root.classList.remove("no-transition");
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("themeMode", mode);
  };

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    localStorage.setItem("colorTheme", color);
  };

  const setUITemplate = (template: UITemplate) => {
    setUITemplateState(template);
  };

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, themeMode, colorTheme, uiTemplate, setThemeMode, setColorTheme, setUITemplate }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
