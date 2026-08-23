import {
  FaBolt,
  FaLocationDot,
  FaShieldHalved,
  FaUsersGear,
  FaChartLine,
  FaCarSide,
} from "react-icons/fa6";

const FEATURES = [
  {
    icon: FaBolt,
    title: "Automatic dispatch engine",
    description:
      "Every approved request is matched to an available driver by seat and luggage capacity — no manual assignment.",
  },
  {
    icon: FaLocationDot,
    title: "Real-time ride tracking",
    description:
      "Socket-driven updates move a ride from assigned to arrived to completed live, across every connected portal.",
  },
  {
    icon: FaUsersGear,
    title: "Role-based portals",
    description:
      "Guests, drivers, and admins each get a dedicated workspace built around what their role actually needs to do.",
  },
  {
    icon: FaShieldHalved,
    title: "Secure by default",
    description:
      "JWT authentication, hashed credentials, and role-scoped routes protect every action across the platform.",
  },
  {
    icon: FaCarSide,
    title: "Full fleet visibility",
    description:
      "Track driver availability, vehicle capacity, and active trips from a single operational dashboard.",
  },
  {
    icon: FaChartLine,
    title: "Operational analytics",
    description:
      "Ride volume, completion rates, and cancellation sources — surfaced for dispatchers, not buried in logs.",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
            Built for real operations
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            One dispatch engine, three portals that actually talk to each other.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Icon className="size-4.5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
