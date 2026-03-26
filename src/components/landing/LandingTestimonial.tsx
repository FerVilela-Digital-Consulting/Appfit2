import { Button } from "@/components/ui/button";
import { landingAssets } from "@/components/landing/assets";

type Props = {
  onPrimary: () => void;
};

export default function LandingTestimonial({ onPrimary }: Props) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6">
      <h3 className="text-center text-2xl font-semibold">Our best customers</h3>
      <div className="mt-8 grid gap-6 rounded-2xl bg-[#fafafa] p-6 md:grid-cols-[280px_1fr] md:p-10">
        <Button className="h-10 rounded-full bg-[#5560f4] text-white hover:bg-[#434dd9]" onClick={onPrimary}>
          View Success Stories
        </Button>
        <div className="flex items-start gap-5">
          <img alt="avatar" className="h-20 w-20 rounded-full object-cover" src={landingAssets.avatar} />
          <p className="text-[#9e9baa]">
            Appfit gave our coaching team one source of truth for training, recovery, and adherence. Weekly decisions are now faster and based on real data.
          </p>
        </div>
      </div>
    </section>
  );
}
