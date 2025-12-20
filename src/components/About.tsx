import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import profilePhoto from "@/assets/profile-photo.png";

const skills = [
  "React / Next.js",
  "TypeScript",
  "Node.js",
  "UI/UX Design",
  "Figma",
  "Tailwind CSS",
  "Python",
  "Database Design",
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-32 relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16 items-center" ref={ref}>
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={profilePhoto}
                  alt="About Bukhari"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-primary" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-primary" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-primary text-sm tracking-[0.3em] uppercase">About Me</span>
              <h2 className="font-display text-5xl md:text-6xl mt-4 leading-tight">
                PASSIONATE ABOUT
                <br />
                <span className="text-gradient">DIGITAL CRAFT</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-lg leading-relaxed">
                Saya adalah seorang Creative Developer & Designer dengan passion 
                dalam menciptakan pengalaman digital yang memorable. Dengan latar 
                belakang di bidang teknologi informasi, saya menggabungkan keahlian 
                teknis dengan sense estetika untuk menghasilkan produk digital berkualitas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Fokus utama saya adalah web development, desain grafis, dan pengembangan 
                tools yang membantu meningkatkan produktivitas. Setiap project yang saya 
                kerjakan selalu mengutamakan clean code, performa optimal, dan user experience 
                yang seamless.
              </p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-foreground font-medium mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground text-sm border border-border hover:border-primary transition-colors duration-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border"
            >
              {[
                { number: "5+", label: "Years Experience" },
                { number: "50+", label: "Projects Done" },
                { number: "30+", label: "Happy Clients" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl text-primary">{stat.number}</p>
                  <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
