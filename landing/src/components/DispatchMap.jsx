import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaCarSide,
  FaChevronRight,
  FaCircleMinus,
  FaCirclePlus,
  FaCloud,
  FaHotel,
  FaLocationCrosshairs,
  FaPlaneDeparture,
  FaRoute,
  FaSatelliteDish,
  FaClock,
  FaUserGroup,
} from "react-icons/fa6";

/*
 * Real Mumbai coordinates and a hand-picked, road-plausible waypoint
 * chain (Airport -> Vile Parle -> Bandra -> Dadar/Mahim -> Worli ->
 * Haji Ali -> Colaba), rather than a straight line or an arbitrary
 * curve. This mirrors the actual corridor a cab takes between CSMIA
 * and Colaba (Western Express Highway -> SV Road -> Tulsi Pipe Road
 * -> Annie Besant Road).
 *
 * This is a static marketing preview, not a live OSRM route — the app's
 * real ride pages call the backend's routing endpoint per active ride;
 * a public marketing page has no active ride to route.
 */
const PICKUP = {
  lat: 19.0896,
  lng: 72.8656,
  name: "Chhatrapati Shivaji Maharaj International Airport",
  city: "Mumbai",
};

const DESTINATION = {
  lat: 18.9217,
  lng: 72.8332,
  name: "The Taj Mahal Palace",
  city: "Mumbai",
};

const DRIVER_POSITION = {
  lat: 19.0596,
  lng: 72.8295,
};

const ROUTE_WAYPOINTS = [
  [19.0896, 72.8656], // Airport (pickup)
  [19.0999, 72.8422], // Vile Parle
  [19.0596, 72.8295], // Bandra (driver is here)
  [19.033, 72.8397], // Dadar / Mahim junction
  [19.0, 72.817], // Worli
  [18.975, 72.81], // Haji Ali / Mahalaxmi
  [18.9217, 72.8332], // Colaba (destination)
];

const MAP_CENTER = [19.0, 72.92];
const MAP_ZOOM = 11;

// CARTO's keyless dark basemap — the same OSM-derived map data used by
// the portals, presented in a dark theme for this marketing surface.
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const METRICS = [
  {
    icon: FaRoute,
    label: "Route",
    value: "28.8 km",
    detail: "From Airport to The Taj Mahal Palace",
  },
  {
    icon: FaClock,
    label: "Estimated arrival",
    value: "49 min",
    detail: "Estimated driving time",
  },
  {
    icon: FaUserGroup,
    label: "Status",
    value: "Assigned",
    detail: "Driver on the way",
    accent: true,
  },
  {
    icon: FaCarSide,
    label: "Vehicle",
    value: "6 seats",
    detail: "Sedan",
  },
];

/*
 * Pin-shaped marker icon — the same teardrop-pin construction already
 * used in guest-portal/src/components/LocationPicker.jsx, reused here
 * for visual consistency across the app's map surfaces.
 */
const buildPinIcon = (colorHex) =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:34px;height:44px;transform:translate(-50%,-100%);filter:drop-shadow(0 6px 10px rgba(0,0,0,.45));">
        <span style="position:absolute;left:50%;top:15px;width:30px;height:30px;background:${colorHex};opacity:.28;border-radius:9999px;transform:translate(-50%,-50%);"></span>
        <svg width="34" height="44" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" style="position:relative;">
          <path d="M13 0C5.8 0 0 5.8 0 13c0 9.2 13 21 13 21s13-11.8 13-21C26 5.8 20.2 0 13 0z" fill="${colorHex}"/>
          <circle cx="13" cy="13" r="5.5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  });

const buildDriverIcon = () =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:40px;height:40px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:.35;animation:scd-driver-pulse 2.2s ease-out infinite;"></span>
        <span style="position:absolute;inset:5px;border-radius:9999px;background:#2563eb;border:3px solid rgba(255,255,255,.85);box-shadow:0 6px 16px rgba(37,99,235,.55);"></span>
      </div>
      <style>
        @keyframes scd-driver-pulse {
          0% { transform:scale(.7); opacity:.55; }
          100% { transform:scale(2.4); opacity:0; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const pickupIcon = buildPinIcon("#10b981");
const destinationIcon = buildPinIcon("#f43f5e");
const driverIcon = buildDriverIcon();

/*
 * Leaflet can measure its container before the surrounding flex/grid
 * layout and webfonts finish settling, especially inside a responsive
 * hero. Force a re-measure shortly after mount and whenever the viewport
 * changes so the tile grid stays correctly positioned.
 */
const MapResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const timeout = setTimeout(invalidate, 200);

    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  return null;
};

/*
 * Static marketing preview: map gestures are disabled so the component
 * behaves like a product visualization instead of hijacking page scroll.
 * The visible controls still operate on the real Leaflet instance.
 */
const MapControls = () => {
  const map = useMap();

  return (
    <div className="absolute left-3 top-3 z-[500] flex flex-col gap-1.5 sm:left-4 sm:top-4">
      <button
        type="button"
        onClick={() => map.setView(MAP_CENTER, MAP_ZOOM, { animate: true })}
        aria-label="Recenter map"
        className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-slate-900/85 text-slate-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800 sm:size-9"
      >
        <FaLocationCrosshairs className="size-3.5" />
      </button>

      <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/85 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="Zoom in"
          className="flex size-8 items-center justify-center text-slate-300 transition hover:bg-white/5 sm:size-9"
        >
          <FaCirclePlus className="size-3.5" />
        </button>
        <div className="h-px bg-white/10" />
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="Zoom out"
          className="flex size-8 items-center justify-center text-slate-300 transition hover:bg-white/5 sm:size-9"
        >
          <FaCircleMinus className="size-3.5" />
        </button>
      </div>
    </div>
  );
};

/*
 * Location cards live inside Leaflet Tooltips so their position is tied
 * to the real marker projection. They cannot drift away at different
 * viewport sizes like percentage-positioned overlays can.
 */
const LocationCard = ({
  eyebrow,
  eyebrowClass,
  iconBg,
  iconColor,
  icon: Icon,
  name,
  city,
}) => (
  <div className="pointer-events-none w-[168px] rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2.5 shadow-xl sm:w-[200px] sm:px-3.5 sm:py-3">
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg sm:size-7 ${iconBg} ${iconColor}`}
      >
        <Icon className="size-3 sm:size-3.5" />
      </span>
      <div className="min-w-0">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${eyebrowClass}`}
        >
          {eyebrow}
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-snug text-white sm:text-xs">
          {name}
        </p>
        <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
          {city}
        </p>
      </div>
      <FaChevronRight className="mt-0.5 hidden size-2.5 shrink-0 text-slate-500 sm:block" />
    </div>
  </div>
);

const DispatchMap = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-blue-950/30 ring-1 ring-blue-400/5">
      <style>{`
        .scd-card-tooltip.leaflet-tooltip {
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
          opacity: 1 !important;
        }
        .scd-card-tooltip.leaflet-tooltip::before {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="relative z-[600] flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-4 py-3.5 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img
            src="/smart-cab-logo.png"
            alt="Smart Cab"
            className="size-9 shrink-0 rounded-xl border border-white/10 bg-slate-950/60 object-contain p-1.5 sm:size-11"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-white sm:text-base">
              Smart Cab
            </p>
            <p className="truncate text-[11px] text-slate-400 sm:text-xs">
              Dispatch platform
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 sm:px-3">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-left">
            <span className="block text-[10px] font-bold leading-tight text-emerald-300 sm:text-[11px]">
              Tracking in progress
            </span>
            <span className="hidden text-[9px] leading-tight text-emerald-400/70 sm:block">
              Live route preview
            </span>
          </span>
        </span>
      </div>

      {/* Map */}
      <div className="relative h-[380px] w-full sm:h-[420px] lg:h-[500px]">
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          style={{ height: "100%", width: "100%", background: "#0a1120" }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapResizeHandler />
          <MapControls />

          <Polyline
            positions={ROUTE_WAYPOINTS}
            pathOptions={{
              color: "#1d4ed8",
              weight: 10,
              opacity: 0.18,
              lineCap: "round",
            }}
          />
          <Polyline
            positions={ROUTE_WAYPOINTS}
            pathOptions={{
              color: "#3b82f6",
              weight: 4,
              opacity: 0.95,
              lineCap: "round",
            }}
          />

          <Marker position={[PICKUP.lat, PICKUP.lng]} icon={pickupIcon}>
            <Tooltip
              permanent
              interactive={false}
              direction="right"
              offset={[10, -34]}
              className="scd-card-tooltip"
            >
              <LocationCard
                eyebrow="Pickup"
                eyebrowClass="text-emerald-400"
                iconBg="bg-emerald-400/15"
                iconColor="text-emerald-400"
                icon={FaPlaneDeparture}
                name={PICKUP.name}
                city={PICKUP.city}
              />
            </Tooltip>
          </Marker>

          <Marker
            position={[DESTINATION.lat, DESTINATION.lng]}
            icon={destinationIcon}
          >
            <Tooltip
              permanent
              interactive={false}
              direction="right"
              offset={[10, -34]}
              className="scd-card-tooltip"
            >
              <LocationCard
                eyebrow="Destination"
                eyebrowClass="text-rose-400"
                iconBg="bg-rose-400/15"
                iconColor="text-rose-400"
                icon={FaHotel}
                name={DESTINATION.name}
                city={DESTINATION.city}
              />
            </Tooltip>
          </Marker>

          <Marker
            position={[DRIVER_POSITION.lat, DRIVER_POSITION.lng]}
            icon={driverIcon}
          >
            <Tooltip
              permanent
              interactive={false}
              direction="right"
              offset={[14, 0]}
              className="scd-card-tooltip"
            >
              <div className="pointer-events-none rounded-xl border border-blue-400/25 bg-slate-900/95 px-3 py-2 shadow-xl sm:px-3.5 sm:py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                  Driver
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-white sm:text-xs">
                  On the way
                </p>
                <p className="text-[9px] text-blue-300 sm:text-[10px]">
                  6 min away
                </p>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>

        {/* Viewport-fixed dashboard chrome */}
        <div className="pointer-events-none absolute right-3 top-3 z-[500] hidden items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-lg backdrop-blur-md sm:flex sm:right-4 sm:top-4">
          <FaCloud className="size-4 text-slate-300" />
          <div className="leading-tight">
            <p className="text-xs font-bold text-white">26°C</p>
            <p className="text-[10px] text-slate-400">Mumbai</p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] inline-flex items-center gap-2.5 rounded-xl border border-cyan-400/15 bg-slate-900/90 px-3 py-2 shadow-xl backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-3.5 sm:py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 sm:size-8">
            <FaSatelliteDish className="size-3.5 sm:size-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-white sm:text-[11px]">
              Live location updates
            </p>
            <p className="hidden text-[9px] text-slate-500 sm:block">
              Driver location, route and ETA
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="relative z-[600] grid grid-cols-2 divide-x divide-y divide-white/10 bg-slate-900/95 sm:grid-cols-4 sm:divide-y-0">
        {METRICS.map(({ icon: Icon, label, value, detail, accent }) => (
          <div key={label} className="min-w-0 px-4 py-3.5 sm:py-4">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {label}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <Icon
                className={`size-3 shrink-0 ${accent ? "text-emerald-400" : "text-blue-400"}`}
              />
              <p
                className={`truncate text-sm font-black ${accent ? "text-emerald-300" : "text-white"}`}
              >
                {value}
              </p>
            </div>
            <p className="mt-0.5 truncate text-[9px] text-slate-500">
              {detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DispatchMap;
