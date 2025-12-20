import { useState, useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Category = "all" | "design" | "website" | "tools" | "project";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  tags: string[];
  year: string | null;
  demo_url: string | null;
  github_url: string | null;
}

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Works" },
  { value: "design", label: "Design" },
  { value: "website", label: "Website" },
  { value: "tools", label: "Tools" },
  { value: "project", label: "Project" },
];

const Works = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("order_index");

      if (projectsData) {
        const projectsWithTags = await Promise.all(
          projectsData.map(async (project) => {
            const { data: tags } = await supabase
              .from("project_tags")
              .select("tag")
              .eq("project_id", project.id);
            return { ...project, tags: tags?.map((t) => t.tag) || [] };
          })
        );
        setProjects(projectsWithTags);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) => activeCategory === "all" || project.category === activeCategory
  );

  return (
    <section id="works" className="py-32 bg-secondary/30 relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 opacity-5"
        style={{ y }}
      >
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="group cursor-pointer card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-card mb-6">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <a 
                    href={project.demo_url || project.github_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-primary flex items-center justify-center"
                  >
                    <ArrowUpRight className="text-primary-foreground" size={24} />
                  </a>
                </div>
              </div>

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
