import { FaBullseye, FaLayerGroup, FaCodeBranch, FaMapLocationDot, FaRoute } from "react-icons/fa6";

const POINTS = [
  {
    icon: FaBullseye,
    title: "Built around real dispatch work",
    description: "Transportation operations have to coordinate guests, drivers, vehicles and timing at once. Smart Cab Dispatch turns that workflow into a connected system rather than a chain of manual updates.",
  },
  {
    icon: FaMapLocationDot,
    title: "Location is part of the ride",
    description: "Guests choose pickup and destination points on a map, while drivers can share their current position during an active trip. That location state is available where the role needs it.",
  },
  {
    icon: FaRoute,
    title: "Routes are calculated, not guessed",
    description: "The platform uses driving-route data to surface distance and duration estimates, giving dispatchers and guests useful trip context instead of placeholder numbers.",
  },
  {
    icon: FaLayerGroup,
    title: "One backend, three focused experiences",
    description: "A Node/Express/MongoDB backend and authenticated Socket.IO layer power dedicated React portals for guests, drivers and admins without duplicating the core ride state.",
  },
  {
    icon: FaCodeBranch,
    title: "Designed to grow without pretending to",
    description: "The current architecture keeps responsibilities clear so caching, queues, stronger observability or external storage can be added when the product actually needs them.",
  },
];

const About = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-[-200px] -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">About the platform</span>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">A dispatch product where booking, routing and live operations belong to the same system.</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-400">Smart Cab Dispatch is a production-inspired full-stack platform for coordinated guest transportation across hotels, airports, conferences and corporate events.</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 ${index === 0 ? "md:col-span-2" : ""}`}>
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"><Icon className="size-4.5" /></div>
                <div>
                  <h2 className="text-base font-bold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
