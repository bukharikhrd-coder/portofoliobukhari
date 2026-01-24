import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ServicesSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requirementsSubmitted, setRequirementsSubmitted] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("client_orders")
        .select("*, service_packages(name)")
        .eq("stripe_session_id", sessionId)
        .single();

      if (error) throw error;
      setOrder(data);

      // Check if requirements already submitted
      if (data.requirements && Object.keys(data.requirements).length > 0) {
        setRequirementsSubmitted(true);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequirements = async () => {
    if (!requirements.trim()) {
      toast.error("Mohon isi kebutuhan website Anda");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("client_orders")
        .update({
          requirements: { description: requirements },
        })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Kebutuhan Anda berhasil dikirim!");
      setRequirementsSubmitted(true);
    } catch (error) {
      console.error("Error submitting requirements:", error);
      toast.error("Gagal mengirim kebutuhan");
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>

        <h1 className="text-3xl font-display mb-4">PEMBAYARAN BERHASIL!</h1>
        
        {order && (
          <div className="bg-card border border-border p-6 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nomor Order</span>
                <span className="font-mono">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket</span>
                <span>{order.service_packages?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-500 font-medium">Dibayar</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-muted-foreground mb-8">
          Terima kasih atas kepercayaan Anda! Kami akan segera memulai 
          pengerjaan website Anda.
        </p>

        {order && !requirementsSubmitted && (
          <div className="bg-card border border-border p-6 mb-6 text-left">
            <Label className="mb-3 block">
              Ceritakan kebutuhan website Anda:
            </Label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Contoh: Saya ingin website portfolio untuk menampilkan karya desain grafis saya. Warna yang saya suka adalah biru dan putih. Saya ingin ada galeri foto dan halaman kontak..."
              className="min-h-[150px] mb-4"
            />
            <Button
              onClick={handleSubmitRequirements}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Mengirim...
                </>
              ) : (
                "Kirim Kebutuhan"
              )}
            </Button>
          </div>
        )}

        {requirementsSubmitted && (
          <div className="bg-green-500/10 border border-green-500/30 p-4 mb-6 text-green-500 text-sm">
            ✓ Kebutuhan Anda sudah kami terima
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Langkah Selanjutnya:</h3>
          <ol className="text-sm text-muted-foreground text-left space-y-2">
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>Kami akan menghubungi Anda via email/WhatsApp dalam 1x24 jam</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>Diskusi detail kebutuhan dan preferensi desain</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Pengerjaan website sesuai timeline yang disepakati</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>Review, revisi, dan serah terima website</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link to="/">
              Kembali ke Homepage
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ServicesSuccess;
