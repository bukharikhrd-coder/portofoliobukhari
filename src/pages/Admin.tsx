import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, FileText, Briefcase, User, Mail, LogOut, Menu, X,
  ChevronDown, Home, Code, GraduationCap, Globe, Wrench, Play,
  BarChart3, Images, Award, Layers, Share2, FileUp, Palette, Layout,
  Settings, Package, ShoppingCart
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
import AdminUITemplate from "@/components/admin/AdminUITemplate";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminServicePackages from "@/components/admin/AdminServicePackages";
import AdminClientOrders from "@/components/admin/AdminClientOrders";

type TabType = "hero" | "about" | "experience" | "education" | "trainings" | "languages" | "projects" | "contact" | "messages" | "techstack" | "softwaretools" | "videoportfolio" | "analytics" | "journeygallery" | "sectionorder" | "footersocial" | "cvmanager" | "colortheme" | "uitemplate" | "settings" | "servicepackages" | "clientorders";

const NAV_GROUPS = [
  { 
    group: "Overview", 
    icon: BarChart3,
    items: [
      { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
      { id: "settings" as TabType, label: "Settings", icon: Settings },
    ]
  },
  { 
    group: "Services", 
    icon: Package,
    items: [
      { id: "servicepackages" as TabType, label: "Packages", icon: Package },
      { id: "clientorders" as TabType, label: "Orders", icon: ShoppingCart },
    ]
  },
  { 
    group: "Content", 
    icon: FileText,
    items: [
      { id: "hero" as TabType, label: "Hero", icon: Home },
      { id: "about" as TabType, label: "About", icon: User },
      { id: "experience" as TabType, label: "Experience", icon: Briefcase },
      { id: "education" as TabType, label: "Education", icon: GraduationCap },
      { id: "trainings" as TabType, label: "Trainings", icon: Award },
      { id: "languages" as TabType, label: "Languages", icon: Globe },
    ]
  },
  { 
    group: "Portfolio", 
    icon: Code,
    items: [
      { id: "projects" as TabType, label: "Projects", icon: FileText },
      { id: "techstack" as TabType, label: "Tech Stack", icon: Code },
      { id: "softwaretools" as TabType, label: "Tools", icon: Wrench },
      { id: "videoportfolio" as TabType, label: "Videos", icon: Play },
      { id: "journeygallery" as TabType, label: "Journey", icon: Images },
    ]
  },
  { 
    group: "Appearance", 
    icon: Palette,
    items: [
      { id: "colortheme" as TabType, label: "Colors", icon: Palette },
      { id: "uitemplate" as TabType, label: "Template", icon: Layout },
      { id: "sectionorder" as TabType, label: "Sections", icon: Layers },
      { id: "cvmanager" as TabType, label: "CV File", icon: FileUp },
    ]
  },
  { 
    group: "Communication", 
    icon: Mail,
    items: [
      { id: "contact" as TabType, label: "Contact", icon: FileText },
      { id: "footersocial" as TabType, label: "Social", icon: Share2 },
      { id: "messages" as TabType, label: "Messages", icon: Mail },
    ]
  },
];

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({ projects: 0, messages: 0, unreadMessages: 0 });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchStats();
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

  const toggleGroup = useCallback((group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const activeLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || "Dashboard";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "analytics": return <AdminAnalytics />;
      case "settings": return <AdminSettings />;
      case "servicepackages": return <AdminServicePackages />;
      case "clientorders": return <AdminClientOrders />;
      case "cvmanager": return <AdminCVManager />;
      case "colortheme": return <AdminColorTheme />;
      case "uitemplate": return <AdminUITemplate />;
      case "sectionorder": return <AdminSectionOrder />;
      case "hero": return <AdminHero />;
      case "about": return <AdminAbout />;
      case "experience": return <AdminExperience />;
      case "education": return <AdminEducation />;
      case "trainings": return <AdminTrainings />;
      case "languages": return <AdminLanguages />;
      case "projects": return <AdminProjects onUpdate={fetchStats} />;
      case "techstack": return <AdminTechStack />;
      case "softwaretools": return <AdminSoftwareTools />;
      case "videoportfolio": return <AdminVideoPortfolio />;
      case "journeygallery": return <AdminWorkJourneyGallery />;
      case "contact": return <AdminContact />;
      case "footersocial": return <AdminFooterSocial />;
      case "messages": return <AdminMessages onUpdate={fetchStats} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-secondary">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-primary" size={16} />
          <span className="font-display text-sm font-bold tracking-wider">ADMIN</span>
          <span className="text-muted-foreground text-xs">/ {activeLabel}</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-card/95 backdrop-blur-md border-r border-border transform transition-all duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="shrink-0 px-4 py-3 border-b border-border hidden lg:flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="text-primary" size={14} />
          </div>
          <div>
            <span className="font-display text-sm font-bold tracking-wider">ADMIN</span>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Dashboard</p>
          </div>
        </div>

        <div className="shrink-0 h-12 lg:hidden" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups[group.group] ?? false;
            const hasActiveItem = group.items.some(i => i.id === activeTab);
            const GroupIcon = group.icon;
            return (
              <div key={group.group}>
                <button
                  onClick={() => toggleGroup(group.group)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 group rounded-md hover:bg-secondary/50 transition-colors"
                >
                  <GroupIcon size={12} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
                    {group.group}
                  </span>
                  {hasActiveItem && isCollapsed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  <ChevronDown
                    size={10}
                    className={`text-muted-foreground transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-2 border-l border-border/50 pl-1 space-y-0.5 py-0.5">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left transition-all duration-150 rounded-md text-xs ${
                              activeTab === item.id
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                            }`}
                          >
                            <item.icon size={13} />
                            <span className="truncate">{item.label}</span>
                            {item.id === "messages" && stats.unreadMessages > 0 && (
                              <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                                {stats.unreadMessages}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-2 py-2 border-t border-border space-y-0.5">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all rounded-md text-xs"
          >
            <Home size={13} />
            <span>View Site</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-md text-xs"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 pt-14 lg:pt-0 p-4 lg:p-6 overflow-auto lg:ml-56 min-w-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
