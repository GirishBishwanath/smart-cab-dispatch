import FeaturesSection from "../components/Features.jsx";

const Features = () => {
  return (
    <>
      <div className="relative overflow-hidden bg-slate-950 pb-4 pt-16 sm:pt-20">
        <div
          className="pointer-events-none absolute left-1/2 top-[-200px] -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
            Platform
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
            Everything the trip needs, connected in real time.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
            Smart Cab Dispatch runs one backend across three portals, so a
            status change on a driver's phone shows up on the admin dashboard
            before the guest has finished refreshing.
          </p>
        </div>
      </div>

      <FeaturesSection />
    </>
  );
};

export default Features;
