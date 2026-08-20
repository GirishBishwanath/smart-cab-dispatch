import api from "./api.js";

const login = async (email, password) => {
    const response = await api.post(
        "/auth/login",
        { email, password }
    );

    return response.data;
};

const signup = async (data) => {
    const response = await api.post(
        "/auth/signup",
        data
    );

    return response.data;
};

const googleLogin = async (idToken) => {
    const response = await api.post(
        "/auth/google",
        { idToken }
    );

    return response.data;
};

const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export default {
    login,
    signup,
    googleLogin,
    getCurrentUser,
};