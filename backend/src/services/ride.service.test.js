import { beforeEach, describe, expect, it, vi } from "vitest";
import RideService from "./ride.service.js";
import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import Guest from "../models/Guest.js";
import RideRequest from "../models/RideRequest.js";
import routingService from "./routing.service.js";
import socketService from "./socket.service.js";
import { DRIVER_STATUS, RIDE_STATUS, ROLES } from "../utils/constants.js";

vi.mock("../models/Ride.js", () => ({
    default: {
        findById: vi.fn(),
    },
}));

vi.mock("../models/Driver.js", () => ({
    default: {
        findOne: vi.fn(),
        findById: vi.fn(),
    },
}));

vi.mock("../models/Guest.js", () => ({
    default: {
        findOne: vi.fn(),
    },
}));

vi.mock("../models/RideRequest.js", () => ({
    default: {
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock("./routing.service.js", () => ({
    default: {
        getDrivingRoute: vi.fn(),
    },
}));

vi.mock("./socket.service.js", () => ({
    default: {
        emitRideCompleted: vi.fn(),
        emitDriverStatus: vi.fn(),
        emitRideStatus: vi.fn(),
        emitRideAccepted: vi.fn(),
    },
}));

const createQuery = (value) => ({
    populate: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(value),
    sort: vi.fn().mockReturnThis(),
    then: (resolve) => Promise.resolve(value).then(resolve),
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("RideService.updateRideStatus", () => {
    it("rejects an unknown ride", async () => {
        Ride.findById.mockResolvedValue(null);

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.ARRIVED, "user-1", ROLES.DRIVER)
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("rejects a driver who does not own the ride", async () => {
        const driver = { _id: "driver-1" };
        const ride = { driver: { equals: vi.fn(() => false) } };

        Ride.findById.mockResolvedValue(ride);
        Driver.findOne.mockResolvedValue(driver);

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.ARRIVED, "user-1", ROLES.DRIVER)
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("requires an accepted assigned ride before arrival", async () => {
        const driver = { _id: "driver-1" };
        const ride = {
            driver: { equals: vi.fn(() => true) },
            status: RIDE_STATUS.ASSIGNED,
            acceptedAt: null,
        };

        Ride.findById.mockResolvedValue(ride);
        Driver.findOne.mockResolvedValue(driver);

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.ARRIVED, "user-1", ROLES.DRIVER)
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("records arrival for an accepted assigned ride", async () => {
        const driver = { _id: "driver-1", user: "user-1" };
        const ride = {
            _id: "ride-1",
            driver: { equals: vi.fn(() => true) },
            status: RIDE_STATUS.ASSIGNED,
            acceptedAt: new Date(),
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updatedRide = {
            _id: "ride-1",
            status: RIDE_STATUS.ARRIVED,
            driver: { user: "user-1" },
        };

        Ride.findById
            .mockResolvedValueOnce(ride)
            .mockReturnValueOnce(createQuery(updatedRide));
        Driver.findOne.mockResolvedValue(driver);

        const result = await RideService.updateRideStatus(
            "ride-1",
            RIDE_STATUS.ARRIVED,
            "user-1",
            ROLES.DRIVER
        );

        expect(ride.status).toBe(RIDE_STATUS.ARRIVED);
        expect(ride.arrivedAt).toBeInstanceOf(Date);
        expect(ride.save).toHaveBeenCalledTimes(1);
        expect(socketService.emitRideStatus).toHaveBeenCalledWith("user-1", updatedRide);
        expect(result).toBe(updatedRide);
    });

    it("enforces the arrived to picked-up transition", async () => {
        const ride = {
            status: RIDE_STATUS.ASSIGNED,
        };

        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.PICKED_UP, "user-1", ROLES.ADMIN)
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("records pickup only after arrival", async () => {
        const ride = {
            _id: "ride-1",
            status: RIDE_STATUS.ARRIVED,
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updatedRide = {
            _id: "ride-1",
            status: RIDE_STATUS.PICKED_UP,
            driver: { user: "user-1" },
        };

        Ride.findById
            .mockResolvedValueOnce(ride)
            .mockReturnValueOnce(createQuery(updatedRide));

        const result = await RideService.updateRideStatus(
            "ride-1",
            RIDE_STATUS.PICKED_UP,
            "user-1",
            ROLES.ADMIN
        );

        expect(ride.status).toBe(RIDE_STATUS.PICKED_UP);
        expect(ride.startedAt).toBeInstanceOf(Date);
        expect(ride.save).toHaveBeenCalledTimes(1);
        expect(socketService.emitRideStatus).toHaveBeenCalledWith("user-1", updatedRide);
        expect(result).toBe(updatedRide);
    });

    it("rejects completion before pickup", async () => {
        const ride = {
            status: RIDE_STATUS.ARRIVED,
        };

        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.COMPLETED, "user-1", ROLES.ADMIN)
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("completes a picked-up ride and frees its driver", async () => {
        const driver = {
            _id: "driver-1",
            user: "user-1",
            status: DRIVER_STATUS.BUSY,
            currentRide: "ride-1",
            save: vi.fn().mockResolvedValue(undefined),
        };
        const ride = {
            _id: "ride-1",
            driver: "driver-1",
            status: RIDE_STATUS.PICKED_UP,
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updatedRide = {
            _id: "ride-1",
            status: RIDE_STATUS.COMPLETED,
            driver: { user: "user-1" },
        };

        Ride.findById
            .mockResolvedValueOnce(ride)
            .mockReturnValueOnce(createQuery(updatedRide));
        Driver.findById.mockResolvedValue(driver);

        const result = await RideService.updateRideStatus(
            "ride-1",
            RIDE_STATUS.COMPLETED,
            "user-1",
            ROLES.ADMIN
        );

        expect(ride.status).toBe(RIDE_STATUS.COMPLETED);
        expect(ride.completedAt).toBeInstanceOf(Date);
        expect(driver.status).toBe(DRIVER_STATUS.AVAILABLE);
        expect(driver.currentRide).toBeNull();
        expect(driver.freeAt).toBeInstanceOf(Date);
        expect(driver.save).toHaveBeenCalledTimes(1);
        expect(socketService.emitRideCompleted).toHaveBeenCalledWith("user-1", updatedRide);
        expect(socketService.emitDriverStatus).toHaveBeenCalledWith("user-1", driver);
        expect(result).toBe(updatedRide);
    });

    it("rejects invalid status transitions", async () => {
        const ride = {
            status: RIDE_STATUS.ASSIGNED,
        };

        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.updateRideStatus("ride-1", "INVALID", "user-1", ROLES.ADMIN)
        ).rejects.toMatchObject({ statusCode: 400 });
    });
});

describe("RideService.acknowledgeRide", () => {
    it("requires the ride to belong to the driver", async () => {
        const driver = { _id: "driver-1" };
        const ride = { driver: { equals: vi.fn(() => false) } };

        Driver.findOne.mockResolvedValue(driver);
        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.acknowledgeRide("ride-1", "user-1")
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("sets acceptedAt and emits acceptance for an assigned ride", async () => {
        const driver = { _id: "driver-1", user: "user-1" };
        const ride = {
            driver: { equals: vi.fn(() => true) },
            status: RIDE_STATUS.ASSIGNED,
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updatedRide = { _id: "ride-1" };

        Driver.findOne.mockResolvedValue(driver);
        Ride.findById
            .mockResolvedValueOnce(ride)
            .mockReturnValueOnce(createQuery(updatedRide));

        const result = await RideService.acknowledgeRide("ride-1", "user-1");

        expect(ride.acceptedAt).toBeInstanceOf(Date);
        expect(ride.save).toHaveBeenCalledTimes(1);
        expect(socketService.emitRideAccepted).toHaveBeenCalledWith("user-1", updatedRide);
        expect(result).toBe(updatedRide);
    });
});

describe("RideService.cancelGuestRide", () => {
    it("requires a cancellation reason after loading guest data", async () => {
        Guest.findOne.mockResolvedValue({ _id: "guest-1" });

        await expect(
            RideService.cancelGuestRide("user-1", "ride-1", "")
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Guest.findOne).toHaveBeenCalledWith({ user: "user-1" });
        expect(Ride.findById).not.toHaveBeenCalled();
    });

    it("rejects cancellation for a guest who is not on the ride", async () => {
        const guest = { _id: "guest-1" };
        const ride = {
            guests: [{ equals: vi.fn(() => false) }],
        };

        Guest.findOne.mockResolvedValue(guest);
        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.cancelGuestRide("user-1", "ride-1", "Change of plans")
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("rejects cancellation once a ride is completed", async () => {
        const guest = { _id: "guest-1" };
        const ride = {
            guests: [{ equals: vi.fn(() => true) }],
            status: RIDE_STATUS.COMPLETED,
        };

        Guest.findOne.mockResolvedValue(guest);
        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.cancelGuestRide("user-1", "ride-1", "Change of plans")
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("cancels an active guest ride and frees the driver", async () => {
        const guest = { _id: "guest-1" };
        const driver = {
            status: DRIVER_STATUS.AVAILABLE,
            currentRide: "ride-1",
            save: vi.fn().mockResolvedValue(undefined),
        };
        const ride = {
            _id: "ride-1",
            guests: [{ equals: vi.fn(() => true) }],
            status: RIDE_STATUS.ASSIGNED,
            rideRequest: "request-1",
            driver: "driver-1",
            save: vi.fn().mockResolvedValue(undefined),
        };

        Guest.findOne.mockResolvedValue(guest);
        Ride.findById.mockImplementationOnce(() => Promise.resolve(ride)).mockReturnValueOnce(createQuery(ride));
        Driver.findById.mockResolvedValue(driver);
        RideRequest.findByIdAndUpdate.mockResolvedValue(undefined);

        const result = await RideService.cancelGuestRide("user-1", "ride-1", " Change of plans ");

        expect(ride.status).toBe(RIDE_STATUS.CANCELLED);
        expect(ride.cancelReason).toBe("Change of plans");
        expect(ride.cancelledBy).toBe("GUEST");
        expect(ride.cancelledAt).toBeInstanceOf(Date);
        expect(RideRequest.findByIdAndUpdate).toHaveBeenCalledWith(
            "request-1",
            expect.objectContaining({
                status: "CANCELLED",
                cancellationReason: "Change of plans",
                cancelledBy: "GUEST",
            })
        );
        expect(driver.status).toBe(DRIVER_STATUS.AVAILABLE);
        expect(driver.currentRide).toBeNull();
        expect(driver.freeAt).toBeInstanceOf(Date);
        expect(driver.save).toHaveBeenCalledTimes(1);
        expect(result).toBe(ride);
    });
});

describe("RideService.declineRide", () => {
    it("requires a decline reason", async () => {
        await expect(
            RideService.declineRide("user-1", "ride-1", "")
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Driver.findOne).not.toHaveBeenCalled();
    });

    it("rejects a ride that has already been accepted", async () => {
        const driver = { _id: "driver-1" };
        const ride = {
            driver: { equals: vi.fn(() => true) },
            status: RIDE_STATUS.ASSIGNED,
            acceptedAt: new Date(),
        };

        Driver.findOne.mockResolvedValue(driver);
        Ride.findById.mockResolvedValue(ride);

        await expect(
            RideService.declineRide("user-1", "ride-1", "Cannot take this ride")
        ).rejects.toMatchObject({ statusCode: 400 });
    });
});

describe("RideService.getRideRoute", () => {
    const ride = {
        _id: "ride-1",
        driver: { user: "driver-user" },
        guests: [{ user: "guest-user" }],
    };
    const from = { latitude: 12.9, longitude: 77.6 };
    const to = { latitude: 13.0, longitude: 77.7 };
    const route = { distanceKm: 12.3, durationMinutes: 14, geometry: [[12.9, 77.6]] };

    it("rejects users who are not associated with the ride", async () => {
        Ride.findById.mockReturnValue(createQuery(ride));

        await expect(
            RideService.getRideRoute("ride-1", "other-user", ROLES.GUEST, from, to)
        ).rejects.toMatchObject({ statusCode: 403 });
        expect(routingService.getDrivingRoute).not.toHaveBeenCalled();
    });

    it("allows an admin and returns the routed metrics", async () => {
        Ride.findById.mockReturnValue(createQuery(ride));
        routingService.getDrivingRoute.mockResolvedValue(route);

        await expect(
            RideService.getRideRoute("ride-1", "admin-user", ROLES.ADMIN, from, to)
        ).resolves.toEqual({ rideId: "ride-1", ...route });
        expect(routingService.getDrivingRoute).toHaveBeenCalledWith(from, to);
    });

    it("allows the assigned driver", async () => {
        Ride.findById.mockReturnValue(createQuery(ride));
        routingService.getDrivingRoute.mockResolvedValue(route);

        await expect(
            RideService.getRideRoute("ride-1", "driver-user", ROLES.DRIVER, from, to)
        ).resolves.toEqual({ rideId: "ride-1", ...route });
    });

    it("allows a guest listed on the ride", async () => {
        Ride.findById.mockReturnValue(createQuery(ride));
        routingService.getDrivingRoute.mockResolvedValue(route);

        await expect(
            RideService.getRideRoute("ride-1", "guest-user", ROLES.GUEST, from, to)
        ).resolves.toEqual({ rideId: "ride-1", ...route });
    });
});
