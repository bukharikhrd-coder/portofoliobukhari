import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
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
  refreshCustomSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

export const COLOR_THEMES: { id: ColorTheme; label: string; hue: number; saturation: number }[] = [
  { id: "amber", label: "Amber", hue: 38, saturation: 92 },
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

function hexToHSL(hex: string) {
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
}

/**
 * Apply ALL custom colors based on current dark/light state.
 * This must be called AFTER the .dark/.light class is set on <html>.
 */
function applyAllCustomColors(settings: Record<string, string>, isDark: boolean) {
  const root = document.documentElement;

  // Background
  const bgHex = isDark ? settings.custom_bg_dark : settings.custom_bg_light;
  if (bgHex) {
    const hsl = hexToHSL(bgHex);
    root.style.setProperty("--background", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    // Also update card bg to be slightly different
    const cardL = isDark ? Math.min(hsl.l + 3, 100) : Math.min(hsl.l + 2, 100);
    root.style.setProperty("--card", `${hsl.h} ${hsl.s}% ${cardL}%`);
    root.style.setProperty("--popover", `${hsl.h} ${hsl.s}% ${cardL}%`);
  }

  // Foreground / Font
  const fgHex = isDark ? settings.custom_font_dark : settings.custom_font_light;
  if (fgHex) {
    const hsl = hexToHSL(fgHex);
    root.style.setProperty("--foreground", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty("--card-foreground", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty("--popover-foreground", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
  }

  // Accent / Primary
  const accentMode = settings.accent_mode || "solid";
  if (accentMode === "gradient" && settings.accent_gradient_from && settings.accent_gradient_to) {
    const fromHSL = hexToHSL(settings.accent_gradient_from);
    root.style.setProperty("--primary", `${fromHSL.h} ${fromHSL.s}% ${isDark ? fromHSL.l : Math.max(fromHSL.l - 5, 0)}%`);
    root.style.setProperty("--accent", `${fromHSL.h} ${fromHSL.s}% ${isDark ? fromHSL.l : Math.max(fromHSL.l - 5, 0)}%`);
    root.style.setProperty("--ring", `${fromHSL.h} ${fromHSL.s}% ${fromHSL.l}%`);
    root.style.setProperty("--accent-gradient", `linear-gradient(135deg, ${settings.accent_gradient_from}, ${settings.accent_gradient_to})`);
  } else if (settings.custom_accent_hex) {
    const hsl = hexToHSL(settings.custom_accent_hex);
    const lightness = isDark ? hsl.l : Math.max(hsl.l - 5, 0);
    root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${lightness}%`);
    root.style.setProperty("--accent", `${hsl.h} ${hsl.s}% ${lightness}%`);
    root.style.setProperty("--ring", `${hsl.h} ${hsl.s}% ${lightness}%`);
    root.style.removeProperty("--accent-gradient");
  }

  // Background gradient
  if (settings.gradient_enabled === "true" && settings.gradient_from && settings.gradient_to) {
    const angle = settings.gradient_angle || "135";
    root.style.setProperty("--custom-gradient", `linear-gradient(${angle}deg, ${settings.gradient_from}, ${settings.gradient_to})`);
    root.style.setProperty("--gradient-enabled", "1");
    root.style.setProperty("--gradient-target", settings.gradient_target || "hero");
  } else {
    root.style.setProperty("--gradient-enabled", "0");
    root.style.removeProperty("--custom-gradient");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("themeMode") as ThemeMode;
      if (stored && ["dark", "light", "system"].includes(stored)) return stored;
    }
    return "dark";
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("colorTheme") as ColorTheme;
      if (stored && COLOR_THEMES.some(t => t.id === stored)) return stored;
    }
    return "amber";
  });

  const [uiTemplate, setUITemplateState] = useState<UITemplate>("editorial");
  const customSettingsRef = useRef<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themeMode === "system") return getSystemTheme();
    return themeMode as ResolvedTheme;
  });

  // Fetch settings from database on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", [
            "color_theme", "ui_template",
            "custom_bg_dark", "custom_bg_light",
            "custom_font_dark", "custom_font_light",
            "custom_accent_hex",
            "accent_mode", "accent_gradient_from", "accent_gradient_to", "selected_accent_gradient",
            "gradient_enabled", "gradient_from", "gradient_to",
            "gradient_angle", "gradient_target",
          ]);

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

          customSettingsRef.current = settings;
          setSettingsLoaded(true);
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

  // MASTER EFFECT: Apply dark/light class + all colors in one place
  useEffect(() => {
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";

    // 1. Set the class
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // 2. Clear any inline style overrides so CSS defaults take effect first
    const propsToReset = [
      "--background", "--foreground", "--card", "--card-foreground",
      "--popover", "--popover-foreground", "--primary", "--accent",
      "--ring", "--accent-gradient", "--custom-gradient",
      "--gradient-enabled", "--gradient-target",
      "--gradient-gold", "--shadow-glow",
    ];
    propsToReset.forEach(p => root.style.removeProperty(p));

    // 3. Apply color preset
    const colorConfig = COLOR_THEMES.find(t => t.id === colorTheme);
    const settings = customSettingsRef.current;
    const hasCustomAccent = !!(settings.custom_accent_hex || settings.accent_mode === "gradient");

    if (colorConfig && !hasCustomAccent) {
      const { hue, saturation } = colorConfig;
      const lightness = isDark ? 50 : 45;
      const gradientEnd = hue > 10 ? hue - 10 : hue + 350;

      root.style.setProperty("--primary", `${hue} ${saturation}% ${lightness}%`);
      root.style.setProperty("--accent", `${hue} ${saturation}% ${lightness}%`);
      root.style.setProperty("--ring", `${hue} ${saturation}% ${lightness}%`);
      root.style.setProperty("--gradient-gold", `linear-gradient(135deg, hsl(${hue} ${saturation}% ${lightness}%) 0%, hsl(${gradientEnd} ${saturation}% ${lightness - 5}%) 100%)`);
      root.style.setProperty("--shadow-glow", `0 0 60px hsl(${hue} ${saturation}% ${lightness}% / ${isDark ? 0.15 : 0.2})`);
    }

    // 4. Apply custom overrides from DB settings (bg, font, accent, gradient)
    if (Object.keys(settings).length > 0) {
      applyAllCustomColors(settings, isDark);
    }
  }, [resolvedTheme, colorTheme, settingsLoaded]);

  // Prevent flash on initial load
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-transition");
    const timer = setTimeout(() => root.classList.remove("no-transition"), 100);
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
