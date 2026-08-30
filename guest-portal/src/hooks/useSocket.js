import { useEffect } from "react";

import socketService from "../services/socket.service.js";

const useSocket = (event, callback, enabled = true) => {
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        if (typeof callback !== "function") {
            return undefined;
        }

        const remove = socketService.subscribe(event, callback);

        return remove;
    }, [event, callback, enabled]);
};

export default useSocket;