import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_year: string;
  end_year: string | null;
  is_current: boolean;
  description: string | null;
  location: string | null;
  order_index: number;
}

const AdminEducation = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Education>>({});

  const { data: educations, isLoading } = useQuery({
    queryKey: ["admin_education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Education>) => {
      if (data.id) {
        const { id, ...updateData } = data;
        const { error } = await supabase.from("education").update(updateData).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("education").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_education"] });
      toast.success("Education saved successfully");
      setEditingId(null);
      setIsAdding(false);
      setFormData({});
    },
    onError: () => toast.error("Failed to save education"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("education").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_education"] });
      toast.success("Education deleted");
    },
    onError: () => toast.error("Failed to delete education"),
  });

  const handleSave = () => {
    if (!formData.institution || !formData.degree || !formData.start_year) {
      toast.error("Please fill in required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-muted rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Education</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setFormData({ institution: "", degree: "", start_year: "", order_index: (educations?.length || 0) + 1 });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={18} /> Add Education
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <div className="bg-card border border-primary p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Institution *" value={formData.institution || ""} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
              <input type="text" placeholder="Degree *" value={formData.degree || ""} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
              <input type="text" placeholder="Field of Study" value={formData.field_of_study || ""} onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
              <input type="text" placeholder="Location" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
              <input type="text" placeholder="Start Year *" value={formData.start_year || ""} onChange={(e) => setFormData({ ...formData, start_year: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
              <input type="text" placeholder="End Year" value={formData.end_year || ""} onChange={(e) => setFormData({ ...formData, end_year: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
            </div>
            <textarea placeholder="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none min-h-[100px]" />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50"><Save size={18} /> Save</button>
              <button onClick={() => { setIsAdding(false); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 border border-border"><X size={18} /> Cancel</button>
            </div>
          </div>
        )}

        {educations?.map((edu) => (
          <div key={edu.id} className="bg-card border border-border p-6">
            {editingId === edu.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={formData.institution || ""} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
                  <input type="text" value={formData.degree || ""} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
                  <input type="text" value={formData.field_of_study || ""} onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
                  <input type="text" value={formData.start_year || ""} onChange={(e) => setFormData({ ...formData, start_year: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
                  <input type="text" value={formData.end_year || ""} onChange={(e) => setFormData({ ...formData, end_year: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
                </div>
                <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none min-h-[100px]" />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground"><Save size={18} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-4 py-2 border border-border"><X size={18} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{edu.degree} {edu.field_of_study && `- ${edu.field_of_study}`}</h3>
                  <p className="text-muted-foreground">{edu.institution} • {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}</p>
                  {edu.description && <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(edu.id); setFormData(edu); }} className="p-2 hover:bg-secondary"><Pencil size={18} /></button>
                  <button onClick={() => deleteMutation.mutate(edu.id)} className="p-2 hover:bg-destructive/20 text-destructive"><Trash2 size={18} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEducation;
