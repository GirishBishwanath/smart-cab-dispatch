import guestService from "../services/guest.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const createGuest = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    accommodation,
    pickupLocation,
    dropLocation,
  } = req.body;

  if (
    !fullName ||
    !email ||
    !password ||
    !phone ||
    !accommodation ||
    !pickupLocation ||
    !dropLocation
  ) {
    throw new Error("All required fields are mandatory");
  }

  const guest = await guestService.createGuest(req.body);

  return successResponse(
    res,
    guest,
    "Guest created successfully"
  );
});

const getGuests = asyncHandler(async (req, res) => {
  const guests = await guestService.getGuests();

  return successResponse(
    res,
    guests,
    "Guests fetched successfully"
  );
});

const getGuestById = asyncHandler(async (req, res) => {
  const guest = await guestService.getGuestById(req.params.id);

  return successResponse(
    res,
    guest,
    "Guest fetched successfully"
  );
});

const updateGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.updateGuest(
    req.params.id,
    req.body
  );

  return successResponse(
    res,
    guest,
    "Guest updated successfully"
  );
});

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await guestService.getMyProfile(req.user.id);

  return successResponse(
    res,
    profile,
    "Guest profile fetched successfully"
  );
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await guestService.updateMyProfile(
    req.user.id,
    req.body
  );

  return successResponse(
    res,
    profile,
    "Guest profile updated successfully"
  );
});

const deleteGuest = asyncHandler(async (req, res) => {
  await guestService.deleteGuest(req.params.id);

  return successResponse(
    res,
    {},
    "Guest deleted successfully"
  );
});

export {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  getMyProfile,
  updateMyProfile,
  deleteGuest,
};