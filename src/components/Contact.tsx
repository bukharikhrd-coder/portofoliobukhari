import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MapPin, Send, Github, Linkedin, Instagram } from "lucide-react";

const socialLinks = [
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <span className="text-primary text-sm tracking-[0.3em] uppercase">
                Get in Touch
              </span>
              <h2 className="font-display text-5xl md:text-6xl mt-4 leading-tight">
                LET'S WORK
                <br />
                <span className="text-gradient">TOGETHER</span>
              </h2>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Have a project in mind? Let's discuss how we can bring your ideas 
              to life. I'm always open for new opportunities and collaborations.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <a
                href="mailto:hello@bukhari.dev"
                className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-primary transition-colors duration-300">
                  <Mail size={20} />
                </div>
                <span>hello@bukhari.dev</span>
              </a>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-12 h-12 border border-border flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <span>Indonesia</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-12 h-12 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground tracking-wide">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground tracking-wide">
                    Your Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground tracking-wide">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Project Discussion"
                  className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground tracking-wide">
                  Message
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell me about your project..."
                  className="w-full px-4 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300"
              >
                <Send size={18} />
                SEND MESSAGE
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
