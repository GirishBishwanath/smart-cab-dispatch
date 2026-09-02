import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationDot, FaMagnifyingGlass, FaCrosshairs } from "react-icons/fa6";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

const buildPinIcon = (color) =>
    L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:26px;height:36px;transform:translate(-50%,-100%)">
                <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 0C5.82 0 0 5.82 0 13c0 9.5 13 23 13 23s13-13.5 13-23C26 5.82 20.18 0 13 0Z" fill="${color}"/>
                    <circle cx="13" cy="13" r="5.5" fill="#fff"/>
                </svg>
            </div>
        `,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
    });

const pickupIcon = buildPinIcon("#059669");
const dropIcon = buildPinIcon("#e11d48");

const MapMover = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
    }, [map, position]);

    return null;
};

const ClickToPin = ({ onPick }) => {
    useMapEvents({
        click: ({ latlng }) =>
            onPick({
                latitude: latlng.lat,
                longitude: latlng.lng,
            }),
    });

    return null;
};

const LocationPicker = ({
    label,
    color = "emerald",
    value,
    onChange,
    defaultCenter,
}) => {
    const [query, setQuery] = useState(value?.name ?? "");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);

    const isPickup = color === "emerald";
    const icon = isPickup ? pickupIcon : dropIcon;

    const hasCoordinates =
        Number.isFinite(value?.latitude) &&
        Number.isFinite(value?.longitude);

    const position = hasCoordinates
        ? [value.latitude, value.longitude]
        : defaultCenter;

    useEffect(() => {
        setQuery(value?.name ?? "");
    }, [value?.name]);

    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    const searchPlaces = (text) => {
        clearTimeout(debounceRef.current);

        if (text.trim().length < 3) {
            setResults([]);
            setSearching(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setSearching(true);

                const params = new URLSearchParams({
                    q: text.trim(),
                    format: "json",
                    addressdetails: "1",
                    limit: "5",
                });

                const response = await fetch(
                    `${NOMINATIM_SEARCH}?${params.toString()}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) throw new Error("Search failed");

                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);
    };

    const handleQueryChange = ({ target }) => {
        const text = target.value;

        setQuery(text);
        setOpen(true);

        onChange({
            name: text,
            latitude: null,
            longitude: null,
        });

        searchPlaces(text);
    };

    const selectResult = (result) => {
        const next = {
            name: result.display_name,
            latitude: Number(result.lat),
            longitude: Number(result.lon),
        };

        setQuery(next.name);
        setResults([]);
        setOpen(false);
        onChange(next);
    };

    const reverseGeocode = async ({ latitude, longitude }) => {
        try {
            const params = new URLSearchParams({
                lat: String(latitude),
                lon: String(longitude),
                format: "json",
                zoom: "18",
            });

            const response = await fetch(
                `${NOMINATIM_REVERSE}?${params.toString()}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) throw new Error("Reverse geocoding failed");

            const data = await response.json();

            return data?.display_name ||
                `Pinned location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
        } catch {
            return `Pinned location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
        }
    };

    const handleMapPick = async (coordinates) => {
        setOpen(false);

        const name = await reverseGeocode(coordinates);

        const next = {
            ...coordinates,
            name,
        };

        setQuery(name);
        setResults([]);
        onChange(next);
    };

    return (
        <div className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FaLocationDot className={`size-3 ${isPickup ? "text-emerald-600" : "text-rose-600"}`} />
                {label}
            </span>

            <div className="relative">
                <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 z-10 size-3.5 -translate-y-1/2 text-slate-400" />

                <input
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => setOpen(true)}
                    placeholder="Search a place or pin it on the map"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

                {open && (searching || results.length > 0) && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1000] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        {searching && (
                            <div className="px-4 py-3 text-xs font-semibold text-slate-400">
                                Searching locations…
                            </div>
                        )}

                        {!searching &&
                            results.map((result) => (
                                <button
                                    key={result.place_id}
                                    type="button"
                                    onClick={() => selectResult(result)}
                                    className="block w-full border-b border-slate-100 px-4 py-3 text-left text-xs text-slate-700 transition last:border-0 hover:bg-slate-50"
                                >
                                    <span className="line-clamp-2">
                                        {result.display_name}
                                    </span>
                                </button>
                            ))}
                    </div>
                )}
            </div>

            <div className="relative mt-3 h-56 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <MapContainer
                    center={position}
                    zoom={hasCoordinates ? 15 : 12}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <ClickToPin onPick={handleMapPick} />
                    <MapMover position={hasCoordinates ? position : null} />

                    {hasCoordinates && (
                        <Marker position={position} icon={icon} />
                    )}
                </MapContainer>

                <div className="pointer-events-none absolute bottom-2 left-2 z-[500] flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm">
                    <FaCrosshairs className={`size-3 ${isPickup ? "text-emerald-600" : "text-rose-600"}`} />
                    Tap map to pin
                </div>
            </div>

            <p className="mt-1.5 text-[11px] text-slate-400">
                {hasCoordinates
                    ? `${value.name} · ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
                    : "Search for a location or tap the map to choose an exact point."}
            </p>
        </div>
    );
};

export default LocationPicker;