import { 
  Navbar, 
  Hero, 
  Footer, 
  WhyDolfinSection, 
  FeaturesSection, 
  HowItWorksSection, 
  BenefitsSection,
  SupportSection 
} from "@/components/introduce";
import SectionDivider from "@/components/shared/SectionDivider";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Navbar />
      <Hero />
      <BenefitsSection />
      <SectionDivider />
      <WhyDolfinSection />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <SupportSection />
      <Footer />
    </div>
  );
}
