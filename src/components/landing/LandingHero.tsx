import { Button } from "@/components/ui/button";
import { landingAssets } from "@/components/landing/assets";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";
import PhoneMockup from "@/components/landing/PhoneMockup";

type Props = {
  onPrimary: () => void;
  language: LandingLanguage;
};

export default function LandingHero({ onPrimary, language }: Props) {
  const copy = landingCopy[language].hero;

  return (
    <section className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 pb-14 pt-2 md:px-6 lg:grid-cols-[1fr_410px] lg:pb-24">
      <div className="relative overflow-hidden rounded-[28px] bg-[#dfe6f2] px-6 py-10 md:px-10 md:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.55),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(132,157,196,0.16),transparent_40%)]" />
        <div className="pointer-events-none absolute -bottom-8 left-0 h-20 w-[120%] -rotate-[3.2deg] bg-[#d9e1ef]" />
        <div className="relative z-10 max-w-[620px]">
          <span className="inline-flex rounded-full bg-[rgba(31,158,160,0.12)] px-4 py-2 text-xs text-[#1f9ea0]">{copy.badge}</span>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-black md:text-6xl md:leading-[1.15]">
            {copy.title} <span className="text-[#1f9ea0]">{copy.titleHighlight}</span> {copy.titleSuffix}
          </h1>
          <p className="mt-4 text-base leading-8 text-[#748795] md:text-2xl md:leading-[1.6]">{copy.description}</p>
          <div className="mt-7">
            <Button className="h-12 rounded-full bg-[#1f9ea0] px-10 text-base font-semibold tracking-[0.04em] text-white hover:bg-[#198b8d]" onClick={onPrimary}>
              RESGISTRATE AHORA
            </Button>
          </div>
        </div>
      </div>
      <div className="relative mx-auto w-[330px]">
        <div className="pointer-events-none absolute -left-12 top-10 h-[260px] w-[260px] rounded-[48%_52%_58%_42%/44%_42%_58%_56%] bg-[radial-gradient(circle_at_30%_30%,rgba(176,229,230,0.85),rgba(147,214,216,0.45)_55%,rgba(147,214,216,0.08)_100%)]" />
        <div className="pointer-events-none absolute -right-6 bottom-8 h-24 w-24 rounded-full bg-[rgba(126,201,204,0.22)] blur-[2px]" />
        <PhoneMockup alt="phone screen" src={landingAssets.phoneScreen} widthClassName="w-[310px]" />
      </div>
    </section>
  );
}
