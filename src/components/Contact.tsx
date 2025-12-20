import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Mail, MapPin, Send, Github, Linkedin, Instagram, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactContent {
  section_label: string | null;
  headline_1: string | null;
  headline_2: string | null;
  description: string | null;
  email: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
}

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [content, setContent] = useState<ContactContent | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from("contact_content").select("*").limit(1).maybeSingle();
      if (data) setContent(data);
    };
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setSending(false);
  };

  const contactData = content || {
    section_label: "Get in Touch",
    headline_1: "LET'S WORK",
    headline_2: "TOGETHER",
    description: "Have a project in mind? Let's discuss how we can bring your ideas to life.",
    email: "hello@bukhari.dev",
    location: "Indonesia",
    github_url: "#",
    linkedin_url: "#",
    instagram_url: "#",
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, href: contactData.github_url || "#" },
    { name: "LinkedIn", icon: Linkedin, href: contactData.linkedin_url || "#" },
    { name: "Instagram", icon: Instagram, href: contactData.instagram_url || "#" },
  ];

  return (
    <section id="contact" className="py-32 bg-secondary/30 relative overflow-hidden">
      <motion.div className="absolute inset-0 opacity-5" style={{ y }}>
        <div className="absolute left-1/4 top-1/3 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <span className="text-primary text-sm tracking-[0.3em] uppercase">
                {contactData.section_label}
              </span>
              <h2 className="font-display text-5xl md:text-6xl mt-4 leading-tight">
                {contactData.headline_1}
                <br />
                <span className="text-gradient">{contactData.headline_2}</span>
              </h2>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {contactData.description}
            </p>

            <div className="space-y-4">
              <a
                href={`mailto:${contactData.email}`}
                className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-primary transition-colors duration-300">
                  <Mail size={20} />
                </div>
                <span>{contactData.email}</span>
              </a>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-12 h-12 border border-border flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <span>{contactData.location}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-12 h-12 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground tracking-wide">Your Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground tracking-wide">Your Email *</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground tracking-wide">Subject</label>
                <input
                  type="text"
                  placeholder="Project Discussion"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground tracking-wide">Message *</label>
                <textarea
                  rows={6}
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {sending ? "SENDING..." : "SEND MESSAGE"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
