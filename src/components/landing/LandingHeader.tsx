import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { landingCopy } from "@/components/landing/copy";
import type { LandingLanguage } from "@/components/landing/types";

type Props = {
  onPrimary: () => void;
  language: LandingLanguage;
  onToggleLanguage: () => void;
};

export default function LandingHeader({ onPrimary, language, onToggleLanguage }: Props) {
  const copy = landingCopy[language].header;

  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-8 md:px-6">
      <p className="truncate text-left text-[0.92rem] font-black uppercase tracking-[0.22em] text-card-foreground md:text-xl md:tracking-[0.28em]">
        THE <span className="text-[#1f9ea0]">PRIME</span> PROTOCOL
      </p>

      <div className="flex items-center gap-2">
        <button
          aria-label={copy.switchLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#b9dfdf] bg-white text-[#1f9ea0] hover:bg-[#e8f7f7]"
          onClick={onToggleLanguage}
          type="button"
          title={copy.switchLabel}
        >
          <Languages className="h-4 w-4" />
        </button>
        <span className="min-w-8 text-center text-xs font-semibold uppercase text-[#6f748a]">{language}</span>
        <Button className="h-10 rounded-full bg-[#1f9ea0] px-6 text-white hover:bg-[#198b8d]" onClick={onPrimary}>
          {`${copy.login} / ${copy.startFree}`}
        </Button>
      </div>
    </header>
  );
}
