import mongoose from "mongoose";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Ride from "../models/Ride.js";

import { DRIVER_STATUS, RIDE_STATUS } from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";
import { haversineDistanceKm } from "../utils/geo.js";

import routingService from "./routing.service.js";
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

const findAvailableDrivers = () =>
    Driver.find({
        status: DRIVER_STATUS.AVAILABLE,
        currentRide: null,
        $or: [{ breakUntil: null }, { breakUntil: { $lte: new Date() } }],
    });

const reserveDriver = (driverId, session) =>
    Driver.findOneAndUpdate(
        {
            _id: driverId,
            status: DRIVER_STATUS.AVAILABLE,
            currentRide: null,
            $or: [{ breakUntil: null }, { breakUntil: { $lte: new Date() } }],
        },
        {
            $set: {
                status: DRIVER_STATUS.ASSIGNED,
            },
        },
        { new: true, session }
    );

const attachRideToDriver = (driverId, rideId, session) =>
    Driver.findOneAndUpdate(
        {
            _id: driverId,
            status: DRIVER_STATUS.ASSIGNED,
            currentRide: null,
        },
        {
            $set: {
                currentRide: rideId,
            },
        },
        { new: true, session }
    );

const isDuplicateRideRequestError = (error) =>
    error?.code === 11000 &&
    Boolean(error?.keyPattern?.rideRequest || error?.keyValue?.rideRequest);

const assignDriver = async (rideRequest, sessionOverride = null) => {
    const drivers = await findAvailableDrivers();

    if (!drivers.length) {
        throw new ApiError(400, "No drivers available");
    }

    const rankedDrivers = [...drivers].sort(
        (driverA, driverB) =>
            haversineDistanceKm(
                driverA.currentLocation,
                rideRequest.pickupLocation
            ) -
            haversineDistanceKm(
                driverB.currentLocation,
                rideRequest.pickupLocation
            )
    );

    const eligibleDrivers = [];

    for (const driver of rankedDrivers) {
        const vehicle = await Vehicle.findOne({
            driver: driver._id,
            isActive: true,
        });

        if (!vehicle) continue;

        const hasEnoughSeats =
            vehicle.seatCapacity >= rideRequest.groupSize;

        const hasEnoughLuggageSpace =
            vehicle.luggageCapacity >= rideRequest.luggageCount;

        if (hasEnoughSeats && hasEnoughLuggageSpace) {
            eligibleDrivers.push(driver);
        }
    }

    if (!eligibleDrivers.length) {
        throw new ApiError(
            400,
            "No vehicle satisfies capacity requirements"
        );
    }

    let estimatedDistance = 0;
    let estimatedDuration = 0;

    try {
        const route = await routingService.getDrivingRoute(
            rideRequest.pickupLocation,
            rideRequest.dropLocation
        );

        estimatedDistance = route.distanceKm;
        estimatedDuration = route.durationMinutes;
    } catch (error) {
        console.error(
            "Failed to calculate initial ride route:",
            error.message
        );
    }

    const createAssignment = async (session) => {
        let rideId = null;
        let driverUserId = null;

        await session.withTransaction(async () => {
            let reservedDriver = null;
            let selectedVehicle = null;

            for (const candidate of eligibleDrivers) {
                const vehicle = await Vehicle.findOne({
                    driver: candidate._id,
                    isActive: true,
                }).session(session);

                if (!vehicle) continue;

                const hasEnoughSeats =
                    vehicle.seatCapacity >= rideRequest.groupSize;

                const hasEnoughLuggageSpace =
                    vehicle.luggageCapacity >= rideRequest.luggageCount;

                if (!hasEnoughSeats || !hasEnoughLuggageSpace) continue;

                const claimedDriver = await reserveDriver(
                    candidate._id,
                    session
                );

                if (!claimedDriver) continue;

                reservedDriver = claimedDriver;
                selectedVehicle = vehicle;
                break;
            }

            if (!reservedDriver) {
                throw new ApiError(
                    400,
                    "No driver could be reserved"
                );
            }

            const [ride] = await Ride.create([
                {
                    rideRequest: rideRequest._id,
                    guests: [rideRequest.guest],
                    driver: reservedDriver._id,
                    vehicle: selectedVehicle._id,
                    tripType: rideRequest.tripType,
                    pickupLocation: rideRequest.pickupLocation,
                    dropLocation: rideRequest.dropLocation,
                    estimatedDistance,
                    estimatedDuration,
                    assignedAt: new Date(),
                    status: RIDE_STATUS.ASSIGNED,
                },
            ], { session });

            const attachedDriver = await attachRideToDriver(
                reservedDriver._id,
                ride._id,
                session
            );

            if (!attachedDriver) {
                throw new ApiError(
                    409,
                    "Driver reservation could not be finalized"
                );
            }

            rideId = ride._id;
            driverUserId = reservedDriver.user.toString();
        });

        return { rideId, driverUserId };
    };

    let assignment;
    let ownedSession = false;
    const session = sessionOverride || await mongoose.startSession();

    try {
        ownedSession = !sessionOverride;
        assignment = await createAssignment(session);
    } catch (error) {
        if (!isDuplicateRideRequestError(error)) {
            throw error;
        }

        assignment = { rideId: null, driverUserId: null };
    } finally {
        if (ownedSession) {
            await session.endSession();
        }
    }

    if (!assignment.rideId) {
        const existingRide = await populateRideByRequest(rideRequest._id);

        if (!existingRide) {
            throw new ApiError(409, "Ride already exists for this request");
        }

        assignment = {
            rideId: existingRide._id,
            driverUserId: existingRide.driver?.user?._id
                ? String(existingRide.driver.user._id)
                : String(existingRide.driver?.user || ""),
        };
    }

    const populatedRide = await populateRide(assignment.rideId);

    if (!populatedRide) {
        throw new ApiError(500, "Assigned ride could not be loaded");
    }

    const resolvedDriverUserId =
        assignment.driverUserId ||
        populatedRide.driver?.user?._id ||
        populatedRide.driver?.user;

    if (!sessionOverride) {
        socketService.emitRideAssigned(
            String(resolvedDriverUserId),
            populatedRide
        );
        socketService.emitDriverStatus(
            String(resolvedDriverUserId),
            populatedRide.driver
        );
    }

    return populatedRide;
};

const populateRideByRequest = (rideRequestId) =>
    Ride.findOne({ rideRequest: rideRequestId })
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

export default { assignDriver };