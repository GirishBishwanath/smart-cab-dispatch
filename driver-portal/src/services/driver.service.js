import api from "./api.js";


const getMyProfile = async () => {
    const response =
        await api.get("/drivers/me");

    return response.data;
};


export default {
    getMyProfile,
};