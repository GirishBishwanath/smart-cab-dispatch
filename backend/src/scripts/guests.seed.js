import User from "../models/User.js";
import Guest from "../models/Guest.js";
import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../utils/constants.js";

export const seedGuests = async () => {
  const email = "girish@smartcab.com";

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log("ℹ️ Demo Guest Already Exists");
    return;
  }

  const user = await User.create({
    fullName: "Girish",
    email,
    password: await hashPassword("Guest123"),
    role: ROLES.GUEST,
    phone: "9876543210",
  });

  await Guest.create({
    user: user._id,
    accommodation: "Hotel Taj",
    pickupLocation: {
      name: "Hotel Taj",
      latitude: 26.1512,
      longitude: 91.7461,
    },
    dropLocation: {
      name: "Airport",
      latitude: 26.1061,
      longitude: 91.5859,
    },
    groupSize: 3,
    luggageCount: 2,
  });

  console.log("✅ Demo Guest Seeded (girish@smartcab.com)");
};