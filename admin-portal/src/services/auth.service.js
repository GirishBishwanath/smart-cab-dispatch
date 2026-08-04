import api from "./api.js";

/**
 * Thin binding over the existing backend auth routes (backend/src/routes/auth.routes.js).
 *
 *   POST /api/auth/login -> { token, user }
 *   GET  /api/auth/me    -> user
 *
 * The backend exposes no logout or refresh endpoint, so signing out is a purely
 * client-side operation (see AuthContext.logout).
 */
const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });

  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export default {
  login,
  getCurrentUser,
};
