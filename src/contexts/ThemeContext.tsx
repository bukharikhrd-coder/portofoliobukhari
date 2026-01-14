import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type ThemeMode = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";
type ColorTheme = "amber" | "blue" | "green" | "purple" | "red" | "pink" | "cyan" | "orange";

interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ColorTheme) => void;
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

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themeMode === "system") {
      return getSystemTheme();
    }
    return themeMode as ResolvedTheme;
  });

  // Fetch color theme from database on mount
  useEffect(() => {
    const fetchColorTheme = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "color_theme")
          .maybeSingle();
        
        if (data?.value && COLOR_THEMES.some(t => t.id === data.value)) {
          setColorThemeState(data.value as ColorTheme);
          localStorage.setItem("colorTheme", data.value);
        }
      } catch (error) {
        console.error("Error fetching color theme:", error);
      }
    };

    fetchColorTheme();
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

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, themeMode, colorTheme, setThemeMode, setColorTheme }}>
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
