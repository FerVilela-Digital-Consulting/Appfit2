import { partnerLabels } from "@/components/landing/assets";

export default function LandingPartners() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6" id="partners">
      <h2 className="text-center text-4xl font-semibold">See our trusted partners</h2>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {partnerLabels.map((label) => (
          <div className="flex h-14 items-center justify-center bg-[#f8fafc] p-3 text-sm font-semibold text-[#1e194d]" key={label}>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
