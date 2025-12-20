import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

const proficiencyLevels = ["Native", "Professional", "Advanced", "Intermediate", "Basic"];

const AdminLanguages = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
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
      return data;
    },
  });

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

  if (isLoading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Language Skills</h2>
        <button onClick={() => { setIsAdding(true); setFormData({ language_name: "", proficiency_level: "Intermediate", order_index: (languages?.length || 0) + 1 }); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground">
          <Plus size={18} /> Add Language
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <div className="bg-card border border-primary p-6 flex flex-wrap gap-4 items-end">
            <input type="text" placeholder="Language Name" value={formData.language_name} onChange={(e) => setFormData({ ...formData, language_name: e.target.value })} className="flex-1 min-w-[200px] px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
            <select value={formData.proficiency_level} onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none">
              {proficiencyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
            <button onClick={() => saveMutation.mutate(formData)} className="px-4 py-3 bg-primary text-primary-foreground"><Save size={18} /></button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-3 border border-border"><X size={18} /></button>
          </div>
        )}

        {languages?.map((lang) => (
          <div key={lang.id} className="bg-card border border-border p-4 flex items-center justify-between">
            {editingId === lang.id ? (
              <div className="flex flex-wrap gap-4 items-center flex-1">
                <input type="text" value={formData.language_name} onChange={(e) => setFormData({ ...formData, language_name: e.target.value })} className="flex-1 min-w-[200px] px-4 py-2 bg-background border border-border" />
                <select value={formData.proficiency_level} onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })} className="px-4 py-2 bg-background border border-border">
                  {proficiencyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
                <button onClick={() => saveMutation.mutate({ ...formData, id: lang.id })} className="p-2 bg-primary text-primary-foreground"><Save size={18} /></button>
                <button onClick={() => setEditingId(null)} className="p-2 border border-border"><X size={18} /></button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-medium">{lang.language_name}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{lang.proficiency_level}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(lang.id); setFormData(lang); }} className="p-2 hover:bg-secondary"><Pencil size={18} /></button>
                  <button onClick={() => deleteMutation.mutate(lang.id)} className="p-2 hover:bg-destructive/20 text-destructive"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLanguages;
