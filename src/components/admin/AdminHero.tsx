import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface HeroContent {
  id: string;
  headline_1: string;
  headline_2: string;
  subtitle: string;
  description: string | null;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  cta_secondary_text: string | null;
  cta_secondary_link: string | null;
  date_display: string | null;
  brand_name: string | null;
}

const AdminHero = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load hero content");
    } else {
      setContent(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("hero_content")
      .update({
        headline_1: content.headline_1,
        headline_2: content.headline_2,
        subtitle: content.subtitle,
        description: content.description,
        cta_primary_text: content.cta_primary_text,
        cta_primary_link: content.cta_primary_link,
        cta_secondary_text: content.cta_secondary_text,
        cta_secondary_link: content.cta_secondary_link,
        date_display: content.date_display,
        brand_name: content.brand_name,
      })
      .eq("id", content.id);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Hero content updated!");
    }
    setSaving(false);
  };

  const updateField = (field: keyof HeroContent, value: string) => {
    if (content) {
      setContent({ ...content, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!content) {
    return <div className="text-muted-foreground">No hero content found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">HERO SECTION</h1>
          <p className="text-muted-foreground mt-1">Edit your hero section content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Headline Line 1</label>
          <input
            type="text"
            value={content.headline_1}
            onChange={(e) => updateField("headline_1", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Headline Line 2</label>
          <input
            type="text"
            value={content.headline_2}
            onChange={(e) => updateField("headline_2", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-muted-foreground">Subtitle</label>
          <input
            type="text"
            value={content.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-muted-foreground">Description</label>
          <textarea
            rows={3}
            value={content.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Primary CTA Text</label>
          <input
            type="text"
            value={content.cta_primary_text || ""}
            onChange={(e) => updateField("cta_primary_text", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Primary CTA Link</label>
          <input
            type="text"
            value={content.cta_primary_link || ""}
            onChange={(e) => updateField("cta_primary_link", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Secondary CTA Text</label>
          <input
            type="text"
            value={content.cta_secondary_text || ""}
            onChange={(e) => updateField("cta_secondary_text", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Secondary CTA Link</label>
          <input
            type="text"
            value={content.cta_secondary_link || ""}
            onChange={(e) => updateField("cta_secondary_link", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Date Display</label>
          <input
            type="text"
            value={content.date_display || ""}
            onChange={(e) => updateField("date_display", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Brand Name</label>
          <input
            type="text"
            value={content.brand_name || ""}
            onChange={(e) => updateField("brand_name", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
