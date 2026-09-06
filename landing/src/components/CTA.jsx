import { FaArrowRightLong, FaMapLocationDot, FaRoute, FaUsersGear } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const CTA = () => {
  const highlights = [
    [FaMapLocationDot, "Map-first booking", "Precise pickup & destination"],
    [FaRoute, "Route intelligence", "Distance & ETA estimates"],
    [FaUsersGear, "Connected portals", "Guest, driver & admin"],
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute bottom-[-160px] left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="p-8 sm:p-12 lg:p-14">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">Ready to move the operation forward?</span>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Bring booking, dispatch, tracking and routing into one system.</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">Open the guest experience, jump into the driver workflow, or see the operation from the admin control center.</p>
              </div>
              <a href={PORTAL_URLS.GUEST} className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100">Start with a ride<FaArrowRightLong className="size-3.5" /></a>
            </div>
          </div>

          <div className="grid border-t border-white/10 md:grid-cols-3">
            {highlights.map(([Icon, title, text]) => (
              <div key={title} className="flex items-start gap-3 border-b border-white/10 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-6">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <Icon className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
