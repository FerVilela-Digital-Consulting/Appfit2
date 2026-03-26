import { Button } from "@/components/ui/button";

type Props = {
  onPrimary: () => void;
};

export default function LandingHeader({ onPrimary }: Props) {
  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-8 md:px-6">
      <p className="truncate text-left text-[0.92rem] font-black uppercase tracking-[0.22em] text-card-foreground md:text-xl md:tracking-[0.28em]">
        THE <span className="text-primary">PRIME</span> PROTOCOL
      </p>
      <nav className="hidden items-center gap-5 text-sm font-medium text-[#1b1e2c] lg:flex">
        <a href="#about">About</a>
        <a href="#features">Features</a>
        <a href="#partners">Partners</a>
        <a href="#pricing">Pricing</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="flex items-center gap-3">
        <button className="hidden text-sm font-medium text-[#1d1d20] sm:inline-flex" onClick={onPrimary} type="button">
          Login
        </button>
        <Button className="h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={onPrimary}>
          Start Free
        </Button>
      </div>
    </header>
  );
}
