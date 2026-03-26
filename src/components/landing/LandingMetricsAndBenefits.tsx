import { Check } from "lucide-react";
import { landingAssets } from "@/components/landing/assets";

export default function LandingMetricsAndBenefits() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-[820px] grid-cols-2 gap-6 px-4 py-10 text-center text-[#1e194d] sm:grid-cols-4">
        <div><p className="text-2xl font-semibold">10,000+</p><p className="text-sm text-[#9e9baa]">Workouts logged</p></div>
        <div><p className="text-2xl font-semibold">89K</p><p className="text-sm text-[#9e9baa]">Daily check-ins</p></div>
        <div><p className="text-2xl font-semibold">30K</p><p className="text-sm text-[#9e9baa]">Weekly reviews</p></div>
        <div><p className="text-2xl font-semibold">2K</p><p className="text-sm text-[#9e9baa]">Teams onboarded</p></div>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative mx-auto w-[320px]">
          <div className="absolute left-[-28px] top-[-22px] h-[300px] w-[265px] rounded-[150px_150px_0_0] bg-[#edb3f1]" />
          <img alt="phone frame" className="relative z-10 h-auto w-full" src={landingAssets.phoneFrame} />
          <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={landingAssets.phoneScreenFeature} />
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Some excellent features for you</h2>
          <ul className="mt-6 space-y-4">
            {["Training Planner", "Nutrition Targets", "Water and Sleep Goals", "Progress Insights"].map((f) => (
              <li className="flex items-center gap-3 text-[#59616a]" key={f}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2ff] text-[#fbbc05]"><Check className="h-4 w-4" /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
