import { FaArrowRightLong, FaCircleCheck } from "react-icons/fa6";

import DispatchMap from "./DispatchMap.jsx";
import { PORTAL_URLS } from "../utils/constants.js";

const HIGHLIGHTS = [
  "Map-based pickup & destination",
  "Capacity + proximity dispatch",
  "Live driver location updates",
  "Route distance and ETA",
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute left-[58%] top-[-220px] -z-0 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(circle_at_70%_25%,rgba(14,165,233,0.09),transparent_42%)]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Real-time transportation operations
          </div>

          <h1 className="mt-6 max-w-2xl font-black tracking-[-0.045em] text-white">
            <span className="block text-[2.9rem] leading-[0.98] sm:text-5xl lg:whitespace-nowrap lg:text-[56px] lg:leading-[1]">
              Smart Cab Dispatch
            </span>
            <span className="mt-3 block text-[2.45rem] leading-[1.02] text-slate-400 sm:text-[44px] lg:text-[49px] lg:leading-[1.04]">
              keeps every ride on course.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Real-time ride management, dispatch and driver tracking — connected across guest, driver and admin portals from booking to drop-off.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={PORTAL_URLS.GUEST} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100">
              Book a ride
              <FaArrowRightLong className="size-3.5" />
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5">
              See how it works
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 sm:gap-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-[12px] font-semibold leading-5 text-slate-300 sm:text-[13px]">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/15">
                  <FaCircleCheck className="size-2.5" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:pl-4">
          <DispatchMap />
        </div>
      </div>
    </section>
  );
};

export default Hero;
