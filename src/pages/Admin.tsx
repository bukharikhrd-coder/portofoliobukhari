import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  User, 
  Mail, 
  LogOut,
  Menu,
  X,
  Home,
  Code,
  GraduationCap,
  Globe,
  Wrench,
  Play,
  BarChart3,
  Images,
  Award,
  Layers,
  Share2,
  FileUp,
  Palette,
  Settings,
  Package,
  ShoppingCart
} from "lucide-react";
import AdminHero from "@/components/admin/AdminHero";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminContact from "@/components/admin/AdminContact";
import AdminMessages from "@/components/admin/AdminMessages";
import AdminTechStack from "@/components/admin/AdminTechStack";
import AdminExperience from "@/components/admin/AdminExperience";
import AdminEducation from "@/components/admin/AdminEducation";
import AdminLanguages from "@/components/admin/AdminLanguages";
import AdminSoftwareTools from "@/components/admin/AdminSoftwareTools";
import AdminVideoPortfolio from "@/components/admin/AdminVideoPortfolio";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminWorkJourneyGallery from "@/components/admin/AdminWorkJourneyGallery";
import AdminTrainings from "@/components/admin/AdminTrainings";
import AdminSectionOrder from "@/components/admin/AdminSectionOrder";
import AdminFooterSocial from "@/components/admin/AdminFooterSocial";
import AdminCVManager from "@/components/admin/AdminCVManager";
import AdminColorTheme from "@/components/admin/AdminColorTheme";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminServicePackages from "@/components/admin/AdminServicePackages";
import AdminClientOrders from "@/components/admin/AdminClientOrders";

type TabType = "hero" | "about" | "experience" | "education" | "trainings" | "languages" | "projects" | "contact" | "messages" | "techstack" | "softwaretools" | "videoportfolio" | "analytics" | "journeygallery" | "sectionorder" | "footersocial" | "cvmanager" | "colortheme" | "settings" | "servicepackages" | "clientorders";

const navItems: { id: TabType; label: string; icon: any }[] = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "servicepackages", label: "Service Packages", icon: Package },
  { id: "clientorders", label: "Client Orders", icon: ShoppingCart },
  { id: "cvmanager", label: "CV Manager", icon: FileUp },
  { id: "colortheme", label: "Color Theme", icon: Palette },
  { id: "sectionorder", label: "Section Order", icon: Layers },
  { id: "hero", label: "Hero Section", icon: Home },
  { id: "about", label: "About Me", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "trainings", label: "Training & Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Globe },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "techstack", label: "Tech Stack", icon: Code },
  { id: "softwaretools", label: "Tools & Software", icon: Wrench },
  { id: "videoportfolio", label: "Video Portfolio", icon: Play },
  { id: "journeygallery", label: "Work Journey", icon: Images },
  { id: "contact", label: "Contact Info", icon: FileText },
  { id: "footersocial", label: "Footer Social Links", icon: Share2 },
  { id: "messages", label: "Messages", icon: Mail },
];

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    messages: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    const [projectsRes, messagesRes, unreadRes] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact" }),
      supabase.from("contact_messages").select("id", { count: "exact" }),
      supabase.from("contact_messages").select("id", { count: "exact" }).eq("is_read", false),
    ]);

    setStats({
      projects: projectsRes.count || 0,
      messages: messagesRes.count || 0,
      unreadMessages: unreadRes.count || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AdminAnalytics />;
      case "settings":
        return <AdminSettings />;
      case "servicepackages":
        return <AdminServicePackages />;
      case "clientorders":
        return <AdminClientOrders />;
      case "cvmanager":
        return <AdminCVManager />;
      case "colortheme":
        return <AdminColorTheme />;
      case "sectionorder":
        return <AdminSectionOrder />;
      case "hero":
        return <AdminHero />;
      case "about":
        return <AdminAbout />;
      case "experience":
        return <AdminExperience />;
      case "education":
        return <AdminEducation />;
      case "trainings":
        return <AdminTrainings />;
      case "languages":
        return <AdminLanguages />;
      case "projects":
        return <AdminProjects onUpdate={fetchStats} />;
      case "techstack":
        return <AdminTechStack />;
      case "softwaretools":
        return <AdminSoftwareTools />;
      case "videoportfolio":
        return <AdminVideoPortfolio />;
      case "journeygallery":
        return <AdminWorkJourneyGallery />;
      case "contact":
        return <AdminContact />;
      case "footersocial":
        return <AdminFooterSocial />;
      case "messages":
        return <AdminMessages onUpdate={fetchStats} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Fixed Logo Header */}
        <div className="shrink-0 p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <LayoutDashboard className="text-primary" size={24} />
            <span className="font-display text-xl">ADMIN</span>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {[
            { group: "Overview", items: ["analytics", "settings"] },
            { group: "Services", items: ["servicepackages", "clientorders"] },
            { group: "Content", items: ["hero", "about", "experience", "education", "trainings", "languages"] },
            { group: "Portfolio", items: ["projects", "techstack", "softwaretools", "videoportfolio", "journeygallery"] },
            { group: "Tools", items: ["cvmanager", "colortheme", "sectionorder"] },
            { group: "Communication", items: ["contact", "footersocial", "messages"] },
          ].map((group) => (
            <div key={group.group} className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                {group.group}
              </p>
              {group.items.map((itemId) => {
                const item = navItems.find((n) => n.id === itemId);
                if (!item) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200 rounded-md text-sm ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="font-medium truncate">{item.label}</span>
                    {item.id === "messages" && stats.unreadMessages > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                        {stats.unreadMessages}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Fixed Footer */}
        <div className="shrink-0 p-3 border-t border-border space-y-0.5">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 rounded-md text-sm"
          >
            <Home size={16} />
            <span className="font-medium">View Site</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-secondary transition-all duration-200 rounded-md text-sm"
          >
            <LogOut size={16} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto lg:ml-64">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
