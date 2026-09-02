import {
    useEffect,
    useRef,
    useState,
} from "react";
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

import routeService from "../services/route.service.js";

const DEFAULT_CENTER = [26.2389, 73.0243];

const buildDivIcon = (color, pulse = false) =>
    L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:22px;height:22px;">
                ${pulse
                ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.35;animation:scd-pulse 1.6s ease-out infinite;"></span>`
                : ""
            }
                <span style="position:absolute;inset:3px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,.35);"></span>
            </div>
            <style>
                @keyframes scd-pulse {
                    0% { transform:scale(.6); opacity:.5; }
                    100% { transform:scale(2.2); opacity:0; }
                }
            </style>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

const driverIcon = buildDivIcon("#0284c7", true);
const targetIcon = buildDivIcon("#dc2626");

const RecenterOnMove = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(
                position,
                Math.max(map.getZoom(), 14),
                { animate: true }
            );
        }
    }, [position, map]);

    return null;
};

const isValidPoint = (point) =>
    Number.isFinite(Number(point?.latitude)) &&
    Number.isFinite(Number(point?.longitude));

const LiveMap = ({
    ride,
    position,
    locationError,
    locationPermission,
}) => {
    const target =
        ride?.status === "PICKED_UP"
            ? ride?.dropLocation
            : ride?.pickupLocation;

    const targetLabel =
        ride?.status === "PICKED_UP"
            ? "Drop-off"
            : "Pickup point";

    const hasTarget = isValidPoint(target);

    const driverLatLng = position
        ? [position.latitude, position.longitude]
        : null;

    const targetLatLng = hasTarget
        ? [target.latitude, target.longitude]
        : null;

    const center =
        driverLatLng ??
        targetLatLng ??
        DEFAULT_CENTER;

    const [route, setRoute] = useState(null);
    const [routing, setRouting] = useState(false);
    const [routeError, setRouteError] =
        useState("");

    const lastRouteRef = useRef(null);

    useEffect(() => {
        setRoute(null);
        lastRouteRef.current = null;
    }, [ride?._id, ride?.status]);

    useEffect(() => {
        if (
            !ride?._id ||
            !position ||
            !hasTarget
        ) {
            return;
        }

        const from = {
            latitude: Number(position.latitude),
            longitude: Number(position.longitude),
        };

        const to = {
            latitude: Number(target.latitude),
            longitude: Number(target.longitude),
        };

        const previous = lastRouteRef.current;

        if (
            previous &&
            previous.status === ride.status &&
            Math.abs(
                from.latitude - previous.latitude
            ) < 0.0005 &&
            Math.abs(
                from.longitude - previous.longitude
            ) < 0.0005
        ) {
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setRouting(true);
                setRouteError("");

                const result =
                    await routeService.getRideRoute(
                        ride._id,
                        from,
                        to
                    );

                setRoute(result);

                lastRouteRef.current = {
                    latitude: from.latitude,
                    longitude: from.longitude,
                    status: ride.status,
                };
            } catch (error) {
                setRouteError(
                    error?.message ||
                    "Unable to calculate road route."
                );
            } finally {
                setRouting(false);
            }
        }, 700);

        return () => clearTimeout(timeout);
    }, [
        ride?._id,
        ride?.status,
        position?.latitude,
        position?.longitude,
        target?.latitude,
        target?.longitude,
        hasTarget,
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
                            Live location
                        </p>

                        <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">
                            {driverLatLng
                                ? `Live · ${targetLabel.toLowerCase()}`
                                : "Waiting for GPS location…"}
                        </h2>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {routing && (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                            Routing…
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

                    {locationPermission === "granted" && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                            GPS active
                        </span>
                    )}
                </div>
            </div>

            {locationError && (
                <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-700 sm:px-6">
                    {locationError}
                </div>
            )}

            {routeError && (
                <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-700 sm:px-6">
                    {routeError}
                </div>
            )}

            {!hasTarget && (
                <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700 sm:px-6">
                    This ride does not contain pickup/drop coordinates.
                    Create a new ride using Search or Map Pin.
                </div>
            )}

            <div className="h-72 w-full sm:h-96">
                <MapContainer
                    center={center}
                    zoom={
                        driverLatLng || targetLatLng
                            ? 13
                            : 11
                    }
                    scrollWheelZoom
                    style={{
                        height: "100%",
                        width: "100%",
                    }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {driverLatLng && (
                        <>
                            <Marker
                                position={driverLatLng}
                                icon={driverIcon}
                            >
                                <Popup>
                                    Your current location
                                </Popup>
                            </Marker>

                            <RecenterOnMove
                                position={driverLatLng}
                            />
                        </>
                    )}

                    {targetLatLng && (
                        <Marker
                            position={targetLatLng}
                            icon={targetIcon}
                        >
                            <Popup>
                                {targetLabel}
                                {target?.name
                                    ? `: ${target.name}`
                                    : ""}
                            </Popup>
                        </Marker>
                    )}

                    {route?.geometry?.length > 1 && (
                        <Polyline
                            positions={route.geometry}
                            pathOptions={{
                                color: "#0284c7",
                                weight: 5,
                                opacity: 0.9,
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            {route?.distanceKm != null && (
                <div className="border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500 sm:px-6">
                    {route.distanceKm.toFixed(1)} km to{" "}
                    {targetLabel.toLowerCase()}
                </div>
            )}
        </section>
    );
};

export default LiveMap;