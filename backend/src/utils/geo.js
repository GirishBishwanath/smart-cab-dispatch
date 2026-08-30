const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistanceKm = (pointA, pointB) => {
    if (
        !pointA ||
        !pointB ||
        typeof pointA.latitude !== "number" ||
        typeof pointA.longitude !== "number" ||
        typeof pointB.latitude !== "number" ||
        typeof pointB.longitude !== "number" ||
        Number.isNaN(pointA.latitude) ||
        Number.isNaN(pointA.longitude) ||
        Number.isNaN(pointB.latitude) ||
        Number.isNaN(pointB.longitude)
    ) {
        return Infinity;
    }

    const dLat = toRadians(pointB.latitude - pointA.latitude);
    const dLon = toRadians(pointB.longitude - pointA.longitude);

    const lat1 = toRadians(pointA.latitude);
    const lat2 = toRadians(pointB.latitude);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
};

const estimateEtaMinutes = (distanceKm, averageSpeedKmh = 30) => {
    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
        return null;
    }

    return Math.max(1, Math.round((distanceKm / averageSpeedKmh) * 60));
};

export { haversineDistanceKm, estimateEtaMinutes };