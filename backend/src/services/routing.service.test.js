import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import routingService from "./routing.service.js";

describe("routingService.getDrivingRoute", () => {
    const originalFetch = globalThis.fetch;
    const originalBaseUrl = process.env.OSRM_BASE_URL;
    const originalEtaFactor = process.env.OSRM_ETA_FACTOR;

    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.fetch = vi.fn();
        process.env.OSRM_BASE_URL = "https://router.test";
        process.env.OSRM_ETA_FACTOR = "1.4";
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;

        if (originalBaseUrl === undefined) delete process.env.OSRM_BASE_URL;
        else process.env.OSRM_BASE_URL = originalBaseUrl;

        if (originalEtaFactor === undefined) delete process.env.OSRM_ETA_FACTOR;
        else process.env.OSRM_ETA_FACTOR = originalEtaFactor;
    });

    it("rejects invalid coordinates before making a request", async () => {
        await expect(
            routingService.getDrivingRoute(
                { latitude: 91, longitude: 77 },
                { latitude: 13, longitude: 78 }
            )
        ).rejects.toThrow("Invalid routing coordinates");

        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("rejects the zero coordinate sentinel", async () => {
        await expect(
            routingService.getDrivingRoute(
                { latitude: 0, longitude: 0 },
                { latitude: 13, longitude: 78 }
            )
        ).rejects.toThrow("Invalid routing coordinates");
    });

    it("maps an OSRM route into application metrics and geometry", async () => {
        globalThis.fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                code: "Ok",
                routes: [
                    {
                        distance: 12345,
                        duration: 600,
                        geometry: {
                            coordinates: [
                                [77.1, 12.9],
                                [77.2, 13.0],
                            ],
                        },
                    },
                ],
            }),
        });

        const result = await routingService.getDrivingRoute(
            { latitude: 12.9, longitude: 77.1 },
            { latitude: 13.0, longitude: 77.2 }
        );

        expect(result).toEqual({
            distanceKm: 12.3,
            durationMinutes: 14,
            geometry: [
                [12.9, 77.1],
                [13, 77.2],
            ],
        });

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "https://router.test/route/v1/driving/77.1,12.9;77.2,13?overview=full&geometries=geojson&steps=false",
            expect.objectContaining({
                headers: { Accept: "application/json" },
                signal: expect.any(AbortSignal),
            })
        );
    });

    it("applies the configured ETA factor and minimum duration", async () => {
        process.env.OSRM_ETA_FACTOR = "2";
        globalThis.fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                code: "Ok",
                routes: [{ distance: 1000, duration: 20, geometry: { coordinates: [] } }],
            }),
        });

        const result = await routingService.getDrivingRoute(
            { latitude: 12.9, longitude: 77.1 },
            { latitude: 13.0, longitude: 77.2 }
        );

        expect(result.durationMinutes).toBe(1);
    });

    it("throws when the upstream routing request fails", async () => {
        globalThis.fetch.mockResolvedValue({
            ok: false,
            status: 503,
        });

        await expect(
            routingService.getDrivingRoute(
                { latitude: 12.9, longitude: 77.1 },
                { latitude: 13.0, longitude: 77.2 }
            )
        ).rejects.toThrow("OSRM request failed with 503");
    });

    it("throws when OSRM returns no usable route", async () => {
        globalThis.fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                code: "NoRoute",
                routes: [],
                message: "No route found",
            }),
        });

        await expect(
            routingService.getDrivingRoute(
                { latitude: 12.9, longitude: 77.1 },
                { latitude: 13.0, longitude: 77.2 }
            )
        ).rejects.toThrow("No route found");
    });
});
