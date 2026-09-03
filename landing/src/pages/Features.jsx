import { FaMapLocationDot, FaRoute, FaBolt, FaCarSide } from "react-icons/fa6";
import FeaturesSection from "../components/Features.jsx";

const CAPABILITIES = [
  [FaMapLocationDot, "Map", "Precise pickup + destination"],
  [FaBolt, "Dispatch", "Capacity + proximity"],
  [FaCarSide, "Tracking", "Live driver location"],
  [FaRoute, "Routing", "Distance + ETA"],
];

const Features = () => {
  return (
    <>
      <div className="relative overflow-hidden bg-slate-950 pb-12 pt-16 sm:pb-14 sm:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-[-200px] -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">Platform capabilities</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Everything around the ride, connected.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">Smart Cab Dispatch combines map-based booking, intelligent driver assignment, live location and route-aware trip tracking in one operational flow.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map(([Icon, title, text]) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-white/20 hover:bg-white/[0.05]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FeaturesSection />
    </>
  );
};

export default Features;
