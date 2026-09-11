import { io } from "socket.io-client";

import {
    getToken,
} from "./utils/storage.js";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ??
    "http://localhost:5000";

let socket = null;

const createSocket = () => {
    if (socket) {
        return socket;
    }

    const token = getToken();

    if (!token) {
        return null;
    }

    socket = io(
        SOCKET_URL,
        {
            autoConnect: true,
            transports: [
                "websocket",
                "polling",
            ],
            auth: {
                token,
            },
        }
    );

    socket.on(
        "connect",
        () => {
            console.log(
                "🔌 Driver Socket connected:",
                socket.id
            );
        }
    );

    socket.on(
        "socket:connected",
        (payload) => {
            console.log(
                "🔐 Socket authenticated:",
                payload
            );
        }
    );

    socket.on(
        "connect_error",
        (error) => {
            console.error(
                "❌ Socket connection error:",
                error.message
            );
        }
    );

    socket.on(
        "disconnect",
        (reason) => {
            console.log(
                "🔌 Socket disconnected:",
                reason
            );
        }
    );

    return socket;
};

const getSocket = () => {
    return socket ?? createSocket();
};

const connectSocket = () => {
    const instance =
        getSocket();

    if (
        instance &&
        !instance.connected
    ) {
        instance.connect();
    }

    return instance;
};

const disconnectSocket = () => {
    if (!socket) {
        return;
    }

    socket.disconnect();
    socket = null;
};

const sendLocation = ({
    rideId,
    latitude,
    longitude,
}) => {
    const instance = getSocket();

    if (!instance) {
        return false;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return false;
    }

    instance.emit("driver:location", {
        rideId,
        latitude,
        longitude,
        clientUpdatedAt: new Date().toISOString(),
    });

    return true;
};

export {
    getSocket,
    connectSocket,
    disconnectSocket,
    sendLocation,
};

export default {
    getSocket,
    connectSocket,
    disconnectSocket,
    sendLocation,
};