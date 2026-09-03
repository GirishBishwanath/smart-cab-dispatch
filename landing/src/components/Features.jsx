import { FaBolt, FaLocationDot, FaShieldHalved, FaUsersGear, FaChartLine, FaCarSide, FaRoute } from "react-icons/fa6";

const FEATURES = [
  { icon: FaBolt, label: "Dispatch", title: "Capacity-aware assignment", description: "Approved requests are matched against driver availability, vehicle seats, and luggage capacity before a ride is created." },
  { icon: FaLocationDot, label: "Realtime", title: "Live driver location", description: "Socket-powered location updates keep active rides aligned across guest, driver, and operations views." },
  { icon: FaRoute, label: "Routing", title: "Route, distance & ETA", description: "Driving routes and journey metrics come from the routing layer instead of placeholder estimates." },
  { icon: FaUsersGear, label: "Portals", title: "Three focused workspaces", description: "Guests, drivers, and admins get role-specific interfaces backed by the same ride lifecycle." },
  { icon: FaShieldHalved, label: "Security", title: "Role-scoped access", description: "JWT authentication and authorization boundaries protect portal actions and operational data." },
  { icon: FaChartLine, label: "Operations", title: "Fleet visibility", description: "Dispatch teams can see driver state, vehicles, active rides, and operational history from one place." },
];

const Features = () => (
  <section id="features" className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
    <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-3xl" aria-hidden="true" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">The platform</span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">The infrastructure behind a smoother ride.</h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-slate-400 lg:justify-self-end">Built around the real operational moments that matter: approving requests, selecting the right vehicle, moving location data, drawing the route, and keeping every portal in sync.</p>
      </div>

      <div className="mt-14 grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, label, title, description }, index) => (
          <article key={title} className={`group relative p-6 sm:p-7 ${index % 3 !== 2 ? "lg:border-r" : ""} ${index < 3 ? "lg:border-b" : ""} ${index % 2 === 0 ? "sm:border-r lg:border-r" : "sm:border-r-0 lg:border-r-0"} border-white/10`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
              <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-blue-300 transition group-hover:border-blue-400/25 group-hover:bg-blue-400/10">
                <Icon className="size-4" />
              </span>
            </div>
            <h3 className="mt-8 text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
