import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";

import app from "../app.js";
import User from "../models/User.js";
import Guest from "../models/Guest.js";

const MONGO_URI = process.env.MONGO_URI;

const startHttpServer = () => {
    const server = app.listen(0);
    return new Promise((resolve) => {
        server.once("listening", () => resolve(server));
    });
};

describe("authentication HTTP integration", () => {
    let server;
    let baseUrl;

    beforeAll(async () => {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is required for integration tests");
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is required for authentication integration tests");
        }

        await mongoose.connect(MONGO_URI);
        await Promise.all([User.init(), Guest.init()]);
        await mongoose.connection.dropDatabase();

        server = await startHttpServer();
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }

        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    });

    it("signs up a guest through the real HTTP stack and returns a bearer token", async () => {
        const response = await fetch(`${baseUrl}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: "HTTP Integration Guest",
                email: "http-integration@example.com",
                password: "strong-password",
                phone: "9876543210",
            }),
        });

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.token).toEqual(expect.any(String));
        expect(body.data.user.email).toBe("http-integration@example.com");

        const persistedUser = await User.findOne({
            email: "http-integration@example.com",
        });
        const persistedGuest = await Guest.findOne({ user: persistedUser._id });

        expect(persistedUser).not.toBeNull();
        expect(persistedGuest).not.toBeNull();
        expect(persistedUser.password).not.toBe("strong-password");
    });

    it("authenticates the returned bearer token through /me", async () => {
        const login = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "http-integration@example.com",
                password: "strong-password",
            }),
        });
        const loginBody = await login.json();
        const token = loginBody.data.token;

        const response = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.email).toBe("http-integration@example.com");
    });

    it("rejects /me without authentication", async () => {
        const response = await fetch(`${baseUrl}/api/auth/me`);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({
            success: false,
            message: "Authentication required",
        });
    });

    it("rejects /me with an invalid bearer token", async () => {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: "Bearer invalid-token" },
        });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({
            success: false,
            message: "Invalid authentication token",
        });
    });
});
