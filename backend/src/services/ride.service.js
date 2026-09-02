import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import Guest from "../models/Guest.js";
import RideRequest from "../models/RideRequest.js";

import { DRIVER_STATUS, RIDE_STATUS, ROLES } from "../utils/constants.js";

import routingService from "./routing.service.js";
import ApiError from "../utils/ApiError.js";
import socketService from "./socket.service.js";

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
    const ride = await Ride.findById(rideId);

    if (!ride) throw new ApiError(404, "Ride not found");

    let driver = null;

    if (userRole === ROLES.DRIVER) {
        driver = await Driver.findOne({ user: userId });

        if (!driver) throw new ApiError(404, "Driver not found");

        if (!ride.driver?.equals(driver._id)) {
            throw new ApiError(403, "This ride is not assigned to you.");
        }
    }

    switch (status) {
        case RIDE_STATUS.ARRIVED:
            if (ride.status !== RIDE_STATUS.ASSIGNED) {
                throw new ApiError(400, "Ride must be assigned before arrival can be recorded.");
            }

            if (!ride.acceptedAt) {
                throw new ApiError(400, "Accept the ride before marking arrival.");
            }

            ride.status = RIDE_STATUS.ARRIVED;
            ride.arrivedAt ??= new Date();
            break;

        case RIDE_STATUS.PICKED_UP:
            if (ride.status !== RIDE_STATUS.ARRIVED) {
                throw new ApiError(400, "Driver must arrive before starting the ride.");
            }

            ride.status = RIDE_STATUS.PICKED_UP;
            ride.startedAt ??= new Date();
            break;

        case RIDE_STATUS.COMPLETED:
            if (ride.status !== RIDE_STATUS.PICKED_UP) {
                throw new ApiError(400, "Ride must be started before completion.");
            }

            ride.status = RIDE_STATUS.COMPLETED;
            ride.completedAt ??= new Date();

            driver ??= await Driver.findById(ride.driver);

            if (driver) {
                driver.status = DRIVER_STATUS.AVAILABLE;
                driver.currentRide = null;
                driver.freeAt = new Date();
                await driver.save();
            }
            break;

        default:
            throw new ApiError(400, "Invalid ride status");
    }

    await ride.save();

    const updatedRide = await populateRide(ride._id);
    const driverUserId = updatedRide?.driver?.user?._id ?? updatedRide?.driver?.user;

    if (status === RIDE_STATUS.COMPLETED) {
        if (driverUserId) socketService.emitRideCompleted(driverUserId, updatedRide);
        if (driver) socketService.emitDriverStatus(driver.user, driver);
    } else if ([RIDE_STATUS.ARRIVED, RIDE_STATUS.PICKED_UP].includes(status)) {
        if (driverUserId) socketService.emitRideStatus(driverUserId, updatedRide);
    }

    return updatedRide;
};

const cancelGuestRide = async (userId, rideId, reason) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");
    if (!reason?.trim()) throw new ApiError(400, "Cancellation reason is required.");

    const ride = await Ride.findById(rideId);

    if (!ride) throw new ApiError(404, "Ride not found");

    if (!ride.guests.some((id) => id.equals(guest._id))) {
        throw new ApiError(403, "You cannot cancel this ride.");
    }

    if (![RIDE_STATUS.ASSIGNED, RIDE_STATUS.ARRIVED, RIDE_STATUS.PICKED_UP].includes(ride.status)) {
        throw new ApiError(400, "This ride can no longer be cancelled.");
    }

    const cancellationTime = new Date();
    const cancellationReason = reason.trim();

    ride.status = RIDE_STATUS.CANCELLED;
    ride.cancelReason = cancellationReason;
    ride.cancelledAt = cancellationTime;
    ride.cancelledBy = "GUEST";

    await ride.save();

    if (ride.rideRequest) {
        await RideRequest.findByIdAndUpdate(ride.rideRequest, {
            status: "CANCELLED",
            cancellationReason,
            cancelledAt: cancellationTime,
            cancelledBy: "GUEST",
        });
    }

    const driver = await Driver.findById(ride.driver);

    if (driver) {
        driver.status = DRIVER_STATUS.AVAILABLE;
        driver.currentRide = null;
        driver.freeAt = cancellationTime;
        await driver.save();
    }

    return populateRide(ride._id);
};

const declineRide = async (userId, rideId, reason) => {
    if (!reason?.trim()) throw new ApiError(400, "Decline reason is required.");

    const driver = await Driver.findOne({ user: userId });

    if (!driver) throw new ApiError(404, "Driver not found");

    const ride = await Ride.findById(rideId);

    if (!ride) throw new ApiError(404, "Ride not found");

    if (!ride.driver?.equals(driver._id)) {
        throw new ApiError(403, "This ride is not assigned to you.");
    }

    if (ride.status !== RIDE_STATUS.ASSIGNED || ride.acceptedAt) {
        throw new ApiError(400, "Only unaccepted assigned rides can be declined.");
    }

    const cancellationTime = new Date();
    const declineReason = reason.trim();

    ride.status = RIDE_STATUS.CANCELLED;
    ride.cancelReason = declineReason;
    ride.cancelledAt = cancellationTime;
    ride.cancelledBy = "DRIVER";

    await ride.save();

    if (ride.rideRequest) {
        await RideRequest.findByIdAndUpdate(ride.rideRequest, {
            status: "DRIVER_DECLINED",
            cancellationReason: declineReason,
            cancelledAt: cancellationTime,
            cancelledBy: "DRIVER",
        });
    }

    driver.status = DRIVER_STATUS.AVAILABLE;
    driver.currentRide = null;
    driver.freeAt = cancellationTime;

    await driver.save();

    return populateRide(ride._id);
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
            $in: [
                RIDE_STATUS.ASSIGNED,
                RIDE_STATUS.ARRIVED,
                RIDE_STATUS.PICKED_UP,
            ],
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
            $in: [
                RIDE_STATUS.ASSIGNED,
                RIDE_STATUS.ARRIVED,
                RIDE_STATUS.PICKED_UP,
            ],
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

    const ride = await Ride.findById(rideId);

    if (!ride) throw new ApiError(404, "Ride not found");

    if (!ride.driver?.equals(driver._id)) {
        throw new ApiError(403, "This ride is not assigned to you.");
    }

    if (ride.status !== RIDE_STATUS.ASSIGNED) {
        throw new ApiError(400, "Only assigned rides can be acknowledged.");
    }

    ride.acceptedAt ??= new Date();
    await ride.save();

    const updatedRide = await populateRide(rideId);

    socketService.emitRideAccepted(driver.user, updatedRide);

    return updatedRide;
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