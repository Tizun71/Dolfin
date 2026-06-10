import { 
  Navbar, 
  Hero, 
  Footer, 
  WhyDolfinSection, 
  FeaturesSection, 
  HowItWorksSection, 
  SupportSection 
} from "@/components/introduce";
import SectionDivider from "@/components/shared/SectionDivider";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Navbar />
      <Hero />
      <SectionDivider variant="gradient" />
      <WhyDolfinSection />
      <SectionDivider variant="dots" />
      <FeaturesSection />
      <SectionDivider variant="gradient" />
      <HowItWorksSection />
      <SectionDivider variant="default" />
      <SupportSection />
      <Footer />
    </div>
  );
}
