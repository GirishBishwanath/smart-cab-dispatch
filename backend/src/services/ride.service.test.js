import { beforeEach, describe, expect, it, vi } from "vitest";
import RideService from "./ride.service.js";
import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import Guest from "../models/Guest.js";
import RideRequest from "../models/RideRequest.js";
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
        const driver = { _id: "driver-1" };
        const ride = {
            _id: "ride-1",
            driver: { equals: vi.fn(() => true) },
            status: RIDE_STATUS.ASSIGNED,
            acceptedAt: new Date(),
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updatedRide = { _id: "ride-1", status: RIDE_STATUS.ARRIVED };

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
        const updatedRide = { _id: "ride-1", status: RIDE_STATUS.PICKED_UP };

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
            status: DRIVER_STATUS.AVAILABLE,
            currentRide: "ride-1",
            save: vi.fn().mockResolvedValue(undefined),
        };
        const ride = {
            _id: "ride-1",
            driver: "driver-1",
            status: RIDE_STATUS.PICKED_UP,
            save: vi.fn().mockResolvedValue(undefined),
        };
        const updatedRide = { _id: "ride-1", status: RIDE_STATUS.COMPLETED };

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
    it("requires a cancellation reason before loading guest data", async () => {
        await expect(
            RideService.cancelGuestRide("user-1", "ride-1", "")
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(Guest.findOne).not.toHaveBeenCalled();
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
        Ride.findById.mockResolvedValue(ride);
        Driver.findById.mockResolvedValue(driver);
        RideRequest.findByIdAndUpdate.mockResolvedValue(undefined);
        Ride.findById.mockImplementationOnce(() => Promise.resolve(ride)).mockReturnValueOnce(createQuery(ride));

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
