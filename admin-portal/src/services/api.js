import axios from "axios";

import ApiError from "../utils/ApiError.js";
import { getToken } from "../utils/storage.js";

/**
 * Shared Axios client for the admin portal.
 *
 * The response interceptor unwraps Axios' envelope and resolves with the API
 * envelope itself — `{ success, message, data }` — because every backend
 * controller answers through utils/response.js. Callers therefore read
 * `response.data`, never `response.data.data`.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Requests that must not trigger the global session-expiry handler. A 401 from
 * the login route means "wrong credentials", not "your session died".
 */
const SESSION_EXEMPT_PATHS = ["/auth/login"];

/**
 * Backend quirk (verified against /api/auth/me): auth.middleware.js lets
 * jsonwebtoken's errors reach error.middleware.js untyped, so an expired or
 * tampered token comes back as a 500 carrying the library's message instead of
 * a 401. Only a missing Authorization header produces a real 401.
 *
 * Matching those messages is what lets a dead session be recognised. A 403 is
 * deliberately excluded — that is a role denial on a session that is still
 * valid, and must not sign the user out.
 */
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

/**
 * Lets AuthContext own the reaction to an expired/rejected token without this
 * module importing React or reaching for window.location.
 */
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

      // Never surface jsonwebtoken's internal wording ("jwt expired") to the UI.
      return Promise.reject(
        new ApiError(401, "Your session has expired. Please sign in again.")
      );
    }

    return Promise.reject(toApiError(error));
  }
);

export default api;
