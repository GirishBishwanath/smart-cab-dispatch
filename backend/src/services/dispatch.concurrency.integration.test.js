import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";

import Driver from "../models/Driver.js";
import Guest from "../models/Guest.js";
import Ride from "../models/Ride.js";
import RideRequest from "../models/RideRequest.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { DRIVER_STATUS, ROLES } from "../utils/constants.js";

import dispatchService from "../services/dispatch.service.js";
import routingService from "../services/routing.service.js";
import socketService from "../services/socket.service.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("MONGO_URI is required for integration tests");
}

describe("dispatch concurrency integration", () => {
    beforeAll(async () => {
        await mongoose.connect(MONGO_URI);

        await Promise.all([
            User.init(),
            Guest.init(),
            Driver.init(),
            Vehicle.init(),
            Ride.init(),
            RideRequest.init(),
        ]);
    });

    beforeEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    });

    it("allows only one concurrent approval to reserve the same driver", async () => {
        const routeSpy = vi
            .spyOn(routingService, "getDrivingRoute")
            .mockResolvedValue({
                distanceKm: 5,
                durationMinutes: 12,
                geometry: [],
            });
        const assignedSpy = vi
            .spyOn(socketService, "emitRideAssigned")
            .mockImplementation(() => {});
        const statusSpy = vi
            .spyOn(socketService, "emitDriverStatus")
            .mockImplementation(() => {});

        try {
            const driverUser = await User.create({
                fullName: "Integration Driver",
                email: "integration-driver@example.com",
                password: "test-password",
                role: ROLES.DRIVER,
            });

            const driver = await Driver.create({
                user: driverUser._id,
                status: DRIVER_STATUS.AVAILABLE,
                currentLocation: {
                    latitude: 23.1,
                    longitude: 79.9,
                },
            });

            await Vehicle.create({
                driver: driver._id,
                vehicleNumber: "TEST-001",
                model: "Integration",
                seatCapacity: 4,
                luggageCapacity: 4,
                isActive: true,
            });

            const guestUsers = await User.create([
                {
                    fullName: "Guest One",
                    email: "guest-one@example.com",
                    password: "test-password",
                    role: ROLES.GUEST,
                },
                {
                    fullName: "Guest Two",
                    email: "guest-two@example.com",
                    password: "test-password",
                    role: ROLES.GUEST,
                },
            ]);

            const guests = await Guest.create(
                guestUsers.map((user) => ({
                    user: user._id,
                    groupSize: 1,
                    luggageCount: 1,
                }))
            );

            const requests = await RideRequest.create(
                guests.map((guest) => ({
                    guest: guest._id,
                    pickupLocation: {
                        name: "Pickup",
                        latitude: 23.11,
                        longitude: 79.91,
                    },
                    dropLocation: {
                        name: "Drop",
                        latitude: 23.12,
                        longitude: 79.92,
                    },
                    groupSize: 1,
                    luggageCount: 1,
                    tripType: "ON_DEMAND",
                    status: "PENDING",
                }))
            );

            const results = await Promise.allSettled(
                requests.map((request) =>
                    dispatchService.assignDriver(request)
                )
            );

            expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
            expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);

            const rides = await Ride.find({});
            expect(rides).toHaveLength(1);
            expect(String(rides[0].driver)).toBe(String(driver._id));

            const persistedDriver = await Driver.findById(driver._id).lean();
            expect(persistedDriver.status).toBe(DRIVER_STATUS.ASSIGNED);
            expect(String(persistedDriver.currentRide)).toBe(String(rides[0]._id));

            expect(assignedSpy).toHaveBeenCalledTimes(1);
            expect(statusSpy).toHaveBeenCalledTimes(1);
        } finally {
            routeSpy.mockRestore();
            assignedSpy.mockRestore();
            statusSpy.mockRestore();
        }
    }, 30_000);
});
