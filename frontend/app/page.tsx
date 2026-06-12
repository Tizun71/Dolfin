import { 
  Navbar, 
  Hero, 
  Footer, 
  WhyDolfinSection, 
  FeaturesSection, 
  HowItWorksSection, 
  CTASection
} from "@/components/introduce";
import SectionDivider from "@/components/shared/SectionDivider";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      <Navbar />
      <Hero />
      <SectionDivider />
      <WhyDolfinSection />
      <SectionDivider />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
