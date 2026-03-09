import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Palette, Check, Sun, Moon, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme, COLOR_THEMES } from "@/contexts/ThemeContext";

const ACCENT_GRADIENT_PRESETS = [
  { id: "sunset-glow", label: "Sunset Glow", from: "#ff6b6b", to: "#ffa500" },
  { id: "ocean-breeze", label: "Ocean Breeze", from: "#0066cc", to: "#00d4ff" },
  { id: "forest-mist", label: "Forest Mist", from: "#134e5e", to: "#16a085" },
  { id: "neon-pulse", label: "Neon Pulse", from: "#ff00ff", to: "#00ffff" },
  { id: "aurora", label: "Aurora", from: "#667eea", to: "#764ba2" },
  { id: "rose-gold", label: "Rose Gold", from: "#f093fb", to: "#f5576c" },
  { id: "golden-hour", label: "Golden Hour", from: "#f7971e", to: "#ffd200" },
  { id: "midnight", label: "Midnight", from: "#232526", to: "#414345" },
  { id: "fire", label: "Fire", from: "#f12711", to: "#f5af19" },
  { id: "electric", label: "Electric", from: "#4776E6", to: "#8E54E9" },
];

const AdminColorTheme = () => {
  const { colorTheme, setColorTheme, themeMode, setThemeMode, refreshCustomSettings } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorTheme);
  const [accentMode, setAccentMode] = useState<"solid" | "gradient">("solid");

  // Custom color pickers
  const [customBg, setCustomBg] = useState("#0a0a0a");
  const [customBgLight, setCustomBgLight] = useState("#fafafa");
  const [customFontColor, setCustomFontColor] = useState("#f5f5f5");
  const [customFontColorLight, setCustomFontColorLight] = useState("#1a1a1a");
  const [customAccentHex, setCustomAccentHex] = useState("#e69500");

  // Accent gradient
  const [accentGradientFrom, setAccentGradientFrom] = useState("#667eea");
  const [accentGradientTo, setAccentGradientTo] = useState("#764ba2");
  const [selectedAccentGradient, setSelectedAccentGradient] = useState<string | null>(null);

  // Background gradient settings
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientFrom, setGradientFrom] = useState("#e69500");
  const [gradientTo, setGradientTo] = useState("#d97706");
  const [gradientAngle, setGradientAngle] = useState("135");
  const [gradientTarget, setGradientTarget] = useState<"hero" | "sections" | "all">("hero");

  useEffect(() => {
    setSelectedColor(colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    const fetchCustomColors = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "custom_bg_dark", "custom_bg_light",
          "custom_font_dark", "custom_font_light",
          "custom_accent_hex",
          "accent_mode", "accent_gradient_from", "accent_gradient_to", "selected_accent_gradient",
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
          if (s.key === "accent_mode" && s.value) setAccentMode(s.value as "solid" | "gradient");
          if (s.key === "accent_gradient_from" && s.value) setAccentGradientFrom(s.value);
          if (s.key === "accent_gradient_to" && s.value) setAccentGradientTo(s.value);
          if (s.key === "selected_accent_gradient" && s.value) setSelectedAccentGradient(s.value);
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

    const bgHex = isDark ? customBg : customBgLight;
    const bgHSL = hexToHSL(bgHex);
    root.style.setProperty("--background", `${bgHSL.h} ${bgHSL.s}% ${bgHSL.l}%`);

    const fgHex = isDark ? customFontColor : customFontColorLight;
    const fgHSL = hexToHSL(fgHex);
    root.style.setProperty("--foreground", `${fgHSL.h} ${fgHSL.s}% ${fgHSL.l}%`);
    root.style.setProperty("--card-foreground", `${fgHSL.h} ${fgHSL.s}% ${fgHSL.l}%`);

    if (accentMode === "solid") {
      const accentHSL = hexToHSL(customAccentHex);
      root.style.setProperty("--primary", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
      root.style.setProperty("--accent", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
      root.style.setProperty("--ring", `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
      root.style.removeProperty("--accent-gradient");
    } else {
      // For gradient accent, set primary to the "from" color and store gradient
      const fromHSL = hexToHSL(accentGradientFrom);
      root.style.setProperty("--primary", `${fromHSL.h} ${fromHSL.s}% ${fromHSL.l}%`);
      root.style.setProperty("--accent-gradient", `linear-gradient(135deg, ${accentGradientFrom}, ${accentGradientTo})`);
      root.style.setProperty("--ring", `${fromHSL.h} ${fromHSL.s}% ${fromHSL.l}%`);
    }
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
        { key: "accent_mode", value: accentMode },
        { key: "accent_gradient_from", value: accentGradientFrom },
        { key: "accent_gradient_to", value: accentGradientTo },
        { key: "selected_accent_gradient", value: selectedAccentGradient || "" },
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
    setAccentMode("solid");
    setAccentGradientFrom("#667eea");
    setAccentGradientTo("#764ba2");
    setSelectedAccentGradient(null);
    setGradientEnabled(false);
    setGradientFrom("#e69500");
    setGradientTo("#d97706");
    setGradientAngle("135");
    setGradientTarget("hero");
  };

  const bgGradientPresets = [
    { id: "sunset", label: "Sunset", from: "#ff6b6b", to: "#ffa500", angle: "135" },
    { id: "ocean", label: "Ocean", from: "#0066cc", to: "#00d4ff", angle: "45" },
    { id: "forest", label: "Forest", from: "#134e5e", to: "#16a085", angle: "135" },
    { id: "neon", label: "Neon", from: "#ff00ff", to: "#00ffff", angle: "90" },
    { id: "aurora", label: "Aurora", from: "#667eea", to: "#764ba2", angle: "135" },
    { id: "peach", label: "Peach", from: "#f093fb", to: "#f5576c", angle: "45" },
  ];

  const applyBgGradientPreset = (preset: { from: string; to: string; angle: string }) => {
    setGradientFrom(preset.from);
    setGradientTo(preset.to);
    setGradientAngle(preset.angle);
  };

  const bgGradientCSS = `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`;

  const getThemeColors = (hue: number, saturation: number) => ({
    primary: `hsl(${hue}, ${saturation}%, 50%)`,
    gradient: `linear-gradient(135deg, hsl(${hue}, ${saturation}%, 50%) 0%, hsl(${hue > 10 ? hue - 10 : hue + 350}, ${saturation}%, 45%) 100%)`,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">COLOR THEME</h1>
          <p className="text-muted-foreground mt-1">Customize your portfolio's colors</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToDefaults} size="sm" className="gap-2">
            <RotateCcw size={14} /> Reset
          </Button>
          <Button onClick={handleSaveAll} disabled={saving} size="sm" className="gap-2">
            {saving ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : <><Check size={14} /> Save All</>}
          </Button>
        </div>
      </div>

      {/* Display Mode - Compact */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Sun size={16} className="text-primary" /> Display Mode
          </h3>
          <div className="flex gap-2">
            {[
              { mode: "dark" as const, icon: Moon, label: "Dark" },
              { mode: "light" as const, icon: Sun, label: "Light" },
              { mode: "system" as const, icon: Monitor, label: "System" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setThemeMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  themeMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 hover:bg-secondary text-muted-foreground"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Accent Color Preset - with Solid/Gradient tabs */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
          <Palette size={16} className="text-primary" /> Accent Color
        </h3>

        <Tabs value={accentMode} onValueChange={(v) => setAccentMode(v as "solid" | "gradient")} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="solid" className="gap-1.5"><Palette size={14} /> Solid Color</TabsTrigger>
            <TabsTrigger value="gradient" className="gap-1.5"><Sparkles size={14} /> Gradient</TabsTrigger>
          </TabsList>

          <TabsContent value="solid">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {COLOR_THEMES.map((theme) => {
                const colors = getThemeColors(theme.hue, theme.saturation);
                const isSelected = selectedColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedColor(theme.id);
                      const canvas = document.createElement("canvas");
                      canvas.width = 1; canvas.height = 1;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.fillStyle = `hsl(${theme.hue}, ${theme.saturation}%, 50%)`;
                        ctx.fillRect(0, 0, 1, 1);
                        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                        setCustomAccentHex(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
                      }
                    }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected ? "border-foreground bg-secondary" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full shadow-md" style={{ background: colors.gradient }} />
                    <span className="text-[10px] font-medium">{theme.label}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check size={10} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom hex picker inline */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Label className="text-xs font-medium whitespace-nowrap">Custom Hex:</Label>
              <input
                type="color"
                value={customAccentHex}
                onChange={(e) => setCustomAccentHex(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <Input
                value={customAccentHex}
                onChange={(e) => setCustomAccentHex(e.target.value)}
                className="font-mono text-xs h-8 max-w-[120px]"
              />
              <div className="h-6 w-16 rounded" style={{ backgroundColor: customAccentHex }} />
            </div>
          </TabsContent>

          <TabsContent value="gradient">
            {/* Gradient presets grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {ACCENT_GRADIENT_PRESETS.map((preset) => {
                const isSelected = selectedAccentGradient === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedAccentGradient(preset.id);
                      setAccentGradientFrom(preset.from);
                      setAccentGradientTo(preset.to);
                    }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected ? "border-foreground" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className="w-full h-10 rounded-lg shadow-md"
                      style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                    />
                    <span className="text-[10px] font-medium">{preset.label}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                        <Check size={10} className="text-background" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom gradient pickers */}
            <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">From:</Label>
                <input type="color" value={accentGradientFrom} onChange={(e) => { setAccentGradientFrom(e.target.value); setSelectedAccentGradient(null); }}
                  className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={accentGradientFrom} onChange={(e) => { setAccentGradientFrom(e.target.value); setSelectedAccentGradient(null); }}
                  className="font-mono text-xs h-8 w-[100px]" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">To:</Label>
                <input type="color" value={accentGradientTo} onChange={(e) => { setAccentGradientTo(e.target.value); setSelectedAccentGradient(null); }}
                  className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={accentGradientTo} onChange={(e) => { setAccentGradientTo(e.target.value); setSelectedAccentGradient(null); }}
                  className="font-mono text-xs h-8 w-[100px]" />
              </div>
              <div className="h-8 w-24 rounded-lg" style={{ background: `linear-gradient(135deg, ${accentGradientFrom}, ${accentGradientTo})` }} />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Background & Font Colors */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
          🎨 Background & Font Colors
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Background Dark */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Background (Dark)</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer" />
              <Input value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="font-mono text-xs h-8" />
            </div>
            <div className="h-6 rounded border border-border" style={{ backgroundColor: customBg }} />
          </div>

          {/* Background Light */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Background (Light)</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={customBgLight} onChange={(e) => setCustomBgLight(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer" />
              <Input value={customBgLight} onChange={(e) => setCustomBgLight(e.target.value)} className="font-mono text-xs h-8" />
            </div>
            <div className="h-6 rounded border border-border" style={{ backgroundColor: customBgLight }} />
          </div>

          {/* Accent preview */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Current Accent</Label>
            <div className="h-[68px] rounded-lg border border-border overflow-hidden"
              style={{
                background: accentMode === "gradient"
                  ? `linear-gradient(135deg, ${accentGradientFrom}, ${accentGradientTo})`
                  : customAccentHex
              }}
            />
          </div>

          {/* Font Dark */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Font (Dark Mode)</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={customFontColor} onChange={(e) => setCustomFontColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer" />
              <Input value={customFontColor} onChange={(e) => setCustomFontColor(e.target.value)} className="font-mono text-xs h-8" />
            </div>
            <div className="h-6 rounded flex items-center justify-center text-[10px] font-medium" style={{ backgroundColor: customBg, color: customFontColor }}>
              Sample Text
            </div>
          </div>

          {/* Font Light */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Font (Light Mode)</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={customFontColorLight} onChange={(e) => setCustomFontColorLight(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer" />
              <Input value={customFontColorLight} onChange={(e) => setCustomFontColorLight(e.target.value)} className="font-mono text-xs h-8" />
            </div>
            <div className="h-6 rounded flex items-center justify-center text-[10px] font-medium border border-border" style={{ backgroundColor: customBgLight, color: customFontColorLight }}>
              Sample Text
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-5 p-4 border border-border rounded-lg" style={{ backgroundColor: themeMode === "light" ? customBgLight : customBg }}>
          <h4 className="text-xs font-medium mb-2" style={{ color: themeMode === "light" ? customFontColorLight : customFontColor }}>
            Live Preview
          </h4>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{
                background: accentMode === "gradient"
                  ? `linear-gradient(135deg, ${accentGradientFrom}, ${accentGradientTo})`
                  : customAccentHex
              }}>
              Primary Button
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium border-2" style={{ borderColor: accentMode === "gradient" ? accentGradientFrom : customAccentHex, color: accentMode === "gradient" ? accentGradientFrom : customAccentHex }}>
              Outline Button
            </button>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${accentMode === "gradient" ? accentGradientFrom : customAccentHex}20`, color: accentMode === "gradient" ? accentGradientFrom : customAccentHex }}>
              Badge
            </span>
            <span className="text-xs" style={{ color: themeMode === "light" ? customFontColorLight : customFontColor }}>
              Body text sample
            </span>
          </div>
        </div>
      </Card>

      {/* Background Gradient */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-primary" /> Background Gradient
          </h3>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Enable</Label>
            <Switch checked={gradientEnabled} onCheckedChange={setGradientEnabled} />
          </div>
        </div>

        {/* BG Gradient Presets */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {bgGradientPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyBgGradientPreset(preset)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-primary transition-all"
            >
              <div className="w-full h-10 rounded shadow-sm" style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }} />
              <span className="text-[10px] font-medium">{preset.label}</span>
            </button>
          ))}
        </div>

        <div className={`space-y-4 ${!gradientEnabled ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">From Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={gradientFrom} onChange={(e) => setGradientFrom(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={gradientFrom} onChange={(e) => setGradientFrom(e.target.value)} className="font-mono text-xs h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">To Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={gradientTo} onChange={(e) => setGradientTo(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={gradientTo} onChange={(e) => setGradientTo(e.target.value)} className="font-mono text-xs h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Angle ({gradientAngle}°)</Label>
              <input
                type="range" min="0" max="360" value={gradientAngle}
                onChange={(e) => setGradientAngle(e.target.value)}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary mt-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="text-xs font-medium whitespace-nowrap">Apply To:</Label>
            <div className="flex gap-2">
              {[
                { id: "hero" as const, label: "Hero Only" },
                { id: "sections" as const, label: "All Sections" },
                { id: "all" as const, label: "Full Page" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGradientTarget(opt.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    gradientTarget === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-16 rounded-lg border border-border overflow-hidden" style={{ background: bgGradientCSS }}>
            <div className="h-full flex items-center justify-center">
              <span className="text-white text-xs font-medium drop-shadow-lg">
                {gradientAngle}° — {gradientFrom} → {gradientTo}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3 bg-secondary/30 border-border">
        <p className="text-xs text-muted-foreground">
          💡 Custom colors are saved globally for all visitors. Display mode is a personal preference.
        </p>
      </Card>
    </div>
  );
};

export default AdminColorTheme;
