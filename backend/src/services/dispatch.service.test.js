import { beforeEach, describe, expect, it, vi } from "vitest";

import { startSession } from "mongoose";
import dispatchService from "./dispatch.service.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Ride from "../models/Ride.js";
import routingService from "./routing.service.js";
import socketService from "./socket.service.js";
import { DRIVER_STATUS, RIDE_STATUS } from "../utils/constants.js";

vi.mock("mongoose", () => ({
    startSession: vi.fn(),
}));

vi.mock("../models/Driver.js", () => ({
    default: {
        find: vi.fn(),
        findOneAndUpdate: vi.fn(),
    },
}));

vi.mock("../models/Vehicle.js", () => ({
    default: {
        findOne: vi.fn(),
    },
}));

vi.mock("../models/Ride.js", () => ({
    default: {
        create: vi.fn(),
        findById: vi.fn(),
        findOne: vi.fn(),
    },
}));

vi.mock("./routing.service.js", () => ({
    default: {
        getDrivingRoute: vi.fn(),
    },
}));

vi.mock("./socket.service.js", () => ({
    default: {
        emitRideAssigned: vi.fn(),
        emitDriverStatus: vi.fn(),
    },
}));

const createQuery = (value) => ({
    session: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    then: (resolve) => Promise.resolve(value).then(resolve),
});

const createSession = () => ({
    withTransaction: vi.fn(async (callback) => callback()),
    endSession: vi.fn().mockResolvedValue(undefined),
});

const createDriver = (overrides = {}) => ({
    _id: "driver-1",
    user: { toString: () => "user-1" },
    status: DRIVER_STATUS.AVAILABLE,
    currentRide: null,
    breakUntil: null,
    currentLocation: { latitude: 12.97, longitude: 77.59 },
    ...overrides,
});

const createRequest = (overrides = {}) => ({
    _id: "request-1",
    guest: "guest-1",
    pickupLocation: { latitude: 12.98, longitude: 77.60 },
    dropLocation: { latitude: 12.99, longitude: 77.61 },
    groupSize: 2,
    luggageCount: 1,
    tripType: "ON_DEMAND",
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
    startSession.mockResolvedValue(createSession());
});

describe("dispatchService.assignDriver", () => {
    it("rejects when no available drivers exist", async () => {
        Driver.find.mockReturnValue(createQuery([]));

        await expect(
            dispatchService.assignDriver(createRequest())
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Vehicle.findOne).not.toHaveBeenCalled();
        expect(Ride.create).not.toHaveBeenCalled();
    });

    it("skips drivers without an active vehicle", async () => {
        const driver = createDriver();

        Driver.find.mockReturnValue(createQuery([driver]));
        Vehicle.findOne.mockReturnValue(createQuery(null));

        await expect(
            dispatchService.assignDriver(createRequest())
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Vehicle.findOne).toHaveBeenCalledWith({
            driver: driver._id,
            isActive: true,
        });
    });

    it("rejects when no vehicle satisfies passenger or luggage capacity", async () => {
        const driver = createDriver();
        const vehicle = {
            _id: "vehicle-1",
            seatCapacity: 1,
            luggageCapacity: 1,
        };

        Driver.find.mockReturnValue(createQuery([driver]));
        Vehicle.findOne.mockReturnValue(createQuery(vehicle));

        await expect(
            dispatchService.assignDriver(
                createRequest({ groupSize: 2, luggageCount: 1 })
            )
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Ride.create).not.toHaveBeenCalled();
    });

    it("atomically reserves the closest eligible driver before creating the ride", async () => {
        const fartherDriver = createDriver({
            _id: "driver-far",
            user: { toString: () => "user-far" },
            currentLocation: { latitude: 13.1, longitude: 77.7 },
        });
        const nearerDriver = createDriver({
            _id: "driver-near",
            user: { toString: () => "user-near" },
            currentLocation: { latitude: 12.98, longitude: 77.60 },
        });
        const vehicle = {
            _id: "vehicle-near",
            seatCapacity: 4,
            luggageCapacity: 4,
        };
        const reservedDriver = {
            ...nearerDriver,
            status: DRIVER_STATUS.ASSIGNED,
        };
        const ride = { _id: "ride-1" };
        const populatedRide = { _id: "ride-1", driver: reservedDriver };

        Driver.find.mockReturnValue(
            createQuery([fartherDriver, nearerDriver])
        );
        Vehicle.findOne.mockImplementation(({ driver }) =>
            createQuery(driver === nearerDriver._id ? vehicle : null)
        );
        routingService.getDrivingRoute.mockResolvedValue({
            distanceKm: 5.4,
            durationMinutes: 12,
        });
        Driver.findOneAndUpdate
            .mockResolvedValueOnce(reservedDriver)
            .mockResolvedValueOnce(reservedDriver);
        Ride.create.mockResolvedValue([ride]);
        Ride.findById.mockReturnValue(createQuery(populatedRide));

        const result = await dispatchService.assignDriver(createRequest());

        expect(Driver.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: nearerDriver._id,
                status: DRIVER_STATUS.AVAILABLE,
                currentRide: null,
            }),
            { $set: { status: DRIVER_STATUS.ASSIGNED } },
            expect.objectContaining({ new: true, session: expect.anything() })
        );
        expect(Ride.create).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    rideRequest: "request-1",
                    guests: ["guest-1"],
                    driver: nearerDriver._id,
                    vehicle: vehicle._id,
                    estimatedDistance: 5.4,
                    estimatedDuration: 12,
                    status: RIDE_STATUS.ASSIGNED,
                }),
            ],
            expect.objectContaining({ session: expect.anything() })
        );
        expect(result).toBe(populatedRide);
        expect(socketService.emitRideAssigned).toHaveBeenCalledWith(
            "user-near",
            populatedRide
        );
    });

    it("does not assign a driver that loses the atomic reservation race", async () => {
        const driver = createDriver();
        const vehicle = {
            _id: "vehicle-1",
            seatCapacity: 4,
            luggageCapacity: 4,
        };

        Driver.find.mockReturnValue(createQuery([driver]));
        Vehicle.findOne.mockReturnValue(createQuery(vehicle));
        routingService.getDrivingRoute.mockResolvedValue({
            distanceKm: 5,
            durationMinutes: 10,
        });
        Driver.findOneAndUpdate.mockResolvedValue(null);

        await expect(
            dispatchService.assignDriver(createRequest())
        ).rejects.toMatchObject({
            statusCode: 400,
            message: "No driver could be reserved",
        });
        expect(Ride.create).not.toHaveBeenCalled();
    });

    it("continues assignment when routing fails and stores zero route metrics", async () => {
        const driver = createDriver();
        const vehicle = {
            _id: "vehicle-1",
            seatCapacity: 4,
            luggageCapacity: 4,
        };
        const reservedDriver = {
            ...driver,
            status: DRIVER_STATUS.ASSIGNED,
        };
        const ride = { _id: "ride-1" };
        const populatedRide = { _id: "ride-1", driver: reservedDriver };

        Driver.find.mockReturnValue(createQuery([driver]));
        Vehicle.findOne.mockReturnValue(createQuery(vehicle));
        routingService.getDrivingRoute.mockRejectedValue(new Error("OSRM down"));
        Driver.findOneAndUpdate.mockResolvedValue(reservedDriver);
        Ride.create.mockResolvedValue([ride]);
        Ride.findById.mockReturnValue(createQuery(populatedRide));

        const result = await dispatchService.assignDriver(createRequest());

        expect(Ride.create).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    estimatedDistance: 0,
                    estimatedDuration: 0,
                }),
            ],
            expect.objectContaining({ session: expect.anything() })
        );
        expect(result).toBe(populatedRide);
    });

    it("returns the existing ride when a concurrent approval hits the unique ride constraint", async () => {
        const driver = createDriver();
        const vehicle = {
            _id: "vehicle-1",
            seatCapacity: 4,
            luggageCapacity: 4,
        };
        const existingRide = { _id: "ride-existing", driver };

        Driver.find.mockReturnValue(createQuery([driver]));
        Vehicle.findOne.mockReturnValue(createQuery(vehicle));
        routingService.getDrivingRoute.mockResolvedValue({
            distanceKm: 5,
            durationMinutes: 10,
        });
        const duplicateError = {
            code: 11000,
            keyPattern: { rideRequest: 1 },
        };
        const session = createSession();
        session.withTransaction.mockRejectedValue(duplicateError);
        startSession.mockResolvedValue(session);
        Ride.findOne.mockReturnValue(createQuery(existingRide));

        const result = await dispatchService.assignDriver(createRequest());

        expect(result).toBe(existingRide);
        expect(Ride.findOne).toHaveBeenCalledWith({ rideRequest: "request-1" });
    });
});
