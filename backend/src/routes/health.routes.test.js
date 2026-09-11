import { afterEach, describe, expect, it } from "vitest";

import app from "../app.js";
import { setReadiness } from "./health.routes.js";

describe("health routes", () => {
    const servers = [];

    afterEach(async () => {
        setReadiness(false);
        await Promise.all(
            servers.splice(0).map(
                (server) =>
                    new Promise((resolve) => server.close(resolve))
            )
        );
    });

    it("reports liveness independently of readiness", async () => {
        const server = app.listen(0);
        servers.push(server);
        await new Promise((resolve) => server.once("listening", resolve));

        const address = server.address();
        const response = await fetch(`http://127.0.0.1:${address.port}/health/live`);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ success: true, status: "alive" });
    });

    it("returns not ready until startup completes", async () => {
        const server = app.listen(0);
        servers.push(server);
        await new Promise((resolve) => server.once("listening", resolve));

        const address = server.address();
        const notReady = await fetch(`http://127.0.0.1:${address.port}/health/ready`);
        expect(notReady.status).toBe(503);
        expect(await notReady.json()).toEqual({
            success: false,
            status: "not_ready",
        });

        setReadiness(true);

        const ready = await fetch(`http://127.0.0.1:${address.port}/health/ready`);
        expect(ready.status).toBe(200);
        expect(await ready.json()).toEqual({
            success: true,
            status: "ready",
        });
    });
});
