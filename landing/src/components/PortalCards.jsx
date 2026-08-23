import { FaArrowRightLong, FaUser, FaCarSide, FaUserShield, FaMapLocationDot, FaRoute, FaShieldHalved, FaChartLine } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const PORTALS = [
  {
    icon: FaUser,
    role: "Guest portal",
    eyebrow: "Guest travel portal",
    title: "Travel comfortably. Ride confidently.",
    description:
      "Request rides, follow your assigned cab live, and manage your full trip history.",
    pills: [
      { icon: FaMapLocationDot, label: "Travel", sub: "Simple trip management" },
      { icon: FaRoute, label: "Rides", sub: "Follow your journey" },
      { icon: FaShieldHalved, label: "Secure", sub: "Protected guest access" },
    ],
    color: {
      text: "text-emerald-400",
      chipBg: "bg-emerald-500/10",
      chipText: "text-emerald-400",
      chipRing: "ring-emerald-500/20",
      glow: "bg-emerald-600/20",
      border: "hover:border-emerald-500/30",
      button: "bg-emerald-600 hover:bg-emerald-500",
    },
    href: PORTAL_URLS.GUEST,
    cta: "Sign in to Guest Portal",
  },
  {
    icon: FaCarSide,
    role: "Driver portal",
    eyebrow: "Driver operations",
    title: "Keep every ride moving.",
    description:
      "Accept assignments, update trip status, and manage your ride history end to end.",
    pills: [
      { icon: FaCarSide, label: "Fleet", sub: "Your vehicle & profile" },
      { icon: FaRoute, label: "Rides", sub: "Assigned ride control" },
      { icon: FaShieldHalved, label: "Secure", sub: "Protected driver access" },
    ],
    color: {
      text: "text-violet-400",
      chipBg: "bg-violet-500/10",
      chipText: "text-violet-400",
      chipRing: "ring-violet-500/20",
      glow: "bg-violet-600/20",
      border: "hover:border-violet-500/30",
      button: "bg-violet-600 hover:bg-violet-500",
    },
    href: PORTAL_URLS.DRIVER,
    cta: "Sign in to Driver Portal",
  },
  {
    icon: FaUserShield,
    role: "Admin portal",
    eyebrow: "Operations control center",
    title: "Run every ride from one place.",
    description:
      "Approve requests, oversee drivers and guests, and watch dispatch move live.",
    pills: [
      { icon: FaCarSide, label: "Fleet", sub: "Driver visibility" },
      { icon: FaChartLine, label: "Operations", sub: "Live overview" },
      { icon: FaShieldHalved, label: "Secure", sub: "Role-based access" },
    ],
    color: {
      text: "text-blue-400",
      chipBg: "bg-blue-500/10",
      chipText: "text-blue-400",
      chipRing: "ring-blue-500/20",
      glow: "bg-blue-600/20",
      border: "hover:border-blue-500/30",
      button: "bg-blue-600 hover:bg-blue-500",
    },
    href: PORTAL_URLS.ADMIN,
    cta: "Sign in to Admin Portal",
  },
];

const PortalCards = () => {
  return (
    <section id="portals" className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Three portals, one platform
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Pick your side of the trip.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PORTALS.map(({ icon: Icon, role, eyebrow, title, description, pills, color, href, cta }) => (
            <div
              key={role}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-7 transition ${color.border}`}
            >
              <div
                className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full ${color.glow} blur-3xl transition group-hover:scale-110`}
                aria-hidden="true"
              />

              <div className="relative">
                <div className={`flex size-11 items-center justify-center rounded-xl ${color.chipBg} ${color.chipText} ring-1 ${color.chipRing}`}>
                  <Icon className="size-4.5" />
                </div>

                <span className={`mt-6 block text-xs font-bold uppercase tracking-wide ${color.text}`}>
                  {eyebrow}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {description}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {pills.map((pill) => (
                    <div
                      key={pill.label}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                    >
                      <pill.icon className={`size-3.5 ${color.chipText}`} />
                      <p className="mt-2 text-[11px] font-bold text-white">
                        {pill.label}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-slate-500">
                        {pill.sub}
                      </p>
                    </div>
                  ))}
                </div>

                <a
                  href={href}
                  className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition ${color.button}`}
                >
                  {cta}
                  <FaArrowRightLong className="size-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalCards;
