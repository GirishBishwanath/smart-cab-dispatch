import { useNavigate } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBars,
} from "react-icons/fa6";

import useAuth from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";

const PortalHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const initials = (user?.fullName || "Driver")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="z-20 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
            aria-label="Open navigation"
          >
            <FaBars className="size-4" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center">
              <img
                src="/smart-cab-logo.png"
                alt="Smart Cab"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                  Smart Cab Dispatch
                </h1>

                <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:inline-flex">
                  Driver
                </span>
              </div>

              <p className="hidden text-xs text-slate-400 sm:block">
                Fleet & ride operations
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.fullName || "Driver"}
            </p>

            <p className="max-w-[220px] truncate text-xs text-slate-400">
              {user?.email}
            </p>
          </div>

          <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {initials}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <FaArrowRightFromBracket className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;