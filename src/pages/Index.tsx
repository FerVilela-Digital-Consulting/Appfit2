import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingFeatureRows from "@/components/landing/LandingFeatureRows";
import LandingMetricsAndBenefits from "@/components/landing/LandingMetricsAndBenefits";
import LandingFooter from "@/components/landing/LandingFooter";
import type { LandingLanguage } from "@/components/landing/types";

const LANDING_LANGUAGE_KEY = "appfit.landing.language";

const Index = () => {
  const { user, isGuest, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const initialLanguage = useMemo<LandingLanguage>(() => {
    const cached = localStorage.getItem(LANDING_LANGUAGE_KEY);
    if (cached === "es" || cached === "en") {
      return cached;
    }
    return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
  }, []);
  const [language, setLanguage] = useState<LandingLanguage>(initialLanguage);

  const goPrimary = () => navigate(user || isGuest ? "/today" : "/auth");
  const toggleLanguage = () => {
    const next = language === "es" ? "en" : "es";
    setLanguage(next);
    localStorage.setItem(LANDING_LANGUAGE_KEY, next);
  };

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
        <LandingHeader language={language} onPrimary={goPrimary} onToggleLanguage={toggleLanguage} />
        <LandingHero language={language} onPrimary={goPrimary} />
        <LandingHowItWorks language={language} />
        <LandingFeatureRows language={language} onPrimary={goPrimary} />
        <LandingMetricsAndBenefits language={language} />
        <LandingFooter language={language} />
      </div>
    </div>
  );
};

export default Index;
