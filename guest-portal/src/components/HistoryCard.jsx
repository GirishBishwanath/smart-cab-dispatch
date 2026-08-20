import {
    FaArrowRight,
    FaCalendarDays,
    FaRoute,
} from "react-icons/fa6";

import RideStatus from "./RideStatus.jsx";

const HistoryCard = ({ ride }) => {
    const date =
        ride?.completedAt ??
        ride?.createdAt;

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <FaCalendarDays className="size-3" />
                        {date
                            ? new Date(date).toLocaleDateString()
                            : "—"}
                    </p>

                    <p className="mt-2 text-base font-bold text-slate-950">
                        {ride?.pickupLocation?.name || "—"}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <FaArrowRight className="size-3" />
                        <span>{ride?.dropLocation?.name || "—"}</span>
                    </div>
                </div>

                <RideStatus status={ride?.status} />
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                <FaRoute className="size-3 text-slate-400" />

                <p className="text-xs font-semibold text-slate-600">
                    {ride?.vehicle?.vehicleNumber || "Vehicle unavailable"}
                    {ride?.vehicle?.model
                        ? ` · ${ride.vehicle.model}`
                        : ""}
                </p>
            </div>
        </article>
    );
};

export default HistoryCard;