import { afterEach, describe, expect, it, vi } from "vitest";

import logger from "./logger.js";

describe("logger", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("writes structured JSON and redacts sensitive fields", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});

        logger.info("auth.test", {
            userId: "user-1",
            authorization: "Bearer secret-token",
            password: "super-secret",
        });

        expect(spy).toHaveBeenCalledTimes(1);

        const entry = JSON.parse(spy.mock.calls[0][0]);

        expect(entry).toMatchObject({
            level: "info",
            message: "auth.test",
            userId: "user-1",
        });
        expect(entry).not.toHaveProperty("authorization");
        expect(entry).not.toHaveProperty("password");
        expect(entry.timestamp).toEqual(expect.any(String));
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
