import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accommodation: {
      type: String,
      default: "",
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

    groupSize: {
      type: Number,
      default: 1,
    },

    luggageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Guest",
  guestSchema
);