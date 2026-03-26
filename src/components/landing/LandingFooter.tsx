import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  language: LandingLanguage;
};

export default function LandingFooter({ language }: Props) {
  const copy = landingCopy[language].footer;

  return (
    <footer className="mt-16 bg-[#08003b] px-4 py-14 text-white md:px-6" id="contact">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[1.25fr_1.75fr]">
        <div>
          <h3 className="text-4xl font-semibold">{copy.title}</h3>
          <p className="mt-4 max-w-[560px] text-[#9e9baa]">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full border border-white px-4 py-2 text-sm">{copy.playStore}</button>
            <button className="rounded-full border border-white px-4 py-2 text-sm">{copy.appStore}</button>
          </div>
        </div>

        <div className="grid gap-7 text-sm text-[#9e9baa] sm:grid-cols-2 lg:grid-cols-4">
          {copy.groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 font-semibold text-white">{group.title}</p>
              {group.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-[#848487]">
        <div className="flex gap-4">
          <span className="h-2 w-2 rounded-full bg-[#1f9ea0]" />
          <span className="h-2 w-2 rounded-full bg-[#1f9ea0]" />
          <span className="h-2 w-2 rounded-full bg-[#1f9ea0]" />
          <span className="h-2 w-2 rounded-full bg-[#1f9ea0]" />
        </div>
        <div className="flex flex-wrap gap-4"><span>{copy.terms}</span><span>{copy.privacy}</span><span>{copy.cookies}</span></div>
      </div>
    </footer>
  );
}
