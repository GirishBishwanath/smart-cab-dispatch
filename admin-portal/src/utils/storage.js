/**
 * Single owner of the persisted session. Nothing else should touch
 * localStorage directly, so the storage keys stay changeable in one place.
 */
const TOKEN_KEY = "scd.admin.token";
const USER_KEY = "scd.admin.user";

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
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage can be unavailable (private mode, quota). The in-memory session
    // still works for this tab, so a failure here must not break login.
  }
};

export const saveUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // See saveSession.
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // See saveSession.
  }
};
