import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingFeatureRows from "@/components/landing/LandingFeatureRows";
import LandingMetricsAndBenefits from "@/components/landing/LandingMetricsAndBenefits";
import LandingFooter from "@/components/landing/LandingFooter";
import type { LandingLanguage } from "@/components/landing/types";

const Index = () => {
  const { user, isGuest, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [language] = useState<LandingLanguage>("es");

  const goPrimary = () => navigate(user || isGuest ? "/today" : "/auth");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#1e194d]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1f9ea0] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1e194d]">
      <LandingHeader language={language} onPrimary={goPrimary} />
      <main className="pt-[90px] md:pt-[100px]">
        <LandingHero language={language} onPrimary={goPrimary} />
        <LandingHowItWorks language={language} />
        <LandingFeatureRows language={language} onPrimary={goPrimary} />
        <LandingMetricsAndBenefits language={language} />
        <LandingFooter language={language} />
      </main>
    </div>
  );
};

export default Index;
