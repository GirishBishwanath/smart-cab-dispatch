import { describe, expect, it } from "vitest";

import { estimateEtaMinutes, haversineDistanceKm } from "./geo.js";

describe("haversineDistanceKm", () => {
    it("returns zero for identical points", () => {
        expect(
            haversineDistanceKm(
                { latitude: 12.9716, longitude: 77.5946 },
                { latitude: 12.9716, longitude: 77.5946 }
            )
        ).toBe(0);
    });

    it("calculates a reasonable distance between two coordinates", () => {
        const distance = haversineDistanceKm(
            { latitude: 12.9716, longitude: 77.5946 },
            { latitude: 13.0827, longitude: 80.2707 }
        );

        expect(distance).toBeGreaterThan(280);
        expect(distance).toBeLessThan(300);
    });

    it("returns Infinity for invalid points", () => {
        expect(haversineDistanceKm(null, { latitude: 1, longitude: 1 })).toBe(
            Infinity
        );
        expect(
            haversineDistanceKm(
                { latitude: Number.NaN, longitude: 1 },
                { latitude: 1, longitude: 1 }
            )
        ).toBe(Infinity);
    });
});

describe("estimateEtaMinutes", () => {
    it("uses the default average speed", () => {
        expect(estimateEtaMinutes(15)).toBe(30);
    });

    it("respects a custom average speed", () => {
        expect(estimateEtaMinutes(30, 60)).toBe(30);
    });

    it("returns null for invalid distance", () => {
        expect(estimateEtaMinutes(Infinity)).toBeNull();
        expect(estimateEtaMinutes(-1)).toBeNull();
    });

    it("never returns less than one minute for a valid distance", () => {
        expect(estimateEtaMinutes(0)).toBe(1);
    });
});
