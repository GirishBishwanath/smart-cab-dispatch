import api from "./api.js";

const getCurrentRide = async () => {
    const response = await api.get("/rides/current");

    return response?.data ?? null;
};

const getRideById = async (id) => {
    const response = await api.get(`/rides/${id}`);

    return response?.data ?? null;
};

const acknowledgeRide = async (id) => {
    const response = await api.patch(
        `/rides/${id}/acknowledge`
    );

    return response?.data ?? null;
};

const updateRideStatus = async (
    id,
    status
) => {
    const response = await api.patch(
        `/rides/${id}/status`,
        { status }
    );

    return response?.data ?? null;
};

const getRide = async (rideId) => {
    const response = await api.get(
        `/rides/${rideId}`
    );

    return response;
};

const getRides = async () => {
    const response = await api.get("/rides");

    return response?.data ?? [];
};

const getRideHistory = async () => {
    const response =
        await api.get(
            "/rides/history"
        );

    return response.data;
};

export default {
    getCurrentRide,
    getRideById,
    acknowledgeRide,
    updateRideStatus,
    getRide,
    getRides,
    getRideHistory,
};