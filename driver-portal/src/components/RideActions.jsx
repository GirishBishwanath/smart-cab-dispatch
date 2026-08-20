import { useState } from "react";
import {
    FaArrowRight,
    FaCheck,
    FaFlagCheckered,
    FaLocationDot,
    FaPlay,
    FaXmark,
} from "react-icons/fa6";

import rideService from "../services/ride.service.js";
import { RIDE_STATUS } from "../utils/constants.js";

const getNextAction = (ride) => {
    if (!ride) return null;

    if (
        ride.status === RIDE_STATUS.ASSIGNED &&
        !ride.acceptedAt
    ) {
        return {
            label: "Accept Ride",
            icon: FaCheck,
            type: "acknowledge",
        };
    }

    if (
        ride.status === RIDE_STATUS.ASSIGNED &&
        ride.acceptedAt
    ) {
        return {
            label: "Mark Arrived",
            icon: FaLocationDot,
            type: "arrived",
        };
    }

    if (ride.status === RIDE_STATUS.ARRIVED) {
        return {
            label: "Start Ride",
            icon: FaPlay,
            type: "start",
        };
    }

    if (ride.status === RIDE_STATUS.PICKED_UP) {
        return {
            label: "Complete Ride",
            icon: FaFlagCheckered,
            type: "complete",
        };
    }

    return null;
};

const RideActions = ({ ride, onUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const action = getNextAction(ride);

    if (!action) return null;

    const canDecline =
        ride.status === RIDE_STATUS.ASSIGNED &&
        !ride.acceptedAt;

    const handleDecline = async () => {
        const reason = window.prompt(
            "Why are you declining this ride?"
        );

        if (reason === null) return;

        if (!reason.trim()) {
            setError("Please enter a decline reason.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const updatedRide = await rideService.declineRide(
                ride._id,
                reason.trim()
            );

            onUpdated?.(updatedRide);
        } catch (err) {
            setError(
                err?.message ?? "Unable to decline the ride."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            setLoading(true);
            setError("");

            let updatedRide;

            if (action.type === "acknowledge") {
                updatedRide = await rideService.acknowledgeRide(
                    ride._id
                );
            }

            if (action.type === "arrived") {
                updatedRide = await rideService.updateRideStatus(
                    ride._id,
                    RIDE_STATUS.ARRIVED
                );
            }

            if (action.type === "start") {
                updatedRide = await rideService.updateRideStatus(
                    ride._id,
                    RIDE_STATUS.PICKED_UP
                );
            }

            if (action.type === "complete") {
                updatedRide = await rideService.updateRideStatus(
                    ride._id,
                    RIDE_STATUS.COMPLETED
                );
            }

            onUpdated?.(updatedRide);
        } catch (err) {
            setError(
                err?.message ?? "Unable to update the ride."
            );
        } finally {
            setLoading(false);
        }
    };

    const Icon = action.icon;

    return (
        <div className="w-full sm:w-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {canDecline && (
                    <button
                        type="button"
                        onClick={handleDecline}
                        disabled={loading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaXmark className="size-3.5" />
                        Decline
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleAction}
                    disabled={loading}
                    className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Icon className="size-4" />

                    <span>
                        {loading ? "Updating..." : action.label}
                    </span>

                    {!loading && (
                        <FaArrowRight className="ml-1 size-3.5" />
                    )}
                </button>
            </div>

            {error && (
                <p className="mt-2 text-right text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default RideActions;