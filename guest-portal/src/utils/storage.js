const TOKEN_KEY = "scd.guest.token";
const USER_KEY = "scd.guest.user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const saveUser = (user) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};