import { useEffect, useRef } from "react";
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

const PICKUP = {
  lat: 19.0896,
  lng: 72.8656,
  lines: ["Chhatrapati Shivaji", "Maharaj International Airport"],
  city: "Mumbai",
};

const DESTINATION = {
  lat: 18.9217,
  lng: 72.8332,
  name: "The Taj Mahal Palace",
  city: "Mumbai",
};

const DRIVER_POSITION = {
  lat: 19.02,
  lng: 72.8275,
};

const ROUTE_WAYPOINTS = [
  [19.0896, 72.8656],
  [19.0999, 72.8422],
  [19.0596, 72.8295],
  [19.033, 72.8397],
  [19.02, 72.8275],
  [19.0, 72.817],
  [18.975, 72.81],
  [18.9217, 72.8332],
];

const MAP_CENTER = [19.015, 72.9];
const MAP_ZOOM = 10.5;

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const METRICS = [
  {
    icon: FaRoute,
    label: "Route",
    value: "28.8 km",
    detail: "Airport → Taj Mahal Palace",
  },
  {
    icon: FaClock,
    label: "ETA",
    value: "49 min",
    detail: "Estimated driving time",
  },
  {
    icon: FaUserGroup,
    label: "Status",
    value: "Picked up",
    detail: "Heading to destination",
    accent: true,
  },
  {
    icon: FaCarSide,
    label: "Vehicle",
    value: "Sedan",
    detail: "6 seats",
  },
];

const buildPinIcon = (colorHex) =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:28px;height:36px;filter:drop-shadow(0 5px 8px rgba(0,0,0,.42));">
        <span style="position:absolute;left:50%;top:12px;width:24px;height:24px;background:${colorHex};opacity:.24;border-radius:9999px;transform:translate(-50%,-50%);"></span>
        <svg width="28" height="36" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 0C5.8 0 0 5.8 0 13c0 9.2 13 21 13 21s13-11.8 13-21C26 5.8 20.2 0 13 0z" fill="${colorHex}"/>
          <circle cx="13" cy="13" r="5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });

const buildDriverIcon = () =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:30px;height:30px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:.35;animation:scd-driver-pulse 2.2s ease-out infinite;"></span>
        <span style="position:absolute;inset:4px;border-radius:9999px;background:#2563eb;border:2px solid rgba(255,255,255,.85);box-shadow:0 5px 12px rgba(37,99,235,.5);"></span>
      </div>
      <style>
        @keyframes scd-driver-pulse {
          0% { transform:scale(.7); opacity:.55; }
          100% { transform:scale(2.4); opacity:0; }
        }
      </style>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const pickupIcon = buildPinIcon("#10b981");
const destinationIcon = buildPinIcon("#f43f5e");
const driverIcon = buildDriverIcon();

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

const RouteShine = () => {
  const routeRef = useRef(null);

  useEffect(() => {
    const path = routeRef.current?.getElement();

    if (!path) return;

    const duration = 3400;
    const dashLength = 36;
    const gapLength = 860;
    const patternLength = dashLength + gapLength;
    let frameId;
    let startTime = null;

    const animate = (time) => {
      if (startTime === null) startTime = time;

      const progress = ((time - startTime) % duration) / duration;
      const offset = -(progress * patternLength);

      path.style.strokeDashoffset = `${offset}px`;
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <Polyline
      ref={routeRef}
      positions={ROUTE_WAYPOINTS}
      pathOptions={{
        color: "#dbeafe",
        weight: 3,
        opacity: 0.95,
        lineCap: "round",
        dashArray: "36 860",
        className: "scd-route-shine",
      }}
    />
  );
};

const MapControls = () => {
  const map = useMap();

  return (
    <div className="absolute left-3 top-3 z-[500] flex flex-col gap-1 sm:left-4 sm:top-4">
      <button
        type="button"
        onClick={() => map.setView(MAP_CENTER, MAP_ZOOM, { animate: true })}
        aria-label="Recenter map"
        className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-slate-900/85 text-slate-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800 sm:size-9"
      >
        <FaLocationCrosshairs className="size-3.5" />
      </button>

      <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-900/85 shadow-lg backdrop-blur-md">
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

const LocationCard = ({
  eyebrow,
  eyebrowClass,
  iconBg,
  iconColor,
  icon: Icon,
  lines,
  city,
  pickup = false,
}) => (
  <div
    className={`pointer-events-none rounded-lg bg-slate-900/95 px-2.5 py-2 shadow-xl ${
      pickup
        ? "w-[184px] border-1 border-emerald-400/80 sm:w-[198px]"
        : "w-[154px] border-1 border-rose-400/80 sm:w-[162px]"
    }`}
  >
    <div className="flex items-center gap-2">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
      >
        <Icon className="size-2.5 sm:size-3" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[8px] font-medium uppercase tracking-[0.12em] ${eyebrowClass}`}
        >
          {eyebrow}
        </p>

        <p className="mt-0.5 text-[10px] font-medium tracking-[0.03em] leading-[1.3] text-white sm:text-[11px]">
          {lines.map((line) => (
            <span key={line} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </p>

        <p className="mt-0.5 text-[8px] tracking-[0.03em] text-slate-400 sm:text-[9px]">
          {city}
        </p>
      </div>
    </div>
  </div>
);

const DispatchMap = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-blue-950/30 ring-1 ring-blue-400/5">
      <style>{`
        .scd-dark-map {
          filter: brightness(0.45) saturate(0.4) contrast(1.35) grayscale(0.15);
        }

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

        @media (max-width: 639px) {
          .scd-mobile-tooltip .leaflet-tooltip-content {
            max-width: 100%;
          }
        }

        .scd-route-shine {
          filter: drop-shadow(0 0 4px rgba(191, 219, 254, 0.9))
            drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
        }
      `}</style>

      <div className="relative z-[600] flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-3.5 py-3 backdrop-blur-xl sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img
            src="/smart-cab-logo.png"
            alt="Smart Cab"
            className="logo-on-dark size-8 shrink-0 object-contain sm:size-9"
          />

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-white sm:text-base">
              Smart Cab
            </p>
            <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
              Dispatch platform
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>

          <span className="text-left">
            <span className="block whitespace-nowrap text-[9px] font-medium tracking-[0.03em] leading-tight text-emerald-300 sm:text-[10px]">
              Ride in progress
            </span>

            <span className="hidden text-[8px] tracking-[0.03em] leading-tight text-emerald-400/70 sm:block">
              Live route
            </span>
          </span>
        </span>
      </div>

      <div className="relative h-[400px] w-full sm:h-[360px] lg:h-[380px]">
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
          style={{
            height: "100%",
            width: "100%",
            background: "#0a1120",
          }}
        >
          <TileLayer
            url={TILE_URL}
            attribution={TILE_ATTRIBUTION}
            className="scd-dark-map"
          />

          <MapResizeHandler />
          <MapControls />

          <Polyline
            positions={ROUTE_WAYPOINTS}
            pathOptions={{
              color: "#1d4ed8",
              weight: 8,
              opacity: 0.18,
              lineCap: "round",
            }}
          />

          <Polyline
            positions={ROUTE_WAYPOINTS}
            pathOptions={{
              color: "#3b82f6",
              weight: 3,
              opacity: 0.95,
              lineCap: "round",
            }}
          />

          <RouteShine />

          <Marker position={[PICKUP.lat, PICKUP.lng]} icon={pickupIcon}>
            <Tooltip
              permanent
              interactive={false}
              direction="right"
              offset={[8, -10]}
              className="scd-card-tooltip scd-mobile-tooltip"
            >
              <LocationCard
                eyebrow="Pickup"
                eyebrowClass="text-emerald-400"
                iconBg="bg-emerald-400/15"
                iconColor="text-white/90"
                icon={FaPlaneDeparture}
                lines={PICKUP.lines}
                city={PICKUP.city}
                pickup
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
              offset={[8, -10]}
              className="scd-card-tooltip scd-mobile-tooltip"
            >
              <LocationCard
                eyebrow="Destination"
                eyebrowClass="text-rose-400"
                iconBg="bg-rose-400/15"
                iconColor="text-white/90"
                icon={FaHotel}
                lines={[DESTINATION.name]}
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
              offset={[10, 0]}
              className="scd-card-tooltip"
            >
              <div className="pointer-events-none flex w-[162px] items-center gap-2 rounded-lg border border-blue-400/25 bg-slate-900/95 px-2.5 py-2 shadow-xl sm:w-[176px] sm:px-3 sm:py-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-white/90">
                  <FaCarSide className="size-2.5" />
                </span>

                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[10px] font-medium tracking-[0.03em] leading-none text-white sm:text-[11px]">
                    Heading to destination
                  </p>

                  <p className="mt-1 whitespace-nowrap text-[8px] tracking-[0.05em] text-blue-300 sm:text-[9px]">
                    23 min remaining
                  </p>
                </div>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>

        <div className="pointer-events-none absolute right-3 top-3 z-[500] hidden items-center gap-2 rounded-lg border border-white/10 bg-slate-900/85 px-2.5 py-1.5 shadow-lg backdrop-blur-md sm:flex sm:right-4 sm:top-4">
          <FaCloud className="size-3.5 text-slate-300" />

          <div className="leading-tight">
            <p className="text-[10px] font-medium tracking-[0.03em] text-white">
              26°C
            </p>
            <p className="text-[8px] tracking-[0.03em] text-slate-400">
              Mumbai
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 z-[500] hidden items-center gap-2 rounded-lg border border-cyan-400/15 bg-slate-900/90 px-2.5 py-1.5 shadow-xl backdrop-blur-md sm:flex sm:bottom-4 sm:right-4 sm:px-3 sm:py-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300 sm:size-7">
            <FaSatelliteDish className="size-3 sm:size-3.5" />
          </span>

          <div>
            <p className="whitespace-nowrap text-[9px] font-medium tracking-[0.03em] text-white sm:text-[10px]">
              Driver location
            </p>

            <p className="hidden text-[8px] tracking-[0.03em] text-slate-500 sm:block">
              Live • Route • ETA
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-[600] grid grid-cols-2 divide-x divide-y divide-white/10 bg-slate-900/95 sm:grid-cols-4 sm:divide-y-0">
        {METRICS.map(({ icon: Icon, label, value, detail, accent }) => (
          <div
            key={label}
            className="min-w-0 px-3 py-2.5 sm:px-4 sm:py-3"
          >
            <p className="truncate text-[8px] font-medium uppercase tracking-[0.16em] text-slate-500">
              {label}
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <Icon
                className={`size-2.5 shrink-0 sm:size-3 ${
                  accent ? "text-emerald-400" : "text-blue-400"
                }`}
              />

              <p
                className={`truncate text-xs font-medium tracking-[0.02em] sm:text-sm ${
                  accent ? "text-emerald-300" : "text-white"
                }`}
              >
                {value}
              </p>
            </div>

            {detail && (
              <p className="mt-0.5 truncate text-[8px] tracking-[0.02em] text-slate-500 sm:text-[9px]">
                {detail}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DispatchMap;