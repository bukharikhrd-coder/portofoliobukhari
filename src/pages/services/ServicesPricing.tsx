import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const ServicesPricing = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("service_packages")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Parse features from JSONB
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

  const handleSelectPackage = (packageId: string) => {
    navigate(`/services/checkout/${packageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Link
            to="/services"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-6"
        >
          <h1 className="text-4xl md:text-5xl font-display mb-4">
            PILIH PAKET ANDA
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Semua paket sudah termasuk hosting gratis, SSL certificate, 
            dan support pasca pembuatan
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          {packages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                Belum ada paket layanan tersedia.
              </p>
              <Button asChild variant="outline">
                <a href="mailto:hello@bukhari.dev">Hubungi Kami</a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-card border ${
                    index === 1 ? "border-primary" : "border-border"
                  } p-8 flex flex-col`}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium">
                      POPULER
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-display text-2xl mb-2">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-display">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPackage(pkg.id)}
                    className="w-full"
                    variant={index === 1 ? "default" : "outline"}
                  >
                    Pilih Paket Ini
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-2xl font-display text-center mb-8">
            PERTANYAAN UMUM
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <h3 className="font-medium mb-2">Berapa lama waktu pengerjaan?</h3>
              <p className="text-sm text-muted-foreground">
                Waktu pengerjaan rata-rata 3-7 hari kerja tergantung kompleksitas dan paket yang dipilih.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="font-medium mb-2">Apakah bisa revisi?</h3>
              <p className="text-sm text-muted-foreground">
                Ya, setiap paket sudah termasuk revisi. Jumlah revisi tergantung paket yang dipilih.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="font-medium mb-2">Bagaimana dengan hosting?</h3>
              <p className="text-sm text-muted-foreground">
                Website akan di-host menggunakan platform modern dengan hosting gratis. 
                Anda juga bisa menggunakan custom domain sendiri.
              </p>
            </div>
            <div className="pb-6">
              <h3 className="font-medium mb-2">Metode pembayaran apa yang tersedia?</h3>
              <p className="text-sm text-muted-foreground">
                Kami menerima pembayaran melalui Stripe yang mendukung kartu kredit/debit, 
                dan berbagai metode pembayaran lokal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Bukhari, S.Kom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPricing;
