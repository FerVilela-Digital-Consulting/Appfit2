export default function LandingHowItWorks() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-[628px] text-center">
        <h2 className="text-4xl font-semibold">How it works</h2>
        <p className="mt-4 text-xl leading-9 text-[#9e9baa]">
          Build your week, execute every day, and adapt with feedback from your own health metrics.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          "Install the app",
          "Create your fitness plan",
          "Track and improve weekly",
        ].map((title) => (
          <article className="text-center" key={title}>
            <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-[#fbbc05]" />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-base text-[#9e9baa]">
              Keep everything in one workflow: training, meals, hydration, sleep, and progress analytics.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
