import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, X, Check, ExternalLink } from "lucide-react";
import { SortableList } from "./SortableList";
import IconPicker from "./IconPicker";
import { Switch } from "@/components/ui/switch";
import { icons } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
  order_index: number | null;
}

const AdminFooterSocial = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({
    platform: "",
    url: "",
    icon_name: "",
    is_active: true,
  });

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = icons[iconName as keyof typeof icons];
    if (!IconComponent) return null;
    return <IconComponent size={18} />;
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("footer_social_links")
      .select("*")
      .order("order_index");

    if (error) {
      toast.error("Failed to load social links");
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const handleReorder = async (reorderedLinks: SocialLink[]) => {
    setLinks(reorderedLinks);

    const updates = reorderedLinks.map((link, index) => ({
      id: link.id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from("footer_social_links")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
    }

    toast.success("Order updated!");
  };

  const handleAdd = async () => {
    if (!newLink.platform.trim() || !newLink.url.trim()) {
      toast.error("Platform and URL are required");
      return;
    }

    const { data, error } = await supabase
      .from("footer_social_links")
      .insert({
        platform: newLink.platform.trim(),
        url: newLink.url.trim(),
        icon_name: newLink.icon_name || null,
        is_active: newLink.is_active,
        order_index: links.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add social link");
    } else {
      setLinks([...links, data]);
      setNewLink({ platform: "", url: "", icon_name: "", is_active: true });
      setIsAdding(false);
      toast.success("Social link added!");
    }
  };

  const handleUpdate = async (id: string, updates: Partial<SocialLink>) => {
    const { error } = await supabase
      .from("footer_social_links")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update social link");
    } else {
      setLinks(links.map((l) => (l.id === id ? { ...l, ...updates } : l)));
      toast.success("Social link updated!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this social link?")) return;

    const { error } = await supabase
      .from("footer_social_links")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete social link");
    } else {
      setLinks(links.filter((l) => l.id !== id));
      toast.success("Social link deleted!");
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
          <h1 className="font-display text-3xl">FOOTER SOCIAL LINKS</h1>
          <p className="text-muted-foreground mt-1">
            Manage social media links in footer
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-300"
        >
          <Plus size={18} />
          Add Link
        </button>
      </div>

      {/* Add New Link Form */}
      {isAdding && (
        <div className="p-6 bg-secondary/50 border border-border space-y-4">
          <h3 className="font-medium text-lg">Add New Social Link</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Platform Name *
              </label>
              <input
                type="text"
                value={newLink.platform}
                onChange={(e) =>
                  setNewLink({ ...newLink, platform: e.target.value })
                }
                className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g., LinkedIn, Twitter..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">URL *</label>
              <input
                type="text"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                className="w-full px-4 py-3 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Icon</label>
            <button
              type="button"
              onClick={() => setIconPickerOpen("new")}
              className="w-full px-4 py-3 bg-background border border-border text-foreground hover:border-primary transition-colors flex items-center gap-2"
            >
              {newLink.icon_name ? (
                <>
                  {renderIcon(newLink.icon_name)}
                  <span>{newLink.icon_name}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Select icon...</span>
              )}
            </button>
          </div>

          <IconPicker
            selectedIcon={newLink.icon_name}
            onSelect={(icon) => setNewLink({ ...newLink, icon_name: icon })}
            isOpen={iconPickerOpen === "new"}
            onClose={() => setIconPickerOpen(null)}
          />

          <div className="flex items-center gap-3">
            <Switch
              checked={newLink.is_active}
              onCheckedChange={(checked) =>
                setNewLink({ ...newLink, is_active: checked })
              }
            />
            <span className="text-sm text-muted-foreground">Active</span>
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
                setNewLink({
                  platform: "",
                  url: "",
                  icon_name: "",
                  is_active: true,
                });
              }}
              className="px-6 py-3 border border-border text-foreground font-medium flex items-center gap-2 hover:border-primary transition-all duration-300"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Social Links List */}
      <SortableList
        items={links}
        onReorder={handleReorder}
        renderItem={(link) => (
          <div className="p-4 bg-secondary/50 border border-border">
            <div className="flex items-center gap-4">
              <div className="flex-1 grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) =>
                      handleUpdate(link.id, { platform: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">URL</label>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) =>
                      handleUpdate(link.id, { url: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Icon</label>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(link.id)}
                    className="w-full px-3 py-2 bg-background border border-border text-foreground hover:border-primary transition-colors flex items-center gap-2 text-sm"
                  >
                    {link.icon_name ? (
                      <>
                        {renderIcon(link.icon_name)}
                        <span className="truncate">{link.icon_name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select...</span>
                    )}
                  </button>
                  <IconPicker
                    selectedIcon={link.icon_name}
                    onSelect={(icon) => handleUpdate(link.id, { icon_name: icon })}
                    isOpen={iconPickerOpen === link.id}
                    onClose={() => setIconPickerOpen(null)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={(checked) =>
                      handleUpdate(link.id, { is_active: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {link.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {links.length === 0 && !isAdding && (
        <div className="text-center py-16 text-muted-foreground">
          No social links yet. Click "Add Link" to get started.
        </div>
      )}
    </div>
  );
};

export default AdminFooterSocial;