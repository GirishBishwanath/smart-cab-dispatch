import { useCallback, useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";

import rideService from "../services/ride.service.js";
import Timeline from "../components/Timeline.jsx";
import RideCard from "../components/RideCard.jsx";
import RideActionCard from "../components/RideActionCard.jsx";
import LiveMap from "../components/LiveMap.jsx";
import socketService from "../services/socket.service.js";
import useLocationBroadcaster from "../hooks/useLocationBroadcaster.js";

const CurrentRide = () => {
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const {
        position: livePosition,
        error: locationError,
    } = useLocationBroadcaster(ride);

    const fetchRide = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const currentRide =
                await rideService.getCurrentRide();

            setRide(currentRide ?? null);
        } catch (err) {
            if (err?.status === 404) {
                setRide(null);
                setError("");
                return;
            }

            console.error(
                "Failed to fetch current ride:",
                err
            );

            setError(
                err?.message ??
                    "Unable to load current ride."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRide();

        const handleRideUpdate = (payload) => {
            if (payload?.ride) {
                setRide(payload.ride);
            } else {
                fetchRide();
            }
        };

        const removeAssigned = socketService.subscribe(
            "ride:assigned",
            handleRideUpdate
        );

        const removeAccepted = socketService.subscribe(
            "ride:accepted",
            handleRideUpdate
        );

        const removeStatus = socketService.subscribe(
            "ride:status",
            handleRideUpdate
        );

        const removeCompleted = socketService.subscribe(
            "ride:completed",
            () => setRide(null)
        );

        return () => {
            removeAssigned();
            removeAccepted();
            removeStatus();
            removeCompleted();
        };
    }, [fetchRide]);

    const handleUpdated = (updatedRide) => {
        setRide(updatedRide);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-[500px] animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
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
                        You currently have no assigned ride. Your next
                        assignment will appear here.
                    </p>
                </section>
            </div>
        );
    }

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

            {/* Ride + Action */}
            <div className="space-y-4">
                <RideCard ride={ride} />

                <RideActionCard
                    ride={ride}
                    onUpdated={handleUpdated}
                />
            </div>

            <LiveMap
                ride={ride}
                position={livePosition}
                locationError={locationError}
            />

            {/* Timeline */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-violet-600">
                        Ride progress
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                        Trip Timeline
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Track the milestones of the current trip.
                    </p>
                </div>

                <div className="px-5 py-6 sm:px-6">
                    <Timeline ride={ride} />
                </div>
            </section>
        </div>
    );
};

export default CurrentRide;