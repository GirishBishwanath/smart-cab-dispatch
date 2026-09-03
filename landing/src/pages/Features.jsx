import { FaMapLocationDot, FaRoute, FaBolt, FaCarSide } from "react-icons/fa6";
import FeaturesSection from "../components/Features.jsx";

const Features = () => {
  return (
    <>
      <div className="relative overflow-hidden bg-slate-950 pb-10 pt-16 sm:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-[-200px] -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">Platform capabilities</span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Everything around the ride, connected.</h1>
              <p className="mt-4 text-base leading-relaxed text-slate-400">Smart Cab Dispatch combines map-based booking, intelligent driver assignment, live location and route-aware trip tracking in one operational flow.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[430px]">
              {[
                [FaMapLocationDot, "Map", "Pickup + destination"],
                [FaBolt, "Dispatch", "Capacity + proximity"],
                [FaCarSide, "Tracking", "Driver location"],
                [FaRoute, "Routing", "Distance + ETA"],
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <Icon className="size-4 text-blue-400" />
                  <p className="mt-2 text-[11px] font-bold text-white">{title}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FeaturesSection />
    </>
  );
};

export default Features;
