import { Link } from "react-router-dom";

import { ROUTES } from "../utils/constants.js";

const NotFound = () => (
  <div className="relative grid min-h-[70vh] place-items-center overflow-hidden bg-slate-950 px-4">
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[110px]"
      aria-hidden="true"
    />

    <div className="relative text-center">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
        404
      </p>

      <h1 className="mt-2 text-3xl font-bold text-white">
        Page not found
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to={ROUTES.HOME}
        className="mt-5 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-100"
      >
        Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;
