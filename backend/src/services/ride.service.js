import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";

import {
    DRIVER_STATUS,
    RIDE_STATUS,
    ROLES,
} from "../utils/constants.js";

import ApiError from "../utils/ApiError.js";

import socketService from "./socket.service.js";

/*
 * ============================================================
 * POPULATE RIDE
 * ============================================================
 *
 * Keeps all ride responses consistent across the service.
 */
const populateRide = (rideId) =>
    Ride.findById(rideId)
        .populate({
            path: "driver",
            populate: {
                path: "user",
                select: "-password -__v",
            },
        })
        .populate("vehicle")
        .populate({
            path: "guests",
            populate: {
                path: "user",
                select: "-password -__v",
            },
        });

/*
 * ============================================================
 * UPDATE RIDE STATUS
 * ============================================================
 *
 * Driver lifecycle:
 *
 * ASSIGNED
 *    ↓
 * ACCEPTED (acceptedAt)
 *    ↓
 * ARRIVED
 *    ↓
 * PICKED_UP
 *    ↓
 * COMPLETED
 *
 * Socket events:
 *
 * ARRIVED / PICKED_UP
 *      → ride:status
 *
 * COMPLETED
 *      → ride:completed
 *      → driver:status
 */
const updateRideStatus = async (
    rideId,
    status,
    userId,
    userRole
) => {
    const ride =
        await Ride.findById(rideId);

    if (!ride) {
        throw new ApiError(
            404,
            "Ride not found"
        );
    }

    /*
     * --------------------------------------------------------
     * DRIVER OWNERSHIP CHECK
     * --------------------------------------------------------
     *
     * Drivers can update only their own ride.
     *
     * Admins are allowed through because the route already
     * authorizes ADMIN + DRIVER.
     */
    let driver = null;

    if (
        userRole === ROLES.DRIVER
    ) {
        driver =
            await Driver.findOne({
                user: userId,
            });

        if (!driver) {
            throw new ApiError(
                404,
                "Driver not found"
            );
        }

        if (
            !ride.driver ||
            !ride.driver.equals(
                driver._id
            )
        ) {
            throw new ApiError(
                403,
                "This ride is not assigned to you."
            );
        }
    }

    /*
     * --------------------------------------------------------
     * STATUS TRANSITION
     * --------------------------------------------------------
     */
    switch (status) {
        /*
         * ----------------------------------------------------
         * ARRIVED
         * ----------------------------------------------------
         */
        case RIDE_STATUS.ARRIVED:
            if (
                ride.status !==
                RIDE_STATUS.ASSIGNED
            ) {
                throw new ApiError(
                    400,
                    "Ride must be assigned before arrival can be recorded."
                );
            }

            /*
             * A driver must acknowledge the ride first.
             */
            if (!ride.acceptedAt) {
                throw new ApiError(
                    400,
                    "Accept the ride before marking arrival."
                );
            }

            ride.status =
                RIDE_STATUS.ARRIVED;

            if (!ride.arrivedAt) {
                ride.arrivedAt =
                    new Date();
            }

            break;

        /*
         * ----------------------------------------------------
         * PICKED UP / STARTED
         * ----------------------------------------------------
         */
        case RIDE_STATUS.PICKED_UP:
            if (
                ride.status !==
                RIDE_STATUS.ARRIVED
            ) {
                throw new ApiError(
                    400,
                    "Driver must arrive before starting the ride."
                );
            }

            ride.status =
                RIDE_STATUS.PICKED_UP;

            if (!ride.startedAt) {
                ride.startedAt =
                    new Date();
            }

            break;

        /*
         * ----------------------------------------------------
         * COMPLETED
         * ----------------------------------------------------
         */
        case RIDE_STATUS.COMPLETED:
            if (
                ride.status !==
                RIDE_STATUS.PICKED_UP
            ) {
                throw new ApiError(
                    400,
                    "Ride must be started before completion."
                );
            }

            ride.status =
                RIDE_STATUS.COMPLETED;

            if (!ride.completedAt) {
                ride.completedAt =
                    new Date();
            }

            /*
             * A completed ride releases the driver.
             */
            driver =
                driver ??
                await Driver.findById(
                    ride.driver
                );

            if (driver) {
                driver.status =
                    DRIVER_STATUS.AVAILABLE;

                driver.currentRide =
                    null;

                driver.freeAt =
                    new Date();

                await driver.save();
            }

            break;

        /*
         * ----------------------------------------------------
         * INVALID STATUS
         * ----------------------------------------------------
         */
        default:
            throw new ApiError(
                400,
                "Invalid ride status"
            );
    }

    /*
     * --------------------------------------------------------
     * SAVE RIDE
     * --------------------------------------------------------
     */
    await ride.save();

    /*
     * --------------------------------------------------------
     * GET FULL UPDATED RIDE
     * --------------------------------------------------------
     */
    const updatedRide =
        await populateRide(
            ride._id
        );

    /*
     * --------------------------------------------------------
     * SOCKET EVENTS
     * --------------------------------------------------------
     *
     * IMPORTANT:
     * Completion is emitted ONLY here.
     *
     * This prevents duplicate ride:completed events.
     */
    const driverUserId =
        updatedRide?.driver?.user?._id ??
        updatedRide?.driver?.user;

    if (
        status ===
        RIDE_STATUS.COMPLETED
    ) {
        /*
         * Notify driver that the ride is completed.
         */
        if (driverUserId) {
            socketService.emitRideCompleted(
                driverUserId,
                updatedRide
            );
        }

        /*
         * Notify driver UI that the driver is
         * now available again.
         */
        if (driver) {
            socketService.emitDriverStatus(
                driver.user,
                driver
            );
        }
    } else if (
        status ===
            RIDE_STATUS.ARRIVED ||
        status ===
            RIDE_STATUS.PICKED_UP
    ) {
        /*
         * Notify driver UI of normal ride progress.
         */
        if (driverUserId) {
            socketService.emitRideStatus(
                driverUserId,
                updatedRide
            );
        }
    }

    return updatedRide;
};

/*
 * ============================================================
 * ALL RIDES
 * ============================================================
 */
const getRides = async () => {
    return Ride.find()
        .populate({
            path: "driver",
            populate: {
                path: "user",
            },
        })
        .populate("vehicle")
        .populate({
            path: "guests",
            populate: {
                path: "user",
            },
        });
};

/*
 * ============================================================
 * SINGLE RIDE
 * ============================================================
 */
const getRideById = async (
    rideId
) => {
    const ride =
        await populateRide(
            rideId
        );

    if (!ride) {
        throw new ApiError(
            404,
            "Ride not found"
        );
    }

    return ride;
};

/*
 * ============================================================
 * CURRENT DRIVER RIDE
 * ============================================================
 *
 * Returns the driver's currently active ride.
 *
 * PENDING / COMPLETED / CANCELLED rides are intentionally
 * excluded.
 */
const getCurrentDriverRide =
    async (userId) => {
        const driver =
            await Driver.findOne({
                user: userId,
            });

        if (!driver) {
            throw new ApiError(
                404,
                "Driver not found"
            );
        }

        const ride =
            await Ride.findOne({
                driver: driver._id,

                status: {
                    $in: [
                        RIDE_STATUS.ASSIGNED,
                        RIDE_STATUS.ARRIVED,
                        RIDE_STATUS.PICKED_UP,
                    ],
                },
            })
                .populate({
                    path: "driver",
                    populate: {
                        path: "user",
                        select: "-password -__v",
                    },
                })
                .populate("vehicle")
                .populate({
                    path: "guests",
                    populate: {
                        path: "user",
                        select: "-password -__v",
                    },
                });

        return ride;
    };

/*
 * ============================================================
 * DRIVER RIDE HISTORY
 * ============================================================
 */
const getDriverRideHistory =
    async (userId) => {
        const driver =
            await Driver.findOne({
                user: userId,
            });

        if (!driver) {
            throw new ApiError(
                404,
                "Driver not found"
            );
        }

        return Ride.find({
            driver: driver._id,

            status: {
                $in: [
                    RIDE_STATUS.COMPLETED,
                    RIDE_STATUS.CANCELLED,
                ],
            },
        })
            .populate({
                path: "driver",
                populate: {
                    path: "user",
                    select: "-password -__v",
                },
            })
            .populate("vehicle")
            .populate({
                path: "guests",
                populate: {
                    path: "user",
                    select: "-password -__v",
                },
            })
            .sort({
                completedAt: -1,
                createdAt: -1,
            })
            .lean();
    };

/*
 * ============================================================
 * ACKNOWLEDGE RIDE
 * ============================================================
 *
 * ASSIGNED
 *    ↓
 * acceptedAt gets timestamp
 *
 * The ride status itself remains ASSIGNED.
 *
 * Socket:
 *    ride:accepted
 */
const acknowledgeRide =
    async (
        rideId,
        userId
    ) => {
        const driver =
            await Driver.findOne({
                user: userId,
            });

        if (!driver) {
            throw new ApiError(
                404,
                "Driver not found"
            );
        }

        const ride =
            await Ride.findById(
                rideId
            );

        if (!ride) {
            throw new ApiError(
                404,
                "Ride not found"
            );
        }

        /*
         * Make sure this ride belongs to
         * the logged-in driver.
         */
        if (
            !ride.driver ||
            !ride.driver.equals(
                driver._id
            )
        ) {
            throw new ApiError(
                403,
                "This ride is not assigned to you."
            );
        }

        /*
         * Only ASSIGNED rides can be accepted.
         */
        if (
            ride.status !==
            RIDE_STATUS.ASSIGNED
        ) {
            throw new ApiError(
                400,
                "Only assigned rides can be acknowledged."
            );
        }

        /*
         * Prevent rewriting the original
         * acknowledgement timestamp.
         */
        if (!ride.acceptedAt) {
            ride.acceptedAt =
                new Date();

            await ride.save();
        }

        /*
         * Retrieve fully populated ride.
         */
        const updatedRide =
            await populateRide(
                rideId
            );

        /*
         * Notify the driver's connected
         * browser.
         */
        socketService.emitRideAccepted(
            driver.user,
            updatedRide
        );

        return updatedRide;
    };

export default {
    updateRideStatus,
    getRides,
    getRideById,
    getCurrentDriverRide,
    getDriverRideHistory,
    acknowledgeRide,
};