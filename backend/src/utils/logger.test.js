import { describe, expect, it, vi } from "vitest";

import logger from "./logger.js";

describe("logger", () => {
    it("redacts sensitive keys regardless of casing or naming style", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});

        logger.info("auth.test", {
            userId: "user-1",
            Authorization: "Bearer secret-token",
            accessToken: "secret-access-token",
            access_token: "secret-access-token-2",
            ClientSecret: "secret-client",
            client_secret: "secret-client-2",
            password: "super-secret",
        });

        const entry = JSON.parse(spy.mock.calls[0][0]);

        expect(entry.userId).toBe("user-1");
        expect(entry).not.toHaveProperty("Authorization");
        expect(entry).not.toHaveProperty("accessToken");
        expect(entry).not.toHaveProperty("access_token");
        expect(entry).not.toHaveProperty("ClientSecret");
        expect(entry).not.toHaveProperty("client_secret");
        expect(entry).not.toHaveProperty("password");
    });

    it("preserves shared sibling objects without falsely marking them circular", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});
        const shared = { value: "ok" };

        logger.info("shared-object.test", {
            first: shared,
            second: shared,
        });

        const entry = JSON.parse(spy.mock.calls[0][0]);

        expect(entry.first).toEqual({ value: "ok" });
        expect(entry.second).toEqual({ value: "ok" });
    });

    it("serializes errors without throwing", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        const error = new Error("database unavailable");

        logger.error("database.failed", { error });

        const entry = JSON.parse(spy.mock.calls[0][0]);

        expect(entry.error).toMatchObject({
            name: "Error",
            message: "database unavailable",
        });
    });
});
