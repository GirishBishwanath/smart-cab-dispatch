import { useState } from "react";
import {
    FaArrowRight,
    FaCheck,
    FaFlagCheckered,
    FaLocationDot,
    FaPlay,
} from "react-icons/fa6";

import rideService from "../services/ride.service.js";

import {
    RIDE_STATUS,
} from "../utils/constants.js";

const getNextAction = (ride) => {
    if (!ride) {
        return null;
    }

    /*
     * ASSIGNED + not acknowledged
     * --------------------------------
     * Driver must accept the assignment.
     */
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


    /*
     * ASSIGNED + acknowledged
     * --------------------------------
     * Driver has accepted the ride and
     * can mark arrival.
     */
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


    /*
     * ARRIVED
     * --------------------------------
     * Driver can start the trip.
     */
    if (
        ride.status === RIDE_STATUS.ARRIVED
    ) {
        return {
            label: "Start Ride",
            icon: FaPlay,
            type: "start",
        };
    }


    /*
     * PICKED UP
     * --------------------------------
     * Driver can complete the trip.
     */
    if (
        ride.status === RIDE_STATUS.PICKED_UP
    ) {
        return {
            label: "Complete Ride",
            icon: FaFlagCheckered,
            type: "complete",
        };
    }

    return null;
};

const RideActions = ({
    ride,
    onUpdated,
}) => {
    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const action =
        getNextAction(ride);

    if (!action) {
        return null;
    }

    const handleAction = async () => {
        try {
            setLoading(true);
            setError("");

            let updatedRide;

            switch (action.type) {

                case "acknowledge":

                    updatedRide =
                        await rideService.acknowledgeRide(
                            ride._id
                        );

                    break;


                case "arrived":

                    updatedRide =
                        await rideService.updateRideStatus(
                            ride._id,
                            RIDE_STATUS.ARRIVED
                        );

                    break;


                case "start":

                    updatedRide =
                        await rideService.updateRideStatus(
                            ride._id,
                            RIDE_STATUS.PICKED_UP
                        );

                    break;


                case "complete":

                    updatedRide =
                        await rideService.updateRideStatus(
                            ride._id,
                            RIDE_STATUS.COMPLETED
                        );

                    break;


                default:
                    return;
            }

            onUpdated?.(updatedRide);

        } catch (err) {

            setError(
                err?.message ??
                    "Unable to update the ride."
            );

        } finally {

            setLoading(false);

        }
    };

    const Icon = action.icon;

    return (
        <div className="flex flex-col items-end gap-2">

            <button
                type="button"
                onClick={handleAction}
                disabled={loading}
                className="inline-flex min-w-[165px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >

                <Icon className="h-4 w-4" />

                <span>
                    {loading
                        ? "Updating..."
                        : action.label}
                </span>

                {!loading && (
                    <FaArrowRight className="ml-1 h-3.5 w-3.5" />
                )}

            </button>

            {error && (
                <p className="max-w-xs text-right text-xs font-medium text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
};

export default RideActions;