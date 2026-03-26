import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  language: LandingLanguage;
};

export default function LandingFooter({ language }: Props) {
  const copy = landingCopy[language].footer;

  return (
    <footer className="mt-16 bg-[#08003b] px-4 py-14 text-white md:px-6" id="contact">
      <div className="mx-auto w-full max-w-[1280px]">
        <div>
          <h3 className="text-4xl font-semibold">{copy.title}</h3>
          <p className="mt-4 max-w-[560px] text-[#9e9baa]">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full border border-white px-4 py-2 text-sm">{copy.playStore}</button>
            <button className="rounded-full border border-white px-4 py-2 text-sm">{copy.appStore}</button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[1280px] border-t border-white/15 pt-6 text-sm text-[#848487]">
        <p>© {new Date().getFullYear()} The Prime Protocol</p>
      </div>
    </footer>
  );
}
