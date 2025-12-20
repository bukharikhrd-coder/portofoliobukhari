import { motion } from "framer-motion";
import profilePhoto from "@/assets/profile-photo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Grid lines decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-foreground" />
        <div className="absolute left-2/4 top-0 bottom-0 w-px bg-foreground" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-foreground" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Top label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-px bg-primary" />
              <span className="text-muted-foreground text-sm tracking-[0.3em] uppercase">
                Creative Developer & Designer
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="font-display text-[clamp(3rem,12vw,10rem)] leading-[0.85] tracking-tight">
                <span className="block text-foreground">BUKHARI</span>
                <span className="block text-gradient">S.KOM</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted-foreground text-lg max-w-md leading-relaxed"
            >
              Crafting digital experiences through clean code, 
              thoughtful design, and creative innovation.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <a
                href="#works"
                className="px-8 py-4 bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-all duration-300"
              >
                VIEW WORKS
              </a>
              <a
                href="#contact"
                className="px-8 py-4 border border-border text-foreground font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300"
              >
                GET IN TOUCH
              </a>
            </motion.div>
          </div>

          {/* Right content - Photo & Info */}
          <div className="lg:col-span-5 relative">
            {/* Date badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -top-8 right-0 lg:top-0 lg:right-0 text-right z-20"
            >
              <p className="text-muted-foreground text-sm tracking-[0.2em]">DECEMBER / 2025</p>
              <p className="text-foreground font-medium mt-1">WIXBIHUB</p>
            </motion.div>

            {/* Photo container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mt-16 lg:mt-12"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={profilePhoto}
                  alt="Bukhari S.Kom - Creative Developer"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                {/* Photo overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              
              {/* Decorative frame */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
