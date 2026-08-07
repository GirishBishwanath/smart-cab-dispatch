import api from "./api.js";

const getRides = async () => {
    const response = await api.get("/rides");
    return response.data;
};

const getRide = async (id) => {
    const response = await api.get(`/rides/${id}`);
    return response.data;
};

const updateRideStatus = async (id, status) => {
    const response = await api.patch(
        `/rides/${id}/status`,
        { status }
    );

    return response.data;
};

export default {
    getRides,
    getRide,
    updateRideStatus,
};