import { FaArrowRightLong, FaCircleCheck, FaLocationDot, FaUserCheck, FaRoute } from "react-icons/fa6";

const STEPS = [
  { icon: FaLocationDot, number: "01", title: "Guest books the ride", description: "Pickup, destination, group size and luggage are captured with map-based locations." },
  { icon: FaUserCheck, number: "02", title: "Request is approved", description: "Operations reviews the request and moves it into the dispatch flow." },
  { icon: FaArrowRightLong, number: "03", title: "Driver is assigned", description: "Availability, vehicle capacity and pickup proximity guide the assignment." },
  { icon: FaRoute, number: "04", title: "Route and ETA are ready", description: "The trip gets a driving route with distance and duration estimates." },
  { icon: FaLocationDot, number: "05", title: "Driver location moves live", description: "Socket.IO streams authenticated location updates to the relevant portals." },
  { icon: FaCircleCheck, number: "06", title: "Ride is completed", description: "Status advances through the lifecycle until the guest reaches the destination." },
];

const Workflow = () => {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">One connected journey</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">From a map pin to a completed ride.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">Every stage has an owner, a state and a clear next action — while the important changes stay synchronized across portals.</p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {STEPS.map(({ icon: Icon, number, title, description }, index) => (
            <li key={number} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] lg:min-h-[174px]">
              <div className="flex items-center gap-3">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ${index === STEPS.length - 1 ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-blue-500/10 text-blue-400 ring-blue-500/20"}`}>
                  <Icon className="size-4" />
                </span>
                <span className="text-[10px] font-black tracking-[0.16em] text-slate-600">STEP {number}</span>
              </div>
              <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Workflow;
