import api from "./api.js";

const getCurrentRide = async () => {
    const response = await api.get("/rides/guest/current");
    return response.data;
};

const getRideHistory = async () => {
    const response = await api.get("/rides/guest/history");
    return response.data;
};

const cancelRide = async (id, reason) => {
    const response = await api.patch(
        `/rides/${id}/cancel`,
        { reason }
    );

    return response.data;
};

export default {
    getCurrentRide,
    getRideHistory,
    cancelRide,
};