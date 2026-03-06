import { Helmet } from "react-helmet-async";
import { useSectionConfig } from "@/hooks/useSectionConfig";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import NavbarModern from "@/components/modern/NavbarModern";
import Hero from "@/components/Hero";
import HeroModern from "@/components/modern/HeroModern";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Trainings from "@/components/Trainings";
import Languages from "@/components/Languages";
import Works from "@/components/Works";
import TechStack from "@/components/TechStack";
import SoftwareTools from "@/components/SoftwareTools";
import VideoPortfolio from "@/components/VideoPortfolio";
import WorkJourneyGallery from "@/components/WorkJourneyGallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FooterModern from "@/components/modern/FooterModern";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import BackToDashboard from "@/components/BackToDashboard";
import FloatingCVButton from "@/components/FloatingCVButton";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

// Map section keys to their components
const sectionComponents: Record<string, React.ComponentType> = {
  about: About,
  techstack: TechStack,
  experience: Experience,
  education: Education,
  trainings: Trainings,
  languages: Languages,
  works: Works,
  videoportfolio: VideoPortfolio,
  softwaretools: SoftwareTools,
  workjourney: WorkJourneyGallery,
  contact: Contact,
};

const Index = () => {
  useVisitorTracking();
  const { data: sections, isLoading } = useSectionConfig();
  const { uiTemplate } = useTheme();

  const isModern = uiTemplate === "modern-blue";

  // Render sections based on config order and visibility
  const renderSections = () => {
    if (isLoading || !sections) {
      return (
        <>
          <About />
          <Experience />
          <Education />
          <Trainings />
          <Languages />
          <Works />
          <TechStack />
          <SoftwareTools />
          <VideoPortfolio />
          <WorkJourneyGallery />
          <Contact />
        </>
      );
    }

    return sections
      .filter((section) => section.is_visible)
      .map((section) => {
        const Component = sectionComponents[section.section_key];
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

      <div className="min-h-screen bg-background overflow-x-hidden">
        {isModern ? <NavbarModern /> : <Navbar />}
        <main>
          <div id="home">
            {isModern ? <HeroModern /> : <Hero />}
          </div>
          {renderSections()}
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
