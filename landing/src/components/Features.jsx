import {
  FaBolt,
  FaLocationDot,
  FaShieldHalved,
  FaUsersGear,
  FaChartLine,
  FaCarSide,
  FaRoute,
} from "react-icons/fa6";

const FEATURES = [
  { icon: FaLocationDot, title: "Map-based ride booking", description: "Guests can pin pickup and destination locations so each ride starts with precise trip coordinates." },
  { icon: FaBolt, title: "Capacity-aware dispatch", description: "Approved requests are matched against driver availability, seat count and luggage capacity before assignment." },
  { icon: FaRoute, title: "Route distance + ETA", description: "Driving routes are calculated with OSRM and surfaced as practical distance and duration estimates." },
  { icon: FaCarSide, title: "Live driver tracking", description: "Authenticated Socket.IO updates keep driver location and active ride state moving across the platform." },
  { icon: FaUsersGear, title: "Three focused portals", description: "Guests, drivers and admins get dedicated workflows while sharing the same backend and ride state." },
  { icon: FaShieldHalved, title: "Secure role-based access", description: "JWT authentication and role-scoped APIs keep booking, dispatch, fleet and trip actions separated." },
];

const Features = () => {
  return (
    <section id="features" className="relative bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">What powers the platform</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">The pieces that make a dispatch system actually work.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">From precise locations to the driver receiving an assignment, the important trip state stays connected instead of living in separate tools.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 transition group-hover:bg-blue-500/15">
                <Icon className="size-4.5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] px-5 py-4 text-sm text-slate-300 sm:px-6">
          <span className="font-semibold text-white">Built around the ride lifecycle:</span> requested → approved → assigned → arrived → picked up → completed.
        </div>
      </div>
    </section>
  );
};

export default Features;
