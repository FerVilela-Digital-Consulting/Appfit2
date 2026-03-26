import { landingAssets } from "@/components/landing/assets";

export default function LandingFooter() {
  return (
    <footer className="mt-16 bg-[#08003b] px-4 py-14 text-white md:px-6" id="contact">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[1.2fr_2fr_auto]">
        <div>
          <h3 className="text-4xl font-semibold">Appfit is available for all devices</h3>
          <p className="mt-4 max-w-[560px] text-[#9e9baa]">
            Track your fitness goals from anywhere and keep your progress synchronized across your routine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full border border-white px-4 py-2 text-sm">Google Play</button>
            <button className="rounded-full border border-white px-4 py-2 text-sm">Apple Store</button>
          </div>
        </div>

        <div className="grid gap-7 text-sm text-[#9e9baa] sm:grid-cols-4">
          <div><p className="mb-2 font-semibold text-white">Home</p><p>Product</p><p>Pricing</p><p>Business</p><p>Enterprise</p></div>
          <div><p className="mb-2 font-semibold text-white">About us</p><p>Company</p><p>Leadership</p><p>Careers</p><p>Diversity</p></div>
          <div><p className="mb-2 font-semibold text-white">Resources</p><p>App Guide</p><p>Forum</p><p>Support</p><p>Events</p></div>
          <div><p className="mb-2 font-semibold text-white">Tutorial</p><p>Training setup</p><p>Nutrition baseline</p><p>Weekly review</p><p>See all guides</p></div>
        </div>

        <div className="mx-auto w-[112px] lg:mx-0">
          <img alt="footer phone" className="h-auto w-full" src={landingAssets.phoneFrame} />
          <img alt="footer screen" className="-mt-[245px] ml-[8px] h-[220px] w-[95px] rounded-[16px] object-cover" src={landingAssets.phoneScreenFooter} />
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-[#848487]">
        <div className="flex gap-4">
          <span className="h-2 w-2 rounded-full bg-[#fbbc05]" />
          <span className="h-2 w-2 rounded-full bg-[#fbbc05]" />
          <span className="h-2 w-2 rounded-full bg-[#fbbc05]" />
          <span className="h-2 w-2 rounded-full bg-[#fbbc05]" />
        </div>
        <div className="flex flex-wrap gap-4"><span>Term & Conditions</span><span>Privacy Policy</span><span>Cookies</span></div>
      </div>
    </footer>
  );
}
