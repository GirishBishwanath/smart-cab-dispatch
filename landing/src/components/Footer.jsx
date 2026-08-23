import { Link } from "react-router-dom";

import { PORTAL_URLS, ROUTES } from "../utils/constants.js";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-3">
              <img
                src="/smart-cab-logo.png"
                alt="Smart Cab Dispatch"
                className="logo-on-dark h-8 w-8 object-contain"
              />
              <span className="text-base font-bold tracking-tight text-white">
                Smart Cab Dispatch
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              A real-time dispatch platform connecting guests, drivers, and
              operations on one live engine.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Portals
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a href={PORTAL_URLS.GUEST} className="text-sm text-slate-400 hover:text-emerald-400">
                  Guest portal
                </a>
              </li>
              <li>
                <a href={PORTAL_URLS.DRIVER} className="text-sm text-slate-400 hover:text-violet-400">
                  Driver portal
                </a>
              </li>
              <li>
                <a href={PORTAL_URLS.ADMIN} className="text-sm text-slate-400 hover:text-blue-400">
                  Admin portal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Company
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link to={ROUTES.FEATURES} className="text-sm text-slate-400 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ABOUT} className="text-sm text-slate-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="text-sm text-slate-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            &copy; {year} Smart Cab Dispatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
