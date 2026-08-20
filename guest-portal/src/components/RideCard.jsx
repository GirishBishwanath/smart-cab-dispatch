import {
    FaArrowRight,
    FaCarSide,
    FaLocationDot,
} from "react-icons/fa6";

import RideStatus from "./RideStatus.jsx";

const formatStatus = (value = "") =>
    value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

const RideCard = ({ ride, onOpen }) => (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current ride
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {formatStatus(ride?.tripType)}
                </p>
            </div>

            <div className="shrink-0">
                <RideStatus status={ride?.status} />
            </div>
        </div>

        <div className="px-5 py-6 sm:px-6 sm:py-7">
            <div className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[1fr_64px_1fr] sm:gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                        <FaLocationDot className="size-3 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            Pickup
                        </span>
                    </div>

                    <p className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">
                        {ride?.pickupLocation?.name || "—"}
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 sm:size-11">
                        <FaArrowRight className="size-3.5 sm:size-4" />
                    </div>
                </div>

                <div className="min-w-0 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-red-500">
                        <FaLocationDot className="size-3 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            Destination
                        </span>
                    </div>

                    <p className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">
                        {ride?.dropLocation?.name || "—"}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 sm:mt-7 sm:gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Passengers
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                        {ride?.guests?.[0]?.groupSize ?? 0}
                    </p>
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Luggage
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                        {ride?.guests?.[0]?.luggageCount ?? 0}
                    </p>
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vehicle
                    </p>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900 sm:text-base">
                        <FaCarSide className="size-3 shrink-0 text-slate-400" />
                        <span className="truncate">
                            {ride?.vehicle?.vehicleNumber || "—"}
                        </span>
                    </p>
                </div>
            </div>
        </div>

        {onOpen && (
            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-5 py-3.5 sm:px-6">
                <button
                    type="button"
                    onClick={onOpen}
                    className="text-xs font-bold text-slate-500 transition hover:text-slate-950"
                >
                    View full ride details →
                </button>
            </div>
        )}
    </article>
);

export default RideCard;