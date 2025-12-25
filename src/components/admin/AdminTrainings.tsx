import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, Award, Pencil, X, Check } from "lucide-react";
import { SortableList, SortableItemWrapper } from "./SortableList";
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

interface Training {
  id: string;
  title: string;
  organization: string | null;
  year: string | null;
  description: string | null;
  certificate_url: string | null;
  order_index: number | null;
}

const AdminTrainings = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Training>>({});
  const [localTrainings, setLocalTrainings] = useState<Training[]>([]);
  const [newTraining, setNewTraining] = useState({
    title: '',
    organization: '',
    year: '',
    description: '',
    certificate_url: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: trainings, isLoading } = useQuery({
    queryKey: ['admin-trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as Training[];
    }
  });

  useEffect(() => {
    if (trainings) {
      setLocalTrainings(trainings);
    }
  }, [trainings]);

  const addMutation = useMutation({
    mutationFn: async (training: typeof newTraining) => {
      const maxOrder = trainings?.reduce((max, t) => Math.max(max, t.order_index || 0), -1) ?? -1;
      const { error } = await supabase.from('trainings').insert({ ...training, order_index: maxOrder + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      setNewTraining({ title: '', organization: '', year: '', description: '', certificate_url: '' });
      setIsAdding(false);
      toast.success('Training added successfully');
    },
    onError: () => toast.error('Failed to add training')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Training> & { id: string }) => {
      const { error } = await supabase.from('trainings').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      setEditingId(null);
      toast.success('Training updated successfully');
    },
    onError: () => toast.error('Failed to update training')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trainings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      toast.success('Training deleted successfully');
    },
    onError: () => toast.error('Failed to delete training')
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: Training[]) => {
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase.from('trainings').update({ order_index: i }).eq('id', items[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to update order')
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localTrainings.findIndex((t) => t.id === active.id);
      const newIndex = localTrainings.findIndex((t) => t.id === over.id);
      const newItems = arrayMove(localTrainings, oldIndex, newIndex);
      setLocalTrainings(newItems);
      reorderMutation.mutate(newItems);
    }
  };

  const startEdit = (training: Training) => {
    setEditingId(training.id);
    setEditForm(training);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training & Certifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Drag items to reorder</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" /> Add Training
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/50">
          <CardHeader><CardTitle className="text-lg">Add New Training</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Training Title *" value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Organization" value={newTraining.organization} onChange={(e) => setNewTraining({ ...newTraining, organization: e.target.value })} />
              <Input placeholder="Year" value={newTraining.year} onChange={(e) => setNewTraining({ ...newTraining, year: e.target.value })} />
            </div>
            <Textarea placeholder="Description" value={newTraining.description} onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })} />
            <Input placeholder="Certificate URL (optional)" value={newTraining.certificate_url} onChange={(e) => setNewTraining({ ...newTraining, certificate_url: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={() => addMutation.mutate(newTraining)} disabled={!newTraining.title || addMutation.isPending}>Save Training</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localTrainings.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {localTrainings.map((training) => (
              <SortableItemWrapper key={training.id} id={training.id} disabled={editingId !== null}>
                <Card className="group">
                  <CardContent className="p-4">
                    {editingId === training.id ? (
                      <div className="space-y-4">
                        <Input placeholder="Training Title" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="Organization" value={editForm.organization || ''} onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })} />
                          <Input placeholder="Year" value={editForm.year || ''} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
                        </div>
                        <Textarea placeholder="Description" value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                        <Input placeholder="Certificate URL" value={editForm.certificate_url || ''} onChange={(e) => setEditForm({ ...editForm, certificate_url: e.target.value })} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateMutation.mutate({ id: training.id, ...editForm })} disabled={updateMutation.isPending}><Check className="w-4 h-4 mr-1" /> Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{training.title}</h3>
                          <div className="text-sm text-muted-foreground">{training.organization} {training.year && `• ${training.year}`}</div>
                          {training.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{training.description}</p>}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(training)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(training.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SortableItemWrapper>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default AdminTrainings;
