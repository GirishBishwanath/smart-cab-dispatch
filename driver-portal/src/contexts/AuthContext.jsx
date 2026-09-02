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

import socketService from "../services/socket.service.js";

const PORTAL_ROLE_MESSAGE = "This portal is for drivers only.";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => (getToken() ? getUser() : null));
    const [initializing, setInitializing] = useState(() => Boolean(getToken()));

    const endSession = useCallback(() => {
        socketService.disconnect();
        clearSession();
        setUser(null);
    }, []);

    useEffect(() => {
        if (!getToken()) {
            clearSession();
            setInitializing(false);
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
                if (active) endSession();
            })
            .finally(() => {
                if (active) setInitializing(false);
            });

        return () => {
            active = false;
        };
    }, [endSession]);

    useEffect(() => {
        setUnauthorizedHandler(endSession);
        return () => setUnauthorizedHandler(null);
    }, [endSession]);

    const login = useCallback(async (email, password) => {
        const { token, user: authenticatedUser } =
            await authService.login(email, password);

        if (!isPortalRole(authenticatedUser.role)) {
            throw new ApiError(403, PORTAL_ROLE_MESSAGE);
        }

        saveSession(token, authenticatedUser);
        setUser(authenticatedUser);
        socketService.connect();

        return authenticatedUser;
    }, []);

    const logout = useCallback(() => {
        socketService.disconnect();
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};