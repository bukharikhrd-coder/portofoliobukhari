import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, Palette, Code, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Palette,
    title: "Desain Modern",
    description: "Tampilan profesional dengan desain minimalis dan elegan yang sesuai tren"
  },
  {
    icon: Code,
    title: "Kode Berkualitas",
    description: "Dibangun dengan teknologi terkini: React, TypeScript, dan Tailwind CSS"
  },
  {
    icon: Zap,
    title: "Performa Cepat",
    description: "Website dioptimasi untuk kecepatan loading dan pengalaman pengguna terbaik"
  },
  {
    icon: Clock,
    title: "Proses Cepat",
    description: "Pengerjaan 3-7 hari kerja dengan update progress berkala"
  }
];

const processSteps = [
  { number: "01", title: "Konsultasi", description: "Diskusi kebutuhan dan tujuan website Anda" },
  { number: "02", title: "Pembayaran", description: "Pilih paket dan bayar melalui Stripe" },
  { number: "03", title: "Pengerjaan", description: "Tim kami mulai membangun website Anda" },
  { number: "04", title: "Serah Terima", description: "Review, revisi, dan website siap online" }
];

const ServicesHome = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium mb-6">
              JASA PEMBUATAN WEBSITE
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display leading-tight mb-6">
              WEBSITE PORTFOLIO
              <br />
              <span className="text-primary">PROFESIONAL</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Tingkatkan personal branding Anda dengan website portfolio yang modern, 
              responsif, dan dioptimasi untuk tampil di halaman pertama pencarian.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/services/pricing">
                  Lihat Paket & Harga
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <a href="mailto:hello@bukhari.dev">
                  <MessageSquare className="mr-2" size={20} />
                  Konsultasi Gratis
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              KENAPA MEMILIH KAMI?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami tidak hanya membuat website, tapi juga membantu Anda 
              membangun identitas digital yang kuat.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background p-6 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-display text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              PROSES PEMBUATAN
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Proses yang simpel dan transparan dari awal hingga website Anda online
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-display text-primary/20 mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <div className="border-t-2 border-dashed border-border w-3/4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              SIAP MEMULAI?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Pilih paket yang sesuai dengan kebutuhan Anda dan mulai bangun 
              website portfolio profesional Anda hari ini.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/services/pricing">
                Lihat Paket & Harga
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Bukhari, S.Kom. All rights reserved.</p>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">
            ← Kembali ke Portfolio
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default ServicesHome;
