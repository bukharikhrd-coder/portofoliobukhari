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

interface TechItem {
  id: string;
  name: string;
  category: string | null;
  icon_name: string | null;
  order_index: number | null;
}

const categories = ["Frontend", "Backend", "Design", "DevOps", "Other"];

const AdminTechStack = () => {
  const [items, setItems] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: "", category: "Frontend", icon_name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", icon_name: "" });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<"new" | string>("new");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("tech_stack").select("*").order("category").order("order_index");
    if (error) toast.error("Failed to load tech stack");
    else setItems(data || []);
    setLoading(false);
  };

  const getIcon = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) return icon as LucideIcon;
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const categoryItems = items.filter(i => (i.category || "Other") === category);
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over.id);
      const newCategoryItems = arrayMove(categoryItems, oldIndex, newIndex);
      
      // Update local state
      const newItems = items.map(item => {
        const idx = newCategoryItems.findIndex(ci => ci.id === item.id);
        if (idx !== -1) return { ...item, order_index: idx };
        return item;
      });
      setItems(newItems);

      // Update database
      for (let i = 0; i < newCategoryItems.length; i++) {
        await supabase.from("tech_stack").update({ order_index: i }).eq("id", newCategoryItems[i].id);
      }
      toast.success("Order updated");
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    const { data, error } = await supabase.from("tech_stack").insert({ name: newItem.name.trim(), category: newItem.category, icon_name: newItem.icon_name || null, order_index: items.length }).select().single();
    if (error) toast.error("Failed to add item");
    else {
      setItems([...items, data]);
      setNewItem({ name: "", category: "Frontend", icon_name: "" });
      toast.success("Item added!");
    }
  };

  const startEdit = (item: TechItem) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, category: item.category || "Other", icon_name: item.icon_name || "" });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim()) return;
    const { error } = await supabase.from("tech_stack").update({ name: editForm.name.trim(), category: editForm.category, icon_name: editForm.icon_name || null }).eq("id", editingId);
    if (error) toast.error("Failed to update");
    else {
      setItems(items.map(item => item.id === editingId ? { ...item, name: editForm.name.trim(), category: editForm.category, icon_name: editForm.icon_name || null } : item));
      setEditingId(null);
      toast.success("Item updated!");
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("tech_stack").delete().eq("id", id);
    if (error) toast.error("Failed to remove");
    else {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item removed!");
    }
  };

  const openIconPicker = (target: "new" | string) => {
    setIconPickerTarget(target);
    setShowIconPicker(true);
  };

  const handleIconSelect = (iconName: string) => {
    if (iconPickerTarget === "new") setNewItem({ ...newItem, icon_name: iconName });
    else setEditForm({ ...editForm, icon_name: iconName });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, TechItem[]>);

  const NewItemIcon = newItem.icon_name ? getIcon(newItem.icon_name) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">TECH STACK</h1>
        <p className="text-muted-foreground mt-1">Drag items within categories to reorder</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-card border border-border rounded-xl">
        <h3 className="font-medium text-lg mb-4">Add New Technology</h3>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Icon</label>
            <button type="button" onClick={() => openIconPicker("new")} className="w-14 h-14 flex items-center justify-center bg-secondary border-2 border-dashed border-border rounded-xl hover:border-primary transition-all">
              {NewItemIcon ? <NewItemIcon size={24} className="text-primary" /> : <Smile size={24} className="text-muted-foreground" />}
            </button>
          </div>
          <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Technology Name</label>
            <input type="text" placeholder="e.g. React, Node.js..." value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem()} className="px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Category</label>
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none min-w-[140px]">
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <button onClick={addItem} disabled={!newItem.name.trim()} className="h-[50px] px-6 bg-primary text-primary-foreground font-medium flex items-center gap-2 rounded-lg disabled:opacity-50">
            <Plus size={18} /> Add
          </button>
        </div>
      </motion.div>

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = groupedItems[category] || [];
          if (categoryItems.length === 0) return null;

          return (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl text-primary">{category}</h3>
                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{categoryItems.length}</span>
              </div>
              
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, category)}>
                <SortableContext items={categoryItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {categoryItems.map((item) => {
                        const ItemIcon = getIcon(item.icon_name);
                        const isEditing = editingId === item.id;
                        const EditIcon = editForm.icon_name ? getIcon(editForm.icon_name) : null;

                        return (
                          <SortableItemWrapper key={item.id} id={item.id} disabled={editingId !== null}>
                            <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`relative p-4 bg-card border rounded-xl transition-all ${isEditing ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}>
                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <button type="button" onClick={() => openIconPicker(item.id)} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-secondary border-2 border-dashed border-border rounded-lg hover:border-primary transition-all">
                                      {EditIcon ? <EditIcon size={22} className="text-primary" /> : <Smile size={22} className="text-muted-foreground" />}
                                    </button>
                                    <div className="flex-1 space-y-2">
                                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                                      <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none">
                                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"><X size={18} /></button>
                                    <button onClick={saveEdit} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Check size={18} /></button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                                    {ItemIcon ? <ItemIcon size={24} className="text-primary" /> : <span className="text-lg font-bold text-primary">{item.name.charAt(0)}</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{item.name}</h4>
                                    <p className="text-xs text-muted-foreground">{item.icon_name || "No icon"}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => startEdit(item)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Pencil size={16} /></button>
                                    <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16} /></button>
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
            </motion.div>
          );
        })}
      </div>

      <IconPicker selectedIcon={iconPickerTarget === "new" ? newItem.icon_name : editForm.icon_name} onSelect={handleIconSelect} isOpen={showIconPicker} onClose={() => setShowIconPicker(false)} />
    </div>
  );
};

export default AdminTechStack;
