import api from "./api.js";

const getMyProfile = async () => {
    const response = await api.get("/guests/me");
    return response.data;
};

const updateMyProfile = async (data) => {
    const response = await api.patch("/guests/me", data);
    return response.data;
};

export default {
    getMyProfile,
    updateMyProfile,
};