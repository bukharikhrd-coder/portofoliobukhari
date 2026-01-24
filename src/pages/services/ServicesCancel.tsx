import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServicesCancel = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-destructive" size={40} />
        </div>

        <h1 className="text-3xl font-display mb-4">PEMBAYARAN DIBATALKAN</h1>
        
        <p className="text-muted-foreground mb-8">
          Sepertinya Anda membatalkan proses pembayaran. Tidak ada tagihan 
          yang dikenakan. Jika Anda mengalami masalah, jangan ragu untuk 
          menghubungi kami.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/services/pricing">
              <ArrowLeft className="mr-2" size={16} />
              Kembali ke Pricing
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:hello@bukhari.dev">
              <MessageSquare className="mr-2" size={16} />
              Hubungi Kami
            </a>
          </Button>
        </div>

        <div className="mt-12 p-6 bg-card border border-border text-left">
          <h3 className="font-medium mb-3">Mengalami masalah?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Pastikan koneksi internet Anda stabil</li>
            <li>• Coba gunakan metode pembayaran yang berbeda</li>
            <li>• Pastikan kartu kredit/debit Anda aktif dan memiliki limit yang cukup</li>
            <li>• Jika masalah berlanjut, hubungi kami untuk bantuan</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ServicesCancel;
