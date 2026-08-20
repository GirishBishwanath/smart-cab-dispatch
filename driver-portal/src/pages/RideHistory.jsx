import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaArrowRight,
    FaCalendarDays,
    FaCar,
    FaMagnifyingGlass,
    FaPhone,
    FaRotate,
    FaRoute,
    FaUser,
} from "react-icons/fa6";

import rideService from "../services/ride.service.js";
import StatusBadge from "../components/StatusBadge.jsx";

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

const formatTime = (value) =>
    value
        ? new Date(value).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        })
        : "—";

const getRideDate = (ride) =>
    ride.status === "CANCELLED"
        ? ride.cancelledAt ?? ride.updatedAt ?? ride.createdAt
        : ride.completedAt ?? ride.createdAt;

const sortNewestFirst = (rides) =>
    [...rides].sort(
        (a, b) =>
            new Date(getRideDate(b) || 0) -
            new Date(getRideDate(a) || 0)
    );

const getCancelledBy = (ride) => {
    const source =
        typeof ride.cancelledBy === "string"
            ? ride.cancelledBy
            : ride.cancelledBy?.role ??
            ride.cancelledByRole ??
            ride.cancellationSource;

    if (source === "DRIVER") return "Cancelled by you";
    if (source === "GUEST") return "Cancelled by guest";
    if (source === "ADMIN") return "Cancelled by admin";

    return "Cancelled";
};

const getTripType = (value) =>
    value
        ? value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "—";

const SummaryCard = ({ label, value, tone = "default" }) => {
    const styles = {
        default: "border-slate-200 bg-white text-slate-950 shadow-sm",
        green: "border-emerald-100 bg-emerald-50/70 text-emerald-800",
        red: "border-red-100 bg-red-50/70 text-red-800",
    };

    return (
        <div className={`rounded-2xl border p-5 ${styles[tone]}`}>
            <p className="text-xs font-bold opacity-70">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
    );
};

const EmptyState = () => (
    <div className="px-6 py-16 text-center">
        <FaRoute className="mx-auto size-6 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700">
            No rides found
        </p>
        <p className="mt-1 text-xs text-slate-400">
            Try changing your search or filter.
        </p>
    </div>
);

const RideHistory = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await rideService.getRideHistory();
            setRides(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message ?? "Unable to load ride history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const filteredRides = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sortNewestFirst(rides).filter((ride) => {
            const guest = ride.guests?.[0]?.user?.fullName ?? "";
            const phone = ride.guests?.[0]?.user?.phone ?? "";
            const pickup = ride.pickupLocation?.name ?? "";
            const destination = ride.dropLocation?.name ?? "";
            const vehicle = ride.vehicle?.vehicleNumber ?? "";
            const reason = ride.cancelReason ?? "";
            const cancelledBy = getCancelledBy(ride);

            const matchesFilter =
                filter === "ALL" || ride.status === filter;

            const matchesSearch =
                !query ||
                `${guest} ${phone} ${pickup} ${destination} ${vehicle} ${reason} ${cancelledBy}`
                    .toLowerCase()
                    .includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [rides, filter, search]);

    const completedCount = rides.filter(
        (ride) => ride.status === "COMPLETED"
    ).length;

    const cancelledCount = rides.filter(
        (ride) => ride.status === "CANCELLED"
    ).length;

    if (loading) {
        return (
            <div className="space-y-5">
                <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />

                <div className="grid gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-24 animate-pulse rounded-2xl bg-slate-200"
                        />
                    ))}
                </div>

                <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                        Trip Records
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Ride History
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Review your completed and cancelled trips.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadHistory}
                    disabled={loading}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <FaRotate className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                </button>
            </header>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Total trips" value={rides.length} />
                <SummaryCard label="Completed" value={completedCount} tone="green" />
                <SummaryCard label="Cancelled" value={cancelledCount} tone="red" />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <FaMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search guest, phone, route, vehicle..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        />
                    </div>

                    <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto">
                        {[
                            ["ALL", "All"],
                            ["COMPLETED", "Completed"],
                            ["CANCELLED", "Cancelled"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    filter === value
                                        ? "bg-white text-slate-950 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-bold text-slate-950">
                        Previous Rides
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        {filteredRides.length} ride
                        {filteredRides.length !== 1 ? "s" : ""} shown
                    </p>
                </div>

                {filteredRides.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    {["Date", "Guest", "Route", "Vehicle", "Status"].map(
                                        (title) => (
                                            <th
                                                key={title}
                                                className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                            >
                                                {title}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredRides.map((ride) => {
                                    const date = getRideDate(ride);
                                    const cancelled = ride.status === "CANCELLED";
                                    const guest = ride.guests?.[0]?.user?.fullName ?? "Guest";
                                    const phone = ride.guests?.[0]?.user?.phone ?? "";

                                    return (
                                        <tr key={ride._id} className="transition hover:bg-slate-50/70">
                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {formatDate(date)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    <FaCalendarDays className="mr-1 inline size-3" />
                                                    {formatTime(date)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                        <FaUser className="size-3.5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[170px] truncate text-sm font-semibold text-slate-900">
                                                            {guest}
                                                        </p>

                                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                                            <FaPhone className="size-2.5" />
                                                            <span>{phone || "Phone unavailable"}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="max-w-[180px] truncate font-semibold text-slate-900">
                                                        {ride.pickupLocation?.name || "—"}
                                                    </span>

                                                    <FaArrowRight className="size-3 shrink-0 text-slate-300" />

                                                    <span className="max-w-[180px] truncate font-semibold text-slate-900">
                                                        {ride.dropLocation?.name || "—"}
                                                    </span>
                                                </div>

                                                {cancelled && (
                                                    <div className="mt-2">
                                                        <p className="text-xs font-semibold text-red-600">
                                                            {getCancelledBy(ride)}
                                                        </p>
                                                        <p className="mt-0.5 max-w-md text-xs text-red-500">
                                                            {ride.cancelReason || "No cancellation reason provided."}
                                                        </p>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {ride.vehicle?.vehicleNumber || "—"}
                                                </p>

                                                {ride.vehicle?.model && (
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {ride.vehicle.model}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <StatusBadge status={ride.status} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="space-y-4 lg:hidden">
                {filteredRides.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <FaRoute className="mx-auto size-6 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No rides found</p>
                        <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    filteredRides.map((ride) => {
                        const date = getRideDate(ride);
                        const cancelled = ride.status === "CANCELLED";
                        const guest = ride.guests?.[0]?.user?.fullName ?? "Guest";
                        const phone = ride.guests?.[0]?.user?.phone ?? "";

                        return (
                            <article
                                key={ride._id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {formatDate(date)}
                                        </p>

                                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <FaCalendarDays className="size-3 text-slate-400" />
                                            {formatTime(date)}
                                        </p>
                                    </div>

                                    <StatusBadge status={ride.status} />
                                </div>

                                <div className="flex items-center gap-3 px-4 py-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <FaUser className="size-3.5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Guest
                                        </p>

                                        <p className="mt-1 truncate text-sm font-bold text-slate-950">
                                            {guest}
                                        </p>

                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                            <FaPhone className="size-2.5" />
                                            <span>{phone || "Phone unavailable"}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 px-4 py-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Route
                                    </p>

                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-slate-950">
                                                {ride.pickupLocation?.name || "—"}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Pickup
                                            </p>
                                        </div>

                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                            <FaArrowRight className="size-3 text-slate-500" />
                                        </div>

                                        <div className="min-w-0 flex-1 text-right">
                                            <p className="truncate text-sm font-bold text-slate-950">
                                                {ride.dropLocation?.name || "—"}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Destination
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 border-t border-slate-100">
                                    <div className="min-w-0 border-r border-slate-100 px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <FaCar className="size-3 text-slate-400" />
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Vehicle
                                            </p>
                                        </div>

                                        <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                                            {ride.vehicle?.vehicleNumber || "—"}
                                        </p>

                                        {ride.vehicle?.model && (
                                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                                {ride.vehicle.model}
                                            </p>
                                        )}
                                    </div>

                                    <div className="min-w-0 px-4 py-3.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Trip
                                        </p>

                                        <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                                            {getTripType(ride.tripType)}
                                        </p>
                                    </div>
                                </div>

                                {cancelled && (
                                    <div className="border-t border-red-100 bg-red-50/70 px-4 py-3.5">
                                        <p className="text-xs font-bold text-red-700">
                                            {getCancelledBy(ride)}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-red-600">
                                            {ride.cancelReason || "No cancellation reason provided."}
                                        </p>
                                    </div>
                                )}
                            </article>
                        );
                    })
                )}
            </section>
        </div>
    );
};

export default RideHistory;