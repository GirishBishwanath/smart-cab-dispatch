import { beforeEach, describe, expect, it, vi } from "vitest";

import mongoose from "mongoose";
import RideRequestService from "./rideRequest.service.js";
import RideRequest from "../models/RideRequest.js";
import Guest from "../models/Guest.js";
import dispatchService from "./dispatch.service.js";

vi.mock("mongoose", () => ({
    default: {
        startSession: vi.fn(),
    },
}));

vi.mock("../models/RideRequest.js", () => ({
    default: {
        create: vi.fn(),
        findById: vi.fn(),
        find: vi.fn(),
        findOneAndUpdate: vi.fn(),
    },
}));

vi.mock("../models/Guest.js", () => ({
    default: {
        findOne: vi.fn(),
    },
}));

vi.mock("./dispatch.service.js", () => ({
    default: {
        assignDriver: vi.fn(),
    },
}));

const createQuery = (value) => ({
    populate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    session: vi.fn().mockReturnThis(),
    then: (resolve) => Promise.resolve(value).then(resolve),
});

const createSession = () => ({
    withTransaction: vi.fn(async (callback) => callback()),
    endSession: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
    vi.clearAllMocks();
    mongoose.startSession.mockResolvedValue(createSession());
});

describe("RideRequestService.createRideRequest", () => {
    it("rejects when the guest profile does not exist", async () => {
        Guest.findOne.mockResolvedValue(null);

        await expect(
            RideRequestService.createRideRequest("user-1", {
                pickupLocation: { latitude: 12, longitude: 77 },
                dropLocation: { latitude: 13, longitude: 78 },
            })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("rejects invalid pickup coordinates", async () => {
        Guest.findOne.mockResolvedValue({ _id: "guest-1" });

        await expect(
            RideRequestService.createRideRequest("user-1", {
                pickupLocation: { latitude: "bad", longitude: 77 },
                dropLocation: { latitude: 13, longitude: 78 },
            })
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(RideRequest.create).not.toHaveBeenCalled();
    });

    it("rejects identical pickup and destination coordinates", async () => {
        Guest.findOne.mockResolvedValue({ _id: "guest-1" });

        await expect(
            RideRequestService.createRideRequest("user-1", {
                pickupLocation: { latitude: 12, longitude: 77 },
                dropLocation: { latitude: 12, longitude: 77 },
            })
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(RideRequest.create).not.toHaveBeenCalled();
    });

    it("creates a normalized request and returns the populated request", async () => {
        const guest = { _id: "guest-1", groupSize: 2, luggageCount: 1 };
        const created = { _id: "request-1" };
        const populated = { _id: "request-1", status: "PENDING" };

        Guest.findOne.mockResolvedValue(guest);
        RideRequest.create.mockResolvedValue(created);
        RideRequest.findById.mockReturnValue(createQuery(populated));

        const result = await RideRequestService.createRideRequest("user-1", {
            pickupLocation: { latitude: 12, longitude: 77 },
            dropLocation: { latitude: 13, longitude: 78 },
        });

        expect(RideRequest.create).toHaveBeenCalledWith({
            guest: "guest-1",
            pickupLocation: { latitude: 12, longitude: 77 },
            dropLocation: { latitude: 13, longitude: 78 },
            groupSize: 2,
            luggageCount: 1,
            tripType: "ON_DEMAND",
        });
        expect(result).toBe(populated);
    });
});

describe("RideRequestService.approveRideRequest", () => {
    it("rejects an unknown request without dispatching", async () => {
        const session = createSession();
        mongoose.startSession.mockResolvedValue(session);
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(null));
        RideRequest.findById.mockReturnValue(createQuery(null));

        await expect(
            RideRequestService.approveRideRequest("request-1")
        ).rejects.toMatchObject({ statusCode: 404 });

        expect(dispatchService.assignDriver).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    it("rejects an already processed request without dispatching", async () => {
        const session = createSession();
        mongoose.startSession.mockResolvedValue(session);
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(null));
        RideRequest.findById.mockReturnValue(createQuery({
            _id: "request-1",
            status: "APPROVED",
        }));

        await expect(
            RideRequestService.approveRideRequest("request-1")
        ).rejects.toMatchObject({ statusCode: 400 });

        expect(dispatchService.assignDriver).not.toHaveBeenCalled();
    });

    it("atomically claims a pending request and persists the assigned ride", async () => {
        const session = createSession();
        const request = {
            _id: "request-1",
            status: "APPROVED",
            ride: null,
            save: vi.fn().mockResolvedValue(undefined),
        };
        const ride = { _id: "ride-1" };

        mongoose.startSession.mockResolvedValue(session);
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(request));
        dispatchService.assignDriver.mockResolvedValue(ride);

        const result = await RideRequestService.approveRideRequest("request-1");

        expect(RideRequest.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: "request-1", status: "PENDING" },
            { $set: expect.objectContaining({ status: "APPROVED" }) },
            expect.objectContaining({ new: true, session })
        );
        expect(dispatchService.assignDriver).toHaveBeenCalledWith(request, session);
        expect(request.ride).toBe("ride-1");
        expect(request.save).toHaveBeenCalledWith({ session });
        expect(result).toBe(ride);
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    it("rolls back when driver assignment fails", async () => {
        const session = createSession();
        const request = {
            _id: "request-1",
            status: "APPROVED",
        };

        mongoose.startSession.mockResolvedValue(session);
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(request));
        dispatchService.assignDriver.mockRejectedValue(new Error("No driver could be reserved"));

        await expect(
            RideRequestService.approveRideRequest("request-1")
        ).rejects.toThrow("No driver could be reserved");

        expect(RideRequest.findOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });
});

describe("RideRequestService.declineRideRequest", () => {
    it("rejects an unknown request", async () => {
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(null));
        RideRequest.findById.mockReturnValue(createQuery(null));

        await expect(
            RideRequestService.declineRideRequest("request-1")
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("rejects an already processed request", async () => {
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(null));
        RideRequest.findById.mockReturnValue(createQuery({ status: "REJECTED" }));

        await expect(
            RideRequestService.declineRideRequest("request-1", "No capacity")
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("updates only a pending request and returns the populated result", async () => {
        const updated = { _id: "request-1", status: "REJECTED" };
        const populated = { _id: "request-1", status: "REJECTED" };

        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(updated));
        RideRequest.findById.mockReturnValue(createQuery(populated));

        const result = await RideRequestService.declineRideRequest(
            "request-1",
            "No capacity"
        );

        expect(RideRequest.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: "request-1", status: "PENDING" },
            {
                $set: {
                    status: "REJECTED",
                    rejectionReason: "No capacity",
                    approvedAt: null,
                },
            },
            expect.objectContaining({ new: true, session: expect.anything() })
        );
        expect(result).toBe(populated);
    });
});

describe("RideRequestService.cancelMyRideRequest", () => {
    it("rejects when the guest profile is missing", async () => {
        Guest.findOne.mockResolvedValue(null);

        await expect(
            RideRequestService.cancelMyRideRequest("user-1", "request-1", "Reason")
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("rejects cancellation by another guest", async () => {
        const guest = { _id: "guest-1" };
        Guest.findOne.mockResolvedValue(guest);
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(null));
        RideRequest.findById.mockReturnValue(createQuery({
            guest: { equals: vi.fn(() => false) },
            status: "PENDING",
        }));

        await expect(
            RideRequestService.cancelMyRideRequest("user-1", "request-1", "Reason")
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("requires a cancellation reason for pending requests", async () => {
        Guest.findOne.mockResolvedValue({ _id: "guest-1" });

        await expect(
            RideRequestService.cancelMyRideRequest("user-1", "request-1", "  ")
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("atomically cancels a pending request owned by the guest", async () => {
        const updated = { _id: "request-1", status: "CANCELLED" };
        const populated = { _id: "request-1", status: "CANCELLED" };

        Guest.findOne.mockResolvedValue({ _id: "guest-1" });
        RideRequest.findOneAndUpdate.mockReturnValue(createQuery(updated));
        RideRequest.findById.mockReturnValue(createQuery(populated));

        const result = await RideRequestService.cancelMyRideRequest(
            "user-1",
            "request-1",
            "Change of plans"
        );

        expect(RideRequest.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: "request-1",
                guest: "guest-1",
                status: "PENDING",
            },
            {
                $set: {
                    status: "CANCELLED",
                    cancellationReason: "Change of plans",
                    approvedAt: null,
                    ride: null,
                },
            },
            expect.objectContaining({ new: true, session: expect.anything() })
        );
        expect(result).toBe(populated);
    });
});
