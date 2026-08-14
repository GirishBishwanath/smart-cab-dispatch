import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";

import { hashPassword } from "../utils/hash.js";
import {
    ROLES,
    DRIVER_STATUS,
} from "../utils/constants.js";

import ApiError from "../utils/ApiError.js";

import socketService from "./socket.service.js";

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
        throw new ApiError(
            400,
            "Driver already exists"
        );
    }

    const hashedPassword =
        await hashPassword(password);

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


/*
|--------------------------------------------------------------------------
| Driver Profile
|--------------------------------------------------------------------------
*/

const getMyProfile = async (userId) => {
    const driver = await Driver.findOne({
        user: userId,
    })
        .populate({
            path: "user",
            select: "-password -__v",
        })
        .lean();

    if (!driver) {
        throw new ApiError(
            404,
            "Driver profile not found"
        );
    }

    const vehicle = await Vehicle.findOne({
        driver: driver._id,
    }).lean();

    return {
        driver,
        user: driver.user,
        vehicle: vehicle ?? null,
    };
};


const getDrivers = async () => {
    const drivers = await Driver.find()
        .populate({
            path: "user",
            select: "-password -__v",
        })
        .lean();

    const vehicles = await Vehicle.find().lean();

    return drivers.map((driver) => ({
        ...driver,
        vehicle:
            vehicles.find(
                (vehicle) =>
                    vehicle.driver.toString() ===
                    driver._id.toString()
            ) || null,
    }));
};


const getDriverById = async (id) => {
    const driver = await Driver.findById(id)
        .populate({
            path: "user",
            select: "-password -__v",
        });

    if (!driver) {
        throw new ApiError(
            404,
            "Driver not found"
        );
    }

    const vehicle = await Vehicle.findOne({
        driver: driver._id,
    });

    return {
        driver,
        user: driver.user,
        vehicle,
    };
};


const updateDriver = async (id, data) => {
    const driver =
        await Driver.findById(id);

    if (!driver) {
        throw new ApiError(
            404,
            "Driver not found"
        );
    }

    const user =
        await User.findById(driver.user);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    user.fullName =
        data.fullName ??
        user.fullName;

    user.phone =
        data.phone ??
        user.phone;

    await user.save();

    const vehicle =
        await Vehicle.findOne({
            driver: driver._id,
        });

    if (vehicle) {
        vehicle.vehicleNumber =
            data.vehicleNumber ??
            vehicle.vehicleNumber;

        vehicle.model =
            data.model ??
            vehicle.model;

        vehicle.seatCapacity =
            data.seatCapacity ??
            vehicle.seatCapacity;

        vehicle.luggageCapacity =
            data.luggageCapacity ??
            vehicle.luggageCapacity;

        await vehicle.save();
    }

    return getMyProfile(user._id);
};


const updateDriverStatus = async (id, status) => {
    const driver =
        await Driver.findById(id);

    if (!driver) {
        throw new ApiError(
            404,
            "Driver not found"
        );
    }

    if (
        !Object.values(
            DRIVER_STATUS
        ).includes(status)
    ) {
        throw new ApiError(
            400,
            "Invalid driver status"
        );
    }

    if (
        status ===
        DRIVER_STATUS.OFFLINE &&
        driver.currentRide
    ) {
        throw new ApiError(
            400,
            "Cannot set driver offline while assigned to a ride"
        );
    }

    driver.status = status;

    if (status !== DRIVER_STATUS.ON_BREAK) {
        driver.breakUntil = null;
    }

    await driver.save();

    socketService.emitDriverStatus(
        driver.user,
        driver
    );

    return Driver.findById(id)
        .populate({
            path: "user",
            select: "-password -__v",
        });
};


const deleteDriver = async (id) => {
    const driver =
        await Driver.findById(id);

    if (!driver) {
        throw new ApiError(
            404,
            "Driver not found"
        );
    }

    await Vehicle.deleteOne({
        driver: driver._id,
    });

    await User.findByIdAndDelete(
        driver.user
    );

    await Driver.findByIdAndDelete(id);

    return true;
};


export default {
    createDriver,
    getMyProfile,
    getDrivers,
    getDriverById,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
};