export const ROLES = {
    ADMIN: "ADMIN",
    DRIVER: "DRIVER",
    GUEST: "GUEST",
};

export const LANDING_URL = import.meta.env.VITE_LANDING_URL || "http://localhost:5176";

export const RIDE_STATUS = {
    PENDING: "PENDING",
    ASSIGNED: "ASSIGNED",
    ARRIVED: "ARRIVED",
    PICKED_UP: "PICKED_UP",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};

export const REQUEST_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
};

export const TRIP_TYPES = [
    "ARRIVAL",
    "EVENT_PICKUP",
    "EVENT_DROP",
    "DEPARTURE",
    "ON_DEMAND",
];

export const ROUTES = {
    LOGIN: "/login",
    SIGNUP: "/signup",
    DASHBOARD: "/guest/dashboard",
    BOOK_RIDE: "/guest/book-ride",
    CURRENT_RIDE: "/guest/current-ride",
    RIDE_HISTORY: "/guest/ride-history",
    PROFILE: "/guest/profile",
};

export const roleHomePath = (role) =>
    role === ROLES.GUEST
        ? ROUTES.DASHBOARD
        : ROUTES.LOGIN;