import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

const platforms = ["youtube", "vimeo"];

const AdminVideoPortfolio = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", video_url: "", thumbnail_url: "", platform: "youtube", order_index: 0 });

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin_video_portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase.from("video_portfolio").select("*").order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { error } = await supabase.from("video_portfolio").update(data).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("video_portfolio").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_video_portfolio"] });
      toast.success("Video saved");
      setEditingId(null);
      setIsAdding(false);
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_portfolio").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_video_portfolio"] });
      toast.success("Video deleted");
    },
  });

  const handleSave = () => {
    if (!formData.title || !formData.video_url) {
      toast.error("Title and Video URL are required");
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Video Portfolio</h2>
        <button onClick={() => { setIsAdding(true); setFormData({ title: "", description: "", video_url: "", thumbnail_url: "", platform: "youtube", order_index: (videos?.length || 0) + 1 }); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground">
          <Plus size={18} /> Add Video
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <div className="bg-card border border-primary p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
              <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="px-4 py-3 bg-background border border-border">
                {platforms.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Video URL * (YouTube or Vimeo)" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none min-h-[80px]" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground"><Save size={18} /> Save</button>
              <button onClick={() => setIsAdding(false)} className="flex items-center gap-2 px-4 py-2 border border-border"><X size={18} /> Cancel</button>
            </div>
          </div>
        )}

        {videos?.map((video) => (
          <div key={video.id} className="bg-card border border-border p-6">
            {editingId === video.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none" />
                  <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="px-4 py-3 bg-background border border-border">
                    {platforms.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <input type="text" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="w-full px-4 py-3 bg-background border border-border" />
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border min-h-[80px]" />
                <div className="flex gap-2">
                  <button onClick={() => saveMutation.mutate({ ...formData, id: video.id })} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground"><Save size={18} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-4 py-2 border border-border"><X size={18} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                  <p className="text-muted-foreground text-sm">{video.platform} • {video.video_url}</p>
                  {video.description && <p className="text-sm text-muted-foreground mt-2">{video.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(video.id); setFormData(video); }} className="p-2 hover:bg-secondary"><Pencil size={18} /></button>
                  <button onClick={() => deleteMutation.mutate(video.id)} className="p-2 hover:bg-destructive/20 text-destructive"><Trash2 size={18} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVideoPortfolio;
