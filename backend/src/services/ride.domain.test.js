import { describe, expect, it } from "vitest";
import { isValidObjectId } from "mongoose";

import { RIDE_STATUS } from "../utils/constants.js";
import RideRequest from "../models/RideRequest.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";

describe("ride domain invariants", () => {
    it("exposes the expected ride states", () => {
        expect(RIDE_STATUS).toEqual({
            PENDING: "PENDING",
            ASSIGNED: "ASSIGNED",
            ARRIVED: "ARRIVED",
            PICKED_UP: "PICKED_UP",
            COMPLETED: "COMPLETED",
            CANCELLED: "CANCELLED",
        });
    });

    it("defines a unique active ride request per guest", () => {
        const index = RideRequest.schema.indexes().find(
            ([fields, options]) =>
                fields.guest === 1 && options.unique === true
        );

        expect(index).toBeDefined();
        expect(index[1].partialFilterExpression.status.$in).toEqual([
            "PENDING",
            "APPROVED",
        ]);
    });

    it("allows at most one ride for each ride request", () => {
        const index = Ride.schema.indexes().find(
            ([fields, options]) =>
                fields.rideRequest === 1 && options.unique === true
        );

        expect(index).toBeDefined();
        expect(index[1].sparse).toBe(true);
    });

    it("enables optimistic concurrency for ride state changes", () => {
        expect(Ride.schema.options.optimisticConcurrency).toBe(true);
    });

    it("requires positive vehicle seating capacity", () => {
        expect(Vehicle.schema.path("seatCapacity").options.min).toBe(1);
        expect(Vehicle.schema.path("seatCapacity").isRequired).toBe(true);
    });

    it("requires driver ownership for vehicles", () => {
        expect(Vehicle.schema.path("driver").isRequired).toBe(true);
        expect(Vehicle.schema.path("driver").options.unique).toBe(true);
    });

    it("requires a unique driver user link", () => {
        expect(Driver.schema.path("user").isRequired).toBe(true);
        expect(Driver.schema.path("user").options.unique).toBe(true);
        expect(isValidObjectId(new Vehicle().driver)).toBe(false);
    });
});
