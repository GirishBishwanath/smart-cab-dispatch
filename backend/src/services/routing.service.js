const OSRM_BASE_URL =
    process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

const isValidCoordinate = (point) => {
    const latitude = Number(point?.latitude);
    const longitude = Number(point?.longitude);

    return Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180 &&
        !(latitude === 0 && longitude === 0);
};

const getDrivingRoute = async (from, to) => {
    if (!isValidCoordinate(from) || !isValidCoordinate(to)) {
        throw new Error("Invalid routing coordinates");
    }

    const coordinates = [
        `${Number(from.longitude)},${Number(from.latitude)}`,
        `${Number(to.longitude)},${Number(to.latitude)}`,
    ].join(";");

    const url =
        `${OSRM_BASE_URL}/route/v1/driving/${coordinates}` +
        "?overview=full&geometries=geojson&steps=false";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`OSRM request failed with ${response.status}`);
        }

        const data = await response.json();

        if (data?.code !== "Ok" || !data?.routes?.length) {
            throw new Error(
                data?.message || `OSRM returned ${data?.code || "unknown error"}`
            );
        }

        const route = data.routes[0];
        const osrmMinutes = Number(route.duration) / 60;
        const etaFactor = Number(process.env.OSRM_ETA_FACTOR) || 1.4;
        const durationMinutes = Math.max(
            1,
            Math.round(osrmMinutes * etaFactor)
        );

        const geometry = Array.isArray(route.geometry?.coordinates)
            ? route.geometry.coordinates
                  .filter(
                      (point) =>
                          Array.isArray(point) &&
                          point.length >= 2 &&
                          Number.isFinite(Number(point[0])) &&
                          Number.isFinite(Number(point[1]))
                  )
                  .map(([lng, lat]) => [Number(lat), Number(lng)])
            : [];

        return {
            distanceKm: Number((Number(route.distance) / 1000).toFixed(1)),
            durationMinutes,
            geometry,
        };
    } finally {
        clearTimeout(timeout);
    }
};

export default { getDrivingRoute };