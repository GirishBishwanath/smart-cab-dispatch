import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaRoute,
    FaCalendarDays,
    FaUser,
    FaArrowRight,
    FaMagnifyingGlass,
    FaRotate,
} from "react-icons/fa6";

import rideService from "../services/ride.service.js";
import StatusBadge from "../components/StatusBadge.jsx";

const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const SummaryCard = ({ label, value, tone = "default" }) => {
    const styles = {
        default: "border-slate-200 bg-white text-slate-950",
        blue: "border-blue-100 bg-blue-50/70 text-blue-800",
        green: "border-emerald-100 bg-emerald-50/70 text-emerald-800",
    };

    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone]}`}>
            <p className="text-xs font-semibold opacity-70">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
    );
};

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

        return rides.filter((ride) => {
            const matchesFilter =
                filter === "ALL" || ride.status === filter;

            const guest = ride.guests?.[0]?.user?.fullName ?? "";
            const pickup = ride.pickupLocation?.name ?? "";
            const destination = ride.dropLocation?.name ?? "";
            const vehicle = ride.vehicle?.vehicleNumber ?? "";

            const matchesSearch =
                !query ||
                [guest, pickup, destination, vehicle]
                    .join(" ")
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
            <div className="space-y-6">
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

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
            <header>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                        Trip records
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Ride History
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Review your completed and cancelled trips.
                    </p>
                </div>
            </header>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Total trips" value={rides.length} />
                <SummaryCard
                    label="Completed"
                    value={completedCount}
                    tone="green"
                />
                <SummaryCard
                    label="Cancelled"
                    value={cancelledCount}
                    tone="blue"
                />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search guest, route or vehicle..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        />
                    </div>

                    <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-1">
                        {[
                            ["ALL", "All"],
                            ["COMPLETED", "Completed"],
                            ["CANCELLED", "Cancelled"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={[
                                    "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition",
                                    filter === value
                                        ? "bg-white text-slate-950 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900",
                                ].join(" ")}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={loadHistory}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                        <FaRotate className="size-3" />
                        Refresh
                    </button>
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
                    <div className="px-6 py-16 text-center">
                        <FaRoute className="mx-auto size-6 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            No rides found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-100 bg-slate-50">
                                <tr>
                                    {["Date", "Guest", "Route", "Vehicle", "Status"].map(
                                        (title) => (
                                            <th
                                                key={title}
                                                className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                            >
                                                {title}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredRides.map((ride) => {
                                    const guest =
                                        ride.guests?.[0]?.user?.fullName ?? "Guest";

                                    return (
                                        <tr
                                            key={ride._id}
                                            className="transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarDays className="size-3.5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatDate(
                                                                ride.completedAt ?? ride.createdAt
                                                            )}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {formatDateTime(
                                                                ride.completedAt ?? ride.createdAt
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                        <FaUser className="size-3.5" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {guest}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-slate-800">
                                                        {ride.pickupLocation?.name ?? "—"}
                                                    </span>
                                                    <FaArrowRight className="size-3 text-slate-300" />
                                                    <span className="font-semibold text-slate-800">
                                                        {ride.dropLocation?.name ?? "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {ride.vehicle?.vehicleNumber ?? "—"}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {ride.vehicle?.model ?? "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
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

            <div className="space-y-3 lg:hidden">
                {filteredRides.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <FaRoute className="mx-auto size-6 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            No rides found
                        </p>
                    </div>
                ) : (
                    filteredRides.map((ride) => {
                        const guest =
                            ride.guests?.[0]?.user?.fullName ?? "Guest";

                        return (
                            <div
                                key={ride._id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {formatDate(ride.completedAt ?? ride.createdAt)}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-950">
                                            {guest}
                                        </p>
                                    </div>

                                    <StatusBadge status={ride.status} />
                                </div>

                                <div className="mt-5 flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-slate-900">
                                        {ride.pickupLocation?.name ?? "—"}
                                    </span>
                                    <FaArrowRight className="size-3 shrink-0 text-slate-300" />
                                    <span className="font-semibold text-slate-900">
                                        {ride.dropLocation?.name ?? "—"}
                                    </span>
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <p className="text-xs text-slate-400">Vehicle</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                        {ride.vehicle?.vehicleNumber ?? "—"}
                                        {ride.vehicle?.model
                                            ? ` · ${ride.vehicle.model}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RideHistory;