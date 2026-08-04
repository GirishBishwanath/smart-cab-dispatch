import User from "../models/User.js";
import Guest from "../models/Guest.js";

import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";

const createGuest = async (data) => {
  const {
    fullName,
    email,
    password,
    phone,
    accommodation,
    pickupLocation,
    dropLocation,
    groupSize,
    luggageCount,
  } = data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "Guest already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role: ROLES.GUEST,
  });

  const guest = await Guest.create({
    user: user._id,
    accommodation,
    pickupLocation,
    dropLocation,
    groupSize,
    luggageCount,
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    guest,
  };
};

const getGuests = async () => {
  return await Guest.find()
    .populate({
      path: "user",
      select: "-password -__v",
    })
    .lean();
};

const getGuestById = async (id) => {
  const guest = await Guest.findById(id).populate({
    path: "user",
    select: "-password -__v",
  });

  if (!guest) {
    throw new ApiError(404, "Guest not found");
  }

  return guest;
};

const updateGuest = async (id, data) => {
  const guest = await Guest.findById(id);

  if (!guest) {
    throw new ApiError(404, "Guest not found");
  }

  const user = await User.findById(guest.user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.fullName = data.fullName ?? user.fullName;
  user.phone = data.phone ?? user.phone;

  await user.save();

  guest.accommodation =
    data.accommodation ?? guest.accommodation;

  guest.pickupLocation =
    data.pickupLocation ?? guest.pickupLocation;

  guest.dropLocation =
    data.dropLocation ?? guest.dropLocation;

  guest.groupSize =
    data.groupSize ?? guest.groupSize;

  guest.luggageCount =
    data.luggageCount ?? guest.luggageCount;

  await guest.save();

  return await Guest.findById(id).populate({
    path: "user",
    select: "-password -__v",
  });
};

const deleteGuest = async (id) => {
  const guest = await Guest.findById(id);

  if (!guest) {
    throw new ApiError(404, "Guest not found");
  }

  await User.findByIdAndDelete(guest.user);

  await Guest.findByIdAndDelete(id);

  return true;
};

export default {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  deleteGuest,
};