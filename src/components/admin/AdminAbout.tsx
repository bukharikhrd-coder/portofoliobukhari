import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface AboutContent {
  id: string;
  section_label: string | null;
  headline_1: string | null;
  headline_2: string | null;
  description_1: string | null;
  description_2: string | null;
  stat_1_number: string | null;
  stat_1_label: string | null;
  stat_2_number: string | null;
  stat_2_label: string | null;
  stat_3_number: string | null;
  stat_3_label: string | null;
}

interface Skill {
  id: string;
  name: string;
  order_index: number | null;
}

const AdminAbout = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [aboutImage, setAboutImage] = useState<string>("");
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [contentRes, skillsRes, settingsRes] = await Promise.all([
      supabase.from("about_content").select("*").limit(1).maybeSingle(),
      supabase.from("skills").select("*").order("order_index"),
      supabase.from("site_settings").select("*").eq("key", "about_image_url").maybeSingle()
    ]);

    if (contentRes.data) setContent(contentRes.data);
    if (skillsRes.data) setSkills(skillsRes.data);
    if (settingsRes.data?.value) setAboutImage(settingsRes.data.value);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    const [contentUpdate, settingsUpdate] = await Promise.all([
      supabase
        .from("about_content")
        .update({
          section_label: content.section_label,
          headline_1: content.headline_1,
          headline_2: content.headline_2,
          description_1: content.description_1,
          description_2: content.description_2,
          stat_1_number: content.stat_1_number,
          stat_1_label: content.stat_1_label,
          stat_2_number: content.stat_2_number,
          stat_2_label: content.stat_2_label,
          stat_3_number: content.stat_3_number,
          stat_3_label: content.stat_3_label,
        })
        .eq("id", content.id),
      supabase.from("site_settings").upsert({
        key: "about_image_url",
        value: aboutImage
      }, { onConflict: "key" })
    ]);

    if (contentUpdate.error || settingsUpdate.error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("About content updated!");
    }
    setSaving(false);
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    
    const { data, error } = await supabase
      .from("skills")
      .insert({ name: newSkill.trim(), order_index: skills.length })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add skill");
    } else {
      setSkills([...skills, data]);
      setNewSkill("");
      toast.success("Skill added!");
    }
  };

  const removeSkill = async (id: string) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to remove skill");
    } else {
      setSkills(skills.filter((s) => s.id !== id));
      toast.success("Skill removed!");
    }
  };

  const updateField = (field: keyof AboutContent, value: string) => {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">ABOUT SECTION</h1>
          <p className="text-muted-foreground mt-1">Edit your about section content</p>
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

      {/* About Image Upload */}
      <div className="p-6 bg-secondary/50 border border-border">
        <ImageUpload
          currentImage={aboutImage}
          onImageChange={setAboutImage}
          folder="about"
          label="About Section Image"
        />
      </div>

      {content && (
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
            <label className="text-sm text-muted-foreground">Description 1</label>
            <textarea
              rows={4}
              value={content.description_1 || ""}
              onChange={(e) => updateField("description_1", e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-muted-foreground">Description 2</label>
            <textarea
              rows={4}
              value={content.description_2 || ""}
              onChange={(e) => updateField("description_2", e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Stats */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="space-y-4 p-4 bg-secondary/50 border border-border">
              <h4 className="font-medium">Stat 1</h4>
              <input
                type="text"
                placeholder="Number"
                value={content.stat_1_number || ""}
                onChange={(e) => updateField("stat_1_number", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Label"
                value={content.stat_1_label || ""}
                onChange={(e) => updateField("stat_1_label", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-4 p-4 bg-secondary/50 border border-border">
              <h4 className="font-medium">Stat 2</h4>
              <input
                type="text"
                placeholder="Number"
                value={content.stat_2_number || ""}
                onChange={(e) => updateField("stat_2_number", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Label"
                value={content.stat_2_label || ""}
                onChange={(e) => updateField("stat_2_label", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-4 p-4 bg-secondary/50 border border-border">
              <h4 className="font-medium">Stat 3</h4>
              <input
                type="text"
                placeholder="Number"
                value={content.stat_3_number || ""}
                onChange={(e) => updateField("stat_3_number", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Label"
                value={content.stat_3_label || ""}
                onChange={(e) => updateField("stat_3_label", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="font-display text-2xl">SKILLS</h2>
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Add new skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            className="flex-1 px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
          />
          <button
            onClick={addSkill}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300"
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border group"
            >
              <span>{skill.name}</span>
              <button
                onClick={() => removeSkill(skill.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;
