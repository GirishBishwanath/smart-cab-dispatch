import { emitToUser } from "../config/socket.js";

const emitRideAssigned = (userId, ride) =>
    emitToUser(userId, "ride:assigned", { ride });

const emitRideAccepted = (userId, ride) =>
    emitToUser(userId, "ride:accepted", { ride });

const emitRideStatus = (userId, ride) =>
    emitToUser(userId, "ride:status", { ride });

const emitRideCompleted = (userId, ride) =>
    emitToUser(userId, "ride:completed", { ride });

const emitDriverStatus = (userId, driver) =>
    emitToUser(userId, "driver:status", { driver });

const emitDriverLocation = (userId, payload) =>
    emitToUser(userId, "driver:location", payload);

export default {
    emitRideAssigned,
    emitRideAccepted,
    emitRideStatus,
    emitRideCompleted,
    emitDriverStatus,
    emitDriverLocation,
};