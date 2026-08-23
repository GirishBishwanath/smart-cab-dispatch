import { FaArrowRightLong } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute bottom-[-160px] left-1/2 -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Ready when you need a ride.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Book your next trip in under a minute — dispatch, tracking,
              and driver assignment happen automatically.
            </p>
          </div>

          <a
            href={PORTAL_URLS.GUEST}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100"
          >
            Book a ride
            <FaArrowRightLong className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
