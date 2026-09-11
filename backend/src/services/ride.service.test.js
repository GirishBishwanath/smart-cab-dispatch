import { beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import RideService from "./ride.service.js";
import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import Guest from "../models/Guest.js";
import RideRequest from "../models/RideRequest.js";
import routingService from "./routing.service.js";
import socketService from "./socket.service.js";
import { DRIVER_STATUS, RIDE_STATUS, ROLES } from "../utils/constants.js";

vi.mock("mongoose", () => ({
    default: {
        startSession: vi.fn(),
    },
}));

vi.mock("../models/Ride.js", () => ({
    default: {
        findById: vi.fn(),
        findOneAndUpdate: vi.fn(),
    },
}));

vi.mock("../models/Driver.js", () => ({
    default: {
        findOne: vi.fn(),
        findById: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findByIdAndUpdate: vi.fn(),
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
        findOneAndUpdate: vi.fn(),
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
    session: vi.fn().mockReturnThis(),
    then: (resolve) => Promise.resolve(value).then(resolve),
});

const createSession = () => ({
    withTransaction: vi.fn(async (callback) => callback()),
    endSession: vi.fn().mockResolvedValue(undefined),
});

const ACTIVE_RIDE_STATUSES = [
    RIDE_STATUS.ASSIGNED,
    RIDE_STATUS.ARRIVED,
    RIDE_STATUS.PICKED_UP,
];

beforeEach(() => {
    vi.clearAllMocks();
    mongoose.startSession.mockResolvedValue(createSession());
});

describe("RideService.updateRideStatus", () => {
    it("rejects an invalid target status before opening a transaction", async () => {
        await expect(
            RideService.updateRideStatus("ride-1", "INVALID", "user-1", ROLES.ADMIN)
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(mongoose.startSession).not.toHaveBeenCalled();
    });

    it("rejects an unknown ride", async () => {
        Ride.findOneAndUpdate.mockReturnValue(createQuery(null));
        Ride.findById.mockReturnValue(createQuery(null));

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.ARRIVED, "user-1", ROLES.DRIVER)
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("atomically records arrival only from an accepted assigned ride", async () => {
        const session = createSession();
        const updatedRide = {
            _id: "ride-1",
            status: RIDE_STATUS.ARRIVED,
            acceptedAt: new Date(),
            driver: { user: "user-1" },
        };

        mongoose.startSession.mockResolvedValue(session);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(updatedRide));

        const result = await RideService.updateRideStatus(
            "ride-1",
            RIDE_STATUS.ARRIVED,
            "user-1",
            ROLES.ADMIN
        );

        expect(Ride.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "ride-1",
                status: RIDE_STATUS.ASSIGNED,
                acceptedAt: { $ne: null },
            },
            { $set: { status: RIDE_STATUS.ARRIVED, arrivedAt: expect.any(Date) } },
            expect.objectContaining({ new: true, session })
        );
        expect(result).toBe(updatedRide);
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    it("returns a conflict when another request already changed the ride", async () => {
        const session = createSession();
        const existing = { _id: "ride-1", status: RIDE_STATUS.COMPLETED };

        mongoose.startSession.mockResolvedValue(session);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(null));
        Ride.findById.mockReturnValue(createQuery(existing));

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.ARRIVED, "user-1", ROLES.ADMIN)
        ).rejects.toMatchObject({
            statusCode: 409,
            message: "Ride was modified by another request. Please refresh and retry.",
        });
    });

    it("rejects a driver that does not own the ride", async () => {
        const session = createSession();
        const ride = { _id: "ride-1", status: RIDE_STATUS.ARRIVED, driver: { equals: vi.fn(() => false) } };
        const driver = { _id: "driver-1" };

        mongoose.startSession.mockResolvedValue(session);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(ride));
        Driver.findOne.mockReturnValue(createQuery(driver));

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.PICKED_UP, "user-1", ROLES.DRIVER)
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("atomically completes a ride and releases only its matching assigned driver", async () => {
        const session = createSession();
        const updatedRide = {
            _id: "ride-1",
            status: RIDE_STATUS.COMPLETED,
            driver: "driver-1",
        };
        const driver = { _id: "driver-1", user: "user-1", status: DRIVER_STATUS.AVAILABLE };

        mongoose.startSession.mockResolvedValue(session);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(updatedRide));
        Driver.findOneAndUpdate.mockReturnValue(createQuery(driver));
        Ride.findById.mockReturnValue(createQuery({
            ...updatedRide,
            driver: { user: "user-1" },
        }));

        const result = await RideService.updateRideStatus(
            "ride-1",
            RIDE_STATUS.COMPLETED,
            "user-1",
            ROLES.ADMIN
        );

        expect(Driver.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "driver-1",
                currentRide: "ride-1",
                status: DRIVER_STATUS.ASSIGNED,
            },
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: DRIVER_STATUS.AVAILABLE,
                    currentRide: null,
                }),
            }),
            expect.objectContaining({ new: true, session })
        );
        expect(socketService.emitRideCompleted).toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({ status: RIDE_STATUS.COMPLETED }));
    });

    it("fails the transaction when the driver state no longer matches the ride", async () => {
        const session = createSession();
        const updatedRide = { _id: "ride-1", status: RIDE_STATUS.COMPLETED, driver: "driver-1" };

        mongoose.startSession.mockResolvedValue(session);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(updatedRide));
        Driver.findOneAndUpdate.mockReturnValue(createQuery(null));

        await expect(
            RideService.updateRideStatus("ride-1", RIDE_STATUS.COMPLETED, "user-1", ROLES.ADMIN)
        ).rejects.toMatchObject({
            statusCode: 409,
            message: "Driver state no longer matches this ride",
        });
    });
});

describe("RideService.acknowledgeRide", () => {
    it("atomically acknowledges an unaccepted assigned ride", async () => {
        const driver = { _id: "driver-1", user: "user-1" };
        const updatedRide = { _id: "ride-1", acceptedAt: new Date() };

        Driver.findOne.mockReturnValue(createQuery(driver));
        Ride.findOneAndUpdate.mockReturnValue(createQuery(updatedRide));
        Ride.findById.mockReturnValue(createQuery(updatedRide));

        const result = await RideService.acknowledgeRide("ride-1", "user-1");

        expect(Ride.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "ride-1",
                driver: "driver-1",
                status: RIDE_STATUS.ASSIGNED,
                acceptedAt: null,
            },
            { $set: { acceptedAt: expect.any(Date) } },
            expect.objectContaining({ new: true, session: expect.anything() })
        );
        expect(result).toBe(updatedRide);
    });

    it("returns a conflict when acknowledgement was already won", async () => {
        const driver = { _id: "driver-1", user: "user-1" };
        const session = createSession();
        mongoose.startSession.mockResolvedValue(session);
        Driver.findOne.mockReturnValue(createQuery(driver));
        Ride.findOneAndUpdate.mockReturnValue(createQuery(null));
        Ride.findById.mockReturnValue(createQuery({
            _id: "ride-1",
            driver: { equals: vi.fn(() => true) },
            acceptedAt: new Date(),
            status: RIDE_STATUS.ASSIGNED,
        }));

        await expect(
            RideService.acknowledgeRide("ride-1", "user-1")
        ).rejects.toMatchObject({
            statusCode: 409,
            message: "Ride was modified by another request. Please refresh and retry.",
        });
    });
});

describe("RideService.cancelGuestRide", () => {
    it("atomically cancels an active ride and releases only the matching assigned driver", async () => {
        const session = createSession();
        const guest = { _id: "guest-1" };
        const cancelledAt = new Date();
        const updatedRide = {
            _id: "ride-1",
            guests: [guest._id],
            rideRequest: "request-1",
            driver: "driver-1",
            status: RIDE_STATUS.CANCELLED,
            cancelledAt,
        };

        mongoose.startSession.mockResolvedValue(session);
        Guest.findOne.mockResolvedValue(guest);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(updatedRide));
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery({}));
        Driver.findOneAndUpdate.mockReturnValue(createQuery({ _id: "driver-1" }));
        Ride.findById.mockReturnValue(createQuery(updatedRide));

        await RideService.cancelGuestRide("user-1", "ride-1", "Change of plans");

        expect(Ride.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: "ride-1",
                guests: "guest-1",
                status: { $in: ACTIVE_RIDE_STATUSES },
            }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: RIDE_STATUS.CANCELLED,
                    cancelledBy: "GUEST",
                }),
            }),
            expect.objectContaining({ new: true, session })
        );
        expect(Driver.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "driver-1",
                currentRide: "ride-1",
                status: DRIVER_STATUS.ASSIGNED,
            },
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: DRIVER_STATUS.AVAILABLE,
                    currentRide: null,
                }),
            }),
            expect.objectContaining({ session })
        );
    });
});

describe("RideService.declineRide", () => {
    it("atomically declines only an unaccepted assigned ride", async () => {
        const session = createSession();
        const driver = { _id: "driver-1", user: "user-1" };
        const ride = {
            _id: "ride-1",
            driver: "driver-1",
            rideRequest: "request-1",
            status: RIDE_STATUS.CANCELLED,
            cancelledAt: new Date(),
        };

        mongoose.startSession.mockResolvedValue(session);
        Driver.findOne.mockResolvedValue(driver);
        Ride.findOneAndUpdate.mockReturnValue(createQuery(ride));
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery({}));
        Driver.findOneAndUpdate.mockReturnValue(createQuery(driver));
        Ride.findById.mockReturnValue(createQuery(ride));

        await RideService.declineRide("user-1", "ride-1", "Cannot take this ride");

        expect(Ride.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "ride-1",
                driver: "driver-1",
                status: RIDE_STATUS.ASSIGNED,
                acceptedAt: null,
            },
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: RIDE_STATUS.CANCELLED,
                    cancelledBy: "DRIVER",
                }),
            }),
            expect.objectContaining({ new: true, session })
        );
        expect(Driver.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "driver-1",
                currentRide: "ride-1",
                status: DRIVER_STATUS.ASSIGNED,
            },
            expect.any(Object),
            expect.objectContaining({ session })
        );
    });
});
