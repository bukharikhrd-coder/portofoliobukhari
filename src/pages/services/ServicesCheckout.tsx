import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServicePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  features: string[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const ServicesCheckout = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      const { data, error } = await supabase
        .from("service_packages")
        .select("*")
        .eq("id", packageId)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      setPackageData({
        ...data,
        features: Array.isArray(data.features) 
          ? data.features.map((f: any) => String(f)) 
          : [],
      });
    } catch (error) {
      console.error("Error fetching package:", error);
      toast.error("Paket tidak ditemukan");
      navigate("/services/pricing");
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Nama dan email wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      // Create order in database
      const orderNumber = generateOrderNumber();
      
      const { data: order, error: orderError } = await supabase
        .from("client_orders")
        .insert({
          order_number: orderNumber,
          package_id: packageId,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone || null,
          status: "pending",
          amount_paid: packageData?.price || 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Call edge function to create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            orderId: order.id,
            packageName: packageData?.name,
            price: packageData?.price,
            customerEmail: formData.email,
            customerName: formData.name,
          },
        }
      );

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutData.url;
      } else {
        throw new Error("Checkout URL not received");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(error.message || "Gagal membuat checkout session");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Paket tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Link
            to="/services/pricing"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Pricing
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="font-display text-2xl mb-6">RINGKASAN ORDER</h2>
            
            <div className="bg-card border border-border p-6 space-y-6">
              <div>
                <h3 className="font-display text-xl">{packageData.name}</h3>
                {packageData.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {packageData.description}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-3">Yang Termasuk:</h4>
                <ul className="space-y-2">
                  {packageData.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-display">
                    {formatPrice(packageData.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>Pembayaran Aman</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={16} />
                <span>Powered by Stripe</span>
              </div>
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="font-display text-2xl mb-6">DATA ANDA</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Bukti pembayaran akan dikirim ke email ini
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. WhatsApp (Opsional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Untuk koordinasi lebih lanjut
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2" size={20} />
                    Bayar dengan Stripe
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServicesCheckout;
