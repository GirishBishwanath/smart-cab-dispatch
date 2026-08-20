import api from "./api.js";

const createRideRequest = async (data) => {
    const response = await api.post("/ride-requests", data);
    return response.data;
};

const getMyRideRequests = async () => {
    const response = await api.get("/ride-requests/mine");
    return response.data;
};

const cancelRideRequest = async (id, reason) => {
    const response = await api.patch(
        `/ride-requests/${id}/cancel`,
        { reason }
    );

    return response.data;
};

export default {
    createRideRequest,
    getMyRideRequests,
    cancelRideRequest,
};