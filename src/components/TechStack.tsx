import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Code2, 
  Palette, 
  Database, 
  Globe, 
  Terminal, 
  Figma,
  Layers,
  Zap
} from "lucide-react";

const technologies = [
  { name: "React", icon: Code2, category: "Frontend" },
  { name: "TypeScript", icon: Terminal, category: "Language" },
  { name: "Next.js", icon: Globe, category: "Framework" },
  { name: "Node.js", icon: Zap, category: "Backend" },
  { name: "Tailwind CSS", icon: Layers, category: "Styling" },
  { name: "Figma", icon: Figma, category: "Design" },
  { name: "PostgreSQL", icon: Database, category: "Database" },
  { name: "UI/UX Design", icon: Palette, category: "Design" },
];

const TechStack = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="tech" className="py-32">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">
            Technologies
          </span>
          <h2 className="font-display text-5xl md:text-7xl mt-4">
            TOOLS & <span className="text-gradient">STACK</span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group"
            >
              <div className="relative p-8 bg-card border border-border hover:border-primary transition-all duration-500 card-hover">
                {/* Icon */}
                <div className="mb-6">
                  <tech.icon 
                    size={40} 
                    className="text-muted-foreground group-hover:text-primary transition-colors duration-300" 
                  />
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-muted-foreground tracking-wide uppercase">
                    {tech.category}
                  </p>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-primary/0 border-l-[40px] border-l-transparent group-hover:border-t-primary/20 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground">
            Always learning and exploring new technologies to deliver the best solutions
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
