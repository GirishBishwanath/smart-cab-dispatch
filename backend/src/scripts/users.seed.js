import User from "../models/User.js";
import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../utils/constants.js";

const DEMO_USERS = [
  {
    fullName: "System Administrator",
    email: "admin@smartcab.com",
    password: "Admin123",
    role: ROLES.ADMIN,
    phone: "9999999999",
  },
  {
    fullName: "Rahul Sharma",
    email: "rahul.driver@smartcab.com",
    password: "Driver123",
    role: ROLES.DRIVER,
    phone: "9999999999",
  },
  {
    fullName: "Girish",
    email: "girish@smartcab.com",
    password: "Guest123",
    role: ROLES.GUEST,
    phone: "9876543210",
  },
];

export const seedUsers = async () => {
  for (const demoUser of DEMO_USERS) {
    const password = await hashPassword(demoUser.password);

    const existingUser = await User.findOne({
      email: demoUser.email,
    });

    if (existingUser) {
      existingUser.fullName = demoUser.fullName;
      existingUser.role = demoUser.role;
      existingUser.phone = demoUser.phone;
      existingUser.password = password;
      existingUser.isActive = true;
      existingUser.authProvider = "LOCAL";
      existingUser.googleId = undefined;
      await existingUser.save();

      console.log(`ℹ️ Demo User Repaired (${demoUser.email})`);
      continue;
    }

    await User.create({
      fullName: demoUser.fullName,
      email: demoUser.email,
      password,
      role: demoUser.role,
      phone: demoUser.phone,
      authProvider: "LOCAL",
      isActive: true,
    });

    console.log(`✅ Demo User Seeded (${demoUser.email})`);
  }
};
