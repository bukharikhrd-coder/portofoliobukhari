import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Category = "all" | "design" | "website" | "tools" | "project";

interface Project {
  id: number;
  title: string;
  category: Category;
  description: string;
  image: string;
  tags: string[];
  year: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    category: "website",
    description: "Full-stack e-commerce solution with modern UI",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    tags: ["React", "Node.js", "MongoDB"],
    year: "2025",
  },
  {
    id: 2,
    title: "Brand Identity Design",
    category: "design",
    description: "Complete brand identity for tech startup",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    tags: ["Branding", "Figma", "Illustrator"],
    year: "2025",
  },
  {
    id: 3,
    title: "Task Automation Tool",
    category: "tools",
    description: "Productivity tool for workflow automation",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    tags: ["Python", "Automation", "API"],
    year: "2024",
  },
  {
    id: 4,
    title: "Portfolio Website",
    category: "website",
    description: "Creative portfolio for photographer",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
    tags: ["Next.js", "Framer Motion", "Tailwind"],
    year: "2024",
  },
  {
    id: 5,
    title: "Mobile App UI",
    category: "design",
    description: "Finance app interface design",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    tags: ["UI/UX", "Figma", "Prototype"],
    year: "2024",
  },
  {
    id: 6,
    title: "Content Management System",
    category: "project",
    description: "Custom CMS for media company",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    tags: ["TypeScript", "PostgreSQL", "React"],
    year: "2024",
  },
];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Works" },
  { value: "design", label: "Design" },
  { value: "website", label: "Website" },
  { value: "tools", label: "Tools" },
  { value: "project", label: "Project" },
];

const Works = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const filteredProjects = projects.filter(
    (project) => activeCategory === "all" || project.category === activeCategory
  );

  return (
    <section id="works" className="py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">Portfolio</span>
          <h2 className="font-display text-5xl md:text-7xl mt-4">
            SELECTED <span className="text-gradient">WORKS</span>
          </h2>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-6 py-2 text-sm tracking-wide transition-all duration-300 ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="group cursor-pointer card-hover"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-card mb-6">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Hover overlay */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center">
                    <ArrowUpRight className="text-primary-foreground" size={24} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-primary text-xs tracking-[0.2em] uppercase">
                    {project.category}
                  </span>
                  <span className="text-muted-foreground text-sm">{project.year}</span>
                </div>
                <h3 className="font-display text-2xl group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-muted-foreground px-2 py-1 bg-muted/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Works;
