import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeMode = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

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

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themeMode === "system") {
      return getSystemTheme();
    }
    return themeMode as ResolvedTheme;
  });

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

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, themeMode, setThemeMode }}>
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
