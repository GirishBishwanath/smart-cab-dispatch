import { FaArrowRightLong, FaShieldHalved } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const CTA = () => (
  <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
    <div className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.06] blur-3xl" aria-hidden="true" />
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 shadow-2xl shadow-slate-950/50 sm:p-12 lg:p-14">
        <div className="flex size-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-300"><FaShieldHalved className="size-4" /></div>
        <h2 className="mt-7 max-w-3xl text-3xl font-black tracking-[-0.025em] text-white sm:text-4xl">Make every ride easier to coordinate.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Start with a guest booking, then let the platform carry the request through approval, assignment, live tracking, routing, and completion.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={PORTAL_URLS.GUEST} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950">Start with a ride <FaArrowRightLong className="size-3.5 transition-transform group-hover:translate-x-0.5" /></a>
          <a href="#portals" className="inline-flex items-center justify-center rounded-xl border border-white/12 px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.05]">Explore portals</a>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
