import { useEffect, useRef, useState } from "react";

import socketService from "../services/socket.service.js";
import { RIDE_STATUS } from "../utils/constants.js";

const TRACKABLE_STATUSES = [
    RIDE_STATUS.ASSIGNED,
    RIDE_STATUS.ARRIVED,
    RIDE_STATUS.PICKED_UP,
];

const useLocationBroadcaster = (ride) => {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState("");

    const rideIdRef = useRef(ride?._id);

    const isTrackable =
        Boolean(ride?._id) &&
        TRACKABLE_STATUSES.includes(ride?.status);

    useEffect(() => {
        rideIdRef.current = ride?._id;
    }, [ride?._id]);

    useEffect(() => {
        if (!isTrackable) {
            return undefined;
        }

        if (!("geolocation" in navigator)) {
            setError("Geolocation isn't supported on this device.");
            return undefined;
        }

        const socket = socketService.connect();

        const watchId = navigator.geolocation.watchPosition(
            (geoPosition) => {
                const { latitude, longitude } = geoPosition.coords;

                setPosition({ latitude, longitude });
                setError("");

                socket?.emit("driver:location", {
                    rideId: rideIdRef.current,
                    latitude,
                    longitude,
                });
            },
            (geoError) => {
                setError(
                    geoError?.message ??
                        "Unable to access your location."
                );
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [isTrackable]);

    return { position, error, isTrackable };
};

export default useLocationBroadcaster;