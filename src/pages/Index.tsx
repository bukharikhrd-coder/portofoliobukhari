import { Helmet } from "react-helmet-async";
import { useSectionConfig } from "@/hooks/useSectionConfig";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import NavbarModern from "@/components/modern/NavbarModern";
import Hero from "@/components/Hero";
import HeroModern from "@/components/modern/HeroModern";
import About from "@/components/About";
import AboutModern from "@/components/modern/AboutModern";
import Experience from "@/components/Experience";
import ExperienceModern from "@/components/modern/ExperienceModern";
import Education from "@/components/Education";
import EducationModern from "@/components/modern/EducationModern";
import Trainings from "@/components/Trainings";
import TrainingsModern from "@/components/modern/TrainingsModern";
import Languages from "@/components/Languages";
import LanguagesModern from "@/components/modern/LanguagesModern";
import Works from "@/components/Works";
import WorksModern from "@/components/modern/WorksModern";
import TechStack from "@/components/TechStack";
import TechStackModern from "@/components/modern/TechStackModern";
import SoftwareTools from "@/components/SoftwareTools";
import SoftwareToolsModern from "@/components/modern/SoftwareToolsModern";
import VideoPortfolio from "@/components/VideoPortfolio";
import VideoPortfolioModern from "@/components/modern/VideoPortfolioModern";
import WorkJourneyGallery from "@/components/WorkJourneyGallery";
import WorkJourneyGalleryModern from "@/components/modern/WorkJourneyGalleryModern";
import Contact from "@/components/Contact";
import ContactModern from "@/components/modern/ContactModern";
import Footer from "@/components/Footer";
import FooterModern from "@/components/modern/FooterModern";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import BackToDashboard from "@/components/BackToDashboard";
import FloatingCVButton from "@/components/FloatingCVButton";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

// Map section keys to their components (editorial and modern)
const sectionComponents: Record<string, { editorial: React.ComponentType; modern: React.ComponentType }> = {
  about: { editorial: About, modern: AboutModern },
  techstack: { editorial: TechStack, modern: TechStackModern },
  experience: { editorial: Experience, modern: ExperienceModern },
  education: { editorial: Education, modern: EducationModern },
  trainings: { editorial: Trainings, modern: TrainingsModern },
  languages: { editorial: Languages, modern: LanguagesModern },
  works: { editorial: Works, modern: WorksModern },
  videoportfolio: { editorial: VideoPortfolio, modern: VideoPortfolioModern },
  softwaretools: { editorial: SoftwareTools, modern: SoftwareToolsModern },
  workjourney: { editorial: WorkJourneyGallery, modern: WorkJourneyGalleryModern },
  contact: { editorial: Contact, modern: ContactModern },
};

const Index = () => {
  useVisitorTracking();
  const { data: sections, isLoading } = useSectionConfig();
  const { uiTemplate } = useTheme();

  const isModern = uiTemplate === "modern-blue";

  // Check gradient settings from CSS variables
  const getGradientClass = (target: "hero" | "section") => {
    const root = document.documentElement;
    const enabled = root.style.getPropertyValue("--gradient-enabled") === "1";
    if (!enabled) return "";
    const gradTarget = root.style.getPropertyValue("--gradient-target") || "hero";
    if (gradTarget === "all") return "gradient-section";
    if (gradTarget === "hero" && target === "hero") return "gradient-section";
    if (gradTarget === "sections" && target === "section") return "gradient-section";
    return "";
  };

  const getComponent = (key: string) => {
    const entry = sectionComponents[key];
    if (!entry) return null;
    return isModern ? entry.modern : entry.editorial;
  };

  // Render sections based on config order and visibility
  const renderSections = () => {
    if (isLoading || !sections) {
      const defaultKeys = ["about", "experience", "education", "trainings", "languages", "works", "techstack", "softwaretools", "videoportfolio", "workjourney", "contact"];
      return defaultKeys.map((key) => {
        const Component = getComponent(key);
        return Component ? <Component key={key} /> : null;
      });
    }

    return sections
      .filter((section) => section.is_visible)
      .map((section) => {
        const Component = getComponent(section.section_key);
        if (!Component) return null;
        return <Component key={section.section_key} />;
      });
  };

  return (
    <>
      <Helmet>
        <title>Bukhari, S.Kom | Creative Developer & Designer</title>
        <meta name="description" content="Portfolio personal Bukhari, S.Kom - Creative Developer & Designer. Menampilkan karya desain grafis, website, tools, dan project kreatif." />
        <meta name="keywords" content="web developer, designer, portfolio, React, UI/UX, creative developer, Bukhari, WIXBIHUB" />
        <meta property="og:title" content="Bukhari, S.Kom | Creative Developer & Designer" />
        <meta property="og:description" content="Portfolio personal menampilkan karya desain, website, dan project kreatif." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://bukhari.dev" />
      </Helmet>

      <div className={`min-h-screen bg-background overflow-x-hidden ${getGradientClass("hero") && getGradientClass("section") ? "gradient-section" : ""}`}>
        {isModern ? <NavbarModern /> : <Navbar />}
        <main>
          <div id="home" className={getGradientClass("hero")}>
            {isModern ? <HeroModern /> : <Hero />}
          </div>
          <div className={getGradientClass("section")}>
            {renderSections()}
          </div>
        </main>
        {isModern ? <FooterModern /> : <Footer />}
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        <BackToDashboard />
        <FloatingCVButton />
      </div>
    </>
  );
};

export default Index;
