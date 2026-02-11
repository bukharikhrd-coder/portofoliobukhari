import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { SortableList } from "./SortableList";

const proficiencyLevels = ["Native", "Professional", "Advanced", "Intermediate", "Basic"];
const hskLevels = ["HSK 1 (Beginner)", "HSK 2 (Elementary)", "HSK 3 (Intermediate)", "HSK 4 (Upper Intermediate)", "HSK 5 (Advanced)", "HSK 6 (Mastery)"];

const isMandarin = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes("mandarin") || lower.includes("chinese") || lower.includes("中文") || lower.includes("华语");
};

const getProficiencyOptions = (languageName: string) => {
  if (isMandarin(languageName)) {
    return [...proficiencyLevels, ...hskLevels];
  }
  return proficiencyLevels;
};

interface Language {
  id: string;
  language_name: string;
  proficiency_level: string;
  order_index: number | null;
}

const AdminLanguages = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [localLanguages, setLocalLanguages] = useState<Language[]>([]);
  const [formData, setFormData] = useState<{ language_name: string; proficiency_level: string; order_index: number }>({
    language_name: "",
    proficiency_level: "Intermediate",
    order_index: 0,
  });

  const { data: languages, isLoading } = useQuery({
    queryKey: ["admin_language_skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("language_skills").select("*").order("order_index");
      if (error) throw error;
      return data as Language[];
    },
  });

  useEffect(() => {
    if (languages) {
      setLocalLanguages(languages);
    }
  }, [languages]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { error } = await supabase.from("language_skills").update(data).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("language_skills").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_language_skills"] });
      toast.success("Language saved");
      setEditingId(null);
      setIsAdding(false);
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("language_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_language_skills"] });
      toast.success("Language deleted");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: Language[]) => {
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase
          .from("language_skills")
          .update({ order_index: i })
          .eq("id", items[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_language_skills"] });
      toast.success("Order updated");
    },
    onError: () => toast.error("Failed to update order"),
  });

  const handleReorder = (newItems: Language[]) => {
    setLocalLanguages(newItems);
    reorderMutation.mutate(newItems);
  };

  if (isLoading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  const renderLanguageItem = (lang: Language) => (
    <div className="bg-card border border-border p-4 flex items-center justify-between rounded-lg">
      {editingId === lang.id ? (
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <input type="text" value={formData.language_name} onChange={(e) => setFormData({ ...formData, language_name: e.target.value })} className="flex-1 min-w-[200px] px-4 py-2 bg-background border border-border rounded" />
          <select value={formData.proficiency_level} onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })} className="px-4 py-2 bg-background border border-border rounded">
            {getProficiencyOptions(formData.language_name).map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
          <button onClick={() => saveMutation.mutate({ ...formData, id: lang.id })} className="p-2 bg-primary text-primary-foreground rounded"><Save size={18} /></button>
          <button onClick={() => setEditingId(null)} className="p-2 border border-border rounded"><X size={18} /></button>
        </div>
      ) : (
        <>
          <div>
            <span className="font-medium">{lang.language_name}</span>
            <span className="ml-3 text-sm text-muted-foreground">{lang.proficiency_level}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditingId(lang.id); setFormData({ language_name: lang.language_name, proficiency_level: lang.proficiency_level, order_index: lang.order_index || 0 }); }} className="p-2 hover:bg-secondary rounded"><Pencil size={18} /></button>
            <button onClick={() => deleteMutation.mutate(lang.id)} className="p-2 hover:bg-destructive/20 text-destructive rounded"><Trash2 size={18} /></button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display">Language Skills</h2>
          <p className="text-sm text-muted-foreground mt-1">Drag items to reorder</p>
        </div>
        <button onClick={() => { setIsAdding(true); setFormData({ language_name: "", proficiency_level: "Intermediate", order_index: (languages?.length || 0) + 1 }); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded">
          <Plus size={18} /> Add Language
        </button>
      </div>

      {isAdding && (
        <div className="bg-card border border-primary p-6 flex flex-wrap gap-4 items-end mb-4 rounded-lg">
          <input type="text" placeholder="Language Name" value={formData.language_name} onChange={(e) => setFormData({ ...formData, language_name: e.target.value })} className="flex-1 min-w-[200px] px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none rounded" />
          <select value={formData.proficiency_level} onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none rounded">
            {getProficiencyOptions(formData.language_name).map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
          <button onClick={() => saveMutation.mutate(formData)} className="px-4 py-3 bg-primary text-primary-foreground rounded"><Save size={18} /></button>
          <button onClick={() => setIsAdding(false)} className="px-4 py-3 border border-border rounded"><X size={18} /></button>
        </div>
      )}

      <SortableList
        items={localLanguages}
        onReorder={handleReorder}
        renderItem={renderLanguageItem}
        disabled={editingId !== null}
      />
    </div>
  );
};

export default AdminLanguages;
