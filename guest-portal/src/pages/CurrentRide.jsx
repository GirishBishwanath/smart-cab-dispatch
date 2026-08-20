import { useCallback, useEffect, useState } from "react";
import {
    FaCarSide,
    FaLocationDot,
    FaPhone,
    FaRoute,
} from "react-icons/fa6";

import rideService from "../services/ride.service.js";
import bookingService from "../services/booking.service.js";
import RideCard from "../components/RideCard.jsx";
import RideRequestCard from "../components/RideRequestCard.jsx";
import RideStatus from "../components/RideStatus.jsx";

const Info = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
            {value || "—"}
        </p>
    </div>
);

const CurrentRide = () => {
    const [ride, setRide] = useState(null);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");

            const [rideResult, requestsResult] =
                await Promise.all([
                    rideService.getCurrentRide().catch((err) =>
                        err?.status === 404
                            ? null
                            : Promise.reject(err)
                    ),
                    bookingService.getMyRideRequests(),
                ]);

            setRide(rideResult ?? null);
            setRequest(
                Array.isArray(requestsResult)
                    ? requestsResult[0] ?? null
                    : null
            );
        } catch (err) {
            setError(
                err?.message ??
                "Unable to load your trip information."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, [load]);

    const cancelRequest = async () => {
        if (!request?._id) return;

        const reason = window.prompt(
            "Why are you cancelling this ride request?"
        );

        if (reason === null) return;

        if (!reason.trim()) {
            setError("Please enter a cancellation reason.");
            return;
        }

        try {
            setCancelling(true);
            await bookingService.cancelRideRequest(
                request._id,
                reason.trim()
            );
            await load();
        } catch (err) {
            setError(
                err?.message ??
                "Unable to cancel the ride request."
            );
        } finally {
            setCancelling(false);
        }
    };

    const cancelRide = async () => {
        if (!ride?._id) return;

        const reason = window.prompt(
            "Why are you cancelling this ride?"
        );

        if (reason === null) return;

        if (!reason.trim()) {
            setError("Please enter a cancellation reason.");
            return;
        }

        try {
            setCancelling(true);
            await rideService.cancelRide(
                ride._id,
                reason.trim()
            );
            await load();
        } catch (err) {
            setError(
                err?.message ??
                "Unable to cancel the ride."
            );
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-5">
                <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (
        !ride &&
        request &&
        [
            "PENDING",
            "APPROVED",
            "REJECTED",
            "DRIVER_DECLINED",
        ].includes(request.status)
    ) {
        return (
            <div className="space-y-6">
                <header>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                        Ride Request
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Your Request
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Track the status of your submitted ride request.
                    </p>
                </header>

                <RideRequestCard
                    request={request}
                    onCancel={
                        request.status === "PENDING"
                            ? cancelRequest
                            : undefined
                    }
                    cancelling={cancelling}
                />
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="space-y-6">
                <header>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                        Active Trip
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Current Ride
                    </h1>
                </header>

                <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <FaLocationDot className="size-5" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-950">
                        No current ride
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        You currently have no active ride or pending request.
                    </p>
                </section>
            </div>
        );
    }

    const guest = ride.guests?.[0];
    const driver = ride.driver?.user;
    const vehicle = ride.vehicle;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                        Active Trip
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Current Ride
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Follow your active passenger trip.
                    </p>
                </div>

                <div className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                        Live updates
                    </span>
                </div>
            </header>

            <RideCard ride={ride} />

            <section className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-900">
                            Need to cancel this ride?
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Cancellation requires a reason and will notify dispatch.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={cancelRide}
                        disabled={cancelling || ride.status === "PICKED_UP"}
                        className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelling ? "Cancelling..." : "Cancel Ride"}
                    </button>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <FaCarSide className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                                Driver
                            </p>
                            <h2 className="mt-1 text-base font-bold text-slate-950">
                                Driver information
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 grid-cols-2">
                        <Info label="Name" value={driver?.fullName || "Not assigned"} />
                        <Info label="Phone" value={driver?.phone || "Not available"} />
                        <Info label="Vehicle" value={vehicle?.vehicleNumber || "Not assigned"} />
                        <Info label="Model" value={vehicle?.model || "—"} />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <FaRoute className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                                Journey
                            </p>
                            <h2 className="mt-1 text-base font-bold text-slate-950">
                                Trip information
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 grid-cols-2">
                        <Info label="Passengers" value={guest?.groupSize} />
                        <Info label="Luggage" value={guest?.luggageCount} />
                        <Info label="Estimated distance" value={`${ride.estimatedDistance || 0} km`} />
                        <Info label="Estimated duration" value={`${ride.estimatedDuration || 0} min`} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CurrentRide;