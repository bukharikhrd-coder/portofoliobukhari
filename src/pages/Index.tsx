import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Works from "@/components/Works";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const Index = () => {
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
          <Works />
          <TechStack />
          <Contact />
        </main>
        <Footer />
        <PWAInstallPrompt />
      </div>
    </>
  );
};

export default Index;
