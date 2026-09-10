import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";

import AuthService from "./auth.service.js";
import User from "../models/User.js";
import Guest from "../models/Guest.js";
import { ROLES } from "../utils/constants.js";

vi.mock("../models/User.js", () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
    },
}));

vi.mock("../models/Guest.js", () => ({
    default: {
        create: vi.fn(),
        exists: vi.fn(),
    },
}));

vi.mock("bcrypt", () => ({
    default: {
        compare: vi.fn(),
        hash: vi.fn(),
    },
}));

vi.mock("../utils/hash.js", () => ({
    hashPassword: vi.fn(async () => "hashed-password"),
}));

vi.mock("../utils/jwt.js", () => ({
    generateToken: vi.fn(() => "token"),
}));

vi.mock("google-auth-library", () => ({
    OAuth2Client: vi.fn().mockImplementation(() => ({
        verifyIdToken: vi.fn(),
    })),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("AuthService login", () => {
    it("rejects unknown or inactive users", async () => {
        User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

        await expect(AuthService.login("missing@example.com", "secret")).rejects.toMatchObject({
            statusCode: 401,
        });
    });

    it("rejects an invalid password", async () => {
        const user = {
            _id: "user-1",
            email: "user@example.com",
            password: "hash",
            isActive: true,
            save: vi.fn(),
        };

        User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
        bcrypt.compare.mockResolvedValue(false);

        await expect(AuthService.login(" User@Example.com ", "wrong")).rejects.toMatchObject({
            statusCode: 401,
        });
        expect(User.findOne).toHaveBeenCalledWith({
            email: "user@example.com",
            isActive: true,
        });
    });

    it("returns a token for valid credentials", async () => {
        const user = {
            _id: "user-1",
            email: "user@example.com",
            password: "hash",
            role: ROLES.GUEST,
            fullName: "Guest",
            phone: "",
            avatar: "",
            isActive: true,
            lastLogin: null,
            createdAt: new Date(),
            save: vi.fn(),
        };

        User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
        bcrypt.compare.mockResolvedValue(true);

        const result = await AuthService.login("user@example.com", "secret");

        expect(result.token).toBe("token");
        expect(result.user.id).toBe("user-1");
        expect(user.save).toHaveBeenCalledTimes(1);
    });
});

describe("AuthService signup", () => {
    it("validates required fields", async () => {
        await expect(
            AuthService.signup({ email: "user@example.com", password: "secret" })
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("rejects short passwords", async () => {
        await expect(
            AuthService.signup({
                fullName: "Guest",
                email: "user@example.com",
                password: "12345",
            })
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("rejects an existing email", async () => {
        User.findOne.mockResolvedValue({ _id: "existing" });

        await expect(
            AuthService.signup({
                fullName: "Guest",
                email: "USER@example.com",
                password: "secret",
            })
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
    });
});

describe("AuthService.googleLogin", () => {
    it("rejects missing Google credentials", async () => {
        await expect(AuthService.googleLogin("")).rejects.toMatchObject({ statusCode: 400 });

        const client = vi.mocked((await import("google-auth-library")).OAuth2Client).mock
            .results[0]?.value;
        expect(client?.verifyIdToken).not.toHaveBeenCalled();
    });
});
