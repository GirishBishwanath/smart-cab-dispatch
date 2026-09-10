import { beforeEach, describe, expect, it, vi } from "vitest";

import GuestService from "./guest.service.js";
import User from "../models/User.js";
import Guest from "../models/Guest.js";
import { ROLES } from "../utils/constants.js";

vi.mock("../models/User.js", () => ({
    default: {
        findOne: vi.fn(),
        findById: vi.fn(),
        findByIdAndDelete: vi.fn(),
        create: vi.fn(),
    },
}));

vi.mock("../models/Guest.js", () => ({
    default: {
        create: vi.fn(),
        find: vi.fn(),
        findById: vi.fn(),
        findOne: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
}));

vi.mock("../utils/hash.js", () => ({
    hashPassword: vi.fn(async () => "hashed-password"),
}));

const createQuery = (value) => ({
    populate: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(value),
    then: (resolve) => Promise.resolve(value).then(resolve),
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GuestService.createGuest", () => {
    it("rejects an existing guest email", async () => {
        User.findOne.mockResolvedValue({ _id: "user-1" });

        await expect(
            GuestService.createGuest({ email: "guest@example.com" })
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(User.create).not.toHaveBeenCalled();
    });

    it("creates a guest user and profile", async () => {
        const user = {
            _id: "user-1",
            fullName: "Guest",
            email: "guest@example.com",
            phone: "123",
            role: ROLES.GUEST,
        };
        const guest = { _id: "guest-1", user: "user-1", groupSize: 2 };

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(user);
        Guest.create.mockResolvedValue(guest);

        const result = await GuestService.createGuest({
            fullName: "Guest",
            email: "guest@example.com",
            password: "secret",
            phone: "123",
            accommodation: "Hotel",
            pickupLocation: { latitude: 12, longitude: 77 },
            dropLocation: { latitude: 13, longitude: 78 },
            groupSize: 2,
            luggageCount: 1,
        });

        expect(User.create).toHaveBeenCalledWith({
            fullName: "Guest",
            email: "guest@example.com",
            password: "hashed-password",
            phone: "123",
            role: ROLES.GUEST,
        });
        expect(Guest.create).toHaveBeenCalledWith({
            user: "user-1",
            accommodation: "Hotel",
            pickupLocation: { latitude: 12, longitude: 77 },
            dropLocation: { latitude: 13, longitude: 78 },
            groupSize: 2,
            luggageCount: 1,
        });
        expect(result.guest).toBe(guest);
    });
});

describe("GuestService.getGuestById", () => {
    it("rejects an unknown guest", async () => {
        Guest.findById.mockReturnValue(createQuery(null));

        await expect(GuestService.getGuestById("guest-1")).rejects.toMatchObject({ statusCode: 404 });
    });
});

describe("GuestService.updateMyProfile", () => {
    it("rejects a missing guest profile", async () => {
        Guest.findOne.mockResolvedValue(null);

        await expect(
            GuestService.updateMyProfile("user-1", { fullName: "Updated" })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("updates user and guest fields while preserving omitted values", async () => {
        const user = {
            _id: "user-1",
            fullName: "Guest",
            email: "guest@example.com",
            phone: "123",
            role: ROLES.GUEST,
            save: vi.fn().mockResolvedValue(undefined),
        };
        const guest = {
            _id: "guest-1",
            user: "user-1",
            accommodation: "Old Hotel",
            groupSize: 2,
            luggageCount: 1,
            save: vi.fn().mockResolvedValue(undefined),
        };

        Guest.findOne.mockResolvedValue(guest);
        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(user),
        });
        User.findById.mockResolvedValueOnce(user);

        const result = await GuestService.updateMyProfile("user-1", {
            fullName: "Updated Guest",
            accommodation: "New Hotel",
            luggageCount: 3,
        });

        expect(user.fullName).toBe("Updated Guest");
        expect(user.phone).toBe("123");
        expect(guest.accommodation).toBe("New Hotel");
        expect(guest.groupSize).toBe(2);
        expect(guest.luggageCount).toBe(3);
        expect(user.save).toHaveBeenCalledTimes(1);
        expect(guest.save).toHaveBeenCalledTimes(1);
        expect(result.user.role).toBe(ROLES.GUEST);
        expect(result.guest).toBe(guest);
    });
});

describe("GuestService.deleteGuest", () => {
    it("rejects an unknown guest", async () => {
        Guest.findById.mockResolvedValue(null);

        await expect(GuestService.deleteGuest("guest-1")).rejects.toMatchObject({ statusCode: 404 });
        expect(User.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("deletes the linked user and guest", async () => {
        Guest.findById.mockResolvedValue({ _id: "guest-1", user: "user-1" });
        User.findByIdAndDelete.mockResolvedValue({ _id: "user-1" });
        Guest.findByIdAndDelete.mockResolvedValue({ _id: "guest-1" });

        await expect(GuestService.deleteGuest("guest-1")).resolves.toBe(true);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith("user-1");
        expect(Guest.findByIdAndDelete).toHaveBeenCalledWith("guest-1");
    });
});
