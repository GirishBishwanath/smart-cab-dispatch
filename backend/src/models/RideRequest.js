import mongoose from "mongoose";

const rideRequestSchema = new mongoose.Schema({
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
        required: true,
    },

    pickupLocation: {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },

    dropLocation: {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },

    groupSize: { type: Number, default: 1, min: 1 },
    luggageCount: { type: Number, default: 0, min: 0 },

    tripType: {
        type: String,
        enum: ["ARRIVAL", "EVENT_PICKUP", "EVENT_DROP", "DEPARTURE", "ON_DEMAND"],
        default: "ON_DEMAND",
    },

    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "DRIVER_DECLINED"],
        default: "PENDING",
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    approvedAt: { type: Date, default: null },

    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
        default: null,
    },

    rejectionReason: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },

    cancelledBy: {
        type: String,
        enum: ["GUEST", "DRIVER", "ADMIN", null],
        default: null,
    },

    notes: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("RideRequest", rideRequestSchema);