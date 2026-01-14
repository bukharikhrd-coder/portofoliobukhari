import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Palette, Check, Sun, Moon, Monitor } from "lucide-react";
import { useTheme, COLOR_THEMES } from "@/contexts/ThemeContext";

const AdminColorTheme = () => {
  const { colorTheme, setColorTheme, themeMode, setThemeMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorTheme);

  useEffect(() => {
    setSelectedColor(colorTheme);
  }, [colorTheme]);

  const handleSave = async () => {
    setSaving(true);

    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "color_theme")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_settings")
          .update({ value: selectedColor, updated_at: new Date().toISOString() })
          .eq("key", "color_theme");
      } else {
        await supabase
          .from("site_settings")
          .insert({ key: "color_theme", value: selectedColor });
      }

      setColorTheme(selectedColor);
      toast.success("Color theme saved successfully!");
    } catch (error) {
      console.error("Error saving color theme:", error);
      toast.error("Failed to save color theme");
    } finally {
      setSaving(false);
    }
  };

  const getThemeColors = (hue: number, saturation: number) => ({
    primary: `hsl(${hue}, ${saturation}%, 50%)`,
    gradient: `linear-gradient(135deg, hsl(${hue}, ${saturation}%, 50%) 0%, hsl(${hue > 10 ? hue - 10 : hue + 350}, ${saturation}%, 45%) 100%)`,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">COLOR THEME</h1>
        <p className="text-muted-foreground mt-1">Customize your portfolio's accent color</p>
      </div>

      {/* Light/Dark Mode Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sun size={18} className="text-primary" />
          Display Mode
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose between light and dark mode, or follow your system preference.
        </p>
        
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            onClick={() => setThemeMode("dark")}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
              themeMode === "dark"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-secondary"
            }`}
          >
            <Moon size={24} />
            <span>Dark</span>
          </button>
          
          <button
            onClick={() => setThemeMode("light")}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
              themeMode === "light"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-secondary"
            }`}
          >
            <Sun size={24} />
            <span>Light</span>
          </button>
          
          <button
            onClick={() => setThemeMode("system")}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
              themeMode === "system"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-secondary"
            }`}
          >
            <Monitor size={24} />
            <span>System</span>
          </button>
        </div>
      </Card>

      {/* Color Theme Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Palette size={18} className="text-primary" />
          Accent Color
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select the accent color for your portfolio. This will change buttons, links, and highlight colors.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COLOR_THEMES.map((theme) => {
            const colors = getThemeColors(theme.hue, theme.saturation);
            const isSelected = selectedColor === theme.id;
            
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedColor(theme.id)}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-foreground bg-secondary"
                    : "border-border hover:border-muted-foreground bg-card"
                }`}
              >
                {/* Color Preview Circle */}
                <div 
                  className="w-12 h-12 rounded-full shadow-lg"
                  style={{ background: colors.gradient }}
                />
                
                {/* Label */}
                <span className="text-sm font-medium">{theme.label}</span>
                
                {/* Check mark */}
                {isSelected && (
                  <div 
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 border border-border rounded-lg bg-secondary/50">
          <h4 className="text-sm font-medium mb-3">Preview</h4>
          <div className="flex flex-wrap gap-3">
            {(() => {
              const theme = COLOR_THEMES.find(t => t.id === selectedColor);
              if (!theme) return null;
              const colors = getThemeColors(theme.hue, theme.saturation);
              
              return (
                <>
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ background: colors.gradient }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Outline Button
                  </button>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                  >
                    Badge
                  </span>
                  <a 
                    href="#" 
                    className="text-sm font-medium underline"
                    style={{ color: colors.primary }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Link Text
                  </a>
                </>
              );
            })()}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={saving || selectedColor === colorTheme}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Theme
              </>
            )}
          </Button>
          
          {selectedColor !== colorTheme && (
            <span className="text-sm text-muted-foreground">
              Unsaved changes
            </span>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-secondary/50 border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Note:</strong> The color theme is saved globally and will be applied to all visitors of your portfolio. 
          Display mode (Dark/Light/System) is a personal preference and only affects your view.
        </p>
      </Card>
    </div>
  );
};

export default AdminColorTheme;
