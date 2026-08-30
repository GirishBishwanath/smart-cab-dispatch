import { Server } from "socket.io";

import jwt from "jsonwebtoken";

import { JWT_SECRET, ALLOWED_ORIGINS } from "./env.js";

import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";
import "../models/Guest.js";

import { ROLES, RIDE_STATUS } from "../utils/constants.js";

let io = null;

const TRACKABLE_RIDE_STATUSES = [
    RIDE_STATUS.ASSIGNED,
    RIDE_STATUS.ARRIVED,
    RIDE_STATUS.PICKED_UP,
];

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
                    return next(
                        new Error(
                            "Invalid authentication token"
                        )
                    );
                }

                socket.user = {
                    id: user._id.toString(),
                    fullName:
                        user.fullName,
                    email:
                        user.email,
                    role:
                        user.role,
                };

                next();
            } catch (error) {
                console.error(
                    "Socket authentication failed:",
                    error.message
                );

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

            console.log(
                `🔌 Socket connected: ${userId}`
            );

            socket.join(
                `user:${userId}`
            );

            if (
                socket.user.role ===
                "DRIVER"
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
                        } = payload || {};

                        if (
                            typeof latitude !== "number" ||
                            typeof longitude !== "number"
                        ) {
                            return;
                        }

                        const driver =
                            await Driver.findOne({
                                user: userId,
                            });

                        if (!driver) {
                            return;
                        }

                        driver.currentLocation = {
                            latitude,
                            longitude,
                        };

                        await driver.save();

                        const targetRideId =
                            rideId ||
                            driver.currentRide?.toString();

                        if (!targetRideId) {
                            return;
                        }

                        if (
                            driver.currentRide?.toString() !==
                            targetRideId.toString()
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

                        const locationPayload = {
                            rideId: ride._id.toString(),
                            latitude,
                            longitude,
                            updatedAt: new Date().toISOString(),
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
                        console.error(
                            "Failed to process driver:location:",
                            error.message
                        );
                    }
                }
            );

            socket.on(
                "disconnect",
                (reason) => {
                    console.log(
                        `🔌 Socket disconnected: ${userId} (${reason})`
                    );
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

export {
    initializeSocket,
    getIO,
};