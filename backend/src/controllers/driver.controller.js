import driverService from "../services/driver.service.js";

import asyncHandler from "../utils/asyncHandler.js";

import { successResponse } from "../utils/response.js";

const createDriver = asyncHandler(async (req, res) => {

    const {
        fullName,
        email,
        password,
        phone,
        vehicleNumber,
        seatCapacity,
        luggageCapacity,
    } = req.body;

    if (
        !fullName ||
        !email ||
        !password ||
        !phone ||
        !vehicleNumber ||
        seatCapacity === undefined ||
        luggageCapacity === undefined
    ) {
        throw new Error("All required fields are mandatory");
    }

    const driver = await driverService.createDriver(req.body);

    return successResponse(
        res,
        driver,
        "Driver created successfully"
    );
});

const getDrivers = asyncHandler(async (req, res) => {
    const drivers = await driverService.getDrivers();

    return successResponse(
        res,
        drivers,
        "Drivers fetched successfully"
    );
});

const getDriverById = asyncHandler(async (req, res) => {
  const driver = await driverService.getDriverById(
    req.params.id
  );

  return successResponse(
    res,
    driver,
    "Driver fetched successfully"
  );
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.updateDriver(
    req.params.id,
    req.body
  );

  return successResponse(
    res,
    driver,
    "Driver updated successfully"
  );
});

const updateDriverStatus = asyncHandler(
    async (req, res) => {

        const driver =
            await driverService.updateDriverStatus(
                req.params.id,
                req.body.status
            );

        return successResponse(
            res,
            driver,
            "Driver status updated successfully"
        );

    }
);

const deleteDriver = asyncHandler(async (req, res) => {
  await driverService.deleteDriver(req.params.id);

  return successResponse(
    res,
    {},
    "Driver deleted successfully"
  );
});

export {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
};