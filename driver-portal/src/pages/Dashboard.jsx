import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCarSide,
    FaLocationDot,
    FaRoute,
    FaUser,
    FaArrowRight,
    FaCircle,
} from "react-icons/fa6";

import useAuth from "../hooks/useAuth.js";
import rideService from "../services/ride.service.js";
import driverService from "../services/driver.service.js";
import RideActions from "../components/RideActions.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { ROUTES } from "../utils/constants.js";
import socketService from "../services/socket.service.js";

const DRIVER_STATUS_STYLES = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ASSIGNED: "bg-amber-50 text-amber-700 ring-amber-200",
    ON_BREAK: "bg-blue-50 text-blue-700 ring-blue-200",
    OFFLINE: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatStatus = (status = "") =>
    status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const DriverStatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
            DRIVER_STATUS_STYLES[status] ?? DRIVER_STATUS_STYLES.OFFLINE
        }`}
    >
        <FaCircle className="size-1.5" />
        {formatStatus(status)}
    </span>
);

const Metric = ({
    icon: Icon,
    label,
    children,
    accent = "bg-slate-100 text-slate-500",
}) => (
    <div className="flex items-center gap-3 px-5 py-5">
        <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
            <Icon className="size-4" />
        </div>

        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <div className="mt-1">{children}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [ride, setRide] = useState(null);
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [currentRide, profile] = await Promise.all([
                rideService.getCurrentRide().catch((err) => {
                    if (err?.status === 404) return null;
                    throw err;
                }),
                driverService.getMyProfile(),
            ]);

            setRide(currentRide ?? null);
            setDriver(profile?.driver ?? null);
        } catch (err) {
            console.error("Failed to load dashboard:", err);

            setError(
                err?.message ?? "Unable to load your dashboard."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();

        const removeAssigned = socketService.subscribe(
            "ride:assigned",
            fetchDashboard
        );

        const removeAccepted = socketService.subscribe(
            "ride:accepted",
            fetchDashboard
        );

        const removeStatus = socketService.subscribe(
            "ride:status",
            fetchDashboard
        );

        const removeCompleted = socketService.subscribe(
            "ride:completed",
            fetchDashboard
        );

        const removeDriverStatus = socketService.subscribe(
            "driver:status",
            fetchDashboard
        );

        return () => {
            removeAssigned();
            removeAccepted();
            removeStatus();
            removeCompleted();
            removeDriverStatus();
        };
    }, [fetchDashboard]);

    const handleRideUpdated = (updatedRide) => {
        setRide(updatedRide);
    };

    const vehicle = ride?.vehicle ?? null;
    const guest = ride?.guests?.[0] ?? null;
    const firstName = user?.fullName?.split(" ")[0] || "Driver";

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-6 shadow-sm sm:px-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-400">
                            Driver Dashboard
                        </p>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Welcome back, {firstName}
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Your current assignment and trip status at a glance.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-2">
                        <FaCircle className="size-2 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300">
                            Live updates
                        </span>
                    </div>
                </div>
            </section>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                    <Metric
                        icon={FaUser}
                        label="Driver status"
                        accent="bg-sky-50 text-sky-600"
                    >
                        {loading ? (
                            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                        ) : (
                            <DriverStatusBadge
                                status={driver?.status ?? "OFFLINE"}
                            />
                        )}
                    </Metric>

                    <Metric
                        icon={FaRoute}
                        label="Current ride"
                        accent="bg-violet-50 text-violet-600"
                    >
                        {loading ? (
                            <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
                        ) : ride ? (
                            <>
                                <p className="text-sm font-bold text-slate-900">
                                    {formatStatus(ride.status)}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {ride.pickupLocation?.name ?? "Pickup"}{" "}
                                    →{" "}
                                    {ride.dropLocation?.name ?? "Destination"}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-semibold text-slate-500">
                                No active ride
                            </p>
                        )}
                    </Metric>

                    <Metric
                        icon={FaCarSide}
                        label="Assigned vehicle"
                        accent="bg-emerald-50 text-emerald-600"
                    >
                        {loading ? (
                            <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
                        ) : vehicle ? (
                            <>
                                <p className="text-sm font-bold text-slate-900">
                                    {vehicle.vehicleNumber}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {vehicle.model}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-semibold text-slate-500">
                                No vehicle assigned
                            </p>
                        )}
                    </Metric>
                </div>
            </section>

            {loading ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="animate-pulse space-y-7">
                        <div className="flex justify-between">
                            <div className="space-y-2">
                                <div className="h-3 w-32 rounded bg-slate-200" />
                                <div className="h-5 w-48 rounded bg-slate-200" />
                            </div>

                            <div className="h-7 w-20 rounded-full bg-slate-200" />
                        </div>

                        <div className="h-24 rounded-xl bg-slate-100" />
                        <div className="h-16 rounded-xl bg-slate-100" />
                    </div>
                </section>
            ) : ride ? (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                                Current assignment
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Assigned by dispatch
                            </p>
                        </div>

                        <StatusBadge status={ride.status} ride />
                    </div>

                    <div className="px-6 py-7">
                        <div className="grid items-center gap-5 md:grid-cols-[1fr_120px_1fr]">
                            <div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <FaLocationDot className="size-3.5" />

                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Pickup
                                    </span>
                                </div>

                                <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                                    {ride.pickupLocation?.name ?? "Not available"}
                                </p>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="hidden h-px flex-1 bg-slate-200 md:block" />

                                <div className="mx-3 flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                                    <FaArrowRight className="size-4" />
                                </div>

                                <div className="hidden h-px flex-1 bg-slate-200 md:block" />
                            </div>

                            <div className="md:text-right">
                                <div className="flex items-center gap-2 text-slate-400 md:justify-end">
                                    <FaLocationDot className="size-3.5" />

                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Destination
                                    </span>
                                </div>

                                <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                                    {ride.dropLocation?.name ?? "Not available"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Passenger
                                </p>

                                <p className="mt-1.5 text-sm font-bold text-slate-900">
                                    {guest?.user?.fullName ?? "Guest"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {guest?.user?.phone ?? "Phone unavailable"}
                                </p>
                            </div>

                            <div className="sm:border-l sm:border-slate-100 sm:pl-5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Trip
                                </p>

                                <p className="mt-1.5 text-sm font-bold text-slate-900">
                                    {formatStatus(ride.tripType)}
                                </p>
                            </div>

                            <div className="sm:border-l sm:border-slate-100 sm:pl-5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Party
                                </p>

                                <p className="mt-1.5 text-sm font-bold text-slate-900">
                                    {guest?.groupSize ?? 0} passengers
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {guest?.luggageCount ?? 0} luggage
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Next action
                                </p>

                                <p className="mt-1 text-sm text-slate-600">
                                    Complete the next step in the ride lifecycle.
                                </p>
                            </div>

                            <RideActions
                                ride={ride}
                                onUpdated={handleRideUpdated}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.CURRENT_RIDE)}
                            className="text-xs font-bold text-slate-500 transition hover:text-slate-950"
                        >
                            View full ride details
                            <span className="ml-1">→</span>
                        </button>
                    </div>
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <FaRoute className="size-5" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        No active assignment
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        You currently have no assigned ride. A new assignment will
                        appear here when dispatch assigns one to you.
                    </p>
                </section>
            )}
        </div>
    );
};

export default Dashboard;