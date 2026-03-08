import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Palette, Check, Sun, Moon, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme, COLOR_THEMES } from "@/contexts/ThemeContext";

const AdminColorTheme = () => {
  const { colorTheme, setColorTheme, themeMode, setThemeMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorTheme);

  // Custom color pickers
  const [customBg, setCustomBg] = useState("#0a0a0a");
  const [customBgLight, setCustomBgLight] = useState("#fafafa");
  const [customFontColor, setCustomFontColor] = useState("#f5f5f5");
  const [customFontColorLight, setCustomFontColorLight] = useState("#1a1a1a");
  const [customAccentHex, setCustomAccentHex] = useState("#e69500");

  // Gradient settings
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientFrom, setGradientFrom] = useState("#e69500");
  const [gradientTo, setGradientTo] = useState("#d97706");
  const [gradientAngle, setGradientAngle] = useState("135");
  const [gradientTarget, setGradientTarget] = useState<"hero" | "sections" | "all">("hero");

  useEffect(() => {
    setSelectedColor(colorTheme);
  }, [colorTheme]);

  // Load saved custom colors
  useEffect(() => {
    const fetchCustomColors = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "custom_bg_dark", "custom_bg_light",
          "custom_font_dark", "custom_font_light",
          "custom_accent_hex",
          "gradient_enabled", "gradient_from", "gradient_to",
          "gradient_angle", "gradient_target"
        ]);
      if (data) {
        for (const s of data) {
          if (s.key === "custom_bg_dark" && s.value) setCustomBg(s.value);
          if (s.key === "custom_bg_light" && s.value) setCustomBgLight(s.value);
          if (s.key === "custom_font_dark" && s.value) setCustomFontColor(s.value);
          if (s.key === "custom_font_light" && s.value) setCustomFontColorLight(s.value);
          if (s.key === "custom_accent_hex" && s.value) setCustomAccentHex(s.value);
          if (s.key === "gradient_enabled" && s.value) setGradientEnabled(s.value === "true");
          if (s.key === "gradient_from" && s.value) setGradientFrom(s.value);
          if (s.key === "gradient_to" && s.value) setGradientTo(s.value);
          if (s.key === "gradient_angle" && s.value) setGradientAngle(s.value);
          if (s.key === "gradient_target" && s.value) setGradientTarget(s.value as "hero" | "sections" | "all");
        }
      }
    };
    fetchCustomColors();
  }, []);

  const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
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

  const applyCustomColors = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");

    // Apply background
    const bgHex = isDark ? customBg : customBgLight;
    const bgHSL = hexToHSL(bgHex);
    root.style.setProperty("--background", `${bgHSL.h} ${bgHSL.s}% ${bgHSL.l}%`);

    // Apply foreground/font
    const fgHex = isDark ? customFontColor : customFontColorLight;
    const fgHSL = hexToHSL(fgHex);
    root.style.setProperty("--foreground", `${fgHSL.h} ${fgHSL.s}% ${fgHSL.l}%`);
    root.style.setProperty("--card-foreground", `${fgHSL.h} ${fgHSL.s}% ${fgHSL.l}%`);

    // Apply accent
    const accentHSL = hexToHSL(customAccentHex);
    root.style.setProperty("--primary", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
    root.style.setProperty("--accent", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
    root.style.setProperty("--ring", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "color_theme", value: selectedColor },
        { key: "custom_bg_dark", value: customBg },
        { key: "custom_bg_light", value: customBgLight },
        { key: "custom_font_dark", value: customFontColor },
        { key: "custom_font_light", value: customFontColorLight },
        { key: "custom_accent_hex", value: customAccentHex },
        { key: "gradient_enabled", value: String(gradientEnabled) },
        { key: "gradient_from", value: gradientFrom },
        { key: "gradient_to", value: gradientTo },
        { key: "gradient_angle", value: gradientAngle },
        { key: "gradient_target", value: gradientTarget },
      ];

      for (const s of settings) {
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", s.key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("site_settings")
            .update({ value: s.value, updated_at: new Date().toISOString() })
            .eq("key", s.key);
        } else {
          await supabase
            .from("site_settings")
            .insert({ key: s.key, value: s.value });
        }
      }

      setColorTheme(selectedColor);
      applyCustomColors();
      toast.success("Theme colors saved!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setCustomBg("#0a0a0a");
    setCustomBgLight("#fafafa");
    setCustomFontColor("#f5f5f5");
    setCustomFontColorLight("#1a1a1a");
    setCustomAccentHex("#e69500");
    setSelectedColor("amber");
  };

  const getThemeColors = (hue: number, saturation: number) => ({
    primary: `hsl(${hue}, ${saturation}%, 50%)`,
    gradient: `linear-gradient(135deg, hsl(${hue}, ${saturation}%, 50%) 0%, hsl(${hue > 10 ? hue - 10 : hue + 350}, ${saturation}%, 45%) 100%)`,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">COLOR THEME</h1>
        <p className="text-muted-foreground mt-1">Customize your portfolio's colors</p>
      </div>

      {/* Display Mode */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sun size={18} className="text-primary" /> Display Mode
        </h3>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { mode: "dark" as const, icon: Moon, label: "Dark" },
            { mode: "light" as const, icon: Sun, label: "Light" },
            { mode: "system" as const, icon: Monitor, label: "System" },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                themeMode === mode
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-secondary"
              }`}
            >
              <Icon size={24} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Accent Color Presets */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Palette size={18} className="text-primary" /> Accent Color Preset
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COLOR_THEMES.map((theme) => {
            const colors = getThemeColors(theme.hue, theme.saturation);
            const isSelected = selectedColor === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedColor(theme.id);
                  // Also update the hex picker to match
                  const hsl = `hsl(${theme.hue}, ${theme.saturation}%, 50%)`;
                  const canvas = document.createElement("canvas");
                  canvas.width = 1; canvas.height = 1;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    ctx.fillStyle = hsl;
                    ctx.fillRect(0, 0, 1, 1);
                    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                    setCustomAccentHex(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
                  }
                }}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground bg-card"
                }`}
              >
                <div className="w-12 h-12 rounded-full shadow-lg" style={{ background: colors.gradient }} />
                <span className="text-sm font-medium">{theme.label}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Custom Color Pickers */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          🎨 Custom Color Picker
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Pilih warna custom untuk background, font, dan aksen. Warna ini akan diterapkan ke seluruh portfolio.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Accent / Primary Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Accent / Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customAccentHex}
                onChange={(e) => setCustomAccentHex(e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={customAccentHex}
                onChange={(e) => setCustomAccentHex(e.target.value)}
                placeholder="#e69500"
                className="font-mono text-sm"
              />
            </div>
            <div className="h-8 rounded-lg" style={{ backgroundColor: customAccentHex }} />
          </div>

          {/* Background Dark */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background (Dark Mode)</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                placeholder="#0a0a0a"
                className="font-mono text-sm"
              />
            </div>
            <div className="h-8 rounded-lg border border-border" style={{ backgroundColor: customBg }} />
          </div>

          {/* Background Light */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background (Light Mode)</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customBgLight}
                onChange={(e) => setCustomBgLight(e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={customBgLight}
                onChange={(e) => setCustomBgLight(e.target.value)}
                placeholder="#fafafa"
                className="font-mono text-sm"
              />
            </div>
            <div className="h-8 rounded-lg border border-border" style={{ backgroundColor: customBgLight }} />
          </div>

          {/* Font Dark */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Color (Dark Mode)</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customFontColor}
                onChange={(e) => setCustomFontColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={customFontColor}
                onChange={(e) => setCustomFontColor(e.target.value)}
                placeholder="#f5f5f5"
                className="font-mono text-sm"
              />
            </div>
            <div className="h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ backgroundColor: customBg, color: customFontColor }}>
              Sample Text
            </div>
          </div>

          {/* Font Light */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Color (Light Mode)</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customFontColorLight}
                onChange={(e) => setCustomFontColorLight(e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={customFontColorLight}
                onChange={(e) => setCustomFontColorLight(e.target.value)}
                placeholder="#1a1a1a"
                className="font-mono text-sm"
              />
            </div>
            <div className="h-8 rounded-lg flex items-center justify-center text-xs font-medium border border-border" style={{ backgroundColor: customBgLight, color: customFontColorLight }}>
              Sample Text
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-6 p-4 border border-border rounded-lg" style={{ backgroundColor: themeMode === "light" ? customBgLight : customBg }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: themeMode === "light" ? customFontColorLight : customFontColor }}>
            Live Preview
          </h4>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: customAccentHex }}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border-2" style={{ borderColor: customAccentHex, color: customAccentHex }}>
              Outline Button
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${customAccentHex}20`, color: customAccentHex }}>
              Badge
            </span>
            <span className="text-sm" style={{ color: themeMode === "light" ? customFontColorLight : customFontColor }}>
              Body text sample
            </span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSaveAll} disabled={saving} className="gap-2">
          {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Check size={16} /> Save All Colors</>}
        </Button>
        <Button variant="outline" onClick={resetToDefaults} className="gap-2">
          <RotateCcw size={16} /> Reset Defaults
        </Button>
      </div>

      <Card className="p-4 bg-secondary/50 border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Note:</strong> Custom colors are saved globally for all visitors. Display mode is a personal preference.
        </p>
      </Card>
    </div>
  );
};

export default AdminColorTheme;
