import { useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationDot } from "react-icons/fa6";

import useSocket from "../hooks/useSocket.js";
import routeService from "../services/route.service.js";

const DEFAULT_CENTER = [26.2389, 73.0243];

const buildDivIcon = (color, pulse = false) =>
    L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:20px;height:20px;">
                ${pulse ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.35;animation:scd-pulse 1.6s ease-out infinite;"></span>` : ""}
                <span style="position:absolute;inset:3px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35);"></span>
            </div>
            <style>
                @keyframes scd-pulse {
                    0% { transform:scale(.6); opacity:.5; }
                    100% { transform:scale(2.2); opacity:0; }
                }
            </style>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

const driverIcon = buildDivIcon("#0284c7", true);
const targetIcon = buildDivIcon("#dc2626");

const RecenterOnMove = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, Math.max(map.getZoom(), 14), { animate: true });
        }
    }, [position, map]);

    return null;
};

const isValidPoint = (point) =>
    Number.isFinite(Number(point?.latitude)) &&
    Number.isFinite(Number(point?.longitude));

const LiveMap = ({ ride, onMetricsChange }) => {
    const initialPosition = ride?.driver?.currentLocation;

    const [driverPosition, setDriverPosition] = useState(() =>
        isValidPoint(initialPosition)
            ? { latitude: Number(initialPosition.latitude), longitude: Number(initialPosition.longitude) }
            : null
    );

    const [route, setRoute] = useState(null);
    const [routing, setRouting] = useState(false);
    const [routeError, setRouteError] = useState("");

    const rideIdRef = useRef(ride?._id);
    const lastRouteRef = useRef(null);

    useEffect(() => {
        rideIdRef.current = ride?._id;
    }, [ride?._id]);

    useEffect(() => {
        const position = ride?.driver?.currentLocation;

        if (isValidPoint(position)) {
            setDriverPosition({
                latitude: Number(position.latitude),
                longitude: Number(position.longitude),
            });
        }
    }, [ride?.driver?.currentLocation]);

    useEffect(() => {
        setRoute(null);
        lastRouteRef.current = null;
        onMetricsChange?.({ distanceKm: null, etaMinutes: null });
    }, [ride?._id, ride?.status, onMetricsChange]);

    const handleLocation = useMemo(
        () => (payload) => {
            if (!payload || payload.rideId !== rideIdRef.current) return;

            const latitude = Number(payload.latitude);
            const longitude = Number(payload.longitude);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

            setDriverPosition({ latitude, longitude });
        },
        []
    );

    useSocket("driver:location", handleLocation, Boolean(ride?._id));

    const target =
        ride?.status === "PICKED_UP"
            ? ride?.dropLocation
            : ride?.pickupLocation;

    const targetLabel = ride?.status === "PICKED_UP" ? "Drop-off" : "Pickup point";
    const hasTarget = isValidPoint(target);

    const driverLatLng = driverPosition
        ? [driverPosition.latitude, driverPosition.longitude]
        : null;

    const targetLatLng = hasTarget
        ? [Number(target.latitude), Number(target.longitude)]
        : null;

    const centerLatLng = driverLatLng ?? targetLatLng ?? DEFAULT_CENTER;

    useEffect(() => {
        if (!ride?._id || !driverPosition || !hasTarget) return;

        const from = {
            latitude: Number(driverPosition.latitude),
            longitude: Number(driverPosition.longitude),
        };

        const to = {
            latitude: Number(target.latitude),
            longitude: Number(target.longitude),
        };

        const previous = lastRouteRef.current;

        if (
            previous &&
            previous.status === ride.status &&
            Math.abs(from.latitude - previous.latitude) < 0.0005 &&
            Math.abs(from.longitude - previous.longitude) < 0.0005
        ) {
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setRouting(true);
                setRouteError("");

                const result = await routeService.getRideRoute(ride._id, from, to);

                setRoute(result);
                onMetricsChange?.({
                    distanceKm: result.distanceKm,
                    etaMinutes: result.durationMinutes,
                });

                lastRouteRef.current = {
                    latitude: from.latitude,
                    longitude: from.longitude,
                    status: ride.status,
                };
            } catch (error) {
                setRouteError(error?.message || "Unable to calculate road route.");
            } finally {
                setRouting(false);
            }
        }, 700);

        return () => clearTimeout(timeout);
    }, [
        ride?._id,
        ride?.status,
        driverPosition?.latitude,
        driverPosition?.longitude,
        target?.latitude,
        target?.longitude,
        hasTarget,
        onMetricsChange,
    ]);

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <FaLocationDot className="size-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                            Live tracking
                        </p>

                        <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">
                            {driverPosition ? "Driver is on the move" : "Waiting for driver location…"}
                        </h2>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {routing && (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                            Routing…
                        </span>
                    )}

                    {route?.distanceKm != null && (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                            {route.distanceKm.toFixed(1)} km
                        </span>
                    )}

                    {route?.durationMinutes != null && (
                        <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                                ETA
                            </p>
                            <p className="text-sm font-bold text-slate-950">
                                ~{route.durationMinutes} min
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {routeError && (
                <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-700 sm:px-6">
                    {routeError}
                </div>
            )}

            {!hasTarget && (
                <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700 sm:px-6">
                    This ride does not contain pickup/drop coordinates. Create a new ride using Search or Map Pin.
                </div>
            )}

            <div className="h-72 w-full sm:h-96">
                <MapContainer
                    center={centerLatLng}
                    zoom={driverLatLng || targetLatLng ? 13 : 11}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {driverLatLng && (
                        <>
                            <Marker position={driverLatLng} icon={driverIcon}>
                                <Popup>Driver&apos;s current location</Popup>
                            </Marker>
                            <RecenterOnMove position={driverLatLng} />
                        </>
                    )}

                    {targetLatLng && (
                        <Marker position={targetLatLng} icon={targetIcon}>
                            <Popup>
                                {targetLabel}
                                {target?.name ? `: ${target.name}` : ""}
                            </Popup>
                        </Marker>
                    )}

                    {route?.geometry?.length > 1 && (
                        <Polyline
                            positions={route.geometry}
                            pathOptions={{ color: "#0284c7", weight: 5, opacity: 0.9 }}
                        />
                    )}
                </MapContainer>
            </div>

            {route?.distanceKm != null && (
                <div className="border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500 sm:px-6">
                    {route.distanceKm.toFixed(1)} km to {targetLabel.toLowerCase()}
                </div>
            )}
        </section>
    );
};

export default LiveMap;