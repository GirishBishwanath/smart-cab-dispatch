import { FaCarSide, FaLocationDot, FaRoute } from "react-icons/fa6";

const DispatchMap = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.12),transparent_26%)]" />

      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Dispatch preview</p>
          <p className="mt-1 text-sm font-bold text-white">Airport → Hotel Taj</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Tracking ready
        </span>
      </div>

      <div className="relative h-[330px] overflow-hidden bg-slate-950 sm:h-[370px]">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute inset-x-[-12%] top-[24%] h-16 rotate-[16deg] border-y border-white/5 bg-white/[0.015]" />
        <div className="absolute left-[-8%] top-[62%] h-24 w-[120%] -rotate-[12deg] border-y border-white/5 bg-white/[0.015]" />
        <div className="absolute left-[12%] top-[-12%] h-[125%] w-16 rotate-[31deg] border-x border-white/5 bg-white/[0.015]" />

        <svg viewBox="0 0 640 370" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M78 294 C170 248, 207 160, 301 169 C367 176, 392 237, 452 219 C514 201, 508 126, 575 82" fill="none" stroke="rgba(148,163,184,.14)" strokeWidth="18" strokeLinecap="round" />
          <path d="M78 294 C170 248, 207 160, 301 169 C367 176, 392 237, 452 219 C514 201, 508 126, 575 82" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" strokeDasharray="5 8" strokeLinecap="round" />
          <path d="M78 294 C170 248, 207 160, 301 169 C367 176, 392 237, 452 219 C514 201, 508 126, 575 82" fill="none" stroke="rgba(96,165,250,.95)" strokeWidth="5" strokeLinecap="round" />
        </svg>

        <div className="absolute left-[10%] top-[72%] flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-400/15">
          <FaLocationDot className="size-4" />
        </div>
        <div className="absolute left-[70%] top-[17%] flex size-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-4 ring-rose-400/15">
          <FaLocationDot className="size-4" />
        </div>
        <div className="absolute left-[60%] top-[55%] flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500 text-white shadow-lg shadow-blue-500/30">
          <FaCarSide className="size-4" />
        </div>

        <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 backdrop-blur">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Pickup</p>
          <p className="mt-1 text-xs font-bold text-white">Airport Terminal 1</p>
        </div>
        <div className="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 backdrop-blur">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Driver ETA</p>
          <p className="mt-1 text-sm font-black text-white">8 min</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-white/10">
        <div className="bg-slate-900 px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Route</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white"><FaRoute className="text-blue-400" /> 18.4 km</p>
        </div>
        <div className="bg-slate-900 px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-1 text-xs font-bold text-emerald-300">Assigned</p>
        </div>
        <div className="bg-slate-900 px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Vehicle</p>
          <p className="mt-1 text-xs font-bold text-white">6 seats</p>
        </div>
      </div>
    </div>
  );
};

export default DispatchMap;
