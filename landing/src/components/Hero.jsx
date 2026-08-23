import { FaArrowRightLong, FaLocationDot } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] -z-10 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.9)_85%)]"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
            Guests &middot; Drivers &middot; Operations
          </span>

          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            One dispatch engine.
            <br className="hidden sm:block" /> Three portals, in sync.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Smart Cab Dispatch connects guests, drivers, and operations on
            one real-time engine — every request, assignment, and trip
            update reflected live across all three.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={PORTAL_URLS.GUEST}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100"
            >
              Book a ride
              <FaArrowRightLong className="size-3.5" />
            </a>
            <a
              href="#portals"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
            >
              Choose your portal
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-2xl font-black text-white sm:text-3xl">24/7</dt>
              <dd className="mt-1 text-xs font-medium text-slate-500">Live dispatch coverage</dd>
            </div>
            <div>
              <dt className="text-2xl font-black text-white sm:text-3xl">3</dt>
              <dd className="mt-1 text-xs font-medium text-slate-500">Connected portals</dd>
            </div>
            <div>
              <dt className="text-2xl font-black text-white sm:text-3xl">6-stage</dt>
              <dd className="mt-1 text-xs font-medium text-slate-500">Ride lifecycle tracking</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-25px_rgba(2,6,23,0.6)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                  Active trip
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  On Demand &middot; Ride #SCD-2291
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  <FaLocationDot className="size-2.5" />
                  Pickup
                </p>
                <p className="mt-1 truncate text-base font-bold text-slate-950">
                  Airport
                </p>
              </div>

              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                <FaArrowRightLong className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1 text-right">
                <p className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-500">
                  Destination
                  <FaLocationDot className="size-2.5" />
                </p>
                <p className="mt-1 truncate text-base font-bold text-slate-950">
                  Hotel Taj
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 border-t border-slate-100 pt-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Passengers
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">3</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Luggage
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">2</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Vehicle
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-950">
                  Toyota Innova &middot; JH10AB1234
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
                  RS
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Rahul Sharma</p>
                  <p className="text-[11px] text-slate-400">9825354890</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                Assigned
              </span>
            </div>
          </div>

          <div className="absolute -bottom-10 -left-5 hidden rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              ETA to pickup
            </p>
            <p className="mt-0.5 text-sm font-bold text-white">
              8 minutes away
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
