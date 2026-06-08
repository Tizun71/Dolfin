import { 
  Navbar, 
  Hero, 
  Footer, 
  WhyDolfinSection, 
  FeaturesSection, 
  HowItWorksSection, 
  SupportSection 
} from "@/components/introduce";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Navbar />
      <Hero />
      <WhyDolfinSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SupportSection />
      <Footer />
    </div>
  );
}
