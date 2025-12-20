import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

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
  const [newItem, setNewItem] = useState({ name: "", category: "Frontend" });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("tech_stack")
      .select("*")
      .order("category")
      .order("order_index");

    if (error) {
      toast.error("Failed to load tech stack");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;

    const { data, error } = await supabase
      .from("tech_stack")
      .insert({
        name: newItem.name.trim(),
        category: newItem.category,
        order_index: items.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add item");
    } else {
      setItems([...items, data]);
      setNewItem({ name: "", category: "Frontend" });
      toast.success("Item added!");
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("tech_stack").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to remove item");
    } else {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item removed!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, TechItem[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">TECH STACK</h1>
        <p className="text-muted-foreground mt-1">Manage your technologies and tools</p>
      </div>

      {/* Add new item */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Technology name..."
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1 min-w-[200px] px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          className="px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* Grouped items */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = groupedItems[category] || [];
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h3 className="font-display text-xl text-primary">{category}</h3>
              <div className="flex flex-wrap gap-3">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border group"
                  >
                    <span>{item.name}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTechStack;
