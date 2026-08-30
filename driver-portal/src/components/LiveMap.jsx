import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationDot } from "react-icons/fa6";

const buildDivIcon = (colorClass, pulse = false) =>
    L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:20px;height:20px;">
                ${
                    pulse
                        ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${colorClass};opacity:0.35;animation:scd-pulse 1.6s ease-out infinite;"></span>`
                        : ""
                }
                <span style="position:absolute;inset:3px;border-radius:9999px;background:${colorClass};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>
            </div>
            <style>
                @keyframes scd-pulse {
                    0% { transform: scale(0.6); opacity: 0.5; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
            </style>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

const selfIcon = buildDivIcon("#0284c7", true);
const targetIcon = buildDivIcon("#dc2626");

const RecenterOnMove = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom(), { animate: true });
        }
    }, [position, map]);

    return null;
};

const LiveMap = ({ ride, position, locationError }) => {
    const target =
        ride?.status === "PICKED_UP"
            ? ride?.dropLocation
            : ride?.pickupLocation;

    const targetLabel =
        ride?.status === "PICKED_UP" ? "Drop-off" : "Pickup point";

    if (!target?.latitude || !target?.longitude) {
        return null;
    }

    const selfLatLng = position
        ? [position.latitude, position.longitude]
        : null;

    const targetLatLng = [target.latitude, target.longitude];

    const centerLatLng = selfLatLng ?? targetLatLng;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <FaLocationDot className="size-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                            Live location
                        </p>
                        <h2 className="mt-0.5 text-base font-bold text-slate-950">
                            {selfLatLng
                                ? `Sharing location · heading to ${targetLabel.toLowerCase()}`
                                : "Getting your GPS fix…"}
                        </h2>
                    </div>
                </div>
            </div>

            {locationError && (
                <div className="border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-xs font-semibold text-amber-700 sm:px-6">
                    {locationError} — enable location access to share your
                    position with the passenger.
                </div>
            )}

            <div className="h-72 w-full sm:h-96">
                <MapContainer
                    center={centerLatLng}
                    zoom={13}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {selfLatLng && (
                        <>
                            <Marker position={selfLatLng} icon={selfIcon}>
                                <Popup>Your current location</Popup>
                            </Marker>
                            <RecenterOnMove position={selfLatLng} />
                        </>
                    )}

                    <Marker position={targetLatLng} icon={targetIcon}>
                        <Popup>
                            {targetLabel}
                            {target.name ? `: ${target.name}` : ""}
                        </Popup>
                    </Marker>

                    {selfLatLng && (
                        <Polyline
                            positions={[selfLatLng, targetLatLng]}
                            pathOptions={{
                                color: "#0284c7",
                                weight: 3,
                                dashArray: "6 8",
                                opacity: 0.7,
                            }}
                        />
                    )}
                </MapContainer>
            </div>
        </section>
    );
};

export default LiveMap;