import {
    FaArrowRight,
    FaCarSide,
    FaLocationDot,
    FaPhone,
} from "react-icons/fa6";

import StatusBadge from "./StatusBadge.jsx";

const formatStatus = (value = "") =>
    value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const Detail = ({ label, value, secondary, children }) => (
    <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {label}
        </p>

        {children ?? (
            <>
                <p className="mt-1.5 truncate text-sm font-bold text-slate-900 sm:text-[15px]">
                    {value || "—"}
                </p>

                {secondary && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {secondary}
                    </p>
                )}
            </>
        )}
    </div>
);

const RideCard = ({ ride }) => {
    const guest = ride?.guests?.[0];
    const passengers = ride?.rideRequest?.groupSize ?? guest?.groupSize ?? 0;
    const luggage = ride?.rideRequest?.luggageCount ?? guest?.luggageCount ?? 0;

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-sky-600">
                        Current assignment
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Assigned by dispatch
                    </p>
                </div>

                <div className="shrink-0">
                    <StatusBadge status={ride?.status} />
                </div>
            </div>

            {/* Route */}
            <div className="px-5 py-6 sm:px-6 sm:py-7">
                <div className="grid grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[1fr_72px_1fr] sm:gap-5">
                    {/* Pickup */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <FaLocationDot className="size-3 shrink-0" />

                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                Pickup
                            </span>
                        </div>

                        <p className="mt-2 truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {ride?.pickupLocation?.name || "—"}
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 sm:size-11">
                            <FaArrowRight className="size-3.5 sm:size-4" />
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="min-w-0 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-red-500">
                            <FaLocationDot className="size-3 shrink-0" />

                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                Destination
                            </span>
                        </div>

                        <p className="mt-2 truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {ride?.dropLocation?.name || "—"}
                        </p>
                    </div>
                </div>

                {/* Trip information */}
                <div className="mt-7 border-t border-slate-100 pt-5">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Trip information
                    </p>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4 sm:gap-x-6">
                        <Detail
                            label="Passenger"
                            value={guest?.user?.fullName || "Guest"}
                            secondary={guest?.user?.phone || "Phone unavailable"}
                            children={
                                <>
                                    <p className="mt-1.5 truncate text-sm font-bold text-slate-900 sm:text-[15px]">
                                        {guest?.user?.fullName || "Guest"}
                                    </p>

                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                        <FaPhone className="size-2.5 shrink-0" />
                                        <span className="truncate">
                                            {guest?.user?.phone || "Phone unavailable"}
                                        </span>
                                    </p>
                                </>
                            }
                        />

                        <Detail
                            label="Trip"
                            value={formatStatus(ride?.tripType)}
                            secondary="Trip type"
                        />

                        <Detail
                            label="Passengers"
                            value={passengers}
                            secondary={passengers === 1 ? "passenger" : "passengers"}
                        />

                        <Detail
                            label="Luggage"
                            value={luggage}
                            secondary={luggage === 1 ? "bag" : "bags"}
                        />
                    </div>
                </div>

                {/* Vehicle */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Assigned vehicle
                    </p>

                    <div className="grid grid-cols-2 gap-5 sm:gap-6">
                        <Detail
                            label="Registration"
                            value={ride?.vehicle?.vehicleNumber || "Not available"}
                            children={
                                <>
                                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-900 sm:text-[15px]">
                                        <FaCarSide className="size-3 shrink-0 text-slate-400" />
                                        <span className="truncate">
                                            {ride?.vehicle?.vehicleNumber || "Not available"}
                                        </span>
                                    </p>
                                </>
                            }
                        />

                        <Detail
                            label="Model"
                            value={ride?.vehicle?.model || "Not available"}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
};

export default RideCard;