import RideRequest from "../models/RideRequest.js";
import Guest from "../models/Guest.js";
import ApiError from "../utils/ApiError.js";
import dispatchService from "./dispatch.service.js";

const createRideRequest = async (userId, data) => {
    const guest = await Guest.findOne({
        user: userId,
    });

    if (!guest) {
        throw new ApiError(404, "Guest not found");
    }

    const rideRequest = await RideRequest.create({
        guest: guest._id,

        pickupLocation:
            data.pickupLocation ?? guest.pickupLocation,

        dropLocation:
            data.dropLocation ?? guest.dropLocation,

        groupSize:
            data.groupSize ?? guest.groupSize,

        luggageCount:
            data.luggageCount ?? guest.luggageCount,

        tripType:
            data.tripType ?? "ON_DEMAND",
    });

    return rideRequest.populate({
        path: "guest",
        populate: {
            path: "user",
            select: "-password -__v",
        },
    });
};

const getRideRequests = async () => {
    return RideRequest.find()
        .populate({
            path: "guest",
            populate: {
                path: "user",
                select: "-password -__v",
            },
        })
        .sort({ createdAt: -1 });
};

const approveRideRequest = async (id) => {
    const request = await RideRequest.findById(id);

    if (!request) {
        throw new ApiError(404, "Ride request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(
            400,
            "Ride request already processed"
        );
    }

    const ride =
        await dispatchService.assignDriver(request);

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
        throw new ApiError(
            400,
            "Ride request already processed"
        );
    }

    request.status = "REJECTED";

    request.rejectionReason = reason;

    request.approvedAt = null;

    await request.save();

    return request.populate({
        path: "guest",
        populate: {
            path: "user",
            select: "-password -__v",
        },
    });
};

export default {
    createRideRequest,
    getRideRequests,
    approveRideRequest,
    declineRideRequest,
};