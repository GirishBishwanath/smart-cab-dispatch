import { FaCircleCheck } from "react-icons/fa6";

const STEPS = [
  {
    number: "01",
    title: "Guest requests a ride",
    description:
      "Pickup, drop-off, group size, and luggage are submitted from the guest portal in under a minute.",
  },
  {
    number: "02",
    title: "Admin approves the request",
    description:
      "Operations reviews and approves from the dashboard — or rejects with a clear, logged reason.",
  },
  {
    number: "03",
    title: "A driver is auto-assigned",
    description:
      "The dispatch engine checks availability, seat count, and luggage capacity, then assigns a vehicle instantly.",
  },
  {
    number: "04",
    title: "The trip runs live",
    description:
      "Accept, arrive, start, and complete — every step streams in real time to the guest and admin portals.",
  },
];

const Workflow = () => {
  return (
    <section id="how-it-works" className="bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            From request to drop-off, in four steps.
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 lg:block"
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => {
              const isLast = index === STEPS.length - 1;

              return (
                <li key={step.number} className="relative">
                  <span
                    className={`relative z-10 flex size-12 items-center justify-center rounded-full border text-sm font-black ${
                      isLast
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/15 bg-slate-900 text-white"
                    }`}
                  >
                    {isLast ? <FaCircleCheck className="size-5" /> : step.number}
                  </span>

                  <h3 className="mt-5 text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
