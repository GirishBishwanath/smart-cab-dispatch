import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Ride from "../models/Ride.js";

import { DRIVER_STATUS, RIDE_STATUS } from "../utils/constants.js";

import ApiError from "../utils/ApiError.js";

const assignDriver = async (rideRequest) => {
  const drivers = await Driver.find({
    status: DRIVER_STATUS.AVAILABLE,
    currentRide: null,
    $or: [
      { breakUntil: null },
      { breakUntil: { $lte: new Date() } }
    ]
  });

  if (drivers.length === 0) {
    throw new ApiError(400, "No drivers available");
  }

  let selectedDriver = null;
  let selectedVehicle = null;

  for (const driver of drivers) {
    const vehicle = await Vehicle.findOne({
      driver: driver._id,
      isActive: true,
    });

    if (!vehicle) continue;

    if (
      vehicle.seatCapacity >= rideRequest.groupSize &&
      vehicle.luggageCapacity >= rideRequest.luggageCount
    ) {
      selectedDriver = driver;
      selectedVehicle = vehicle;
      break;
    }
  }

  if (!selectedDriver) {
    throw new ApiError(
      400,
      "No vehicle satisfies capacity requirements"
    );
  }

  const ride = await Ride.create({
    rideRequest: rideRequest._id,

    guests: [rideRequest.guest],

    driver: selectedDriver._id,

    vehicle: selectedVehicle._id,

    tripType: rideRequest.tripType,

    pickupLocation: rideRequest.pickupLocation,

    dropLocation: rideRequest.dropLocation,

    assignedAt: new Date(),

    status: RIDE_STATUS.ASSIGNED,
  });

  selectedDriver.status = DRIVER_STATUS.ASSIGNED;

  selectedDriver.currentRide = ride._id;

  await selectedDriver.save();

  return ride;
};

export default {
  assignDriver,
};