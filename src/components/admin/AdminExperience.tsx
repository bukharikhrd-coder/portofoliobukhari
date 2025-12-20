import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface WorkExperience {
  id: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  location: string | null;
  order_index: number;
}

const AdminExperience = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkExperience>>({});

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["admin_work_experience"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<WorkExperience>) => {
      if (data.id) {
        const { id, ...updateData } = data;
        const { error } = await supabase
          .from("work_experience")
          .update(updateData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("work_experience").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_work_experience"] });
      toast.success("Experience saved successfully");
      setEditingId(null);
      setIsAdding(false);
      setFormData({});
    },
    onError: (error) => {
      toast.error("Failed to save experience");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("work_experience").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_work_experience"] });
      toast.success("Experience deleted");
    },
    onError: () => {
      toast.error("Failed to delete experience");
    },
  });

  const handleEdit = (exp: WorkExperience) => {
    setEditingId(exp.id);
    setFormData(exp);
  };

  const handleSave = () => {
    if (!formData.company_name || !formData.position || !formData.start_date) {
      toast.error("Please fill in required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      company_name: "",
      position: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      location: "",
      order_index: (experiences?.length || 0) + 1,
    });
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Work Experience</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <div className="bg-card border border-primary p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company Name *"
                value={formData.company_name || ""}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder="Position *"
                value={formData.position || ""}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder="Start Date * (e.g., 2020)"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder="End Date (leave empty if current)"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
              />
              <label className="flex items-center gap-2 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.is_current || false}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Currently working here</span>
              </label>
            </div>
            <textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none min-h-[100px]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setFormData({});
                }}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {experiences?.map((exp) => (
          <div key={exp.id} className="bg-card border border-border p-6">
            {editingId === exp.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.company_name || ""}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.position || ""}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.start_date || ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.end_date || ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none min-h-[100px]"
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground">
                    <Save size={18} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-4 py-2 border border-border">
                    <X size={18} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{exp.position}</h3>
                  <p className="text-muted-foreground">{exp.company_name} • {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}</p>
                  {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(exp)} className="p-2 hover:bg-secondary">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(exp.id)} className="p-2 hover:bg-destructive/20 text-destructive">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminExperience;
