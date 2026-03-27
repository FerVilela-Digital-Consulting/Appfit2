import { Button } from "@/components/ui/button";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  onPrimary: () => void;
  language: LandingLanguage;
};

export default function LandingHeader({ onPrimary, language }: Props) {
  const copy = landingCopy[language].header;

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-[#d6e0eb] bg-[#f5f9fc] shadow-none">
      <div className="mx-auto flex h-[76px] w-full max-w-[1280px] items-center justify-between px-4 md:h-[82px] md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(31,158,160,0.16)] ring-1 ring-[#9ad9da]/70">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1f9ea0]" />
          </span>
          <p className="truncate text-left text-[0.92rem] font-black uppercase tracking-[0.22em] text-[#1f2a3a] md:text-xl md:tracking-[0.28em]">
            THE <span className="text-[#1f9ea0]">PRIME</span> <span className="text-[#1f2a3a]">PROTOCOL</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-8 text-center text-xs font-semibold uppercase text-[#4f5f78]">{language}</span>
          <Button className="h-10 rounded-full bg-[#1f9ea0] px-6 text-white hover:bg-[#198b8d]" onClick={onPrimary}>
            {`${copy.login} / ${copy.startFree}`}
          </Button>
        </div>
      </div>
    </header>
  );
}
