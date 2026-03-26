import { Button } from "@/components/ui/button";
import { landingAssets } from "@/components/landing/assets";

type Props = {
  onPrimary: () => void;
};

export default function LandingFeatureRows({ onPrimary }: Props) {
  return (
    <>
      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:items-center" id="features">
        <div className="relative mx-auto w-[320px]">
          <div className="absolute left-[-35px] top-[-28px] h-[300px] w-[300px] rounded-full bg-[#f2cc11]" />
          <img alt="phone frame" className="relative z-10 h-auto w-full" src={landingAssets.phoneFrame} />
          <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={landingAssets.phoneScreenAlt} />
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Daily dashboard focused on actions</h2>
          <p className="mt-4 text-lg leading-8 text-[#9e9baa]">
            Start each day with a clear plan: your workout, hydration target, recovery status, and nutrition checkpoints.
          </p>
          <Button className="mt-7 h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={onPrimary}>
            Open dashboard
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-4xl font-semibold leading-tight">Nutrition and recovery in sync</h2>
          <p className="mt-4 text-lg leading-8 text-[#9e9baa]">
            Connect meals, sleep, and biofeedback so your training load matches your real recovery capacity.
          </p>
          <Button className="mt-7 h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={onPrimary}>
            Start tracking
          </Button>
        </div>
        <div className="order-1 relative mx-auto w-[320px] lg:order-2">
          <div className="absolute right-[-30px] top-[-26px] h-[295px] w-[280px] rounded-[150px_150px_0_0] bg-[#f7b6c5]" />
          <img alt="phone frame" className="relative z-10 h-auto w-full" src={landingAssets.phoneFrame} />
          <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={landingAssets.phoneScreenAlt2} />
        </div>
      </section>
    </>
  );
}
