import { Check } from "lucide-react";

const pricing = [
  {
    name: "Free",
    badge: "LIMITED",
    price: "$0",
    features: ["Workout tracking", "Hydration logs", "Basic insights", "Profile setup", "Calendar view"],
  },
  {
    name: "Pro",
    badge: "POPULAR",
    price: "$39",
    features: ["Everything in Free", "Nutrition targets", "Advanced stats", "Weekly review", "Goal forecasting"],
  },
  {
    name: "Master",
    badge: "ENTERPRISE",
    price: "$99",
    features: ["Everything in Pro", "Team workspaces", "Admin controls", "Usage analytics", "Priority support"],
  },
];

export default function LandingPricing() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6" id="pricing">
      <h2 className="text-center text-4xl font-semibold">Choose the best plan</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {pricing.map((plan) => (
          <article className="rounded-xl border border-[#ececec] p-6" key={plan.name}>
            <p className="text-xl font-semibold">{plan.name}</p>
            <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
            <p className="mt-1 inline-flex rounded-full bg-[#dff4f4] px-2 py-0.5 text-xs text-[#1a6f70]">{plan.badge}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#748795]">
              {plan.features.map((feature) => (
                <li className="flex items-center gap-2" key={feature}>
                  <Check className="h-4 w-4 text-[#1f9ea0]" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
