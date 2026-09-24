import { describe, expect, it } from "vitest";

import express from "express";

import securityHeaders from "./security-headers.middleware.js";

describe("securityHeaders", () => {
    it("adds baseline security response headers", async () => {
        const app = express();
        app.disable("x-powered-by");
        app.use(securityHeaders);
        app.get("/health", (req, res) => res.json({ success: true }));

        const server = app.listen(0);
        await new Promise((resolve) => server.once("listening", resolve));

        try {
            const address = server.address();
            const response = await fetch(`http://127.0.0.1:${address.port}/health`);

            expect(response.status).toBe(200);
            expect(response.headers.get("x-content-type-options")).toBe("nosniff");
            expect(response.headers.get("x-frame-options")).toBe("DENY");
            expect(response.headers.get("referrer-policy")).toBe("no-referrer");
            expect(response.headers.get("permissions-policy")).toBe("geolocation=()");
            expect(response.headers.get("content-security-policy")).toContain(
                "default-src 'none'"
            );
            expect(response.headers.get("x-powered-by")).toBeNull();
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    });
});
