import { describe, expect, it } from "vitest";

import RideRequest from "./RideRequest.js";

describe("RideRequest indexes", () => {
    it("allows only one pending request per guest", () => {
        const indexes = RideRequest.schema.indexes();

        const pendingIndex = indexes.find(
            ([keys, options]) =>
                keys.guest === 1 &&
                options.unique === true &&
                options.name === "unique_pending_ride_request_per_guest"
        );

        expect(pendingIndex).toBeDefined();
        expect(pendingIndex?.[1]?.partialFilterExpression).toEqual({
            status: "PENDING",
        });
    });

    it("does not use the old approved-or-pending uniqueness rule", () => {
        const indexes = RideRequest.schema.indexes();

        const legacyIndex = indexes.find(
            ([keys, options]) =>
                keys.guest === 1 &&
                options.unique === true &&
                options.partialFilterExpression?.status?.$in
        );

        expect(legacyIndex).toBeUndefined();
    });
});
