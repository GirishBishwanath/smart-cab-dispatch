import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowRight,
    FaCalendarCheck,
    FaCarSide,
    FaClock,
    FaRoute,
} from "react-icons/fa6";

import useAuth from "../hooks/useAuth.js";
import rideService from "../services/ride.service.js";
import bookingService from "../services/booking.service.js";
import RideCard from "../components/RideCard.jsx";
import RideRequestCard from "../components/RideRequestCard.jsx";
import RideStatus from "../components/RideStatus.jsx";
import { ROUTES } from "../utils/constants.js";

const QuickAction = ({
    icon: Icon,
    title,
    text,
    color,
    onClick,
}) => (
    <button
        type="button"
        onClick={onClick}
        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
        <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="size-4" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-950">
            {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
        </p>
        <FaArrowRight className="mt-4 size-3 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
    </button>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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
                        err?.status === 404 ? null : Promise.reject(err)
                    ),
                    bookingService.getMyRideRequests(),
                ]);

            setRide(rideResult ?? null);

            const latest =
                Array.isArray(requestsResult)
                    ? requestsResult[0] ?? null
                    : null;

            setRequest(latest);
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
            setError(
                "Please enter a cancellation reason."
            );
            return;
        }

        try {
            setCancelling(true);
            setError("");

            await bookingService.cancelRideRequest(
                request._id,
                reason
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

    const firstName =
        user?.fullName?.split(" ")[0] || "Guest";

    const showRequest =
        !ride &&
        request &&
        ["PENDING", "APPROVED", "REJECTED"].includes(
            request.status
        );

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 text-white shadow-sm sm:px-7">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                            Guest Dashboard
                        </p>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome back, {firstName}
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                            Book your next ride or keep track of your current trip.
                        </p>
                    </div>

                    {!request ||
                        ["COMPLETED", "CANCELLED", "REJECTED"].includes(
                            request.status
                        ) ? (
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    ROUTES.BOOK_RIDE
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                            Book a ride
                            <FaArrowRight className="size-3" />
                        </button>
                    ) : null}
                </div>
            </section>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            ) : ride ? (
                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                            Active Trip
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-950">
                            Your current ride
                        </h2>
                    </div>

                    <RideCard
                        ride={ride}
                        onOpen={() =>
                            navigate(
                                ROUTES.CURRENT_RIDE
                            )
                        }
                    />
                </section>
            ) : showRequest ? (
                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                            Ride Request
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-950">
                            {request.status === "PENDING"
                                ? "Waiting for approval"
                                : request.status === "APPROVED"
                                    ? "Request approved"
                                    : "Request declined"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {request.status === "PENDING"
                                ? "Dispatch is reviewing your request."
                                : request.status === "APPROVED"
                                    ? "Your ride is being prepared for dispatch."
                                    : "This request was declined by dispatch."}
                        </p>
                    </div>

                    <RideRequestCard
                        request={request}
                        onCancel={cancelRequest}
                        cancelling={cancelling}
                    />
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FaCarSide className="size-5" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-950">
                        Ready for your next ride?
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Create a ride request and dispatch will arrange the trip for you.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                ROUTES.BOOK_RIDE
                            )
                        }
                        className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                        Book a ride
                    </button>
                </section>
            )}

            <section className="grid gap-4 md:grid-cols-3">
                <QuickAction
                    icon={FaCalendarCheck}
                    title="Book a ride"
                    text="Send dispatch a new ride request."
                    color="bg-emerald-50 text-emerald-600"
                    onClick={() =>
                        navigate(
                            ROUTES.BOOK_RIDE
                        )
                    }
                />

                <QuickAction
                    icon={FaClock}
                    title="Current ride"
                    text="Follow your active trip and driver."
                    color="bg-violet-50 text-violet-600"
                    onClick={() =>
                        navigate(
                            ROUTES.CURRENT_RIDE
                        )
                    }
                />

                <QuickAction
                    icon={FaRoute}
                    title="Ride history"
                    text="Review completed and cancelled trips."
                    color="bg-sky-50 text-sky-600"
                    onClick={() =>
                        navigate(
                            ROUTES.RIDE_HISTORY
                        )
                    }
                />
            </section>
        </div>
    );
};

export default Dashboard;