import { useCallback, useEffect, useState } from "react";
import {
    FaCarSide,
    FaLocationDot,
    FaRoute,
    FaUser,
} from "react-icons/fa6";

import rideService from "../services/ride.service.js";
import Timeline from "../components/Timeline.jsx";
import RideActions from "../components/RideActions.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import socketService from "../services/socket.service.js";

const formatTripType = (value = "") =>
    value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const CurrentRide = () => {
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRide = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const currentRide = await rideService.getCurrentRide();
            setRide(currentRide ?? null);
        } catch (err) {
            if (err?.status === 404) {
                setRide(null);
                setError("");
                return;
            }

            console.error("Failed to fetch current ride:", err);
            setError(err?.message ?? "Unable to load current ride.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRide();

        const handleRideUpdate = (payload) => {
            if (payload?.ride) setRide(payload.ride);
            else fetchRide();
        };

        const removeAssigned = socketService.subscribe("ride:assigned", handleRideUpdate);
        const removeAccepted = socketService.subscribe("ride:accepted", handleRideUpdate);
        const removeStatus = socketService.subscribe("ride:status", handleRideUpdate);
        const removeCompleted = socketService.subscribe("ride:completed", () => setRide(null));

        return () => {
            removeAssigned();
            removeAccepted();
            removeStatus();
            removeCompleted();
        };
    }, [fetchRide]);

    const handleUpdated = (updatedRide) => setRide(updatedRide);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="space-y-6">
                <header>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-600">
                        Driver Operations
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                        Current Ride
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Manage your active passenger trip.
                    </p>
                </header>

                <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <FaLocationDot className="size-5" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        No active ride
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        You currently have no assigned ride. Your next assignment will
                        appear here.
                    </p>
                </section>
            </div>
        );
    }

    const guest = ride.guests?.[0] ?? null;
    const vehicle = ride.vehicle ?? null;

    return (
        <div className="space-y-6">
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                    Active Trip
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Current Ride
                </h1>

                <p className="mt-1.5 text-sm text-slate-500">
                    Manage your active passenger trip.
                </p>
            </header>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                            Current assignment
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Ride assigned by dispatch
                        </p>
                    </div>

                    <StatusBadge status={ride.status} ride />
                </div>

                <div className="px-6 py-9">
                    <div className="grid items-center gap-6 md:grid-cols-[1fr_150px_1fr]">
                        <div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <FaLocationDot className="size-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    Pickup
                                </span>
                            </div>

                            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                {ride.pickupLocation?.name ?? "Not available"}
                            </p>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="hidden h-px flex-1 bg-slate-200 md:block" />
                            <div className="mx-3 flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                                <FaRoute className="size-4" />
                            </div>
                            <div className="hidden h-px flex-1 bg-slate-200 md:block" />
                        </div>

                        <div className="md:text-right">
                            <div className="flex items-center gap-2 text-slate-400 md:justify-end">
                                <FaLocationDot className="size-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    Destination
                                </span>
                            </div>

                            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                {ride.dropLocation?.name ?? "Not available"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid divide-y divide-slate-200 border-t border-slate-100 bg-slate-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {[
                        ["Trip type", formatTripType(ride.tripType)],
                        ["Passengers", guest?.groupSize ?? 0],
                        ["Luggage", guest?.luggageCount ?? 0],
                    ].map(([label, value]) => (
                        <div key={label} className="px-6 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {label}
                            </p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                            Next action
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                            Continue the ride
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Update the trip when the next milestone is reached.
                        </p>
                    </div>

                    <RideActions ride={ride} onUpdated={handleUpdated} />
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                                <FaUser className="size-4" />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                                    Passenger
                                </p>
                                <h2 className="mt-0.5 text-lg font-bold text-slate-950">
                                    Guest Information
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 px-6 py-6">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Name</p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {guest?.user?.fullName ?? "Guest"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-400">Phone</p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {guest?.user?.phone ?? "Unavailable"}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <FaCarSide className="size-4" />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                    Vehicle
                                </p>
                                <h2 className="mt-0.5 text-lg font-bold text-slate-950">
                                    Assigned Vehicle
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 px-6 py-6">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Registration
                            </p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {vehicle?.vehicleNumber ?? "Unavailable"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-400">Model</p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {vehicle?.model ?? "Unavailable"}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                        Ride progress
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                        Trip Timeline
                    </h2>
                </div>

                <div className="px-6 py-6">
                    <Timeline ride={ride} />
                </div>
            </section>
        </div>
    );
};

export default CurrentRide;