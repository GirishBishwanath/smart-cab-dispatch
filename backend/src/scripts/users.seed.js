import User from "../models/User.js";
import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../utils/constants.js";

export const seedUsers = async () => {
  const adminExists = await User.findOne({
    email: "admin@smartcab.com",
  });

  if (!adminExists) {
    await User.create({
      fullName: "System Administrator",
      email: "admin@smartcab.com",
      password: await hashPassword("Admin123"),
      role: ROLES.ADMIN,
      phone: "9999999999",
    });

    console.log("✅ Admin Seeded");
  } else {
    console.log("ℹ️ Admin Already Exists");
  }
};