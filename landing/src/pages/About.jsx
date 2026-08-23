import { FaBullseye, FaLayerGroup, FaCodeBranch } from "react-icons/fa6";

const POINTS = [
  {
    icon: FaBullseye,
    title: "Why we built it",
    description:
      "Hotels, airports, and events need cab dispatch that's live, not a spreadsheet someone checks every ten minutes. Smart Cab Dispatch replaces manual assignment with an engine that reacts the moment a request is approved.",
  },
  {
    icon: FaLayerGroup,
    title: "How it's structured",
    description:
      "One Node/Express/MongoDB backend, one Socket.IO layer for live state, and three purpose-built React portals — guest, driver, and admin — each showing only what that role needs to act on.",
  },
  {
    icon: FaCodeBranch,
    title: "What's next",
    description:
      "The dispatch engine, ride lifecycle, and all three portals are in active development, with realtime verification, authorization audits, and production hardening ongoing.",
  },
];

const About = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-20">
      <div
        className="pointer-events-none absolute left-1/2 top-[-200px] -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
          About
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Dispatch, built like an operations tool — not a booking form.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
          Smart Cab Dispatch is a production-inspired full-stack platform for
          managing guest transportation across hotels, airports, conferences,
          and corporate events — from the first ride request to the last
          drop-off.
        </p>

        <div className="mt-14 flex flex-col gap-10">
          {POINTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Icon className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
