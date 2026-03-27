import { Button } from "@/components/ui/button";
import { landingAssets } from "@/components/landing/assets";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";
import PhoneMockup from "@/components/landing/PhoneMockup";

type Props = {
  onPrimary: () => void;
  language: LandingLanguage;
};

export default function LandingFeatureRows({ onPrimary, language }: Props) {
  const copy = landingCopy[language].featureRows;

  return (
    <>
      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:items-center" id="features">
        <div className="relative mx-auto w-[320px]">
          <div className="pointer-events-none absolute left-[-35px] top-[-28px] h-[300px] w-[300px] rounded-full bg-[#8fd6d7]" />
          <div className="pointer-events-none absolute left-[-18px] top-[-22px] h-0 w-0 border-b-[26px] border-l-[20px] border-r-[20px] border-b-[#66c6c8] border-l-transparent border-r-transparent" />
          <div className="pointer-events-none absolute right-[8px] top-[22px] h-0 w-0 border-b-[14px] border-l-[10px] border-r-[10px] border-b-[#b6e5e6] border-l-transparent border-r-transparent" />
          <div className="pointer-events-none absolute -bottom-5 left-[30px] h-16 w-52 rounded-full bg-[rgba(31,158,160,0.14)] blur-lg" />
          <PhoneMockup alt="phone screen" src={landingAssets.phoneScreenAlt} />
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">{copy.firstTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-[#9e9baa]">{copy.firstDescription}</p>
          <Button className="mt-7 h-10 rounded-full bg-[#1f9ea0] px-6 text-white hover:bg-[#198b8d]" onClick={onPrimary}>
            {copy.firstButton}
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-4xl font-semibold leading-tight">{copy.secondTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-[#9e9baa]">{copy.secondDescription}</p>
          <Button className="mt-7 h-10 rounded-full bg-[#1f9ea0] px-6 text-white hover:bg-[#198b8d]" onClick={onPrimary}>
            {copy.secondButton}
          </Button>
        </div>
        <div className="order-1 relative mx-auto w-[320px] lg:order-2">
          <div className="pointer-events-none absolute right-[-30px] top-[-26px] h-[295px] w-[280px] rounded-[150px_150px_0_0] bg-[#a8e2e3]" />
          <div className="pointer-events-none absolute right-[10px] top-[-12px] h-0 w-0 border-b-[24px] border-l-[18px] border-r-[18px] border-b-[#70ccce] border-l-transparent border-r-transparent" />
          <div className="pointer-events-none absolute left-[20px] top-[12px] h-0 w-0 border-b-[12px] border-l-[9px] border-r-[9px] border-b-[#d0eff0] border-l-transparent border-r-transparent" />
          <div className="pointer-events-none absolute -bottom-5 right-[28px] h-16 w-52 rounded-full bg-[rgba(31,158,160,0.14)] blur-lg" />
          <PhoneMockup alt="phone screen" src={landingAssets.phoneScreenAlt2} />
        </div>
      </section>
    </>
  );
}
