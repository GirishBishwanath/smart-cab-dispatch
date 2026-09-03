import { FaArrowRightLong, FaCircleCheck, FaLocationDot, FaRoute } from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_18%_10%,rgba(16,185,129,0.10),transparent_26%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-semibold text-slate-300">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Real-time ride management
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.035em] text-white sm:text-5xl lg:text-7xl">
            Dispatch every ride with clarity.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Smart Cab Dispatch connects guests, drivers, and operations through one live dispatch engine — from booking and assignment to route tracking and ride completion.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={PORTAL_URLS.GUEST} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950">
              Book a ride
              <FaArrowRightLong className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950">
              See how it works
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">
            {[
              ["3", "Connected portals"],
              ["Live", "Location updates"],
              ["Route", "Distance + ETA"],
            ].map(([value, label], index) => (
              <div key={label} className={index === 1 ? "border-x border-white/10 px-4 sm:px-6" : index === 2 ? "pl-4 sm:pl-6" : "pr-4 sm:pr-6"}>
                <p className="text-xl font-black tracking-tight text-white sm:text-2xl">{value}</p>
                <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
          <div className="absolute -inset-6 rounded-[2rem] bg-blue-500/10 blur-3xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/90 shadow-2xl shadow-slate-950/60 ring-1 ring-white/5 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Dispatch overview</p>
                <p className="mt-1 text-sm font-semibold text-white">Ride coordination in one view</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Live system
              </span>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_0.88fr]">
              <div className="min-h-[330px] bg-slate-950 p-5 sm:p-6">
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/8 bg-[#09111f]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" aria-hidden="true" />
                  <div className="absolute left-[14%] top-[66%] h-2/3 w-2/3 -rotate-[20deg] rounded-[45%] border border-blue-400/20 bg-blue-500/[0.025]" aria-hidden="true" />
                  <div className="route-line absolute left-[14%] top-[68%] h-[2px] w-[66%] origin-left rotate-[-27deg] bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400" aria-hidden="true" />
                  <div className="absolute left-[12%] top-[69%] size-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" aria-hidden="true" />
                  <div className="absolute right-[14%] top-[28%] size-3 rounded-full bg-rose-400 ring-4 ring-rose-400/10" aria-hidden="true" />
                  <div className="absolute left-[48%] top-[50%] flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/15 text-blue-200 shadow-lg shadow-blue-950/40">
                    <FaLocationDot className="size-4" />
                  </div>
                  <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Pickup</p>
                    <p className="mt-0.5 text-xs font-semibold text-white">Guest location</p>
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-right backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Destination</p>
                    <p className="mt-0.5 text-xs font-semibold text-white">Selected drop-off</p>
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <FaRoute className="size-3 text-blue-300" />
                      <p className="text-[10px] font-semibold text-slate-200">Route + ETA shown from routing data</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/[0.025] p-5 sm:p-6 lg:border-l lg:border-t-0">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Requested", "Guest booking"],
                    ["Approved", "Operations"],
                    ["Assigned", "Capacity match"],
                    ["Live", "Driver location"],
                  ].map(([state, caption], index) => (
                    <div key={state} className="rounded-xl border border-white/8 bg-slate-950/70 p-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex size-6 items-center justify-center rounded-full ${index === 3 ? "bg-emerald-400/10 text-emerald-300" : "bg-blue-400/10 text-blue-300"}`}>
                          {index === 3 ? <FaCircleCheck className="size-3" /> : <span className="text-[9px] font-black">0{index + 1}</span>}
                        </span>
                        <span className="text-xs font-bold text-white">{state}</span>
                      </div>
                      <p className="mt-2 text-[10px] leading-4 text-slate-500">{caption}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Trip status</span>
                    <span className="text-[10px] font-bold text-emerald-300">Synchronized</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400" />
                  </div>
                  <div className="mt-3 flex justify-between text-[9px] font-medium text-slate-500">
                    <span>Request</span>
                    <span>Assign</span>
                    <span>Live</span>
                    <span>Complete</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-blue-400/15 bg-blue-500/[0.06] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-300">What stays connected</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">Guest booking, driver assignment, live location, route geometry, and ETA stay aligned around the same ride lifecycle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
