import { FaArrowRightLong, FaUser, FaCarSide, FaUserShield, FaMapLocationDot, FaRoute, FaShieldHalved, FaChartLine } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const PORTALS = [
  { icon: FaUser, role: "Guest", title: "Book and follow", description: "Create a ride request, choose locations, and follow the journey from one focused travel portal.", features: ["Map-based booking", "Live ride status", "Trip history"], accent: "emerald", href: PORTAL_URLS.GUEST },
  { icon: FaCarSide, role: "Driver", title: "Move the trip forward", description: "See assignments, update ride stages, share location, and keep the journey moving from the road.", features: ["Assignment control", "Live location", "Ride lifecycle"], accent: "violet", href: PORTAL_URLS.DRIVER },
  { icon: FaUserShield, role: "Operations", title: "Command the network", description: "Approve requests, manage fleet state, inspect rides, and watch live operations from one control center.", features: ["Dispatch oversight", "Fleet visibility", "Operational history"], accent: "blue", href: PORTAL_URLS.ADMIN },
];

const ACCENTS = {
  emerald: { icon: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/15", text: "text-emerald-300", button: "bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15" },
  violet: { icon: "bg-violet-400/10 text-violet-300 ring-violet-400/15", text: "text-violet-300", button: "bg-violet-400/10 text-violet-200 hover:bg-violet-400/15" },
  blue: { icon: "bg-blue-400/10 text-blue-300 ring-blue-400/15", text: "text-blue-300", button: "bg-blue-400/10 text-blue-200 hover:bg-blue-400/15" },
};

const PortalCards = () => (
  <section id="portals" className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">One platform, three roles</span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">Every person sees what they need.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">Purpose-built portals share the same ride state without forcing every role into the same workflow.</p>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {PORTALS.map(({ icon: Icon, role, title, description, features, accent, href }) => {
          const color = ACCENTS[accent];
          return (
            <article key={role} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04]">
              <div className="absolute -right-20 -top-20 size-48 rounded-full bg-white/[0.025] blur-3xl transition group-hover:bg-white/[0.05]" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-[0.16em] ${color.text}`}>{role} portal</span>
                  <span className={`flex size-10 items-center justify-center rounded-xl ring-1 ${color.icon}`}><Icon className="size-4" /></span>
                </div>
                <h3 className="mt-10 text-xl font-bold tracking-tight text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                <ul className="mt-7 space-y-3 border-t border-white/10 pt-6">
                  {features.map((feature) => <li key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-300"><span className="size-1.5 rounded-full bg-slate-500" />{feature}</li>)}
                </ul>
                <a href={href} className={`mt-8 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${color.button}`}>Open portal <FaArrowRightLong className="size-3.5" /></a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default PortalCards;
