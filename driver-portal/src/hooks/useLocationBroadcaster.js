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
    const [permission, setPermission] = useState("unknown");

    const rideIdRef = useRef(ride?._id);

    const isTrackable =
        Boolean(ride?._id) &&
        TRACKABLE_STATUSES.includes(ride?.status);

    useEffect(() => {
        rideIdRef.current = ride?._id;
    }, [ride?._id]);

    useEffect(() => {
        if (!isTrackable) {
            setPosition(null);
            setError("");
            return undefined;
        }

        if (!navigator.geolocation) {
            setPermission("unsupported");
            setError(
                "Your browser does not support location services."
            );
            return undefined;
        }

        let cancelled = false;

        const startTracking = () => {
            if (cancelled) return;

            const socket = socketService.connect();

            const emitLocation = (geoPosition) => {
                if (cancelled) return;

                const { latitude, longitude } =
                    geoPosition.coords;

                const nextPosition = {
                    latitude,
                    longitude,
                };

                setPosition(nextPosition);
                setError("");
                setPermission("granted");

                socket?.emit("driver:location", {
                    rideId: rideIdRef.current,
                    latitude,
                    longitude,
                });

                console.log(
                    "📍 Driver location sent:",
                    nextPosition
                );
            };

            const handleError = (geoError) => {
                if (cancelled) return;

                console.error(
                    "❌ Driver geolocation error:",
                    geoError
                );

                if (geoError.code === 1) {
                    setPermission("denied");
                    setError(
                        "Location permission was denied. Allow Location access for localhost:5174."
                    );
                } else if (geoError.code === 2) {
                    setPermission("unavailable");
                    setError(
                        "Your current location could not be determined."
                    );
                } else if (geoError.code === 3) {
                    setPermission("timeout");
                    setError(
                        "Location request timed out. Trying again..."
                    );
                } else {
                    setError(
                        geoError.message || "Unable to access your location."
                    );
                }
            };

            navigator.geolocation.getCurrentPosition(
                emitLocation,
                handleError,
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 15000,
                }
            );

            const watchId = navigator.geolocation.watchPosition(
                emitLocation,
                handleError,
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 15000,
                }
            );

            return () => {
                navigator.geolocation.clearWatch(
                    watchId
                );
            };
        };

        const cleanup = startTracking();

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, [isTrackable]);

    return {
        position,
        error,
        permission,
        isTrackable,
    };
};

export default useLocationBroadcaster;