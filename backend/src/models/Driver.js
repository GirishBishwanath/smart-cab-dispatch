import mongoose from "mongoose";
import { DRIVER_STATUS } from "../utils/constants.js";

const driverSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        currentLocation: {
            latitude: Number,
            longitude: Number,
        },

        status: {
            type: String,
            enum: Object.values(DRIVER_STATUS),
            default: DRIVER_STATUS.OFFLINE,
        },

        freeAt: {
            type: Date,
            default: Date.now,
        },

        breakUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Driver",
    driverSchema
);