import axios from "axios";
import ApiError from "../utils/ApiError.js";
import { clearSession, getToken } from "../utils/storage.js";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
    onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ??
                "Something went wrong. Please try again.";

            if (status === 401) {
                clearSession();
                onUnauthorized?.();
                return Promise.reject(
                    new ApiError(401, "Your session has expired. Please sign in again.")
                );
            }

            return Promise.reject(new ApiError(status, message));
        }

        if (error.request) {
            return Promise.reject(
                new ApiError(0, "Unable to reach the server.")
            );
        }

        return Promise.reject(
            new ApiError(0, error.message || "Unexpected error")
        );
    }
);

export default api;