import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { landingAssets } from "@/components/landing/assets";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

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
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <Button className="h-10 rounded-full bg-[#1f9ea0] px-6 text-white hover:bg-[#198b8d]" onClick={onPrimary}>
              {copy.primary}
            </Button>
            <button className="inline-flex items-center gap-2 text-xl font-medium text-[#1f9ea0]" type="button">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1f9ea0] text-white">
                <Play className="h-4 w-4 fill-white" />
              </span>
              {copy.howItWorks}
            </button>
          </div>
        </div>
      </div>
      <div className="relative mx-auto w-[310px]">
        <div className="absolute inset-[3.9%_4.6%_3.8%_4.6%] z-10 overflow-hidden rounded-[34px] bg-black">
          <img alt="phone screen" className="h-full w-full object-cover object-top" src={landingAssets.phoneScreen} />
        </div>
        <img alt="phone frame" className="relative z-20 h-auto w-full" src={landingAssets.phoneFrame} />
      </div>
    </section>
  );
}
