import { Helmet } from "react-helmet-async";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import HeroSection from "@/components/HeroSection";
import TeamStorySection from "@/components/TeamStorySection";
import CompanyOverview from "@/components/CompanyOverview";
import TeamSection from "@/components/TeamSection";
import WhoWeServe from "@/components/WhoWeServe";
import ServiceOverview from "@/components/ServiceOverview";
import ProblemSection from "@/components/ProblemSection";
import AIAdvantage from "@/components/AIAdvantage";
import FutureExpansion from "@/components/FutureExpansion";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import LatestBlogsSection from "@/components/LatestBlogsSection";
import DataPrivacySection from "@/components/DataPrivacySection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import EnhancedFooter from "@/components/EnhancedFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.origin : "https://www.interq.online"} />
      </Helmet>
      <EnhancedNavigation />
      <HeroSection />
      <TeamStorySection />
      <CompanyOverview />
      <TeamSection />
      <WhoWeServe />
      <ServiceOverview />
      <ProblemSection />
      <AIAdvantage />
      <FutureExpansion />
      <HowItWorks />
      <TestimonialsSection />
      <LatestBlogsSection />
      <DataPrivacySection />
      <FAQSection />
      <FinalCTA />
      <EnhancedFooter />
    </div>
  );
};

export default Index;
