import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import { hashPassword } from "../utils/hash.js";
import { ROLES, DRIVER_STATUS } from "../utils/constants.js";

export const seedDrivers = async () => {
  const email = "rahul.driver@smartcab.com";

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName: "Rahul Sharma",
      email,
      password: await hashPassword("Driver123"),
      role: ROLES.DRIVER,
      phone: "9999999999",
      authProvider: "LOCAL",
      isActive: true,
    });
  }

  user.role = ROLES.DRIVER;
  user.isActive = true;
  await user.save();

  let driver = await Driver.findOne({ user: user._id });

  if (!driver) {
    driver = await Driver.create({
      user: user._id,
      status: DRIVER_STATUS.AVAILABLE,
      currentLocation: {
        latitude: 26.1445,
        longitude: 91.7362,
      },
    });
  }

  let vehicle = await Vehicle.findOne({ driver: driver._id });

  if (!vehicle) {
    vehicle = await Vehicle.create({
      driver: driver._id,
      vehicleNumber: "JH10AB1234",
      model: "Toyota Innova",
      seatCapacity: 6,
      luggageCapacity: 4,
    });
  }

  console.log(
    `ℹ️ Demo Driver Ready (${user.email})`
  );

  return { user, driver, vehicle };
};
