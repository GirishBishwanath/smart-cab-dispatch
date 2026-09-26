import User from "../models/User.js";
import Guest from "../models/Guest.js";
import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../utils/constants.js";

export const seedGuests = async () => {
  const email = "girish@smartcab.com";

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName: "Girish",
      email,
      password: await hashPassword("Guest123"),
      role: ROLES.GUEST,
      phone: "9876543210",
      authProvider: "LOCAL",
      isActive: true,
    });
  }

  user.role = ROLES.GUEST;
  user.isActive = true;
  await user.save();

  let guest = await Guest.findOne({ user: user._id });

  if (!guest) {
    guest = await Guest.create({
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
  }

  console.log(
    `ℹ️ Demo Guest Ready (${user.email})`
  );

  return { user, guest };
};
