import { Check } from "lucide-react";
import { landingAssets } from "@/components/landing/assets";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  language: LandingLanguage;
};

export default function LandingMetricsAndBenefits({ language }: Props) {
  const copy = landingCopy[language].metrics;

  return (
    <>
      <section className="mx-auto grid w-full max-w-[820px] grid-cols-2 gap-6 px-4 py-10 text-center text-[#1e194d] sm:grid-cols-4">
        {copy.items.map((item) => (
          <div key={item.label}>
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-sm text-[#9e9baa]">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative mx-auto w-[320px]">
          <div className="absolute left-[-28px] top-[-22px] h-[300px] w-[265px] rounded-[150px_150px_0_0] bg-[#c7eff0]" />
          <img alt="phone screen" className="absolute left-[4.6%] top-[3.9%] z-10 h-[92.3%] w-[90.8%] rounded-[34px] object-cover object-top" src={landingAssets.phoneScreenFeature} />
          <img alt="phone frame" className="relative z-20 h-auto w-full" src={landingAssets.phoneFrame} />
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">{copy.title}</h2>
          <ul className="mt-6 space-y-4">
            {copy.bullets.map((f) => (
              <li className="flex items-center gap-3 text-[#59616a]" key={f}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e7f7f7] text-[#1f9ea0]"><Check className="h-4 w-4" /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
