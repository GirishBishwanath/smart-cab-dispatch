import { describe, expect, it, vi } from "vitest";

import requestLogger from "./request-logger.middleware.js";
import logger from "../utils/logger.js";

describe("requestLogger", () => {
    it("adds a request id and logs the completed response without query parameters", () => {
        const next = vi.fn();
        const setHeader = vi.fn();
        const listeners = {};
        const response = {
            statusCode: 204,
            setHeader,
            on: vi.fn((event, callback) => {
                listeners[event] = callback;
            }),
        };
        const request = {
            method: "GET",
            path: "/health",
            originalUrl: "/health?token=secret",
        };
        const loggerSpy = vi
            .spyOn(logger, "info")
            .mockImplementation(() => {});

        requestLogger(request, response, next);

        expect(request.requestId).toMatch(
            /^[0-9a-f-]{36}$/
        );
        expect(setHeader).toHaveBeenCalledWith(
            "X-Request-ID",
            request.requestId
        );
        expect(next).toHaveBeenCalledTimes(1);

        listeners.finish();

        expect(loggerSpy).toHaveBeenCalledWith(
            "http.request.completed",
            expect.objectContaining({
                requestId: request.requestId,
                method: "GET",
                path: "/health",
                statusCode: 204,
            })
        );
        expect(loggerSpy.mock.calls[0][1].path).not.toContain("token=");
    });
});
