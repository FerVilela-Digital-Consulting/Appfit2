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
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {copy.steps.map((title) => (
          <article className="text-center" key={title}>
            <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-[#1f9ea0]" />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-base text-[#9e9baa]">{copy.itemDescription}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
