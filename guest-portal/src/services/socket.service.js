import {
    connectSocket,
    disconnectSocket,
    getSocket,
} from "../socket.js";

const subscribe = (event, callback) => {
    const socket = connectSocket();

    if (!socket) {
        return () => {};
    }

    socket.on(event, callback);

    return () => {
        socket.off(event, callback);
    };
};

const on = (event, callback) => subscribe(event, callback);

const off = (event, callback) => {
    const socket = getSocket();

    if (!socket) {
        return;
    }

    socket.off(event, callback);
};

const isConnected = () => Boolean(getSocket()?.connected);

export default {
    subscribe,
    on,
    off,
    isConnected,
    connect: connectSocket,
    disconnect: disconnectSocket,
};