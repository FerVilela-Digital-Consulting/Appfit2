import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  language: LandingLanguage;
};

export default function LandingFooter({ language }: Props) {
  const copy = landingCopy[language].footer;

  return (
    <footer className="relative mt-16 overflow-hidden bg-[#08003b] px-4 py-14 text-white md:px-6" id="contact">
      <div className="pointer-events-none absolute -left-44 -top-36 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(152,128,255,0.24)_0%,rgba(30,18,94,0.08)_58%,rgba(8,0,59,0)_75%)]" />
      <div className="pointer-events-none absolute right-[-130px] top-[-110px] h-[260px] w-[260px] rotate-[24deg] bg-[linear-gradient(135deg,rgba(115,189,230,0.24),rgba(75,116,190,0.06))] [clip-path:polygon(0_0,100%_22%,52%_100%)]" />
      <div className="pointer-events-none absolute right-[120px] top-[36px] h-[120px] w-[120px] rotate-[15deg] bg-[linear-gradient(135deg,rgba(143,214,215,0.28),rgba(143,214,215,0.02))] [clip-path:polygon(0_0,100%_30%,48%_100%)]" />
      <div className="pointer-events-none absolute bottom-[72px] right-[68px] hidden h-[170px] w-[90px] rounded-[26px] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] shadow-[0_14px_30px_rgba(0,0,0,0.3)] lg:block">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-white/45" />
      </div>

      <div className="relative mx-auto w-full max-w-[1280px]">
        <div className="max-w-[700px]">
          <h3 className="text-4xl font-semibold">{copy.title}</h3>
          <p className="mt-4 max-w-[560px] text-[#9e9baa]">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full border border-white px-4 py-2 text-sm">{copy.playStore}</button>
            <button className="rounded-full border border-white px-4 py-2 text-sm">{copy.appStore}</button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 w-full max-w-[1280px] border-t border-white/15 pt-6 text-sm text-[#848487]">
        <p>&copy; {new Date().getFullYear()} The Prime Protocol</p>
      </div>
    </footer>
  );
}
