import api from "./api.js";

const getRideRoute = async (
    rideId,
    from,
    to
) => {
    const response = await api.get(
        `/rides/${rideId}/route`,
        {
            params: {
                fromLat: from.latitude,
                fromLng: from.longitude,
                toLat: to.latitude,
                toLng: to.longitude,
            },
        }
    );

    return response.data;
};

export default {
    getRideRoute,
};