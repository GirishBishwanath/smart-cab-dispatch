import {
    initializeSocket,
    getIO,
} from "../config/socket.js";

/*
 * ============================================================
 * SETUP SOCKET.IO
 * ============================================================
 *
 * Called once when the HTTP server starts.
 */
const setupSocket = (
    httpServer
) => {
    return initializeSocket(
        httpServer
    );
};

/*
 * ============================================================
 * EMIT TO USER
 * ============================================================
 *
 * Sends a private event to a specific authenticated user.
 *
 * Every authenticated socket joins:
 *
 *     user:<userId>
 *
 * Example:
 *
 *     user:68abc123...
 *
 * This is the function used by socket.service.js.
 */
const emitToUser = (
    userId,
    event,
    payload = {}
) => {
    const io = getIO();

    if (!userId) {
        console.warn(
            `⚠️ Cannot emit "${event}": userId is missing.`
        );

        return;
    }

    const normalizedUserId =
        userId.toString();

    io.to(
        `user:${normalizedUserId}`
    ).emit(
        event,
        payload
    );
};

export {
    setupSocket,
    emitToUser,
};