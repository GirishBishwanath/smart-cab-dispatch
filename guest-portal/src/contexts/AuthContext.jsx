import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { AuthContext } from "./auth.context.js";
import authService from "../services/auth.service.js";
import { setUnauthorizedHandler } from "../services/api.js";
import { roleHomePath, ROLES } from "../utils/constants.js";

import {
    clearSession,
    getToken,
    getUser,
    saveSession,
    saveUser,
} from "../utils/storage.js";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() =>
        getToken() ? getUser() : null
    );

    const [initializing, setInitializing] = useState(
        () => Boolean(getToken())
    );

    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    const authenticate = useCallback((data) => {
        if (data?.user?.role !== ROLES.GUEST) {
            throw new Error(
                "This portal is for guests only."
            );
        }

        saveSession(data.token, data.user);
        setUser(data.user);

        return data.user;
    }, []);

    useEffect(() => {
        if (!getToken()) {
            setInitializing(false);
            return;
        }

        let active = true;

        authService
            .getCurrentUser()
            .then((currentUser) => {
                if (!active) return;

                if (currentUser?.role !== ROLES.GUEST) {
                    logout();
                    return;
                }

                setUser(currentUser);
                saveUser(currentUser);
            })
            .catch(() => {
                if (active) logout();
            })
            .finally(() => {
                if (active) setInitializing(false);
            });

        return () => {
            active = false;
        };
    }, [logout]);

    useEffect(() => {
        setUnauthorizedHandler(logout);
        return () => setUnauthorizedHandler(null);
    }, [logout]);

    const login = useCallback(
        async (email, password) => {
            const data = await authService.login(
                email,
                password
            );

            return authenticate(data);
        },
        [authenticate]
    );

    const signup = useCallback(
        async (data) => {
            const response =
                await authService.signup(data);

            return authenticate(response);
        },
        [authenticate]
    );

    const googleLogin = useCallback(
        async (idToken) => {
            const data =
                await authService.googleLogin(idToken);

            return authenticate(data);
        },
        [authenticate]
    );

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            initializing,
            login,
            signup,
            googleLogin,
            logout,
            homePath: roleHomePath(user?.role),
        }),
        [
            user,
            initializing,
            login,
            signup,
            googleLogin,
            logout,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};