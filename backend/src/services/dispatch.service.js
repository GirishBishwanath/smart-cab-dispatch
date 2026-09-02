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

const assignDriver = async (rideRequest) => {
    const drivers = await Driver.find({
        status: DRIVER_STATUS.AVAILABLE,
        currentRide: null,
        $or: [{ breakUntil: null }, { breakUntil: { $lte: new Date() } }],
    });

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

    let selectedDriver = null;
    let selectedVehicle = null;

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
            selectedDriver = driver;
            selectedVehicle = vehicle;
            break;
        }
    }

    if (!selectedDriver) {
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

    const ride = await Ride.create({
        rideRequest: rideRequest._id,
        guests: [rideRequest.guest],
        driver: selectedDriver._id,
        vehicle: selectedVehicle._id,
        tripType: rideRequest.tripType,
        pickupLocation: rideRequest.pickupLocation,
        dropLocation: rideRequest.dropLocation,
        estimatedDistance,
        estimatedDuration,
        assignedAt: new Date(),
        status: RIDE_STATUS.ASSIGNED,
    });

    selectedDriver.status = DRIVER_STATUS.ASSIGNED;
    selectedDriver.currentRide = ride._id;
    await selectedDriver.save();

    const populatedRide = await populateRide(ride._id);
    const driverUserId = selectedDriver.user.toString();

    socketService.emitRideAssigned(driverUserId, populatedRide);
    socketService.emitDriverStatus(driverUserId, selectedDriver);

    return populatedRide;
};

export default { assignDriver };