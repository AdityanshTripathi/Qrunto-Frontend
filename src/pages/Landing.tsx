import { Benefits } from "../components/landing/sections/Benefits";
import { Capabilities } from "../components/landing/sections/Capabilities";
import { FAQ } from "../components/landing/sections/FAQ";
import { FinalCTA } from "../components/landing/sections/FinalCTA";
import { Hero } from "../components/landing/sections/Hero";
import { HowToUse } from "../components/landing/sections/HowToUse";
import { KeyFeatures } from "../components/landing/sections/KeyFeatures";
import { Pricing } from "../components/landing/sections/Pricing";
import { Proof } from "../components/landing/sections/Proof";
import { Testimonials } from "../components/landing/sections/Testimonials";
import { TrustedLogos } from "../components/landing/sections/TrustedLogos";
import { Header } from "../components/landing/layout/Header";
import { Footer } from "../components/landing/layout/Footer";

/**
 * Ordio landing page — warm cream palette, terracotta accents,
 * animated phone compositions, and scroll-reveal sections.
 */
export const Landing: React.FC = () => {
  return (
    <div
      className="relative flex w-full flex-col items-center"
      style={{
        backgroundColor: "#fff8f0",
        color: "#5a3828",
        fontFamily: "'Inter', sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflowX: "hidden",
      }}
    >
      <Header />

      <Hero>
        <TrustedLogos />
      </Hero>

      <main className="page-shell flex flex-col items-center gap-20 pb-[60px] pt-20 tb:gap-[150px] tb:pb-20 tb:pt-[150px] dk:gap-[200px] dk:pb-[100px] dk:pt-[200px]">
        <Proof />
        <Benefits />
        <KeyFeatures />
        <Capabilities />
        <HowToUse />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};
