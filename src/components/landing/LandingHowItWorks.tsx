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
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {copy.steps.map((title, idx) => (
          <article
            className="rounded-3xl border border-[#d8e0ec] bg-white/90 p-6 text-center shadow-[0_12px_32px_rgba(13,35,64,0.08)]"
            key={title}
          >
            <div className="mx-auto mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#8fd6d7] bg-[#1f9ea0]/10 text-sm font-bold text-[#1f9ea0]">
              {idx + 1}
            </div>
            <h3 className="text-[1.7rem] font-semibold leading-tight text-[#1e194d]">{title}</h3>
            <p className="mt-3 text-base leading-8 text-[#7d8396]">{copy.itemDescriptions[idx] ?? ""}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
