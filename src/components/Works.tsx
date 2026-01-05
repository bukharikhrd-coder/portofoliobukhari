import { useState, useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TranslatedText, useTranslatedContent } from "@/components/TranslatedText";

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
  show_link: boolean | null;
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

  const { items: translatedProjects } = useTranslatedContent(
    projects,
    ["title", "description"]
  );

  const filteredProjects = translatedProjects.filter(
    (project) => activeCategory === "all" || project.category === activeCategory
  );

  return (
    <section id="works" className="py-16 md:py-32 bg-secondary/30 relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 opacity-5"
        style={{ y }}
      >
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 lg:px-12" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <TranslatedText className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">Portfolio</TranslatedText>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl mt-3 md:mt-4">
            <TranslatedText>SELECTED</TranslatedText> <span className="text-gradient"><TranslatedText>WORKS</TranslatedText></span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 md:mb-16 relative z-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              type="button"
              className={`px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <TranslatedText>{cat.label}</TranslatedText>
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="group cursor-pointer card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-card mb-4 md:mb-6">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {project.show_link !== false && (project.demo_url || project.github_url) && (
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <a 
                      href={project.demo_url || project.github_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 md:w-12 md:h-12 bg-primary flex items-center justify-center"
                    >
                      <ArrowUpRight className="text-primary-foreground" size={20} />
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-primary text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase">
                    {project.category}
                  </span>
                  <span className="text-muted-foreground text-xs md:text-sm">{project.year}</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 md:gap-2 pt-1 md:pt-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-muted-foreground px-2 py-0.5 md:py-1 bg-muted/50"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 md:py-1 bg-muted/50">
                      +{project.tags.length - 3}
                    </span>
                  )}
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
