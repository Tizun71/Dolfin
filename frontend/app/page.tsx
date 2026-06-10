import { 
  Navbar, 
  Hero, 
  Footer, 
  WhyDolfinSection, 
  FeaturesSection, 
  HowItWorksSection, 
  TrustSection,
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
      <TrustSection />
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
