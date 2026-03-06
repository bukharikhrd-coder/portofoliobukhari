import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, Layout, Monitor } from "lucide-react";
import { useTheme, UI_TEMPLATES } from "@/contexts/ThemeContext";

const AdminUITemplate = () => {
  const { uiTemplate, setUITemplate } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(uiTemplate);

  useEffect(() => {
    setSelected(uiTemplate);
  }, [uiTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "ui_template")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_settings")
          .update({ value: selected, updated_at: new Date().toISOString() })
          .eq("key", "ui_template");
      } else {
        await supabase
          .from("site_settings")
          .insert({ key: "ui_template", value: selected });
      }

      setUITemplate(selected);
      toast.success("UI Template saved successfully!");
    } catch (error) {
      console.error("Error saving UI template:", error);
      toast.error("Failed to save UI template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">UI TEMPLATE</h1>
        <p className="text-muted-foreground mt-1">Pilih tampilan UI untuk portfolio Anda</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Layout size={18} className="text-primary" />
          Template Aktif
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Pilih salah satu template tampilan. Template ini akan diterapkan ke seluruh halaman portfolio publik.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UI_TEMPLATES.map((template) => {
            const isSelected = selected === template.id;
            return (
              <button
                key={template.id}
                onClick={() => setSelected(template.id)}
                className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground bg-card"
                }`}
              >
                {/* Template preview */}
                <div className="mb-4 rounded-lg overflow-hidden border border-border aspect-video">
                  {template.id === "editorial" ? (
                    <div className="w-full h-full bg-[hsl(0,0%,4%)] flex items-center justify-center p-3">
                      <div className="space-y-1 w-full">
                        <div className="h-1.5 w-8 bg-amber-500/60 rounded" />
                        <div className="h-3 w-3/4 bg-white/80 rounded" />
                        <div className="h-3 w-1/2 bg-amber-500/50 rounded" />
                        <div className="h-1 w-full bg-white/10 rounded mt-2" />
                        <div className="h-1 w-4/5 bg-white/10 rounded" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-3">
                      <div className="space-y-1 w-full">
                        <div className="h-1.5 w-12 bg-blue-300/60 rounded-full" />
                        <div className="h-3 w-3/4 bg-blue-900/60 rounded-full" />
                        <div className="h-3 w-1/2 bg-blue-500/40 rounded-full" />
                        <div className="flex gap-1 mt-2">
                          <div className="h-4 w-12 bg-blue-500/50 rounded-full" />
                          <div className="h-4 w-12 bg-blue-200 rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h4 className="font-semibold text-foreground">{template.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving || selected === uiTemplate} className="gap-2">
            {saving ? (
              <><Loader2 className="animate-spin" size={16} /> Saving...</>
            ) : (
              <><Check size={16} /> Aktifkan Template</>
            )}
          </Button>
          {selected !== uiTemplate && (
            <span className="text-sm text-muted-foreground">Perubahan belum disimpan</span>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Note:</strong> Template yang dipilih akan diterapkan secara global untuk semua pengunjung portfolio Anda.
          Kedua template tetap menggunakan data konten yang sama (hero, about, projects, dll).
        </p>
      </Card>
    </div>
  );
};

export default AdminUITemplate;
