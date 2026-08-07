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

const getRideById = async (rideId) => {
  const ride = await Ride.findById(rideId)
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

  if (!ride) {
    throw new ApiError(404, "Ride not found");
  }

  return ride;
};

const getCurrentDriverRide = async (userId) => {

  const driver = await Driver.findOne({
    user: userId,
  });

  if (!driver) {
    throw new ApiError(
      404,
      "Driver not found"
    );
  }

  const ride = await Ride.findOne({
    driver: driver._id,
    status: {
      $in: [
        RIDE_STATUS.ASSIGNED,
        RIDE_STATUS.ARRIVED,
        RIDE_STATUS.PICKED_UP,
      ],
    },
  })
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

  return ride;
};

const acknowledgeRide = async (rideId, userId) => {

    const driver = await Driver.findOne({
        user: userId,
    });

    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
        throw new ApiError(404, "Ride not found");
    }

    if (!ride.driver.equals(driver._id)) {
        throw new ApiError(
            403,
            "This ride is not assigned to you."
        );
    }

    if (ride.status !== RIDE_STATUS.ASSIGNED) {
        throw new ApiError(
            400,
            "Only assigned rides can be acknowledged."
        );
    }

    if (!ride.acceptedAt) {
        ride.acceptedAt = new Date();
        await ride.save();
    }

    return await Ride.findById(rideId)
        .populate({
            path: "driver",
            populate: {
                path: "user",
            },
        })
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
  getRideById,
  getCurrentDriverRide,
  acknowledgeRide,
};