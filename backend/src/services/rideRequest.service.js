import RideRequest from "../models/RideRequest.js";
import Guest from "../models/Guest.js";
import Ride from "../models/Ride.js";
import ApiError from "../utils/ApiError.js";
import dispatchService from "./dispatch.service.js";

const populateRequest = (query) =>
    query
        .populate({
            path: "guest",
            populate: {
                path: "user",
                select: "-password -__v",
            },
        })
        .populate("ride");

const createRideRequest = async (userId, data) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) {
        throw new ApiError(404, "Guest not found");
    }

    if (
        !data?.pickupLocation ||
        !Number.isFinite(data.pickupLocation.latitude) ||
        !Number.isFinite(data.pickupLocation.longitude)
    ) {
        throw new ApiError(
            400,
            "A valid pickup location with coordinates is required."
        );
    }

    if (
        !data?.dropLocation ||
        !Number.isFinite(data.dropLocation.latitude) ||
        !Number.isFinite(data.dropLocation.longitude)
    ) {
        throw new ApiError(
            400,
            "A valid destination with coordinates is required."
        );
    }

    if (
        data.pickupLocation.latitude === data.dropLocation.latitude &&
        data.pickupLocation.longitude === data.dropLocation.longitude
    ) {
        throw new ApiError(
            400,
            "Pickup and destination cannot be the same."
        );
    }

    const rideRequest = await RideRequest.create({
        guest: guest._id,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        groupSize: Math.max(1, Number(data.groupSize ?? guest.groupSize)),
        luggageCount: Math.max(0, Number(data.luggageCount ?? guest.luggageCount)),
        tripType: data.tripType ?? "ON_DEMAND",
    });

    return populateRequest(
        RideRequest.findById(rideRequest._id)
    );
};

const getRideRequests = async () =>
    populateRequest(
        RideRequest.find().sort({ createdAt: -1 })
    );

const getMyRideRequests = async (userId) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) {
        throw new ApiError(404, "Guest not found");
    }

    return populateRequest(
        RideRequest.find({ guest: guest._id })
            .sort({ createdAt: -1 })
    );
};

const approveRideRequest = async (id) => {
    const request = await RideRequest.findById(id);

    if (!request) {
        throw new ApiError(404, "Ride request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(400, "Ride request already processed");
    }

    const ride = await dispatchService.assignDriver(request);

    request.status = "APPROVED";
    request.approvedAt = new Date();
    request.ride = ride._id;

    await request.save();

    return ride;
};

const declineRideRequest = async (id, reason = "") => {
    const request = await RideRequest.findById(id);

    if (!request) {
        throw new ApiError(404, "Ride request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(400, "Ride request already processed");
    }

    request.status = "REJECTED";
    request.rejectionReason = reason;
    request.approvedAt = null;

    await request.save();

    return populateRequest(
        RideRequest.findById(request._id)
    );
};

const cancelMyRideRequest = async (userId, id, reason = "" ) => {
    const guest = await Guest.findOne({
        user: userId,
    });

    if (!guest) {
        throw new ApiError(404, "Guest not found");
    }

    const request = await RideRequest.findById(id);

    if (!request) {
        throw new ApiError(
            404,
            "Ride request not found"
        );
    }

    if (!request.guest.equals(guest._id)) {
        throw new ApiError(
            403,
            "You cannot cancel this ride request."
        );
    }

    if (request.status !== "PENDING") {
        throw new ApiError(
            400,
            "Only pending ride requests can be cancelled."
        );
    }

    if (!reason.trim()) {
        throw new ApiError(
            400,
            "Cancellation reason is required."
        );
    }

    request.status = "CANCELLED";
    request.cancellationReason = reason.trim();
    request.approvedAt = null;
    request.ride = null;

    await request.save();

    return populateRequest(
        RideRequest.findById(request._id)
    );
};

export default {
    createRideRequest,
    getRideRequests,
    getMyRideRequests,
    approveRideRequest,
    declineRideRequest,
    cancelMyRideRequest,
};