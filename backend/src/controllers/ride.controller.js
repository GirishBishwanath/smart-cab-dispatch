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
  const ride = await rideService.getRideById(req.params.id);

  return successResponse(
    res,
    ride,
    "Ride fetched successfully"
  );
});

const getCurrentDriverRide = asyncHandler(async (req, res) => {
  const ride = await rideService.getCurrentDriverRide(
    req.user.id
  );

  return successResponse(
    res,
    ride,
    "Current ride fetched successfully"
  );
});

const getDriverRideHistory = asyncHandler(async (req, res) => {
  const rides = await rideService.getDriverRideHistory(
    req.user.id
  );

  return successResponse(
    res,
    rides,
    "Ride history fetched successfully"
  );
});

const getCurrentGuestRide = asyncHandler(async (req, res) => {
  const ride = await rideService.getCurrentGuestRide(
    req.user.id
  );

  return successResponse(
    res,
    ride,
    "Current guest ride fetched successfully"
  );
});

const getGuestRideHistory = asyncHandler(async (req, res) => {
  const rides = await rideService.getGuestRideHistory(
    req.user.id
  );

  return successResponse(
    res,
    rides,
    "Guest ride history fetched successfully"
  );
});

const acknowledgeRide = asyncHandler(async (req, res) => {
  const ride = await rideService.acknowledgeRide(
    req.params.id,
    req.user.id
  );

  return successResponse(
    res,
    ride,
    "Ride acknowledged successfully"
  );
});

const declineRide = asyncHandler(async (req, res) => {
  const ride = await rideService.declineRide(
    req.user.id,
    req.params.id,
    req.body.reason
  );

  return successResponse(
    res,
    ride,
    "Ride declined successfully"
  );
});

const cancelGuestRide = asyncHandler(async (req, res) => {
  const ride = await rideService.cancelGuestRide(
    req.user.id,
    req.params.id,
    req.body.reason
  );

  return successResponse(
    res,
    ride,
    "Ride cancelled successfully"
  );
});

const updateRideStatus = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(
    req.params.id,
    req.body.status,
    req.user.id,
    req.user.role
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
  getDriverRideHistory,
  getCurrentGuestRide,
  getGuestRideHistory,
  acknowledgeRide,
  declineRide,
  cancelGuestRide,
  updateRideStatus,
};