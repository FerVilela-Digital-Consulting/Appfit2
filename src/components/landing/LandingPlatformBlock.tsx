import { landingAssets } from "@/components/landing/assets";

export default function LandingPlatformBlock() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6" id="about">
      <div className="relative overflow-hidden bg-[#f4eaea] p-8 md:p-10">
        <div className="max-w-[720px]">
          <h2 className="text-4xl font-semibold">Platform to make it easier for users</h2>
          <p className="mt-4 text-[#9e9baa]">
            Appfit keeps everything in one operational flow so users spend less time switching tools and more time improving results.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <span className="rounded bg-white px-4 py-2 text-sm text-[#1e194d] shadow-sm">Daily Check-ins</span>
            <span className="rounded bg-white px-4 py-2 text-sm text-[#1e194d] shadow-sm">Weekly Reviews</span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-8 hidden w-[200px] lg:block">
          <img alt="mini phone" src={landingAssets.phoneScreen} />
        </div>
      </div>
    </section>
  );
}
