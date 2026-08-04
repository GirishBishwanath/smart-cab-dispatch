import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./auth.context.js";
import authService from "../services/auth.service.js";
import { setUnauthorizedHandler } from "../services/api.js";
import ApiError from "../utils/ApiError.js";
import { isPortalRole } from "../utils/constants.js";
import {
  clearSession,
  getToken,
  getUser,
  saveSession,
  saveUser,
} from "../utils/storage.js";

const PORTAL_ROLE_MESSAGE =
  "This portal is for administrators and drivers only.";

export const AuthProvider = ({ children }) => {
  // Seeded from localStorage so a reload paints the authenticated shell
  // immediately; the /auth/me call below is what actually validates the token.
  const [user, setUser] = useState(() => (getToken() ? getUser() : null));

  // Only a stored token is worth revalidating — without one there is nothing to
  // wait for, so the app can render its routes on the first paint.
  const [initializing, setInitializing] = useState(() => Boolean(getToken()));

  const endSession = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Revalidate the persisted token on boot. A token can be expired, revoked, or
  // belong to a deactivated user, so the stored profile is never trusted alone.
  useEffect(() => {
    if (!getToken()) {
      // Drop a profile left behind without its token.
      clearSession();

      return;
    }

    let active = true;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!active) return;

        if (!isPortalRole(currentUser.role)) {
          endSession();

          return;
        }

        setUser(currentUser);
        saveUser(currentUser);
      })
      .catch(() => {
        if (!active) return;

        endSession();
      })
      .finally(() => {
        if (!active) return;

        setInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [endSession]);

  // Any 401 on an authenticated request means the session is gone; drop it so
  // the protected routes fall back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(endSession);

    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  const login = useCallback(async (email, password) => {
    const { token, user: authenticatedUser } = await authService.login(
      email,
      password
    );

    // The backend authenticates every role through this one route, so guests are
    // turned away here — before anything is persisted.
    if (!isPortalRole(authenticatedUser.role)) {
      throw new ApiError(403, PORTAL_ROLE_MESSAGE);
    }

    saveSession(token, authenticatedUser);
    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // The backend exposes no logout route, so signing out is client-side only:
  // discard the token and let it expire on its own.
  const logout = useCallback(() => {
    endSession();
  }, [endSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout,
    }),
    [user, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
