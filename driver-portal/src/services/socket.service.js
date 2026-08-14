import {
    connectSocket,
    disconnectSocket,
    getSocket,
} from "../socket.js";

const subscribe = (
    event,
    callback
) => {
    const socket =
        connectSocket();

    if (!socket) {
        return () => {};
    }

    socket.on(
        event,
        callback
    );

    return () => {
        socket.off(
            event,
            callback
        );
    };
};

const on = (
    event,
    callback
) => {
    return subscribe(
        event,
        callback
    );
};

const off = (
    event,
    callback
) => {
    const socket =
        getSocket();

    if (!socket) {
        return;
    }

    socket.off(
        event,
        callback
    );
};

const isConnected = () => {
    const socket =
        getSocket();

    return Boolean(
        socket?.connected
    );
};

export default {
    subscribe,
    on,
    off,
    isConnected,
    connect: connectSocket,
    disconnect: disconnectSocket,
};