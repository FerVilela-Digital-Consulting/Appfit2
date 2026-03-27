import { Check } from "lucide-react";
import { landingAssets } from "@/components/landing/assets";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";
import PhoneMockup from "@/components/landing/PhoneMockup";

type Props = {
  language: LandingLanguage;
};

export default function LandingMetricsAndBenefits({ language }: Props) {
  const copy = landingCopy[language].metrics;

  return (
    <>
      <section className="relative mx-auto w-full max-w-[980px] px-4 py-10">
        <div className="pointer-events-none absolute inset-x-8 top-4 h-[76%] rounded-[24px] bg-[linear-gradient(180deg,rgba(191,232,233,0.2),rgba(191,232,233,0.06))]" />
        <div className="relative grid grid-cols-2 gap-6 text-center text-[#1e194d] sm:grid-cols-4">
        {copy.items.map((item, idx) => (
          <div className="relative" key={item.label}>
            {idx > 0 ? <span className="pointer-events-none absolute -left-3 top-1/2 hidden h-10 -translate-y-1/2 border-l border-[#d9ecec] sm:block" /> : null}
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-sm text-[#9e9baa]">{item.label}</p>
          </div>
        ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative mx-auto w-[320px]">
          <div className="absolute left-[-28px] top-[-22px] h-[300px] w-[265px] rounded-[150px_150px_0_0] bg-[#c7eff0]" />
          <PhoneMockup alt="phone screen" src={landingAssets.phoneScreenFeature} />
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">{copy.title}</h2>
          <ul className="mt-6 space-y-4">
            {copy.bullets.map((f) => (
              <li className="flex items-center gap-3 text-[#59616a]" key={f}>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#bfe8e9] bg-[linear-gradient(180deg,#f1fbfb,#dff5f5)] text-[#1f9ea0] shadow-[0_2px_6px_rgba(31,158,160,0.16)]">
                  <Check className="h-4 w-4" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
