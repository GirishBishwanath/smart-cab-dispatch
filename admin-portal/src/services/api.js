import axios from "axios";

import ApiError from "../utils/ApiError.js";
import { getToken } from "../utils/storage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const SESSION_EXEMPT_PATHS = ["/auth/login"];

const JWT_FAILURE_MESSAGES = [
  "jwt expired",
  "jwt malformed",
  "jwt must be provided",
  "jwt not active",
  "invalid token",
  "invalid signature",
];

const isSessionFailure = (status, message) => {
  if (status === 401) return true;

  if (status === 500) {
    return JWT_FAILURE_MESSAGES.includes(String(message ?? "").toLowerCase());
  }

  return false;
};

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const toApiError = (error) => {
  if (axios.isCancel(error)) {
    return new ApiError(0, "Request cancelled");
  }

  if (error.response) {
    const { status, data } = error.response;

    return new ApiError(
      status,
      data?.message || "Something went wrong. Please try again."
    );
  }

  if (error.request) {
    return new ApiError(
      0,
      "Unable to reach the server. Check that the backend is running."
    );
  }

  return new ApiError(0, error.message || "Unexpected error");
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
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const url = error.config?.url ?? "";

    const isSessionExempt = SESSION_EXEMPT_PATHS.some((path) =>
      url.includes(path)
    );

    if (!isSessionExempt && isSessionFailure(status, message)) {
      onUnauthorized?.();
      return Promise.reject(
        new ApiError(401, "Your session has expired. Please sign in again.")
      );
    }

    return Promise.reject(toApiError(error));
  }
);

export default api;
