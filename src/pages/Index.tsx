import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingFeatureRows from "@/components/landing/LandingFeatureRows";
import LandingMetricsAndBenefits from "@/components/landing/LandingMetricsAndBenefits";
import LandingPlatformBlock from "@/components/landing/LandingPlatformBlock";
import LandingPartners from "@/components/landing/LandingPartners";
import LandingTestimonial from "@/components/landing/LandingTestimonial";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  const { user, isGuest, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const goPrimary = () => navigate(user || isGuest ? "/today" : "/auth");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#1e194d]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#fbbc05] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1e194d]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden">
        <LandingHeader onPrimary={goPrimary} />
        <LandingHero onPrimary={goPrimary} />
        <LandingHowItWorks />
        <LandingFeatureRows onPrimary={goPrimary} />
        <LandingMetricsAndBenefits />
        <LandingPlatformBlock />
        <LandingPartners />
        <LandingTestimonial onPrimary={goPrimary} />
        <LandingPricing />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
