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
  updateRideStatus,
};