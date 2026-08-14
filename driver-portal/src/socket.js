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

export {
    getSocket,
    connectSocket,
    disconnectSocket,
};

export default {
    getSocket,
    connectSocket,
    disconnectSocket,
};