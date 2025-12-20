import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface ContactContent {
  id: string;
  section_label: string | null;
  headline_1: string | null;
  headline_2: string | null;
  description: string | null;
  email: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
}

const AdminContact = () => {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("contact_content")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load contact content");
    } else {
      setContent(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("contact_content")
      .update({
        section_label: content.section_label,
        headline_1: content.headline_1,
        headline_2: content.headline_2,
        description: content.description,
        email: content.email,
        location: content.location,
        github_url: content.github_url,
        linkedin_url: content.linkedin_url,
        instagram_url: content.instagram_url,
      })
      .eq("id", content.id);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Contact content updated!");
    }
    setSaving(false);
  };

  const updateField = (field: keyof ContactContent, value: string) => {
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
    return <div className="text-muted-foreground">No contact content found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">CONTACT INFO</h1>
          <p className="text-muted-foreground mt-1">Edit your contact section content</p>
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
          <label className="text-sm text-muted-foreground">Section Label</label>
          <input
            type="text"
            value={content.section_label || ""}
            onChange={(e) => updateField("section_label", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Headline Line 1</label>
          <input
            type="text"
            value={content.headline_1 || ""}
            onChange={(e) => updateField("headline_1", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-muted-foreground">Headline Line 2 (Highlighted)</label>
          <input
            type="text"
            value={content.headline_2 || ""}
            onChange={(e) => updateField("headline_2", e.target.value)}
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
          <label className="text-sm text-muted-foreground">Email</label>
          <input
            type="email"
            value={content.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Location</label>
          <input
            type="text"
            value={content.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">GitHub URL</label>
          <input
            type="text"
            value={content.github_url || ""}
            onChange={(e) => updateField("github_url", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">LinkedIn URL</label>
          <input
            type="text"
            value={content.linkedin_url || ""}
            onChange={(e) => updateField("linkedin_url", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-muted-foreground">Instagram URL</label>
          <input
            type="text"
            value={content.instagram_url || ""}
            onChange={(e) => updateField("instagram_url", e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
