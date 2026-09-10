import { beforeEach, describe, expect, it, vi } from "vitest";

import dispatchService from "./dispatch.service.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Ride from "../models/Ride.js";
import routingService from "./routing.service.js";
import socketService from "./socket.service.js";
import { DRIVER_STATUS, RIDE_STATUS } from "../utils/constants.js";

vi.mock("../models/Driver.js", () => ({
    default: {
        find: vi.fn(),
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

const createPopulateQuery = (value) => ({
    populate: vi.fn().mockReturnThis(),
    then: (resolve) => Promise.resolve(value).then(resolve),
});

const createDriver = (overrides = {}) => ({
    _id: "driver-1",
    user: { toString: () => "user-1" },
    status: DRIVER_STATUS.AVAILABLE,
    currentRide: null,
    breakUntil: null,
    currentLocation: { latitude: 12.97, longitude: 77.59 },
    save: vi.fn().mockResolvedValue(undefined),
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
});

describe("dispatchService.assignDriver", () => {
    it("rejects when no available drivers exist", async () => {
        Driver.find.mockReturnValue(createPopulateQuery([]));

        await expect(
            dispatchService.assignDriver(createRequest())
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Vehicle.findOne).not.toHaveBeenCalled();
        expect(Ride.create).not.toHaveBeenCalled();
    });

    it("skips drivers without an active vehicle", async () => {
        const driver = createDriver();

        Driver.find.mockReturnValue(createPopulateQuery([driver]));
        Vehicle.findOne.mockResolvedValue(null);

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

        Driver.find.mockReturnValue(createPopulateQuery([driver]));
        Vehicle.findOne.mockResolvedValue(vehicle);

        await expect(
            dispatchService.assignDriver(
                createRequest({ groupSize: 2, luggageCount: 1 })
            )
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Ride.create).not.toHaveBeenCalled();
    });

    it("chooses the closest eligible driver", async () => {
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
        const ride = { _id: "ride-1" };
        const populatedRide = { _id: "ride-1", driver: nearerDriver };

        Driver.find.mockReturnValue(
            createPopulateQuery([fartherDriver, nearerDriver])
        );
        Vehicle.findOne.mockImplementation(async ({ driver }) =>
            driver === nearerDriver._id ? vehicle : null
        );
        routingService.getDrivingRoute.mockResolvedValue({
            distanceKm: 5.4,
            durationMinutes: 12,
        });
        Ride.create.mockResolvedValue(ride);
        Ride.findById.mockReturnValue(createPopulateQuery(populatedRide));

        const result = await dispatchService.assignDriver(createRequest());

        expect(Vehicle.findOne).toHaveBeenNthCalledWith(1, {
            driver: nearerDriver._id,
            isActive: true,
        });
        expect(Ride.create).toHaveBeenCalledWith(
            expect.objectContaining({
                rideRequest: "request-1",
                guests: ["guest-1"],
                driver: nearerDriver._id,
                vehicle: vehicle._id,
                estimatedDistance: 5.4,
                estimatedDuration: 12,
                status: RIDE_STATUS.ASSIGNED,
            })
        );
        expect(nearerDriver.status).toBe(DRIVER_STATUS.ASSIGNED);
        expect(nearerDriver.currentRide).toBe("ride-1");
        expect(nearerDriver.save).toHaveBeenCalledTimes(1);
        expect(socketService.emitRideAssigned).toHaveBeenCalledWith(
            "user-near",
            populatedRide
        );
        expect(socketService.emitDriverStatus).toHaveBeenCalledWith(
            "user-near",
            nearerDriver
        );
        expect(result).toBe(populatedRide);
    });

    it("continues assignment when routing fails and stores zero route metrics", async () => {
        const driver = createDriver();
        const vehicle = {
            _id: "vehicle-1",
            seatCapacity: 4,
            luggageCapacity: 4,
        };
        const ride = { _id: "ride-1" };
        const populatedRide = { _id: "ride-1" };

        Driver.find.mockReturnValue(createPopulateQuery([driver]));
        Vehicle.findOne.mockResolvedValue(vehicle);
        routingService.getDrivingRoute.mockRejectedValue(new Error("OSRM down"));
        Ride.create.mockResolvedValue(ride);
        Ride.findById.mockReturnValue(createPopulateQuery(populatedRide));

        const result = await dispatchService.assignDriver(createRequest());

        expect(Ride.create).toHaveBeenCalledWith(
            expect.objectContaining({
                estimatedDistance: 0,
                estimatedDuration: 0,
            })
        );
        expect(driver.status).toBe(DRIVER_STATUS.ASSIGNED);
        expect(result).toBe(populatedRide);
    });
});
