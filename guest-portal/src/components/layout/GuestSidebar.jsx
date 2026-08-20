import { NavLink } from "react-router-dom";
import {
    FaGaugeHigh,
    FaCarSide,
    FaRoute,
    FaClockRotateLeft,
    FaUser,
    FaXmark,
    FaCircleCheck,
} from "react-icons/fa6";

import { ROUTES } from "../../utils/constants.js";

const links = [
    { label: "Dashboard", path: ROUTES.DASHBOARD, icon: FaGaugeHigh },
    { label: "Book a Ride", path: ROUTES.BOOK_RIDE, icon: FaCarSide },
    { label: "Current Ride", path: ROUTES.CURRENT_RIDE, icon: FaRoute },
    { label: "Ride History", path: ROUTES.RIDE_HISTORY, icon: FaClockRotateLeft },
    { label: "Profile", path: ROUTES.PROFILE, icon: FaUser },
];

const SidebarContent = ({ onNavigate }) => (
    <>
        <div className="border-b border-slate-800/80 px-5 py-6">
            <div className="flex items-center gap-3">
                <img
                    src="/smart-cab-logo.png"
                    alt="Smart Cab Dispatch"
                    className="h-12 w-auto shrink-0 object-contain brightness-0 invert"
                />

                <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">
                        Smart Cab
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                        Guest Portal
                    </p>
                </div>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Travel
            </p>

            <div className="space-y-1">
                {links.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                                isActive
                                    ? "bg-white text-slate-950 shadow-sm"
                                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                        isActive
                                            ? "bg-slate-100 text-slate-700"
                                            : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                                    }`}
                                >
                                    <Icon className="size-4 shrink-0" />
                                </span>

                                <span className="truncate">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>

        <div className="border-t border-slate-800/80 p-4">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                    <FaCircleCheck className="size-3.5 shrink-0 text-emerald-400" />

                    <div>
                        <p className="text-xs font-semibold text-slate-200">
                            Guest access active
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-500">
                            Ride services available
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
);

const GuestSidebar = ({
    mobileOpen = false,
    onClose = () => {},
}) => (
    <>
        <aside className="hidden h-full w-64 shrink-0 flex-col bg-slate-950 text-white md:flex">
            <SidebarContent />
        </aside>

        {mobileOpen && (
            <div
                className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] md:hidden"
                onClick={onClose}
                aria-hidden="true"
            />
        )}

        <aside
            className={`fixed inset-y-0 left-0 z-[60] flex w-[min(86vw,300px)] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-200 md:hidden ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            aria-label="Guest navigation"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-4 z-10 flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close navigation"
            >
                <FaXmark className="size-4" />
            </button>

            <SidebarContent onNavigate={onClose} />
        </aside>
    </>
);

export default GuestSidebar;