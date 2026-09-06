import { FaArrowRightLong, FaUser, FaCarSide, FaUserShield, FaMapLocationDot, FaRoute, FaClock, FaGaugeHigh } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const PORTALS = [
  {
    icon: FaUser,
    role: "Guest portal",
    eyebrow: "For guests",
    title: "Book, track and arrive.",
    description: "Choose your trip locations, follow the assigned cab and keep your journey details in one place.",
    pills: [
      { icon: FaMapLocationDot, label: "Map booking", sub: "Pin your trip" },
      { icon: FaRoute, label: "Live route", sub: "Follow progress" },
      { icon: FaClock, label: "ETA", sub: "Know what's next" },
    ],
    color: { text: "text-emerald-400", chipBg: "bg-emerald-500/10", chipText: "text-emerald-400", chipRing: "ring-emerald-500/20", glow: "bg-emerald-600/20", border: "hover:border-emerald-500/30", button: "bg-emerald-600 hover:bg-emerald-500" },
    href: PORTAL_URLS.GUEST,
    cta: "Open Guest Portal",
  },
  {
    icon: FaCarSide,
    role: "Driver portal",
    eyebrow: "For drivers",
    title: "Know the ride. Move the ride.",
    description: "Receive assignments, update trip status and share your location while you are on the road.",
    pills: [
      { icon: FaCarSide, label: "Assignments", sub: "Your next ride" },
      { icon: FaMapLocationDot, label: "Location", sub: "Share live position" },
      { icon: FaRoute, label: "Trip flow", sub: "Update status" },
    ],
    color: { text: "text-violet-400", chipBg: "bg-violet-500/10", chipText: "text-violet-400", chipRing: "ring-violet-500/20", glow: "bg-violet-600/20", border: "hover:border-violet-500/30", button: "bg-violet-600 hover:bg-violet-500" },
    href: PORTAL_URLS.DRIVER,
    cta: "Open Driver Portal",
  },
  {
    icon: FaUserShield,
    role: "Admin portal",
    eyebrow: "For operations",
    title: "See the fleet. Control the flow.",
    description: "Approve requests, oversee drivers and rides, and keep the operation visible from one control center.",
    pills: [
      { icon: FaGaugeHigh, label: "Dispatch", sub: "Assign with context" },
      { icon: FaMapLocationDot, label: "Live map", sub: "Watch active rides" },
      { icon: FaRoute, label: "History", sub: "Review completed trips" },
    ],
    color: { text: "text-blue-400", chipBg: "bg-blue-500/10", chipText: "text-blue-400", chipRing: "ring-blue-500/20", glow: "bg-blue-600/20", border: "hover:border-blue-500/30", button: "bg-blue-600 hover:bg-blue-500" },
    href: PORTAL_URLS.ADMIN,
    cta: "Open Admin Portal",
  },
];

const PortalCards = () => {
  return (
    <section id="portals" className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">One platform, three perspectives</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Every role sees the part of the trip they own.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">The same ride state flows through dedicated experiences for the guest, driver and operations team.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PORTALS.map(({ icon: Icon, role, eyebrow, title, description, pills, color, href, cta }) => (
            <div key={role} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-7 transition ${color.border}`}>
              <div className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full ${color.glow} blur-3xl transition group-hover:scale-110`} aria-hidden="true" />
              <div className="relative">
                <div className={`flex size-11 items-center justify-center rounded-xl ${color.chipBg} ${color.chipText} ring-1 ${color.chipRing}`}><Icon className="size-4.5" /></div>
                <span className={`mt-6 block text-xs font-bold uppercase tracking-wide ${color.text}`}>{eyebrow}</span>
                <h3 className="mt-1.5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {pills.map((pill) => {
                    const PillIcon = pill.icon;
                    return <div key={pill.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"><PillIcon className={`size-3.5 ${color.chipText}`} /><p className="mt-2 text-[11px] font-bold text-white">{pill.label}</p><p className="mt-0.5 text-[10px] leading-tight text-slate-500">{pill.sub}</p></div>;
                  })}
                </div>
                <a href={href} className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition ${color.button}`}>{cta}<FaArrowRightLong className="size-3.5" /></a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalCards;
