import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { SortableList } from "./SortableList";

interface JourneyItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  year: string | null;
  order_index: number | null;
}

const AdminWorkJourneyGallery = () => {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    image_url: "",
    year: "",
  });
  const [editItem, setEditItem] = useState<JourneyItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("work_journey_gallery")
      .select("*")
      .order("order_index");
    
    if (error) {
      toast.error("Failed to load gallery items");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleReorder = async (reorderedItems: JourneyItem[]) => {
    setItems(reorderedItems);
    
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from("work_journey_gallery")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
    }
    
    toast.success("Order updated!");
  };

  const handleAdd = async () => {
    if (!newItem.title.trim() || !newItem.image_url) {
      toast.error("Title and image are required");
      return;
    }

    const { data, error } = await supabase
      .from("work_journey_gallery")
      .insert({
        title: newItem.title.trim(),
        description: newItem.description.trim() || null,
        image_url: newItem.image_url,
        year: newItem.year.trim() || null,
        order_index: items.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add item");
    } else {
      setItems([...items, data]);
      setNewItem({ title: "", description: "", image_url: "", year: "" });
      setIsAdding(false);
      toast.success("Item added!");
    }
  };

  const handleEdit = (item: JourneyItem) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;

    const { error } = await supabase
      .from("work_journey_gallery")
      .update({
        title: editItem.title,
        description: editItem.description,
        image_url: editItem.image_url,
        year: editItem.year,
      })
      .eq("id", editItem.id);

    if (error) {
      toast.error("Failed to update item");
    } else {
      setItems(items.map(i => i.id === editItem.id ? editItem : i));
      setEditingId(null);
      setEditItem(null);
      toast.success("Item updated!");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("work_journey_gallery")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete item");
    } else {
      setItems(items.filter(i => i.id !== id));
      toast.success("Item deleted!");
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
          <h1 className="font-display text-3xl">WORK JOURNEY GALLERY</h1>
          <p className="text-muted-foreground mt-1">Manage your work journey collection</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Add New Item Form */}
      {isAdding && (
        <div className="p-6 bg-secondary/50 border border-border space-y-4">
          <h3 className="font-medium text-lg">Add New Gallery Item</h3>
          
          <ImageUpload
            currentImage={newItem.image_url}
            onImageChange={(url) => setNewItem({ ...newItem, image_url: url })}
            folder="journey"
            label="Gallery Image"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Title *</label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Year</label>
              <input
                type="text"
                value={newItem.year}
                onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Description</label>
            <textarea
              rows={3}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Add description..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300"
            >
              <Check size={18} />
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewItem({ title: "", description: "", image_url: "", year: "" });
              }}
              className="px-6 py-3 border border-border text-foreground font-medium flex items-center gap-2 hover:border-primary transition-all duration-300"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery List - Compact View */}
      <SortableList
        items={items}
        onReorder={handleReorder}
        renderItem={(item) => (
          <div className="group relative bg-secondary/50 border border-border overflow-hidden">
            {editingId === item.id && editItem ? (
              <div className="p-4 space-y-3">
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ImageUpload
                      currentImage={editItem.image_url}
                      onImageChange={(url) => setEditItem({ ...editItem, image_url: url })}
                      folder="journey"
                      label=""
                      compact
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Title"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editItem.year || ""}
                        onChange={(e) => setEditItem({ ...editItem, year: e.target.value })}
                        className="w-24 px-3 py-2 bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                        placeholder="Year"
                      />
                      <input
                        type="text"
                        value={editItem.description || ""}
                        onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                        className="flex-1 px-3 py-2 bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                        placeholder="Description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditItem(null); }}
                        className="px-4 py-1.5 border border-border text-foreground text-xs font-medium hover:border-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 flex-shrink-0 bg-secondary/50 overflow-hidden rounded">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.year && (
                      <span className="text-primary text-xs">{item.year}</span>
                    )}
                    {item.description && (
                      <span className="text-muted-foreground text-xs truncate">{item.description}</span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      />

      {items.length === 0 && !isAdding && (
        <div className="text-center py-16 text-muted-foreground">
          No gallery items yet. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
};

export default AdminWorkJourneyGallery;
