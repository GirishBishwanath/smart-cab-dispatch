import { FaArrowRightLong, FaCircleCheck, FaLocationDot, FaUserCheck, FaCarSide } from "react-icons/fa6";

const STEPS = [
  { number: "01", icon: FaLocationDot, title: "Guest books", description: "Pickup, destination, group size, and luggage are captured in the guest portal." },
  { number: "02", icon: FaUserCheck, title: "Request approved", description: "Operations reviews the request and releases it to the dispatch engine." },
  { number: "03", icon: FaCarSide, title: "Driver assigned", description: "Availability and vehicle capacity are checked before the best available driver is selected." },
  { number: "04", icon: FaCircleCheck, title: "Trip stays live", description: "Status, driver location, route, distance, and ETA stay synchronized through completion." },
];

const Workflow = () => (
  <section id="how-it-works" className="relative overflow-hidden bg-slate-900/45 py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">How it works</span>
        <h2 className="mt-4 text-3xl font-black tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">One ride. A coordinated lifecycle.</h2>
        <p className="mt-4 text-base leading-7 text-slate-400">From the first booking to the final drop-off, every handoff is represented in the same operational flow.</p>
      </div>

      <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
        {STEPS.map(({ number, icon: Icon, title, description }, index) => (
          <li key={number} className="relative bg-slate-950 p-6 sm:p-7">
            {index < STEPS.length - 1 && <FaArrowRightLong className="absolute right-4 top-8 hidden size-3 text-slate-700 lg:block" aria-hidden="true" />}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-[0.16em] text-slate-600">{number}</span>
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/15"><Icon className="size-4" /></span>
            </div>
            <h3 className="mt-8 text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default Workflow;
