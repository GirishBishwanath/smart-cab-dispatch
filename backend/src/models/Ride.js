import mongoose from "mongoose";
import { RIDE_STATUS } from "../utils/constants.js";

const rideSchema = new mongoose.Schema(
    {
        guests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Guest",
            },
        ],

        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            default: null,
        },

        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            default: null,
        },

        rideRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RideRequest",
        },

        tripType: {
            type: String,
            enum: [
                "ARRIVAL",
                "EVENT_PICKUP",
                "EVENT_DROP",
                "DEPARTURE",
                "ON_DEMAND",
            ],
            required: true,
        },

        pickupLocation: {
            name: String,
            latitude: Number,
            longitude: Number,
        },

        dropLocation: {
            name: String,
            latitude: Number,
            longitude: Number,
        },

        estimatedDistance: {
            type: Number,
            default: 0,
        },

        estimatedDuration: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: Object.values(RIDE_STATUS),
            default: RIDE_STATUS.PENDING,
        },

        scheduledTime: Date,

        startedAt: Date,

        completedAt: Date,

        assignedAt: Date,

        cancelReason: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Ride",
    rideSchema
);