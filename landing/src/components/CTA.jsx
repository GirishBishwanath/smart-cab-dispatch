import { FaArrowRightLong, FaMapLocationDot, FaRoute, FaUsersGear } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute bottom-[-160px] left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-8 sm:p-12">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">Ready to move the operation forward?</span>
              <h2 className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-white sm:text-3xl">Bring booking, dispatch, tracking and routing into one system.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">Open the guest experience, jump into the driver workflow, or see the operation from the admin control center.</p>
              <a href={PORTAL_URLS.GUEST} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100">Start with a ride<FaArrowRightLong className="size-3.5" /></a>
            </div>
            <div className="grid grid-cols-3 border-t border-white/10 lg:w-[360px] lg:border-l lg:border-t-0">
              {[
                [FaMapLocationDot, "Map", "Book precisely"],
                [FaRoute, "Route", "Estimate clearly"],
                [FaUsersGear, "Portals", "Operate together"],
              ].map(([Icon, title, text]) => (
                <div key={title} className="border-r border-white/10 p-5 last:border-r-0 lg:p-7">
                  <Icon className="size-4 text-blue-400" />
                  <p className="mt-3 text-xs font-bold text-white">{title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
