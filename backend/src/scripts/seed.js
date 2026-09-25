import connectDB from "../config/db.js";

import { seedUsers } from "./users.seed.js";
import { seedDrivers } from "./drivers.seed.js";
import { seedGuests } from "./guests.seed.js";
import { seedRides } from "./rides.seed.js";

export const seedDatabase = async () => {
  console.log("🌱 Starting Database Seed");

  await seedUsers();
  await seedDrivers();
  await seedGuests();
  await seedRides();

  console.log("✅ Database Seed Completed");
};

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[1]?.endsWith("seed.js")) {
  run();
}
