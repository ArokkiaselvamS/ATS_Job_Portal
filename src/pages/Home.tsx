import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import OpportunityCards from "../components/OpportunityCards";
import FeaturedJobs from "../components/FeaturedJobs";
import AIFeatures from "../components/AIFeatures";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <Hero />
        <OpportunityCards />
        <FeaturedJobs />
        <AIFeatures />
      </main>
      <Footer />
    </div>
  );
}