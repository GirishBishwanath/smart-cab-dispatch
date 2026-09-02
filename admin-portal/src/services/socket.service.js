import {
    connectSocket,
    disconnectSocket,
    getSocket,
} from "../socket.js";

const subscribe = (event, callback) => {
    const socket = connectSocket();

    if (!socket) return () => {};

    socket.on(event, callback);

    return () => {
        socket.off(event, callback);
    };
};

const off = (event, callback) => {
    const socket = getSocket();

    if (!socket) return;

    socket.off(event, callback);
};

export default {
    subscribe,
    off,
    connect: connectSocket,
    disconnect: disconnectSocket,
};