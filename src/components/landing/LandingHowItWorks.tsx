import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  language: LandingLanguage;
};

export default function LandingHowItWorks({ language }: Props) {
  const copy = landingCopy[language].how;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-[628px] text-center">
        <h2 className="text-4xl font-semibold">{copy.title}</h2>
        <p className="mt-4 text-xl leading-9 text-[#9e9baa]">{copy.description}</p>
      </div>
      <div className="relative mt-12">
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-[14px] hidden h-px bg-gradient-to-r from-transparent via-[#9ed6d7] to-transparent md:block" />
        <div className="grid gap-8 md:grid-cols-3">
          {copy.steps.map((title, idx) => (
          <article className="text-center" key={title}>
            <div className="mx-auto mb-4 flex items-center justify-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#b9dfdf] bg-white text-[11px] font-semibold text-[#1f9ea0]">
                {idx + 1}
              </span>
              <span className="h-2 w-16 rounded-full bg-[#1f9ea0]" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-base text-[#9e9baa]">{copy.itemDescription}</p>
          </article>
          ))}
        </div>
      </div>
    </section>
  );
}
