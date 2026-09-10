import { beforeEach, describe, expect, it, vi } from "vitest";

import DriverService from "./driver.service.js";
import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import { DRIVER_STATUS, ROLES } from "../utils/constants.js";
import socketService from "./socket.service.js";

vi.mock("../models/User.js", () => ({
    default: {
        findOne: vi.fn(),
        findById: vi.fn(),
        findByIdAndDelete: vi.fn(),
        create: vi.fn(),
    },
}));

vi.mock("../models/Driver.js", () => ({
    default: {
        create: vi.fn(),
        findOne: vi.fn(),
        find: vi.fn(),
        findById: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
}));

vi.mock("../models/Vehicle.js", () => ({
    default: {
        create: vi.fn(),
        findOne: vi.fn(),
        find: vi.fn(),
        deleteOne: vi.fn(),
    },
}));

vi.mock("../utils/hash.js", () => ({
    hashPassword: vi.fn(async () => "hashed-password"),
}));

vi.mock("./socket.service.js", () => ({
    default: {
        emitDriverStatus: vi.fn(),
    },
}));

const createQuery = (value) => ({
    populate: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(value),
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("DriverService.createDriver", () => {
    it("rejects an existing driver email", async () => {
        User.findOne.mockResolvedValue({ _id: "user-1" });

        await expect(
            DriverService.createDriver({
                fullName: "Driver",
                email: "driver@example.com",
                password: "secret",
            })
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(User.create).not.toHaveBeenCalled();
    });

    it("creates the user, driver, and vehicle with the driver role", async () => {
        const user = { _id: "user-1", fullName: "Driver", email: "driver@example.com", phone: "123", role: ROLES.DRIVER };
        const driver = { _id: "driver-1", user: "user-1" };
        const vehicle = { _id: "vehicle-1", driver: "driver-1" };

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(user);
        Driver.create.mockResolvedValue(driver);
        Vehicle.create.mockResolvedValue(vehicle);

        const result = await DriverService.createDriver({
            fullName: "Driver",
            email: "driver@example.com",
            password: "secret",
            phone: "123",
            vehicleNumber: "KA01AB1234",
            model: "Sedan",
            seatCapacity: 4,
            luggageCapacity: 2,
        });

        expect(User.create).toHaveBeenCalledWith({
            fullName: "Driver",
            email: "driver@example.com",
            password: "hashed-password",
            phone: "123",
            role: ROLES.DRIVER,
        });
        expect(Driver.create).toHaveBeenCalledWith({ user: "user-1" });
        expect(Vehicle.create).toHaveBeenCalledWith({
            driver: "driver-1",
            vehicleNumber: "KA01AB1234",
            model: "Sedan",
            seatCapacity: 4,
            luggageCapacity: 2,
        });
        expect(result.driver).toBe(driver);
        expect(result.vehicle).toBe(vehicle);
    });
});

describe("DriverService.getMyProfile", () => {
    it("rejects when the driver profile does not exist", async () => {
        Driver.findOne.mockReturnValue(createQuery(null));

        await expect(DriverService.getMyProfile("user-1")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("returns the driver profile and optional vehicle", async () => {
        const driver = { _id: "driver-1", user: { _id: "user-1" } };
        const vehicle = { _id: "vehicle-1", driver: "driver-1" };

        Driver.findOne.mockReturnValue(createQuery(driver));
        Vehicle.findOne.mockReturnValue(createQuery(vehicle));

        const result = await DriverService.getMyProfile("user-1");

        expect(result).toEqual({ driver, user: driver.user, vehicle });
    });
});

describe("DriverService.updateDriverStatus", () => {
    it("rejects an invalid status", async () => {
        const driver = { _id: "driver-1", user: "user-1", save: vi.fn() };
        Driver.findById.mockResolvedValue(driver);

        await expect(DriverService.updateDriverStatus("driver-1", "INVALID")).rejects.toMatchObject({
            statusCode: 400,
        });
        expect(driver.save).not.toHaveBeenCalled();
    });

    it("prevents going offline during an assigned ride", async () => {
        const driver = { _id: "driver-1", currentRide: "ride-1", save: vi.fn() };
        Driver.findById.mockResolvedValue(driver);

        await expect(
            DriverService.updateDriverStatus("driver-1", DRIVER_STATUS.OFFLINE)
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(driver.save).not.toHaveBeenCalled();
    });

    it("clears breakUntil when leaving break and emits the new status", async () => {
        const driver = {
            _id: "driver-1",
            user: "user-1",
            status: DRIVER_STATUS.ON_BREAK,
            breakUntil: new Date(),
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updated = { _id: "driver-1", status: DRIVER_STATUS.AVAILABLE };

        Driver.findById.mockResolvedValueOnce(driver).mockReturnValueOnce({
            populate: vi.fn().mockResolvedValue(updated),
        });

        const result = await DriverService.updateDriverStatus("driver-1", DRIVER_STATUS.AVAILABLE);

        expect(driver.status).toBe(DRIVER_STATUS.AVAILABLE);
        expect(driver.breakUntil).toBeNull();
        expect(driver.save).toHaveBeenCalledTimes(1);
        expect(socketService.emitDriverStatus).toHaveBeenCalledWith("user-1", driver);
        expect(result).toEqual(updated);
        expect(Driver.findById).toHaveBeenLastCalledWith("driver-1");
    });
});

describe("DriverService.deleteDriver", () => {
    it("rejects an unknown driver", async () => {
        Driver.findById.mockResolvedValue(null);

        await expect(DriverService.deleteDriver("driver-1")).rejects.toMatchObject({ statusCode: 404 });
        expect(Vehicle.deleteOne).not.toHaveBeenCalled();
    });

    it("deletes the vehicle, user, and driver", async () => {
        const driver = { _id: "driver-1", user: "user-1" };
        Driver.findById.mockResolvedValue(driver);
        Vehicle.deleteOne.mockResolvedValue({ acknowledged: true });
        User.findByIdAndDelete.mockResolvedValue({ _id: "user-1" });
        Driver.findByIdAndDelete.mockResolvedValue({ _id: "driver-1" });

        const result = await DriverService.deleteDriver("driver-1");

        expect(Vehicle.deleteOne).toHaveBeenCalledWith({ driver: "driver-1" });
        expect(User.findByIdAndDelete).toHaveBeenCalledWith("user-1");
        expect(Driver.findByIdAndDelete).toHaveBeenCalledWith("driver-1");
        expect(result).toBe(true);
    });
});
