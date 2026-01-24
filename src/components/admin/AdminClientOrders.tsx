import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Eye, 
  X, 
  Save, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Loader2,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ClientOrder {
  id: string;
  order_number: string;
  package_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  status: string;
  stripe_session_id: string | null;
  requirements: any;
  notes: string | null;
  project_url: string | null;
  amount_paid: number | null;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  service_packages: { name: string } | null;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Menunggu Pembayaran", icon: Clock, color: "text-yellow-500" },
  paid: { label: "Dibayar", icon: CreditCard, color: "text-blue-500" },
  in_progress: { label: "Dalam Pengerjaan", icon: Loader2, color: "text-primary" },
  completed: { label: "Selesai", icon: CheckCircle, color: "text-green-500" },
  cancelled: { label: "Dibatalkan", icon: XCircle, color: "text-destructive" },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const AdminClientOrders = () => {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [editData, setEditData] = useState({
    status: "",
    notes: "",
    project_url: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("client_orders")
        .select("*, service_packages(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Gagal memuat data order");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: ClientOrder) => {
    setSelectedOrder(order);
    setEditData({
      status: order.status,
      notes: order.notes || "",
      project_url: order.project_url || "",
    });
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const updateData: any = {
        status: editData.status,
        notes: editData.notes || null,
        project_url: editData.project_url || null,
      };

      // Set completed_at if status is completed
      if (editData.status === "completed" && selectedOrder.status !== "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("client_orders")
        .update(updateData)
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast.success("Order berhasil diperbarui!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Gagal memperbarui order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

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
          <h1 className="text-2xl font-display mb-2">Client Orders</h1>
          <p className="text-muted-foreground">
            Kelola order dari klien
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
            <SelectItem value="paid">Dibayar</SelectItem>
            <SelectItem value="in_progress">Dalam Pengerjaan</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
            <p>Belum ada order</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="bg-card border border-border p-6 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm">{order.order_number}</span>
                    <span className={`flex items-center gap-1 text-sm ${status.color}`}>
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Klien:</strong> {order.client_name} ({order.client_email})</p>
                    <p><strong>Paket:</strong> {order.service_packages?.name || "-"}</p>
                    <p><strong>Total:</strong> {order.amount_paid ? formatPrice(order.amount_paid) : "-"}</p>
                    <p><strong>Tanggal:</strong> {format(new Date(order.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}</p>
                  </div>
                </div>

                <Button variant="outline" onClick={() => handleViewOrder(order)}>
                  <Eye size={16} className="mr-2" />
                  Detail
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Detail Order</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nomor Order</Label>
                  <p className="font-mono">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Paket</Label>
                  <p>{selectedOrder.service_packages?.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Bayar</Label>
                  <p>{selectedOrder.amount_paid ? formatPrice(selectedOrder.amount_paid) : "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tanggal Order</Label>
                  <p>{format(new Date(selectedOrder.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="border-t border-border pt-4">
                <h3 className="font-medium mb-3">Informasi Klien</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nama</Label>
                    <p>{selectedOrder.client_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedOrder.client_email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">No. Telepon</Label>
                    <p>{selectedOrder.client_phone || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {selectedOrder.requirements && Object.keys(selectedOrder.requirements).length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-3">Kebutuhan Klien</h3>
                  <div className="bg-muted/50 p-4 text-sm">
                    {typeof selectedOrder.requirements === "object" ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedOrder.requirements, null, 2)}
                      </pre>
                    ) : (
                      selectedOrder.requirements
                    )}
                  </div>
                </div>
              )}

              {/* Edit Section */}
              <div className="border-t border-border pt-4 space-y-4">
                <h3 className="font-medium">Update Order</h3>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                      <SelectItem value="paid">Dibayar</SelectItem>
                      <SelectItem value="in_progress">Dalam Pengerjaan</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL Project (setelah selesai)</Label>
                  <Input
                    value={editData.project_url}
                    onChange={(e) => setEditData({ ...editData, project_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catatan Internal</Label>
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Catatan untuk referensi internal..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateOrder}>
                    <Save size={16} className="mr-2" />
                    Simpan Perubahan
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientOrders;
