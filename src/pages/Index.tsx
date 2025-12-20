import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Works from "@/components/Works";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Bukhari S.Kom | Creative Developer & Designer</title>
        <meta
          name="description"
          content="Personal portfolio of Bukhari S.Kom - Creative Developer & Designer specializing in web development, UI/UX design, and digital solutions."
        />
        <meta
          name="keywords"
          content="web developer, designer, portfolio, React, UI/UX, creative developer"
        />
        <meta property="og:title" content="Bukhari S.Kom | Creative Developer & Designer" />
        <meta
          property="og:description"
          content="Personal portfolio showcasing web development, design, and creative projects."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://bukhari.dev" />
      </Helmet>

      <div className="min-h-screen bg-background">
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
      </div>
    </>
  );
};

export default Index;
