import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, Check, X, Smile } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IconPicker from "./IconPicker";
import { SortableItemWrapper } from "./SortableList";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ToolItem {
  id: string;
  name: string;
  icon_name: string | null;
  proficiency_level: string | null;
  order_index: number | null;
}

const proficiencyLevels = ["Expert", "Advanced", "Intermediate", "Beginner"];

const AdminSoftwareTools = () => {
  const [items, setItems] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 });
  const [showIconPicker, setShowIconPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("video_tools").select("*").order("order_index");
    if (error) toast.error("Failed to load tools");
    else setItems(data || []);
    setLoading(false);
  };

  const getIcon = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) {
      return icon as LucideIcon;
    }
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      for (let i = 0; i < newItems.length; i++) {
        await supabase.from("video_tools").update({ order_index: i }).eq("id", newItems[i].id);
      }
      toast.success("Order updated");
    }
  };

  const saveTool = async () => {
    if (!formData.name.trim()) return;
    
    if (editingId) {
      const { error } = await supabase.from("video_tools").update({
        name: formData.name,
        icon_name: formData.icon_name || null,
        proficiency_level: formData.proficiency_level
      }).eq("id", editingId);
      
      if (error) toast.error("Failed to update");
      else {
        setItems(items.map(i => i.id === editingId ? { ...i, ...formData } : i));
        toast.success("Tool updated");
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from("video_tools").insert({
        name: formData.name,
        icon_name: formData.icon_name || null,
        proficiency_level: formData.proficiency_level,
        order_index: items.length
      }).select().single();
      
      if (error) toast.error("Failed to add");
      else {
        setItems([...items, data]);
        toast.success("Tool added");
        setIsAdding(false);
      }
    }
    setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 });
  };

  const deleteTool = async (id: string) => {
    const { error } = await supabase.from("video_tools").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setItems(items.filter(i => i.id !== id));
      toast.success("Tool deleted");
    }
  };

  const startEdit = (tool: ToolItem) => {
    setEditingId(tool.id);
    setFormData({ name: tool.name, icon_name: tool.icon_name || "", proficiency_level: tool.proficiency_level || "Intermediate", order_index: tool.order_index || 0 });
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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const FormIcon = formData.icon_name ? getIcon(formData.icon_name) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">TOOLS & SOFTWARE</h1>
        <p className="text-muted-foreground mt-1">Drag items to reorder</p>
      </div>

      {!isAdding && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setIsAdding(true); setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: items.length }); }} className="w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
          <Plus size={20} /> Add New Tool
        </motion.button>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-6 bg-card border border-primary rounded-xl">
            <h3 className="font-medium text-lg mb-4">Add New Tool</h3>
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Icon</label>
                <button type="button" onClick={() => setShowIconPicker(true)} className="w-14 h-14 flex items-center justify-center bg-secondary border-2 border-dashed border-border rounded-xl hover:border-primary transition-all">
                  {FormIcon ? <FormIcon size={24} className="text-primary" /> : <Smile size={24} className="text-muted-foreground" />}
                </button>
              </div>
              <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Tool Name</label>
                <input type="text" placeholder="e.g. Adobe Premiere Pro" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Proficiency</label>
                <select value={formData.proficiency_level} onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })} className="px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none min-w-[150px]">
                  {proficiencyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={saveTool} disabled={!formData.name.trim()} className="h-[50px] px-6 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 flex items-center gap-2"><Check size={18} /> Save</button>
                <button onClick={() => { setIsAdding(false); setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 }); }} className="h-[50px] px-4 border border-border rounded-lg"><X size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((tool) => {
                const ToolIcon = getIcon(tool.icon_name);
                const isEditing = editingId === tool.id;
                const EditIcon = formData.icon_name ? getIcon(formData.icon_name) : null;

                return (
                  <SortableItemWrapper key={tool.id} id={tool.id} disabled={editingId !== null}>
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`relative p-5 bg-card border rounded-xl transition-all ${isEditing ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <button type="button" onClick={() => setShowIconPicker(true)} className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-secondary border-2 border-dashed border-border rounded-xl hover:border-primary transition-all">
                              {EditIcon ? <EditIcon size={24} className="text-primary" /> : <Smile size={24} className="text-muted-foreground" />}
                            </button>
                            <div className="flex-1 space-y-2">
                              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                              <select value={formData.proficiency_level} onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none">
                                {proficiencyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setEditingId(null); setFormData({ name: "", icon_name: "", proficiency_level: "Intermediate", order_index: 0 }); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"><X size={18} /></button>
                            <button onClick={saveTool} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Check size={18} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                            {ToolIcon ? <ToolIcon size={26} className="text-primary" /> : <span className="text-xl font-bold text-primary">{tool.name.charAt(0)}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{tool.name}</h4>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getProficiencyColor(tool.proficiency_level)}`}>{tool.proficiency_level}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEdit(tool)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Pencil size={16} /></button>
                            <button onClick={() => deleteTool(tool.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </SortableItemWrapper>
                );
              })}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !isAdding && <div className="text-center py-12 text-muted-foreground"><p>No tools added yet. Add your first tool above!</p></div>}

      <IconPicker selectedIcon={formData.icon_name} onSelect={(icon) => setFormData({ ...formData, icon_name: icon })} isOpen={showIconPicker} onClose={() => setShowIconPicker(false)} />
    </div>
  );
};

export default AdminSoftwareTools;
