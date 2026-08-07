import rideService from "../services/ride.service.js";

import asyncHandler from "../utils/asyncHandler.js";

import { successResponse } from "../utils/response.js";

const getRides = asyncHandler(async (req, res) => {
  const rides = await rideService.getRides();

  return successResponse(
    res,
    rides,
    "Rides fetched successfully"
  );
});

const getRideById = asyncHandler(async (req, res) => {
  const ride = await rideService.getRideById(
    req.params.id
  );

  return successResponse(
    res,
    ride,
    "Ride fetched successfully"
  );
});

const getCurrentDriverRide = asyncHandler(
  async (req, res) => {

    const ride =
      await rideService.getCurrentDriverRide(
        req.user.id
      );

    return successResponse(
      res,
      ride,
      "Current ride fetched successfully"
    );

  }
);

const acknowledgeRide = asyncHandler(
  async (req, res) => {

    const ride =
      await rideService.acknowledgeRide(
        req.params.id,
        req.user.id
      );

    return successResponse(
      res,
      ride,
      "Ride acknowledged successfully"
    );

  }
);

const updateRideStatus = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(
    req.params.id,
    req.body.status
  );

  return successResponse(
    res,
    ride,
    "Ride status updated successfully"
  );
});

export {
  getRides,
  getRideById,
  getCurrentDriverRide,
  acknowledgeRide,
  updateRideStatus,
};