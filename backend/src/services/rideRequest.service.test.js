import { beforeEach, describe, expect, it, vi } from "vitest";

import RideRequestService from "./rideRequest.service.js";
import RideRequest from "../models/RideRequest.js";
import Guest from "../models/Guest.js";
import dispatchService from "./dispatch.service.js";

vi.mock("../models/RideRequest.js", () => ({
    default: {
        create: vi.fn(),
        findById: vi.fn(),
        find: vi.fn(),
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
    then: (resolve) => Promise.resolve(value).then(resolve),
});

beforeEach(() => {
    vi.clearAllMocks();
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
    it("rejects an unknown request", async () => {
        RideRequest.findById.mockResolvedValue(null);

        await expect(
            RideRequestService.approveRideRequest("request-1")
        ).rejects.toMatchObject({ statusCode: 404 });
        expect(dispatchService.assignDriver).not.toHaveBeenCalled();
    });

    it("rejects an already processed request", async () => {
        RideRequest.findById.mockResolvedValue({ status: "APPROVED" });

        await expect(
            RideRequestService.approveRideRequest("request-1")
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("assigns a driver and persists approval", async () => {
        const ride = { _id: "ride-1" };
        const request = {
            _id: "request-1",
            status: "PENDING",
            save: vi.fn().mockResolvedValue(undefined),
        };

        RideRequest.findById.mockResolvedValue(request);
        dispatchService.assignDriver.mockResolvedValue(ride);

        const result = await RideRequestService.approveRideRequest("request-1");

        expect(dispatchService.assignDriver).toHaveBeenCalledWith(request);
        expect(request.status).toBe("APPROVED");
        expect(request.approvedAt).toBeInstanceOf(Date);
        expect(request.ride).toBe("ride-1");
        expect(request.save).toHaveBeenCalledTimes(1);
        expect(result).toBe(ride);
    });
});

describe("RideRequestService.declineRideRequest", () => {
    it("rejects an unknown request", async () => {
        RideRequest.findById.mockResolvedValue(null);

        await expect(
            RideRequestService.declineRideRequest("request-1")
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("rejects an already processed request", async () => {
        RideRequest.findById.mockResolvedValue({ status: "REJECTED" });

        await expect(
            RideRequestService.declineRideRequest("request-1", "No capacity")
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("persists the rejection reason", async () => {
        const request = {
            _id: "request-1",
            status: "PENDING",
            rejectionReason: null,
            approvedAt: new Date(),
            save: vi.fn().mockResolvedValue(undefined),
        };

        RideRequest.findById.mockResolvedValue(request);
        RideRequest.findById.mockReturnValueOnce(Promise.resolve(request)).mockReturnValueOnce(
            createQuery({ _id: "request-1", status: "REJECTED" })
        );

        const result = await RideRequestService.declineRideRequest(
            "request-1",
            "  No capacity  "
        );

        expect(request.status).toBe("REJECTED");
        expect(request.rejectionReason).toBe("  No capacity  ");
        expect(request.approvedAt).toBeNull();
        expect(request.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ _id: "request-1", status: "REJECTED" });
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
        Guest.findOne.mockResolvedValue({ _id: "guest-1" });
        RideRequest.findById.mockResolvedValue({
            guest: { equals: vi.fn(() => false) },
            status: "PENDING",
        });

        await expect(
            RideRequestService.cancelMyRideRequest("user-1", "request-1", "Reason")
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("requires a cancellation reason for pending requests", async () => {
        Guest.findOne.mockResolvedValue({ _id: "guest-1" });
        RideRequest.findById.mockResolvedValue({
            guest: { equals: vi.fn(() => true) },
            status: "PENDING",
        });

        await expect(
            RideRequestService.cancelMyRideRequest("user-1", "request-1", "  ")
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("cancels a pending request and clears approval linkage", async () => {
        const request = {
            _id: "request-1",
            guest: { equals: vi.fn(() => true) },
            status: "PENDING",
            cancellationReason: null,
            approvedAt: new Date(),
            ride: "ride-1",
            save: vi.fn().mockResolvedValue(undefined),
        };

        Guest.findOne.mockResolvedValue({ _id: "guest-1" });
        RideRequest.findById
            .mockResolvedValueOnce(request)
            .mockReturnValueOnce(createQuery({ _id: "request-1", status: "CANCELLED" }));

        const result = await RideRequestService.cancelMyRideRequest(
            "user-1",
            "request-1",
            "  Change of plans  "
        );

        expect(request.status).toBe("CANCELLED");
        expect(request.cancellationReason).toBe("Change of plans");
        expect(request.approvedAt).toBeNull();
        expect(request.ride).toBeNull();
        expect(request.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ _id: "request-1", status: "CANCELLED" });
    });
});
