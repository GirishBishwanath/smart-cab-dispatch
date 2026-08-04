import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";

import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../utils/constants.js";

import ApiError from "../utils/ApiError.js";

const createDriver = async (data) => {
    const {
        fullName,
        email,
        password,
        phone,
        vehicleNumber,
        model,
        seatCapacity,
        luggageCapacity,
    } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "Driver already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        phone,
        role: ROLES.DRIVER,
    });

    const driver = await Driver.create({
        user: user._id,
    });

    const vehicle = await Vehicle.create({
        driver: driver._id,
        vehicleNumber,
        model,
        seatCapacity,
        luggageCapacity,
    });

    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
        driver,
        vehicle,
    };
};

const getDrivers = async () => {
    const drivers = await Driver.find()
        .populate({
            path: "user",
            select: "-password -__v",
        })
        .lean();

    return drivers;
};

const getDriverById = async (id) => {
    const driver = await Driver.findById(id)
        .populate({
            path: "user",
            select: "-password -__v",
        });

    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    return driver;
};

const updateDriver = async (id, data) => {
    const driver = await Driver.findById(id);

    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    const user = await User.findById(driver.user);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.fullName = data.fullName ?? user.fullName;
    user.phone = data.phone ?? user.phone;

    await user.save();

    return await Driver.findById(id).populate({
        path: "user",
        select: "-password -__v",
    });
};

const deleteDriver = async (id) => {
    const driver = await Driver.findById(id);

    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    await Vehicle.deleteOne({
        driver: driver._id,
    });

    await User.findByIdAndDelete(driver.user);

    await Driver.findByIdAndDelete(id);

    return true;
};

export default {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
};