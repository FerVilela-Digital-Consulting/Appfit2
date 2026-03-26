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
      <div className="relative overflow-hidden rounded-[28px] bg-[#eef2ff] px-6 py-10 md:px-10 md:py-12">
        <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" src={landingAssets.heroBg} />
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
        <img alt="phone frame" className="relative z-10 h-auto w-full" src={landingAssets.phoneFrame} />
        <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={landingAssets.phoneScreen} />
      </div>
    </section>
  );
}
