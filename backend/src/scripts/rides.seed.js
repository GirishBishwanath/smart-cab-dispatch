import User from "../models/User.js";
import Guest from "../models/Guest.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import RideRequest from "../models/RideRequest.js";
import Ride from "../models/Ride.js";
import { DRIVER_STATUS, RIDE_STATUS } from "../utils/constants.js";

export const seedRides = async () => {
  const guestUser = await User.findOne({ email: "girish@smartcab.com" });
  const driverUser = await User.findOne({ email: "rahul.driver@smartcab.com" });

  if (!guestUser || !driverUser) {
    console.log("⏭ Ride Seeder Skipped — demo guest/driver not seeded yet");
    return;
  }

  const guest = await Guest.findOne({ user: guestUser._id });
  const driver = await Driver.findOne({ user: driverUser._id });
  const vehicle = await Vehicle.findOne({ driver: driver._id });

  const existingRequest = await RideRequest.findOne({ guest: guest._id });

  if (existingRequest) {
    console.log("ℹ️ Demo Ride Already Exists");
    return;
  }

  const rideRequest = await RideRequest.create({
    guest: guest._id,
    pickupLocation: guest.pickupLocation,
    dropLocation: guest.dropLocation,
    groupSize: guest.groupSize,
    luggageCount: guest.luggageCount,
    tripType: "ON_DEMAND",
    status: "APPROVED",
    approvedBy: driverUser._id,
    approvedAt: new Date(),
  });

  const ride = await Ride.create({
    guests: [guest._id],
    driver: driver._id,
    vehicle: vehicle._id,
    rideRequest: rideRequest._id,
    tripType: "ON_DEMAND",
    pickupLocation: guest.pickupLocation,
    dropLocation: guest.dropLocation,
    status: RIDE_STATUS.ASSIGNED,
    assignedAt: new Date(),
  });

  rideRequest.ride = ride._id;
  await rideRequest.save();

  driver.status = DRIVER_STATUS.ASSIGNED;
  driver.currentRide = ride._id;
  await driver.save();

  console.log("✅ Demo Ride Seeded (Hotel Taj → Airport, ASSIGNED)");
};