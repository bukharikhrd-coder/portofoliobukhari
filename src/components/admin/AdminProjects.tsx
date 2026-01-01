import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, X, Save, Upload } from "lucide-react";
import { SortableList } from "./SortableList";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  year: string | null;
  demo_url: string | null;
  github_url: string | null;
  is_featured: boolean | null;
  order_index: number | null;
  show_link: boolean | null;
  tags?: string[];
}

interface AdminProjectsProps {
  onUpdate?: () => void;
}

const categories = ["design", "website", "tools", "project"];

const AdminProjects = ({ onUpdate }: AdminProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyProject: Omit<Project, "id"> = {
    title: "",
    category: "project",
    description: "",
    image_url: "",
    year: new Date().getFullYear().toString(),
    demo_url: "",
    github_url: "",
    is_featured: false,
    order_index: 0,
    show_link: true,
    tags: [],
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data: projectsData, error } = await supabase
      .from("projects")
      .select("*")
      .order("order_index");

    if (error) {
      toast.error("Failed to load projects");
      return;
    }

    // Fetch tags for each project
    const projectsWithTags = await Promise.all(
      (projectsData || []).map(async (project) => {
        const { data: tags } = await supabase
          .from("project_tags")
          .select("tag")
          .eq("project_id", project.id);
        return { ...project, tags: tags?.map((t) => t.tag) || [] };
      })
    );

    setProjects(projectsWithTags);
    setLoading(false);
  };

  const handleReorder = async (reorderedProjects: Project[]) => {
    setProjects(reorderedProjects);
    
    const updates = reorderedProjects.map((project, index) => ({
      id: project.id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from("projects")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
    }
    
    toast.success("Order updated!");
  };

  const handleSave = async () => {
    if (!editingProject) return;
    
    setSaving(true);
    const { tags, ...projectData } = editingProject;
    
    if (isCreating) {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: projectData.title,
          category: projectData.category,
          description: projectData.description,
          image_url: projectData.image_url,
          year: projectData.year,
          demo_url: projectData.demo_url,
          github_url: projectData.github_url,
          is_featured: projectData.is_featured,
          show_link: projectData.show_link,
          order_index: projects.length,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create project");
        setSaving(false);
        return;
      }

      // Add tags
      if (tags && tags.length > 0) {
        await supabase.from("project_tags").insert(
          tags.map((tag) => ({ project_id: data.id, tag }))
        );
      }

      toast.success("Project created!");
    } else {
      const { error } = await supabase
        .from("projects")
        .update({
          title: projectData.title,
          category: projectData.category,
          description: projectData.description,
          image_url: projectData.image_url,
          year: projectData.year,
          demo_url: projectData.demo_url,
          github_url: projectData.github_url,
          is_featured: projectData.is_featured,
          show_link: projectData.show_link,
        })
        .eq("id", projectData.id);

      if (error) {
        toast.error("Failed to update project");
        setSaving(false);
        return;
      }

      // Update tags
      await supabase.from("project_tags").delete().eq("project_id", projectData.id);
      if (tags && tags.length > 0) {
        await supabase.from("project_tags").insert(
          tags.map((tag) => ({ project_id: projectData.id, tag }))
        );
      }

      toast.success("Project updated!");
    }

    setSaving(false);
    setEditingProject(null);
    setIsCreating(false);
    fetchProjects();
    onUpdate?.();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to delete project");
    } else {
      toast.success("Project deleted!");
      fetchProjects();
      onUpdate?.();
    }
  };

  const addTag = () => {
    if (!newTag.trim() || !editingProject) return;
    const tags = editingProject.tags || [];
    if (!tags.includes(newTag.trim())) {
      setEditingProject({ ...editingProject, tags: [...tags, newTag.trim()] });
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      tags: (editingProject.tags || []).filter((t) => t !== tag),
    });
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
          <h1 className="font-display text-3xl">PROJECTS</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => {
            setEditingProject({ ...emptyProject, id: "" } as Project);
            setIsCreating(true);
          }}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-display text-2xl">
                {isCreating ? "NEW PROJECT" : "EDIT PROJECT"}
              </h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsCreating(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Project Image</label>
                <div className="flex gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploading(true);
                      const fileExt = file.name.split(".").pop();
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                      
                      const { data, error } = await supabase.storage
                        .from("project-images")
                        .upload(fileName, file);

                      if (error) {
                        toast.error("Failed to upload image");
                        setUploading(false);
                        return;
                      }

                      const { data: publicUrl } = supabase.storage
                        .from("project-images")
                        .getPublicUrl(data.path);

                      setEditingProject({ ...editingProject!, image_url: publicUrl.publicUrl });
                      setUploading(false);
                      toast.success("Image uploaded!");
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 px-4 py-3 border border-dashed border-border hover:border-primary transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">Or enter URL manually:</div>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingProject.image_url || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, image_url: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                />
                {editingProject.image_url && (
                  <div className="relative">
                    <img
                      src={editingProject.image_url}
                      alt="Preview"
                      className="w-full h-40 object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingProject({ ...editingProject, image_url: "" })}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Year</label>
                  <input
                    type="text"
                    value={editingProject.year || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, year: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Demo URL</label>
                  <input
                    type="text"
                    value={editingProject.demo_url || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, demo_url: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-muted-foreground">GitHub URL</label>
                  <input
                    type="text"
                    value={editingProject.github_url || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, github_url: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>


              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingProject.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingProject.is_featured || false}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="featured" className="text-sm text-muted-foreground">
                    Featured Project
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_link"
                    checked={editingProject.show_link !== false}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, show_link: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="show_link" className="text-sm text-muted-foreground">
                    Show Link Button
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsCreating(false);
                }}
                className="px-6 py-3 border border-border text-foreground hover:border-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isCreating ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <SortableList
        items={projects}
        onReorder={handleReorder}
        renderItem={(project) => (
          <div className="bg-card border border-border overflow-hidden group">
            {project.image_url && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-primary text-xs tracking-wide uppercase">
                  {project.category}
                </span>
                <span className="text-muted-foreground text-sm">{project.year}</span>
              </div>
              <h3 className="font-medium text-lg">{project.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {(project.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground px-2 py-0.5 bg-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingProject(project)}
                  className="flex-1 py-2 border border-border text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="py-2 px-4 border border-border text-sm hover:border-destructive hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default AdminProjects;
