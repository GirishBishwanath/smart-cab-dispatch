import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const ioMock = {
    use: vi.fn(),
    on: vi.fn(),
};

const ServerMock = vi.fn(() => ioMock);
const jwtVerify = vi.fn();
const userFindById = vi.fn();
const driverFindOne = vi.fn();
const driverFindOneAndUpdate = vi.fn();
const rideFindById = vi.fn();

vi.mock("socket.io", () => ({
    Server: ServerMock,
}));

vi.mock("jsonwebtoken", () => ({
    default: {
        verify: jwtVerify,
    },
}));

vi.mock("../models/User.js", () => ({
    default: {
        findById: userFindById,
    },
}));

vi.mock("../models/Driver.js", () => ({
    default: {
        findOne: driverFindOne,
        findOneAndUpdate: driverFindOneAndUpdate,
    },
}));

vi.mock("../models/Ride.js", () => ({
    default: {
        findById: rideFindById,
    },
}));

vi.mock("../models/Guest.js", () => ({
    default: {},
}));

vi.mock("../config/env.js", () => ({
    JWT_SECRET: "test-secret",
    ALLOWED_ORIGINS: ["http://localhost:3000"],
}));

const { initializeSocket, emitToUser, getIO } = await import("./socket.js");

const getMiddleware = () => ioMock.use.mock.calls[0][0];
const getConnectionHandler = () => ioMock.on.mock.calls.find(([event]) => event === "connection")[1];

const createSelectableQuery = (value) => ({
    select: vi.fn().mockResolvedValue(value),
});

const createRideQuery = (value) => ({
    populate: vi.fn().mockResolvedValue(value),
});

const getLocationHandler = (socket) => {
    getConnectionHandler()(socket);
    return socket.on.mock.calls.find(([event]) => event === "driver:location")[1];
};

beforeEach(() => {
    vi.clearAllMocks();
});

afterAll(() => {
    vi.restoreAllMocks();
});

describe("initializeSocket", () => {
    it("configures Socket.IO and returns the server instance", () => {
        const httpServer = {};

        expect(initializeSocket(httpServer)).toBe(ioMock);
        expect(ServerMock).toHaveBeenCalledWith(httpServer, expect.objectContaining({
            cors: expect.objectContaining({
                origin: ["http://localhost:3000"],
                credentials: true,
            }),
        }));
        expect(ioMock.use).toHaveBeenCalledTimes(1);
        expect(ioMock.on).toHaveBeenCalledWith("connection", expect.any(Function));
        expect(getIO()).toBe(ioMock);
    });

    it("rejects socket connections without a token", async () => {
        initializeSocket({});
        const next = vi.fn();

        await getMiddleware()({ handshake: { auth: {} } }, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Authentication required" }));
        expect(jwtVerify).not.toHaveBeenCalled();
    });

    it("rejects invalid tokens or inactive users", async () => {
        initializeSocket({});
        jwtVerify.mockReturnValue({ id: "user-1" });
        userFindById.mockReturnValue(createSelectableQuery({
            _id: "user-1",
            isActive: false,
        }));
        const next = vi.fn();

        await getMiddleware()({ handshake: { auth: { token: "bad" } } }, next);

        expect(jwtVerify).toHaveBeenCalledWith("bad", "test-secret");
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid authentication token" }));
    });

    it("authenticates active users and attaches normalized socket user data", async () => {
        initializeSocket({});
        jwtVerify.mockReturnValue({ id: "user-1" });
        userFindById.mockReturnValue(createSelectableQuery({
            _id: "user-1",
            fullName: "Driver",
            email: "driver@example.com",
            role: "DRIVER",
            isActive: true,
        }));
        const next = vi.fn();
        const socket = { handshake: { auth: { token: "valid" } } };

        await getMiddleware()(socket, next);

        expect(socket.user).toEqual({
            id: "user-1",
            fullName: "Driver",
            email: "driver@example.com",
            role: "DRIVER",
        });
        expect(next).toHaveBeenCalledWith();
    });
});

describe("socket connection handlers", () => {
    it("joins the user-specific driver room and confirms connection", () => {
        initializeSocket({});
        const socket = {
            user: { id: "user-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };

        getConnectionHandler()(socket);

        expect(socket.join).toHaveBeenCalledWith("user:user-1");
        expect(socket.join).toHaveBeenCalledWith("driver:user-1");
        expect(socket.emit).toHaveBeenCalledWith("socket:connected", {
            connected: true,
            userId: "user-1",
        });
        expect(socket.on).toHaveBeenCalledWith("driver:location", expect.any(Function));
    });

    it("ignores driver location updates from non-drivers", async () => {
        initializeSocket({});
        const socket = {
            user: { id: "user-1", role: "GUEST" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };

        const locationHandler = getLocationHandler(socket);

        await locationHandler({
            rideId: "ride-1",
            latitude: 12.97,
            longitude: 77.59,
        });

        expect(driverFindOne).not.toHaveBeenCalled();
        expect(driverFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it("rejects invalid or out-of-range coordinates without persisting them", async () => {
        initializeSocket({});
        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
        const locationHandler = getLocationHandler(socket);

        await locationHandler({ latitude: 91, longitude: 77 });
        await locationHandler({ latitude: 12, longitude: 181 });
        await locationHandler({ latitude: 0, longitude: 0 });

        expect(driverFindOne).not.toHaveBeenCalled();
        expect(driverFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it("does not persist a location for a mismatched or missing active ride", async () => {
        initializeSocket({});
        const driver = { currentRide: "ride-1" };
        driverFindOne.mockResolvedValue(driver);
        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
        const locationHandler = getLocationHandler(socket);

        await locationHandler({
            rideId: "ride-2",
            latitude: 12.97,
            longitude: 77.59,
        });

        expect(driverFindOneAndUpdate).not.toHaveBeenCalled();
        expect(rideFindById).not.toHaveBeenCalled();
    });

    it("does not persist a location after the ride becomes non-trackable", async () => {
        initializeSocket({});
        const driver = {
            _id: "driver-doc-1",
            currentRide: "ride-1",
            locationUpdatedAt: null,
        };
        driverFindOne.mockResolvedValue(driver);
        rideFindById.mockReturnValue(createRideQuery({
            _id: "ride-1",
            status: "COMPLETED",
            guests: [{ user: "guest-1" }],
        }));
        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
        const locationHandler = getLocationHandler(socket);

        await locationHandler({
            latitude: 12.97,
            longitude: 77.59,
        });

        expect(driverFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it("rejects a client timestamp that is in the future", async () => {
        initializeSocket({});
        const driver = {
            currentRide: "ride-1",
            locationUpdatedAt: null,
        };
        driverFindOne.mockResolvedValue(driver);
        rideFindById.mockReturnValue(createRideQuery({
            _id: "ride-1",
            status: "ASSIGNED",
            guests: [],
        }));
        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
        const locationHandler = getLocationHandler(socket);

        const future = new Date(Date.now() + 60_000).toISOString();
        await locationHandler({
            latitude: 12.97,
            longitude: 77.59,
            clientUpdatedAt: future,
        });

        expect(driverFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it("ignores an older client timestamp than the persisted driver location", async () => {
        initializeSocket({});
        const olderTimestamp = new Date(Date.now() - 60_000);
        const driver = {
            currentRide: "ride-1",
            locationUpdatedAt: olderTimestamp,
        };
        driverFindOne.mockResolvedValue(driver);
        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
        const locationHandler = getLocationHandler(socket);

        const staleTimestamp = new Date(olderTimestamp.getTime() - 1_000).toISOString();
        await locationHandler({
            latitude: 12.97,
            longitude: 77.59,
            clientUpdatedAt: staleTimestamp,
        });

        expect(rideFindById).not.toHaveBeenCalled();
        expect(driverFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it("atomically persists a valid location before broadcasting it", async () => {
        initializeSocket({});
        const emit = vi.fn();
        const to = vi.fn(() => ({ emit }));
        ioMock.to = to;

        const driver = {
            _id: "driver-doc-1",
            currentRide: "ride-1",
            locationUpdatedAt: null,
        };
        driverFindOne.mockResolvedValue(driver);
        driverFindOneAndUpdate.mockResolvedValue({
            ...driver,
            currentLocation: { latitude: 12.97, longitude: 77.59 },
            locationUpdatedAt: new Date(),
        });
        rideFindById.mockReturnValue(createRideQuery({
            _id: "ride-1",
            status: "ASSIGNED",
            guests: [{ user: "guest-1" }, { user: "guest-2" }],
        }));

        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };

        const locationHandler = getLocationHandler(socket);
        const clientUpdatedAt = new Date(Date.now() - 1_000).toISOString();

        await locationHandler({
            latitude: 12.97,
            longitude: 77.59,
            clientUpdatedAt,
        });

        expect(driverFindOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(driverFindOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: "driver-doc-1",
                currentRide: "ride-1",
                $or: [
                    { locationUpdatedAt: null },
                    { locationUpdatedAt: { $lt: new Date(clientUpdatedAt) } },
                ],
            }),
            {
                $set: {
                    currentLocation: { latitude: 12.97, longitude: 77.59 },
                    locationUpdatedAt: new Date(clientUpdatedAt),
                },
            },
            { new: true }
        );
        expect(to).toHaveBeenCalledWith("user:guest-1");
        expect(to).toHaveBeenCalledWith("user:guest-2");
        expect(to).toHaveBeenCalledWith("admins");
        expect(emit).toHaveBeenCalledTimes(3);
        expect(emit.mock.calls[0][0]).toBe("driver:location");
        expect(emit.mock.calls[0][1]).toEqual(expect.objectContaining({
            latitude: 12.97,
            longitude: 77.59,
            updatedAt: clientUpdatedAt,
        }));
    });

    it("does not broadcast when the atomic location update loses a race", async () => {
        initializeSocket({});
        const emit = vi.fn();
        ioMock.to = vi.fn(() => ({ emit }));

        driverFindOne.mockResolvedValue({
            _id: "driver-doc-1",
            currentRide: "ride-1",
            locationUpdatedAt: null,
        });
        driverFindOneAndUpdate.mockResolvedValue(null);
        rideFindById.mockReturnValue(createRideQuery({
            _id: "ride-1",
            status: "ASSIGNED",
            guests: [{ user: "guest-1" }],
        }));

        const socket = {
            user: { id: "driver-1", role: "DRIVER" },
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
        const locationHandler = getLocationHandler(socket);

        await locationHandler({
            latitude: 12.97,
            longitude: 77.59,
            clientUpdatedAt: new Date(Date.now() - 1_000).toISOString(),
        });

        expect(driverFindOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(ioMock.to).not.toHaveBeenCalled();
        expect(emit).not.toHaveBeenCalled();
    });
});

describe("emitToUser", () => {
    it("emits to a normalized user room", () => {
        initializeSocket({});
        const emit = vi.fn();
        ioMock.to = vi.fn(() => ({ emit }));

        emitToUser("user-1", "ride:status", { rideId: "ride-1" });

        expect(ioMock.to).toHaveBeenCalledWith("user:user-1");
        expect(emit).toHaveBeenCalledWith("ride:status", { rideId: "ride-1" });
    });
});
