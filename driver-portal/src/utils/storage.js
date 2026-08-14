const TOKEN_KEY = "scd.driver.token";
const USER_KEY = "scd.driver.user";

export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const getUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);

        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const saveSession = (token, user) => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );
    } catch {
        // In-memory authentication still works
        // if localStorage is unavailable.
    }
};

export const saveUser = (user) => {
    try {
        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );
    } catch {
        // Ignore storage failures.
    }
};

export const clearSession = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch {
        // Ignore storage failures.
    }
};