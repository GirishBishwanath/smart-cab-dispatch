import { useMemo, useState } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationDot } from "react-icons/fa6";

import useSocket from "../hooks/useSocket.js";

const DEFAULT_CENTER = [26.2389, 73.0243];

const driverIcon = L.divIcon({
    className: "",
    html: `
        <div style="width:22px;height:22px;position:relative">
            <span style="position:absolute;inset:0;border-radius:9999px;background:#0284c7;opacity:.25"></span>
            <span style="position:absolute;inset:4px;border-radius:9999px;background:#0284c7;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,.35)"></span>
        </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const FleetMap = ({ rides }) => {
    const initialPositions = useMemo(() => {
        const map = {};

        rides.forEach((ride) => {
            const position =
                ride.driver?.currentLocation;

            if (
                Number.isFinite(position?.latitude) &&
                Number.isFinite(position?.longitude)
            ) {
                map[ride._id] = position;
            }
        });

        return map;
    }, [rides]);

    const [positions, setPositions] =
        useState(initialPositions);

    useSocket(
        "driver:location",
        (payload) => {
            if (!payload?.rideId) return;

            const latitude = Number(payload.latitude);
            const longitude = Number(payload.longitude);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                return;
            }

            setPositions((previous) => ({
                ...previous,
                [payload.rideId]: {
                    latitude,
                    longitude,
                },
            }));
        },
        true
    );

    const visibleRides = rides.filter(
        (ride) =>
            positions[ride._id] &&
            ["ASSIGNED", "ARRIVED", "PICKED_UP"].includes(
                ride.status
            )
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <FaLocationDot className="size-4" />
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        Fleet tracking
                    </p>

                    <h2 className="mt-0.5 text-base font-bold text-slate-950">
                        Active drivers
                    </h2>
                </div>
            </div>

            <div className="h-80 w-full sm:h-96">
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={11}
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

                    {visibleRides.map((ride) => {
                        const position =
                            positions[ride._id];

                        return (
                            <Marker
                                key={ride._id}
                                position={[
                                    position.latitude,
                                    position.longitude,
                                ]}
                                icon={driverIcon}
                            >
                                <Popup>
                                    <strong>
                                        {ride.driver?.user?.fullName ||
                                            "Driver"}
                                    </strong>
                                    <br />
                                    {ride.driver?.user?.phone || "No phone"}
                                    <br />
                                    {ride.pickupLocation?.name || "Pickup"}
                                    {" → "}
                                    {ride.dropLocation?.name ||
                                        "Destination"}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {!visibleRides.length && (
                <div className="border-t border-slate-100 px-5 py-4 text-sm font-medium text-slate-500">
                    No active driver locations are available yet.
                </div>
            )}
        </section>
    );
};

export default FleetMap;