import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Save, Package } from "lucide-react";

interface ServicePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  order_index: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

const AdminServicePackages = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    features: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("service_packages")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;

      const parsedPackages = (data || []).map((pkg) => ({
        ...pkg,
        features: Array.isArray(pkg.features) 
          ? pkg.features.map((f) => String(f)) 
          : [],
      }));

      setPackages(parsedPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Gagal memuat paket layanan");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      features: "",
      is_active: true,
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    try {
      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f);

      const { error } = await supabase.from("service_packages").insert({
        name: formData.name,
        description: formData.description || null,
        price: parseInt(formData.price),
        features: featuresArray,
        is_active: formData.is_active,
        order_index: packages.length,
      });

      if (error) throw error;

      toast.success("Paket berhasil ditambahkan!");
      resetForm();
      setShowAddForm(false);
      fetchPackages();
    } catch (error) {
      console.error("Error adding package:", error);
      toast.error("Gagal menambahkan paket");
    }
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price.toString(),
      features: pkg.features.join("\n"),
      is_active: pkg.is_active,
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name || !formData.price) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    try {
      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f);

      const { error } = await supabase
        .from("service_packages")
        .update({
          name: formData.name,
          description: formData.description || null,
          price: parseInt(formData.price),
          features: featuresArray,
          is_active: formData.is_active,
        })
        .eq("id", editingId);

      if (error) throw error;

      toast.success("Paket berhasil diperbarui!");
      setEditingId(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Gagal memperbarui paket");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus paket ini?")) return;

    try {
      const { error } = await supabase
        .from("service_packages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Paket berhasil dihapus!");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Gagal menghapus paket");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("service_packages")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchPackages();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Gagal mengubah status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display mb-2">Service Packages</h1>
          <p className="text-muted-foreground">
            Kelola paket layanan pembuatan website
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus size={16} className="mr-2" />
          Tambah Paket
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display">Tambah Paket Baru</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Paket *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Paket Basic"
              />
            </div>
            <div className="space-y-2">
              <Label>Harga (Rupiah) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="500000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi singkat paket"
            />
          </div>

          <div className="space-y-2">
            <Label>Fitur (satu per baris)</Label>
            <Textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Website 1 halaman&#10;Desain responsif&#10;Hosting gratis&#10;SSL certificate"
              className="min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Aktif</Label>
          </div>

          <Button onClick={handleAdd}>
            <Save size={16} className="mr-2" />
            Simpan Paket
          </Button>
        </div>
      )}

      {/* Packages List */}
      <div className="space-y-4">
        {packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>Belum ada paket layanan</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-card border ${
                pkg.is_active ? "border-border" : "border-destructive/30"
              } p-6`}
            >
              {editingId === pkg.id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Paket *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Harga (Rupiah) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fitur (satu per baris)</Label>
                    <Textarea
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Aktif</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate}>
                      <Save size={16} className="mr-2" />
                      Simpan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        resetForm();
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg">{pkg.name}</h3>
                      {!pkg.is_active && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                    )}
                    <p className="text-xl font-display text-primary">
                      Rp {formatPrice(pkg.price)}
                    </p>
                    {pkg.features.length > 0 && (
                      <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                        {pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-primary">+{pkg.features.length - 3} fitur lainnya</li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={() => handleToggleActive(pkg.id, pkg.is_active)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminServicePackages;
