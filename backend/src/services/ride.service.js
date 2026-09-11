import mongoose from "mongoose";
import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import Guest from "../models/Guest.js";
import RideRequest from "../models/RideRequest.js";

import { DRIVER_STATUS, RIDE_STATUS, ROLES } from "../utils/constants.js";

import routingService from "./routing.service.js";
import ApiError from "../utils/ApiError.js";
import socketService from "./socket.service.js";

const ACTIVE_RIDE_STATUSES = [
    RIDE_STATUS.ASSIGNED,
    RIDE_STATUS.ARRIVED,
    RIDE_STATUS.PICKED_UP,
];

const populateRide = (rideId) =>
    Ride.findById(rideId)
        .populate({
            path: "driver",
            populate: { path: "user", select: "-password -__v" },
        })
        .populate("vehicle")
        .populate("rideRequest")
        .populate({
            path: "guests",
            populate: { path: "user", select: "-password -__v" },
        });

const updateRideStatus = async (rideId, status, userId, userRole) => {
    if (![RIDE_STATUS.ARRIVED, RIDE_STATUS.PICKED_UP, RIDE_STATUS.COMPLETED].includes(status)) {
        throw new ApiError(400, "Invalid ride status");
    }

    const session = await mongoose.startSession();

    try {
        let updatedRideId;
        let completedDriverUserId = null;
        let completedDriver = null;

        await session.withTransaction(async () => {
            const transitionFilter =
                status === RIDE_STATUS.ARRIVED
                    ? { status: RIDE_STATUS.ASSIGNED, acceptedAt: { $ne: null } }
                    : status === RIDE_STATUS.PICKED_UP
                        ? { status: RIDE_STATUS.ARRIVED }
                        : { status: RIDE_STATUS.PICKED_UP };

            const update =
                status === RIDE_STATUS.ARRIVED
                    ? { $set: { status, arrivedAt: new Date() } }
                    : status === RIDE_STATUS.PICKED_UP
                        ? { $set: { status, startedAt: new Date() } }
                        : { $set: { status, completedAt: new Date() } };

            const ride = await Ride.findOneAndUpdate(
                { _id: rideId, ...transitionFilter },
                update,
                { new: true, session }
            );

            if (!ride) {
                const existing = await Ride.findById(rideId).session(session);
                if (!existing) throw new ApiError(404, "Ride not found");
                throw new ApiError(409, "Ride was modified by another request. Please refresh and retry.");
            }

            if (userRole === ROLES.DRIVER) {
                const driver = await Driver.findOne({ user: userId }).session(session);

                if (!driver) throw new ApiError(404, "Driver not found");
                if (!ride.driver?.equals(driver._id)) {
                    throw new ApiError(403, "This ride is not assigned to you.");
                }
            }

            if (status === RIDE_STATUS.COMPLETED) {
                const driver = await Driver.findOneAndUpdate(
                    {
                        _id: ride.driver,
                        currentRide: ride._id,
                        status: DRIVER_STATUS.ASSIGNED,
                    },
                    {
                        $set: {
                            status: DRIVER_STATUS.AVAILABLE,
                            currentRide: null,
                            freeAt: ride.completedAt,
                        },
                    },
                    { new: true, session }
                );

                if (!driver) {
                    throw new ApiError(409, "Driver state no longer matches this ride");
                }

                completedDriver = driver;
                completedDriverUserId = driver.user;
            }

            updatedRideId = ride._id;
        });

        const updatedRide = await populateRide(updatedRideId);
        const driverUserId =
            updatedRide?.driver?.user?._id ?? updatedRide?.driver?.user;

        if (status === RIDE_STATUS.COMPLETED) {
            if (driverUserId) socketService.emitRideCompleted(driverUserId, updatedRide);
            if (completedDriverUserId && completedDriver) {
                socketService.emitDriverStatus(completedDriverUserId, completedDriver);
            }
        } else if ([RIDE_STATUS.ARRIVED, RIDE_STATUS.PICKED_UP].includes(status)) {
            if (driverUserId) socketService.emitRideStatus(driverUserId, updatedRide);
        }

        return updatedRide;
    } finally {
        await session.endSession();
    }
};

const cancelGuestRide = async (userId, rideId, reason) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");
    if (!reason?.trim()) throw new ApiError(400, "Cancellation reason is required.");

    const session = await mongoose.startSession();

    try {
        let updatedRideId;

        await session.withTransaction(async () => {
            const ride = await Ride.findOneAndUpdate(
                {
                    _id: rideId,
                    guests: guest._id,
                    status: { $in: ACTIVE_RIDE_STATUSES },
                },
                {
                    $set: {
                        status: RIDE_STATUS.CANCELLED,
                        cancelReason: reason.trim(),
                        cancelledAt: new Date(),
                        cancelledBy: "GUEST",
                    },
                },
                { new: true, session }
            );

            if (!ride) {
                const existing = await Ride.findById(rideId).session(session);
                if (!existing) throw new ApiError(404, "Ride not found");
                if (!existing.guests.some((id) => id.equals(guest._id))) {
                    throw new ApiError(403, "You cannot cancel this ride.");
                }
                throw new ApiError(409, "Ride was modified by another request. Please refresh and retry.");
            }

            if (ride.rideRequest) {
                await RideRequest.findOneAndUpdate(
                    {
                        _id: ride.rideRequest,
                        status: { $in: ["PENDING", "APPROVED"] },
                    },
                    {
                        $set: {
                            status: "CANCELLED",
                            cancellationReason: reason.trim(),
                            cancelledAt: ride.cancelledAt,
                            cancelledBy: "GUEST",
                        },
                    },
                    { session }
                );
            }

            if (ride.driver) {
                await Driver.findOneAndUpdate(
                    {
                        _id: ride.driver,
                        currentRide: ride._id,
                        status: DRIVER_STATUS.ASSIGNED,
                    },
                    {
                        $set: {
                            status: DRIVER_STATUS.AVAILABLE,
                            currentRide: null,
                            freeAt: ride.cancelledAt,
                        },
                    },
                    { session }
                );
            }

            updatedRideId = ride._id;
        });

        return populateRide(updatedRideId);
    } finally {
        await session.endSession();
    }
};

const declineRide = async (userId, rideId, reason) => {
    if (!reason?.trim()) throw new ApiError(400, "Decline reason is required.");

    const driver = await Driver.findOne({ user: userId });

    if (!driver) throw new ApiError(404, "Driver not found");

    const session = await mongoose.startSession();

    try {
        let updatedRideId;

        await session.withTransaction(async () => {
            const ride = await Ride.findOneAndUpdate(
                {
                    _id: rideId,
                    driver: driver._id,
                    status: RIDE_STATUS.ASSIGNED,
                    acceptedAt: null,
                },
                {
                    $set: {
                        status: RIDE_STATUS.CANCELLED,
                        cancelReason: reason.trim(),
                        cancelledAt: new Date(),
                        cancelledBy: "DRIVER",
                    },
                },
                { new: true, session }
            );

            if (!ride) {
                const existing = await Ride.findById(rideId).session(session);
                if (!existing) throw new ApiError(404, "Ride not found");
                if (!existing.driver?.equals(driver._id)) {
                    throw new ApiError(403, "This ride is not assigned to you.");
                }
                throw new ApiError(409, "Ride was modified by another request. Please refresh and retry.");
            }

            if (ride.rideRequest) {
                await RideRequest.findOneAndUpdate(
                    {
                        _id: ride.rideRequest,
                        status: "APPROVED",
                    },
                    {
                        $set: {
                            status: "DRIVER_DECLINED",
                            cancellationReason: reason.trim(),
                            cancelledAt: ride.cancelledAt,
                            cancelledBy: "DRIVER",
                        },
                    },
                    { session }
                );
            }

            const releasedDriver = await Driver.findOneAndUpdate(
                {
                    _id: driver._id,
                    currentRide: ride._id,
                    status: DRIVER_STATUS.ASSIGNED,
                },
                {
                    $set: {
                        status: DRIVER_STATUS.AVAILABLE,
                        currentRide: null,
                        freeAt: ride.cancelledAt,
                    },
                },
                { new: true, session }
            );

            if (!releasedDriver) {
                throw new ApiError(409, "Driver state no longer matches this ride");
            }

            updatedRideId = ride._id;
        });

        return populateRide(updatedRideId);
    } finally {
        await session.endSession();
    }
};

const getRides = async () =>
    Ride.find()
        .populate({ path: "driver", populate: { path: "user" } })
        .populate("vehicle")
        .populate("rideRequest")
        .populate({ path: "guests", populate: { path: "user" } });

const getRideById = async (rideId) => {
    const ride = await Ride.findById(rideId);

    if (!ride) throw new ApiError(404, "Ride not found");

    const hasRouteMetrics =
        Number(ride.estimatedDistance) > 0 &&
        Number(ride.estimatedDuration) > 0;

    const hasCoordinates =
        ride.pickupLocation?.latitude != null &&
        ride.pickupLocation?.longitude != null &&
        ride.dropLocation?.latitude != null &&
        ride.dropLocation?.longitude != null;

    if (!hasRouteMetrics && hasCoordinates) {
        try {
            const route = await routingService.getDrivingRoute(
                ride.pickupLocation,
                ride.dropLocation
            );

            ride.estimatedDistance = route.distanceKm;
            ride.estimatedDuration = route.durationMinutes;

            await ride.save();
        } catch (error) {
            console.error(
                `Failed to backfill route metrics for ride ${rideId}:`,
                error.message
            );
        }
    }

    return populateRide(rideId);
};

const getCurrentDriverRide = async (userId) => {
    const driver = await Driver.findOne({ user: userId });

    if (!driver) throw new ApiError(404, "Driver not found");

    return Ride.findOne({
        driver: driver._id,
        status: {
            $in: ACTIVE_RIDE_STATUSES,
        },
    })
        .sort({ createdAt: -1 })
        .populate({
            path: "driver",
            populate: { path: "user", select: "-password -__v" },
        })
        .populate("vehicle")
        .populate("rideRequest")
        .populate({
            path: "guests",
            populate: { path: "user", select: "-password -__v" },
        });
};

const getDriverRideHistory = async (userId) => {
    const driver = await Driver.findOne({ user: userId });

    if (!driver) throw new ApiError(404, "Driver not found");

    return Ride.find({
        driver: driver._id,
        status: {
            $in: [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED],
        },
    })
        .populate({
            path: "driver",
            populate: { path: "user", select: "-password -__v" },
        })
        .populate("vehicle")
        .populate("rideRequest")
        .populate({
            path: "guests",
            populate: { path: "user", select: "-password -__v" },
        })
        .sort({
            completedAt: -1,
            cancelledAt: -1,
            createdAt: -1,
        })
        .lean();
};

const getCurrentGuestRide = async (userId) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");

    return Ride.findOne({
        guests: guest._id,
        status: {
            $in: ACTIVE_RIDE_STATUSES,
        },
    })
        .sort({ createdAt: -1 })
        .populate({
            path: "driver",
            populate: { path: "user", select: "-password -__v" },
        })
        .populate("vehicle")
        .populate("rideRequest")
        .populate({
            path: "guests",
            populate: { path: "user", select: "-password -__v" },
        });
};

const getGuestRideHistory = async (userId) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");

    return Ride.find({
        guests: guest._id,
        status: {
            $in: [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED],
        },
    })
        .populate({
            path: "driver",
            populate: { path: "user", select: "-password -__v" },
        })
        .populate("vehicle")
        .populate("rideRequest")
        .populate({
            path: "guests",
            populate: { path: "user", select: "-password -__v" },
        })
        .sort({
            completedAt: -1,
            cancelledAt: -1,
            createdAt: -1,
        })
        .lean();
};

const acknowledgeRide = async (rideId, userId) => {
    const driver = await Driver.findOne({ user: userId });

    if (!driver) throw new ApiError(404, "Driver not found");

    const session = await mongoose.startSession();

    try {
        let updatedRideId;

        await session.withTransaction(async () => {
            const ride = await Ride.findOneAndUpdate(
                {
                    _id: rideId,
                    driver: driver._id,
                    status: RIDE_STATUS.ASSIGNED,
                    acceptedAt: null,
                },
                { $set: { acceptedAt: new Date() } },
                { new: true, session }
            );

            if (!ride) {
                const existing = await Ride.findById(rideId).session(session);
                if (!existing) throw new ApiError(404, "Ride not found");
                if (!existing.driver?.equals(driver._id)) {
                    throw new ApiError(403, "This ride is not assigned to you.");
                }
                throw new ApiError(409, "Ride was modified by another request. Please refresh and retry.");
            }

            updatedRideId = ride._id;
        });

        const updatedRide = await populateRide(updatedRideId);

        socketService.emitRideAccepted(driver.user, updatedRide);

        return updatedRide;
    } finally {
        await session.endSession();
    }
};

const getRideRoute = async (rideId, userId, role, from, to) => {
    const ride = await Ride.findById(rideId)
        .select("driver guests")
        .populate({ path: "driver", select: "user" })
        .populate({ path: "guests", select: "user" })
        .lean();

    if (!ride) throw new ApiError(404, "Ride not found");

    const allowed =
        role === ROLES.ADMIN ||
        (role === ROLES.DRIVER && String(ride.driver?.user) === String(userId)) ||
        (role === ROLES.GUEST &&
            ride.guests?.some(
                (guest) => String(guest?.user) === String(userId)
            ));

    if (!allowed) {
        throw new ApiError(403, "You do not have access to this ride");
    }

    return {
        rideId: ride._id,
        ...(await routingService.getDrivingRoute(from, to)),
    };
};

export default {
    updateRideStatus,
    cancelGuestRide,
    declineRide,
    getRides,
    getRideById,
    getCurrentDriverRide,
    getDriverRideHistory,
    getCurrentGuestRide,
    getGuestRideHistory,
    acknowledgeRide,
    getRideRoute,
};
