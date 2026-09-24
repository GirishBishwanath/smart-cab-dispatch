import { describe, expect, it, vi } from "vitest";

import errorHandler from "./error.middleware.js";

describe("errorHandler", () => {
    it("maps Mongoose version conflicts to HTTP 409", () => {
        const json = vi.fn();
        const res = {
            status: vi.fn(() => ({ json })),
        };

        errorHandler(
            { name: "VersionError" },
            {},
            res,
            vi.fn()
        );

        expect(res.status).toHaveBeenCalledWith(409);
        expect(json).toHaveBeenCalledWith({
            success: false,
            message: "Ride was modified by another request. Please refresh and retry.",
        });
    });

    it("preserves normal API errors", () => {
        const json = vi.fn();
        const res = {
            status: vi.fn(() => ({ json })),
        };

        errorHandler(
            { statusCode: 400, message: "Bad request" },
            {},
            res,
            vi.fn()
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({
            success: false,
            message: "Bad request",
            stack: undefined,
        });
    });
});
