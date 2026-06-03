import { Navbar, Hero, Footer, DevsSection } from "@/components/introduce";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden pt-24">
      <Navbar />
      <Hero />
      <DevsSection />
      <Footer />
    </div>
  );
}
