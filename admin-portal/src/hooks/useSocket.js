import { useEffect } from "react";

import socketService from "../services/socket.service.js";

const useSocket = (event, callback, enabled = true) => {
    useEffect(() => {
        if (!enabled || typeof callback !== "function") {
            return undefined;
        }

        return socketService.subscribe(
            event,
            callback
        );
    }, [event, callback, enabled]);

    return null;
};

export default useSocket;