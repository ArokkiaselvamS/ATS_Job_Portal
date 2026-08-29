import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import OpportunityCards from "../components/OpportunityCards";
import FeaturedJobs from "../components/FeaturedJobs";
import AIFeatures from "../components/AIFeatures";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <OpportunityCards />
          <FeaturedJobs />
          <AIFeatures />
        </main>
        <Footer />
      </div>
    </div>
  );
}