import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Play } from "lucide-react";

const imgLogo = "https://www.figma.com/api/mcp/asset/afc6f028-00d1-495f-bd40-461357ff47e7";
const imgHeroBg = "https://www.figma.com/api/mcp/asset/8c38573b-147e-40d5-8560-fc4273a0a4a3";
const imgPhoneFrame = "https://www.figma.com/api/mcp/asset/1d6625e0-82e1-4cc6-90c4-2be5aebac0cf";
const imgPhoneScreen = "https://www.figma.com/api/mcp/asset/8fe64d5c-ddd0-4717-9395-1cd09563fdab";
const imgPhoneScreenAlt = "https://www.figma.com/api/mcp/asset/11a72f1f-d955-47e8-a0ef-c55b45d7d44d";
const imgPhoneScreenAlt2 = "https://www.figma.com/api/mcp/asset/52e623aa-83ab-410a-9f4d-271b293c55d6";
const imgPhoneScreenFeature = "https://www.figma.com/api/mcp/asset/213edeb1-7431-4b31-989f-7b035a262b4e";
const imgPhoneScreenFooter = "https://www.figma.com/api/mcp/asset/6390db42-6601-401d-bb99-2ea91a81bfe0";
const imgAvatar = "https://www.figma.com/api/mcp/asset/e81f7a63-0f00-4946-8375-4a45251ce0fd";

const partnerLogos = [
  "https://www.figma.com/api/mcp/asset/8bff04e9-36a1-40dd-9b7f-bb881034f9cc",
  "https://www.figma.com/api/mcp/asset/ce8fd138-fb8c-48b3-909c-6b87fbd44c38",
  "https://www.figma.com/api/mcp/asset/aadf69d7-1e15-4f99-bdb8-9d4cb0009817",
  "https://www.figma.com/api/mcp/asset/6bb6f451-e592-401c-a127-27d4956be9bb",
  "https://www.figma.com/api/mcp/asset/c264e144-6865-4d84-bf1e-f74ac3dc3731",
  "https://www.figma.com/api/mcp/asset/06d93d87-3a53-44b4-8bdb-e5d9f8b3c040",
  "https://www.figma.com/api/mcp/asset/a18c740f-ad3c-431c-a23c-5e66829e9781",
  "https://www.figma.com/api/mcp/asset/4dd1af8a-e1c1-42da-973f-2cd46a9cd386",
  "https://www.figma.com/api/mcp/asset/69ad4c7e-1e3e-47ed-86ce-999783e7bdd7",
  "https://www.figma.com/api/mcp/asset/82c1343a-3631-4b38-8ce7-cf962f13cec7",
];

const pricing = [
  {
    name: "Free",
    badge: "LIMITED",
    price: "$0",
    features: ["Order Transaction", "Live Inventory", "Basic Statistics", "Invoice Management", "Database"]
  },
  {
    name: "Pro",
    badge: "POPULAR",
    price: "$39",
    features: ["Order Transaction", "Live Inventory", "Advanced Statistics", "Invoice Management", "Smart Reports"]
  },
  {
    name: "Master",
    badge: "ENTERPRISE",
    price: "$99",
    features: ["Order Transaction", "Live Inventory", "Full Statistics", "Invoice Management", "Dedicated Support"]
  }
];

const Index = () => {
  const { user, isGuest, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const goPrimary = () => navigate(user || isGuest ? "/today" : "/auth");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#1e194d]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#fbbc05] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1e194d]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden">
        <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-8 md:px-6">
          <img alt="Quotient" className="h-10 w-auto" src={imgLogo} />

          <nav className="hidden items-center gap-5 text-sm font-medium text-[#1b1e2c] lg:flex">
            <a href="#about">About</a>
            <a href="#service">Service</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden text-sm font-medium text-[#1d1d20] sm:inline-flex" onClick={goPrimary} type="button">
              Login
            </button>
            <Button className="h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={goPrimary}>
              Sign Up Free
            </Button>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 pb-14 pt-2 md:px-6 lg:grid-cols-[1fr_410px] lg:pb-24">
          <div className="relative overflow-hidden rounded-[28px] bg-[#eef2ff] px-6 py-10 md:px-10 md:py-12">
            <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" src={imgHeroBg} />
            <div className="relative z-10 max-w-[620px]">
              <span className="inline-flex rounded-full bg-[rgba(84,94,244,0.06)] px-4 py-2 text-xs text-[#fbbc05]">Welcome to MyApp</span>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-black md:text-6xl md:leading-[1.15]">
                Manage your finance with <span className="text-[#fbbc05]">Quotient</span> app
              </h1>
              <p className="mt-4 text-base leading-8 text-[#748795] md:text-2xl md:leading-[1.6]">
                Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit quisque iaculis. Nunc enim cursus posuere egestas eu viverra.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-6">
                <Button className="h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={goPrimary}>
                  Get Started
                </Button>
                <button className="inline-flex items-center gap-2 text-xl font-medium text-[#fbbc05]" type="button">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fbbc05] text-white">
                    <Play className="h-4 w-4 fill-white" />
                  </span>
                  How it works
                </button>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-[310px]">
            <img alt="phone frame" className="relative z-10 h-auto w-full" src={imgPhoneFrame} />
            <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={imgPhoneScreen} />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6">
          <div className="mx-auto max-w-[628px] text-center">
            <h2 className="text-4xl font-semibold">How it works</h2>
            <p className="mt-4 text-xl leading-9 text-[#9e9baa]">
              Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit quisque.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              "Install the app",
              "Link with account",
              "Use it and manage"
            ].map((title) => (
              <article className="text-center" key={title}>
                <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-[#fbbc05]" />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-base text-[#9e9baa]">
                  Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative mx-auto w-[320px]">
            <div className="absolute left-[-35px] top-[-28px] h-[300px] w-[300px] rounded-full bg-[#f2cc11]" />
            <img alt="phone frame" className="relative z-10 h-auto w-full" src={imgPhoneFrame} />
            <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={imgPhoneScreenAlt} />
          </div>
          <div>
            <h2 className="text-4xl font-semibold leading-tight">Quick and easy payments with just a few clicks</h2>
            <p className="mt-4 text-lg leading-8 text-[#9e9baa]">
              Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit quisque iaculis.
            </p>
            <Button className="mt-7 h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={goPrimary}>
              Get started
            </Button>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-semibold leading-tight">Quick and easy payments with just a few clicks</h2>
            <p className="mt-4 text-lg leading-8 text-[#9e9baa]">
              Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit quisque iaculis.
            </p>
            <Button className="mt-7 h-10 rounded-full bg-[#fbbc05] px-6 text-white hover:bg-[#efb300]" onClick={goPrimary}>
              Get started
            </Button>
          </div>
          <div className="order-1 relative mx-auto w-[320px] lg:order-2">
            <div className="absolute right-[-30px] top-[-26px] h-[295px] w-[280px] rounded-[150px_150px_0_0] bg-[#f7b6c5]" />
            <img alt="phone frame" className="relative z-10 h-auto w-full" src={imgPhoneFrame} />
            <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={imgPhoneScreenAlt2} />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[820px] grid-cols-2 gap-6 px-4 py-10 text-center text-[#1e194d] sm:grid-cols-4">
          <div><p className="text-2xl font-semibold">10,000+</p><p className="text-sm text-[#9e9baa]">Downloads</p></div>
          <div><p className="text-2xl font-semibold">89K</p><p className="text-sm text-[#9e9baa]">Active users</p></div>
          <div><p className="text-2xl font-semibold">30K</p><p className="text-sm text-[#9e9baa]">Positive review</p></div>
          <div><p className="text-2xl font-semibold">2k</p><p className="text-sm text-[#9e9baa]">Company use</p></div>
        </section>

        <section className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative mx-auto w-[320px]">
            <div className="absolute left-[-28px] top-[-22px] h-[300px] w-[265px] rounded-[150px_150px_0_0] bg-[#edb3f1]" />
            <img alt="phone frame" className="relative z-10 h-auto w-full" src={imgPhoneFrame} />
            <img alt="phone screen" className="absolute left-[20px] top-[28px] z-0 h-[85%] w-[87%] rounded-[26px] object-cover" src={imgPhoneScreenFeature} />
          </div>

          <div>
            <h2 className="text-4xl font-semibold leading-tight">Some excellent features for you</h2>
            <ul className="mt-6 space-y-4">
              {["E-Payment", "Withdraw Money", "Add Card", "Bill Payment"].map((f) => (
                <li className="flex items-center gap-3 text-[#59616a]" key={f}>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2ff] text-[#fbbc05]"><Check className="h-4 w-4" /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6" id="about">
          <div className="relative overflow-hidden bg-[#f4eaea] p-8 md:p-10">
            <div className="max-w-[720px]">
              <h2 className="text-4xl font-semibold">Platform to make it easier for users</h2>
              <p className="mt-4 text-[#9e9baa]">
                Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit quisque iaculis.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <span className="rounded bg-white px-4 py-2 text-sm text-[#1e194d] shadow-sm">Checkout</span>
                <span className="rounded bg-white px-4 py-2 text-sm text-[#1e194d] shadow-sm">Integration</span>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-8 hidden w-[200px] lg:block">
              <img alt="mini phone" src={imgPhoneScreen} />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6" id="portfolio">
          <h2 className="text-center text-4xl font-semibold">See our trusted partners</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {partnerLogos.map((logo, i) => (
              <div className="flex h-14 items-center justify-center bg-[#f8fafc] p-3" key={logo + i}>
                <img alt="partner" className="max-h-7 w-auto" src={logo} />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6" id="blog">
          <h3 className="text-center text-2xl font-semibold">Our best customers</h3>
          <div className="mt-8 grid gap-6 rounded-2xl bg-[#fafafa] p-6 md:grid-cols-[280px_1fr] md:p-10">
            <Button className="h-10 rounded-full bg-[#5560f4] text-white hover:bg-[#434dd9]" onClick={goPrimary}>
              View Photo Gallary
            </Button>
            <div className="flex items-start gap-5">
              <img alt="avatar" className="h-20 w-20 rounded-full object-cover" src={imgAvatar} />
              <p className="text-[#9e9baa]">
                Recusandae sunt voluptate repellat velit dolorem eos nostrum cupiditate. Labore porro cupiditate reiciendis enim neque. Modi eos autem expedita voluptatibus dignissimos repellat.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6" id="service">
          <h2 className="text-center text-4xl font-semibold">Choose the best plan</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pricing.map((plan) => (
              <article className="rounded-xl border border-[#ececec] p-6" key={plan.name}>
                <p className="text-xl font-semibold">{plan.name}</p>
                <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
                <p className="mt-1 inline-flex rounded-full bg-[#ffe7b0] px-2 py-0.5 text-xs text-[#9f6a00]">{plan.badge}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#748795]">
                  {plan.features.map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <Check className="h-4 w-4 text-[#fbbc05]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-16 bg-[#08003b] px-4 py-14 text-white md:px-6" id="contact">
          <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[1.2fr_2fr_auto]">
            <div>
              <h3 className="text-4xl font-semibold">Quotient is available for all devices</h3>
              <p className="mt-4 max-w-[560px] text-[#9e9baa]">
                Lorem ipsum dolor sit amet consectetur. Pulvinar nunc amet pretium pellentesque. Ornare in arcu elit quisque.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-full border border-white px-4 py-2 text-sm">Google play</button>
                <button className="rounded-full border border-white px-4 py-2 text-sm">Apple store</button>
              </div>
            </div>

            <div className="grid gap-7 text-sm text-[#9e9baa] sm:grid-cols-4">
              <div><p className="mb-2 font-semibold text-white">Home</p><p>Product</p><p>Pricing</p><p>Business</p><p>Enterprise</p></div>
              <div><p className="mb-2 font-semibold text-white">About us</p><p>Company</p><p>Leadership</p><p>Careers</p><p>Diversity</p></div>
              <div><p className="mb-2 font-semibold text-white">Resources</p><p>App Guide</p><p>Forum</p><p>Support</p><p>Events</p></div>
              <div><p className="mb-2 font-semibold text-white">Tutorial</p><p>10 leadership styles</p><p>Executive summary tips</p><p>What are OKRs</p><p>See all guides</p></div>
            </div>

            <div className="mx-auto w-[112px] lg:mx-0">
              <img alt="footer phone" className="h-auto w-full" src={imgPhoneFrame} />
              <img alt="footer screen" className="-mt-[245px] ml-[8px] h-[220px] w-[95px] rounded-[16px] object-cover" src={imgPhoneScreenFooter} />
            </div>
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-[#848487]">
            <div className="flex gap-4"><span>?</span><span>?</span><span>?</span><span>?</span></div>
            <div className="flex flex-wrap gap-4"><span>Term & Conditions</span><span>Privacy Policy</span><span>Cookies</span></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
