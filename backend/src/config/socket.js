import { Server } from "socket.io";

import jwt from "jsonwebtoken";

import { JWT_SECRET, ALLOWED_ORIGINS } from "./env.js";

import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";
import "../models/Guest.js";

import { ROLES, RIDE_STATUS } from "../utils/constants.js";
import logger from "../utils/logger.js";

let io = null;

const TRACKABLE_RIDE_STATUSES = [
    RIDE_STATUS.ASSIGNED,
    RIDE_STATUS.ARRIVED,
    RIDE_STATUS.PICKED_UP,
];

const isValidLocation = (latitude, longitude) =>
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0);

const initializeSocket = (
    httpServer
) => {
    io = new Server(
        httpServer,
        {
            cors: {
                origin: ALLOWED_ORIGINS,
                methods: [
                    "GET",
                    "POST",
                    "PATCH",
                    "PUT",
                    "DELETE",
                ],
                credentials: true,
            },
        }
    );

    io.use(
        async (
            socket,
            next
        ) => {
            try {
                const token =
                    socket.handshake.auth?.token;

                if (!token) {
                    logger.warn("socket.auth.rejected", {
                        reason: "missing_token",
                    });
                    return next(
                        new Error(
                            "Authentication required"
                        )
                    );
                }

                const decoded =
                    jwt.verify(
                        token,
                        JWT_SECRET
                    );

                const user =
                    await User.findById(
                        decoded.id
                    ).select(
                        "-password -__v"
                    );

                if (
                    !user ||
                    !user.isActive
                ) {
                    logger.warn("socket.auth.rejected", {
                        reason: "invalid_or_inactive_user",
                        userId: decoded?.id,
                    });
                    return next(
                        new Error(
                            "Invalid authentication token"
                        )
                    );
                }

                socket.user = {
                    id: user._id.toString(),
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                };

                next();
            } catch (error) {
                logger.warn("socket.auth.rejected", {
                    reason: "verification_failed",
                    errorName: error?.name,
                });

                next(
                    new Error(
                        "Invalid authentication token"
                    )
                );
            }
        }
    );

    io.on(
        "connection",
        (socket) => {
            const userId =
                socket.user.id;

            logger.info("socket.connected", {
                userId,
                role: socket.user.role,
            });

            socket.join(
                `user:${userId}`
            );

            if (
                socket.user.role ===
                ROLES.DRIVER
            ) {
                socket.join(
                    `driver:${userId}`
                );
            }

            if (
                socket.user.role ===
                ROLES.ADMIN
            ) {
                socket.join("admins");
            }

            socket.emit(
                "socket:connected",
                {
                    connected: true,
                    userId,
                }
            );

            socket.on(
                "driver:location",
                async (payload) => {
                    try {
                        if (
                            socket.user.role !==
                            ROLES.DRIVER
                        ) {
                            return;
                        }

                        const {
                            rideId,
                            latitude,
                            longitude,
                            clientUpdatedAt,
                        } = payload || {};

                        if (!isValidLocation(latitude, longitude)) {
                            return;
                        }

                        const clientTimestamp =
                            clientUpdatedAt == null
                                ? null
                                : Date.parse(clientUpdatedAt);

                        if (
                            clientUpdatedAt != null &&
                            !Number.isFinite(clientTimestamp)
                        ) {
                            return;
                        }

                        const now = Date.now();

                        if (
                            clientTimestamp != null &&
                            clientTimestamp > now + 30_000
                        ) {
                            return;
                        }

                        const driver =
                            await Driver.findOne({
                                user: userId,
                            });

                        if (!driver) {
                            logger.warn("driver.location.rejected", {
                                userId,
                                reason: "driver_not_found",
                            });
                            return;
                        }

                        const targetRideId =
                            rideId ||
                            driver.currentRide?.toString();

                        if (!targetRideId) {
                            return;
                        }

                        if (
                            !driver.currentRide ||
                            driver.currentRide?.toString() !==
                            targetRideId.toString()
                        ) {
                            return;
                        }

                        if (
                            driver.locationUpdatedAt &&
                            clientTimestamp != null &&
                            clientTimestamp <=
                                driver.locationUpdatedAt.getTime()
                        ) {
                            return;
                        }

                        const ride =
                            await Ride.findById(
                                targetRideId
                            ).populate({
                                path: "guests",
                                select: "user",
                            });

                        if (
                            !ride ||
                            !TRACKABLE_RIDE_STATUSES.includes(
                                ride.status
                            )
                        ) {
                            return;
                        }

                        const updatedAt = new Date(
                            clientTimestamp ?? now
                        );

                        driver.currentLocation = {
                            latitude,
                            longitude,
                        };
                        driver.locationUpdatedAt = updatedAt;

                        await driver.save();

                        const locationPayload = {
                            rideId: ride._id.toString(),
                            latitude,
                            longitude,
                            updatedAt: updatedAt.toISOString(),
                        };

                        const guestUserIds = (
                            ride.guests || []
                        )
                            .map((guest) =>
                                guest?.user?.toString()
                            )
                            .filter(Boolean);

                        guestUserIds.forEach(
                            (guestUserId) => {
                                io.to(
                                    `user:${guestUserId}`
                                ).emit(
                                    "driver:location",
                                    locationPayload
                                );
                            }
                        );

                        io.to("admins").emit(
                            "driver:location",
                            locationPayload
                        );
                    } catch (error) {
                        logger.error("driver.location.failed", {
                            userId,
                            rideId: payload?.rideId,
                            errorMessage: error?.message,
                            stack: error?.stack,
                        });
                    }
                }
            );

            socket.on(
                "disconnect",
                (reason) => {
                    logger.info("socket.disconnected", {
                        userId,
                        reason,
                    });
                }
            );
        }
    );

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized."
        );
    }

    return io;
};

const closeSocket = async () => {
    if (!io) return;

    const currentIO = io;
    io = null;

    await new Promise((resolve) => {
        currentIO.close(resolve);
    });
};

const emitToUser = (userId, event, payload = {}) => {
    const io = getIO();

    if (!userId) {
        logger.warn("socket.emit.skipped", {
            event,
            reason: "missing_user_id",
        });
        return;
    }

    io.to(`user:${userId.toString()}`).emit(event, payload);
};

export {
    initializeSocket,
    getIO,
    closeSocket,
    emitToUser,
};
