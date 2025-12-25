import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GripVertical, Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SectionConfig {
  id: string;
  section_key: string;
  section_name: string;
  order_index: number;
  is_visible: boolean;
}

interface SortableItemProps {
  section: SectionConfig;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const SortableItem = ({ section, onToggleVisibility }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-card border border-border rounded-lg transition-all ${
        isDragging ? "opacity-50 shadow-lg scale-105" : ""
      } ${!section.is_visible ? "opacity-60" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-secondary rounded"
      >
        <GripVertical size={20} className="text-muted-foreground" />
      </button>
      
      <div className="flex-1">
        <h3 className="font-medium">{section.section_name}</h3>
        <p className="text-sm text-muted-foreground">#{section.section_key}</p>
      </div>

      <div className="flex items-center gap-3">
        {section.is_visible ? (
          <Eye size={18} className="text-primary" />
        ) : (
          <EyeOff size={18} className="text-muted-foreground" />
        )}
        <Switch
          checked={section.is_visible}
          onCheckedChange={(checked) => onToggleVisibility(section.id, checked)}
        />
      </div>
    </div>
  );
};

const AdminSectionOrder = () => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("section_config")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      toast.error("Failed to load section configuration");
      console.error(error);
    } else {
      setSections(data || []);
    }
    setLoading(false);
    setHasChanges(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order_index for all items
        return newItems.map((item, index) => ({
          ...item,
          order_index: index,
        }));
      });
      setHasChanges(true);
    }
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setSections((items) =>
      items.map((item) =>
        item.id === id ? { ...item, is_visible: isVisible } : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Update all sections in batch
      const updates = sections.map((section) => ({
        id: section.id,
        section_key: section.section_key,
        section_name: section.section_name,
        order_index: section.order_index,
        is_visible: section.is_visible,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("section_config")
          .update({
            order_index: update.order_index,
            is_visible: update.is_visible,
          })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast.success("Section order saved successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save section order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display">Section Order</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display">Section Order</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop to reorder sections on the homepage. Toggle visibility to show/hide sections.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchSections}
            disabled={saving}
          >
            <RefreshCw size={16} className="mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Navbar and Hero sections are always displayed at the top and cannot be reordered.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <span>You have unsaved changes</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSave}
            disabled={saving}
          >
            Save Now
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSectionOrder;
