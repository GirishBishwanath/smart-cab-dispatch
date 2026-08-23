import { Server } from "socket.io";

import jwt from "jsonwebtoken";

import { JWT_SECRET, ALLOWED_ORIGINS } from "./env.js";

import User from "../models/User.js";

let io = null;

/*
 * ============================================================
 * INITIALIZE SOCKET.IO
 * ============================================================
 */
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

    /*
     * ========================================================
     * SOCKET AUTHENTICATION
     * ========================================================
     *
     * Uses the same JWT as REST authentication.
     */
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

                /*
                 * Store authenticated user
                 * on the socket.
                 */
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

    /*
     * ========================================================
     * CONNECTION
     * ========================================================
     */
    io.on(
        "connection",
        (socket) => {
            const userId =
                socket.user.id;

            console.log(
                `🔌 Socket connected: ${userId}`
            );

            /*
             * Private user room.
             *
             * All ride events are sent here.
             */
            socket.join(
                `user:${userId}`
            );

            /*
             * Driver-specific room.
             */
            if (
                socket.user.role ===
                "DRIVER"
            ) {
                socket.join(
                    `driver:${userId}`
                );
            }

            /*
             * Tell frontend that the
             * authenticated socket is ready.
             */
            socket.emit(
                "socket:connected",
                {
                    connected: true,
                    userId,
                }
            );

            /*
             * Disconnect.
             */
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

/*
 * ============================================================
 * GET SOCKET.IO INSTANCE
 * ============================================================
 */
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