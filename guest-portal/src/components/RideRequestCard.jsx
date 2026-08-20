import {
    FaArrowRight,
    FaCalendarDays,
    FaLocationDot,
    FaXmark,
} from "react-icons/fa6";

import RideStatus from "./RideStatus.jsx";

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

const RideRequestCard = ({
    request,
    onCancel,
    cancelling = false,
}) => {
    const canCancel =
        request?.status === "PENDING" &&
        typeof onCancel === "function";

    const reason =
        request?.rejectionReason ||
        request?.cancellationReason;

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ride request
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900">
                        <FaCalendarDays className="size-3 text-slate-400" />
                        {formatDate(request?.createdAt)}
                    </p>
                </div>

                <RideStatus status={request?.status} />
            </div>

            <div className="space-y-5 px-5 py-6">
                <div className="grid gap-5 md:grid-cols-[1fr_70px_1fr] md:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600">
                            <FaLocationDot className="size-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                Pickup
                            </span>
                        </div>

                        <p className="mt-2 text-lg font-bold text-slate-950">
                            {request?.pickupLocation?.name || "—"}
                        </p>
                    </div>

                    <div className="hidden justify-center md:flex">
                        <FaArrowRight className="size-4 text-slate-300" />
                    </div>

                    <div className="md:text-right">
                        <div className="flex items-center gap-2 text-red-500 md:justify-end">
                            <FaLocationDot className="size-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                Destination
                            </span>
                        </div>

                        <p className="mt-2 text-lg font-bold text-slate-950">
                            {request?.dropLocation?.name || "—"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Passengers
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {request?.groupSize ?? 0}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Luggage
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {request?.luggageCount ?? 0}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Trip type
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {request?.tripType
                                ?.replaceAll("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase()) || "—"}
                        </p>
                    </div>
                </div>

                {reason && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {request.status === "REJECTED"
                                ? "Rejection reason"
                                : "Cancellation reason"}
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                            {reason}
                        </p>
                    </div>
                )}
            </div>

            {canCancel && (
                <div className="border-t border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={cancelling}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaXmark className="size-3.5" />
                        {cancelling ? "Cancelling..." : "Cancel Request"}
                    </button>
                </div>
            )}
        </article>
    );
};

export default RideRequestCard;