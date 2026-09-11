import mongoose from "mongoose";
import RideRequest from "../models/RideRequest.js";
import Guest from "../models/Guest.js";
import ApiError from "../utils/ApiError.js";
import dispatchService from "./dispatch.service.js";

const populateRequest = (query) =>
    query
        .populate({
            path: "guest",
            populate: { path: "user", select: "-password -__v" },
        })
        .populate("ride");

const createRideRequest = async (userId, data) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");

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

    return populateRequest(RideRequest.findById(rideRequest._id));
};

const getRideRequests = async () =>
    populateRequest(RideRequest.find().sort({ createdAt: -1 }));

const getMyRideRequests = async (userId) => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");

    return populateRequest(
        RideRequest.find({ guest: guest._id }).sort({ createdAt: -1 })
    );
};

const withTransaction = async (callback) => {
    const session = await mongoose.startSession();

    try {
        let result;

        await session.withTransaction(async () => {
            result = await callback(session);
        });

        return result;
    } finally {
        await session.endSession();
    }
};

const findRequestForDecision = async (id, session, message) => {
    const existing = await RideRequest.findById(id).session(session);

    if (!existing) throw new ApiError(404, "Ride request not found");
    throw new ApiError(400, message);
};

const approveRideRequest = async (id) => {
    const ride = await withTransaction(async (session) => {
        const request = await RideRequest.findOneAndUpdate(
            { _id: id, status: "PENDING" },
            {
                $set: {
                    status: "APPROVED",
                    approvedAt: new Date(),
                },
            },
            { new: true, session }
        );

        if (!request) {
            await findRequestForDecision(
                id,
                session,
                "Ride request already processed"
            );
        }

        const assignedRide = await dispatchService.assignDriver(request, session);
        request.ride = assignedRide._id;
        await request.save({ session });

        return assignedRide;
    });

    return ride;
};

const declineRideRequest = async (id, reason = "") => {
    const request = await withTransaction(async (session) => {
        const updated = await RideRequest.findOneAndUpdate(
            { _id: id, status: "PENDING" },
            {
                $set: {
                    status: "REJECTED",
                    rejectionReason: reason,
                    approvedAt: null,
                },
            },
            { new: true, session }
        );

        if (!updated) {
            await findRequestForDecision(
                id,
                session,
                "Ride request already processed"
            );
        }

        return updated;
    });

    return populateRequest(RideRequest.findById(request._id));
};

const cancelMyRideRequest = async (userId, id, reason = "") => {
    const guest = await Guest.findOne({ user: userId });

    if (!guest) throw new ApiError(404, "Guest not found");

    if (!reason.trim()) {
        throw new ApiError(400, "Cancellation reason is required.");
    }

    const request = await withTransaction(async (session) => {
        const updated = await RideRequest.findOneAndUpdate(
            {
                _id: id,
                guest: guest._id,
                status: "PENDING",
            },
            {
                $set: {
                    status: "CANCELLED",
                    cancellationReason: reason.trim(),
                    approvedAt: null,
                    ride: null,
                },
            },
            { new: true, session }
        );

        if (!updated) {
            const existing = await RideRequest.findById(id).session(session);

            if (!existing) throw new ApiError(404, "Ride request not found");
            if (!existing.guest.equals(guest._id)) {
                throw new ApiError(403, "You cannot cancel this ride request.");
            }
            throw new ApiError(
                400,
                "Only pending ride requests can be cancelled."
            );
        }

        return updated;
    });

    return populateRequest(RideRequest.findById(request._id));
};

export default {
    createRideRequest,
    getRideRequests,
    getMyRideRequests,
    approveRideRequest,
    declineRideRequest,
    cancelMyRideRequest,
};
