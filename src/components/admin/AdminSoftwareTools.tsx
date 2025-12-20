import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, Smile, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IconPicker from "./IconPicker";

const proficiencyLevels = ["Expert", "Advanced", "Intermediate", "Beginner"];

interface ToolItem {
  id: string;
  name: string;
  icon_name: string | null;
  proficiency_level: string | null;
  order_index: number | null;
}

const AdminSoftwareTools = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<"new" | string>("new");

  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin_video_tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("video_tools").select("*").order("order_index");
      if (error) throw error;
      return data as ToolItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { id?: string; name: string; icon_name: string; proficiency_level: string; order_index: number }) => {
      if (data.id) {
        const { id, ...updateData } = data;
        const { error } = await supabase.from("video_tools").update(updateData).eq("id", id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = data;
        const { error } = await supabase.from("video_tools").insert(insertData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_video_tools"] });
      toast.success("Tool saved successfully");
      setEditingId(null);
      setIsAdding(false);
      setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 });
    },
    onError: () => toast.error("Failed to save tool"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_video_tools"] });
      toast.success("Tool deleted");
    },
  });

  const getIcon = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) {
      return icon as LucideIcon;
    }
    return null;
  };

  const openIconPicker = (target: "new" | string) => {
    setIconPickerTarget(target);
    setShowIconPicker(true);
  };

  const handleIconSelect = (iconName: string) => {
    setFormData({ ...formData, icon_name: iconName });
  };

  const startEdit = (tool: ToolItem) => {
    setEditingId(tool.id);
    setFormData({
      name: tool.name,
      icon_name: tool.icon_name || "",
      proficiency_level: tool.proficiency_level || "Intermediate",
      order_index: tool.order_index || 0
    });
  };

  const getProficiencyColor = (level: string | null) => {
    switch (level) {
      case "Expert": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Advanced": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "Intermediate": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "Beginner": return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      default: return "bg-primary/10 text-primary border-primary/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const FormIcon = formData.icon_name ? getIcon(formData.icon_name) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">TOOLS & SOFTWARE</h1>
        <p className="text-muted-foreground mt-1">Manage your software and tools mastery</p>
      </div>

      {/* Add New Tool Button */}
      {!isAdding && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setIsAdding(true);
            setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: (tools?.length || 0) + 1 });
          }}
          className="w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add New Tool
        </motion.button>
      )}

      {/* Add New Tool Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-card border border-primary rounded-xl"
          >
            <h3 className="font-medium text-lg mb-4">Add New Tool</h3>
            <div className="flex gap-4 flex-wrap items-end">
              {/* Icon Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Icon</label>
                <button
                  type="button"
                  onClick={() => openIconPicker("new")}
                  className="w-14 h-14 flex items-center justify-center bg-secondary border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300"
                >
                  {FormIcon ? (
                    <FormIcon size={24} className="text-primary" />
                  ) : (
                    <Smile size={24} className="text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Tool Name</label>
                <input
                  type="text"
                  placeholder="e.g. Adobe Premiere Pro, Figma..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Proficiency Level */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Proficiency</label>
                <select
                  value={formData.proficiency_level}
                  onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
                  className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:outline-none transition-colors min-w-[150px]"
                >
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={!formData.name.trim() || saveMutation.isPending}
                  className="h-[50px] px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 });
                  }}
                  className="h-[50px] px-4 border border-border rounded-lg hover:bg-secondary transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {tools?.map((tool) => {
            const ToolIcon = getIcon(tool.icon_name);
            const isEditing = editingId === tool.id;
            const EditIcon = formData.icon_name ? getIcon(formData.icon_name) : null;

            return (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative p-5 bg-card border rounded-xl transition-all duration-300 ${
                  isEditing ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                }`}
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => openIconPicker(tool.id)}
                        className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-secondary border-2 border-dashed border-border rounded-xl hover:border-primary transition-all"
                      >
                        {EditIcon ? (
                          <EditIcon size={24} className="text-primary" />
                        ) : (
                          <Smile size={24} className="text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                        />
                        <select
                          value={formData.proficiency_level}
                          onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                        >
                          {proficiencyLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 });
                        }}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => saveMutation.mutate({ ...formData, id: tool.id })}
                        disabled={saveMutation.isPending}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                      {ToolIcon ? (
                        <ToolIcon size={26} className="text-primary" />
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          {tool.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{tool.name}</h4>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getProficiencyColor(tool.proficiency_level)}`}>
                        {tool.proficiency_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(tool)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(tool.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {tools?.length === 0 && !isAdding && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tools added yet. Add your first tool above!</p>
        </div>
      )}

      {/* Icon Picker Modal */}
      <IconPicker
        selectedIcon={formData.icon_name}
        onSelect={handleIconSelect}
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
      />
    </div>
  );
};

export default AdminSoftwareTools;
