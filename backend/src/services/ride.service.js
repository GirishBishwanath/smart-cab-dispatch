import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";

import { DRIVER_STATUS, RIDE_STATUS } from "../utils/constants.js";

import ApiError from "../utils/ApiError.js";

const updateRideStatus = async (rideId, status) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new ApiError(404, "Ride not found");
  }

  switch (status) {
    case RIDE_STATUS.ARRIVED:
      ride.status = RIDE_STATUS.ARRIVED;
      break;

    case RIDE_STATUS.PICKED_UP:
      ride.status = RIDE_STATUS.PICKED_UP;
      ride.startedAt = new Date();
      break;

    case RIDE_STATUS.COMPLETED:
      ride.status = RIDE_STATUS.COMPLETED;
      ride.completedAt = new Date();

      const driver = await Driver.findById(ride.driver);

      driver.status = DRIVER_STATUS.AVAILABLE;
      driver.currentRide = null;
      driver.freeAt = new Date();

      await driver.save();

      break;

    default:
      throw new ApiError(400, "Invalid ride status");
  }

  await ride.save();

  return await Ride.findById(rideId)
    .populate({
      path: "driver",
      populate: {
        path: "user",
      },
    })
    .populate("vehicle")
    .populate({
      path: "guests",
      populate: {
        path: "user",
      },
    });
};

const getRides = async () => {
  return Ride.find()
    .populate({
      path: "driver",
      populate: {
        path: "user",
      },
    })
    .populate("vehicle")
    .populate({
      path: "guests",
      populate: {
        path: "user",
      },
    });
};

export default {
  updateRideStatus,
  getRides,
};