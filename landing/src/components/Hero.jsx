import { FaArrowRightLong, FaCircleCheck } from "react-icons/fa6";

import DispatchMap from "./DispatchMap.jsx";
import { PORTAL_URLS } from "../utils/constants.js";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute left-[58%] top-[-220px] -z-0 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(circle_at_70%_25%,rgba(14,165,233,0.09),transparent_42%)]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-20 lg:pt-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Real-time transportation operations
          </div>

          <h1 className="mt-6 max-w-lg text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[58px]">
            Smart Cab Dispatch
            <span className="mt-3 block text-slate-400">keeps every ride on course.</span>
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

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "Map-based pickup & destination",
              "Capacity + proximity dispatch",
              "Live driver location updates",
              "Route distance and ETA",
            ].map((item) => (
              <div key={item} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FaCircleCheck className="size-3 shrink-0 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:pl-2">
          <DispatchMap />
        </div>
      </div>
    </section>
  );
};

export default Hero;
