import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Languages from "@/components/Languages";
import Works from "@/components/Works";
import TechStack from "@/components/TechStack";
import SoftwareTools from "@/components/SoftwareTools";
import VideoPortfolio from "@/components/VideoPortfolio";
import WorkJourneyGallery from "@/components/WorkJourneyGallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import BackToDashboard from "@/components/BackToDashboard";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const Index = () => {
  useVisitorTracking();

  return (
    <>
      <Helmet>
        <title>Bukhari, S.Kom | Creative Developer & Designer</title>
        <meta
          name="description"
          content="Portfolio personal Bukhari, S.Kom - Creative Developer & Designer. Menampilkan karya desain grafis, website, tools, dan project kreatif."
        />
        <meta
          name="keywords"
          content="web developer, designer, portfolio, React, UI/UX, creative developer, Bukhari, WIXBIHUB"
        />
        <meta property="og:title" content="Bukhari, S.Kom | Creative Developer & Designer" />
        <meta
          property="og:description"
          content="Portfolio personal menampilkan karya desain, website, dan project kreatif."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://bukhari.dev" />
      </Helmet>

      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <main>
          <div id="home">
            <Hero />
          </div>
          <About />
          <Experience />
          <Education />
          <Languages />
          <Works />
          <TechStack />
          <SoftwareTools />
          <VideoPortfolio />
          <WorkJourneyGallery />
          <Contact />
        </main>
        <Footer />
        <PWAInstallPrompt />
        <BackToDashboard />
      </div>
    </>
  );
};

export default Index;
