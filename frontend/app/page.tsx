import { Navbar, Hero, Footer, FeaturesSection, HowItWorksSection, SupportSection } from "@/components/introduce";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden pt-24">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <SupportSection />
      <Footer />
    </div>
  );
}
