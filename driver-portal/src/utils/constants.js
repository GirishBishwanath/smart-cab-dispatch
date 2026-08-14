export const ROLES = {
    ADMIN: "ADMIN",
    DRIVER: "DRIVER",
    GUEST: "GUEST",
};

export const PORTAL_ROLES = [
    ROLES.DRIVER,
];

export const DRIVER_STATUS = {
    AVAILABLE: "AVAILABLE",
    ASSIGNED: "ASSIGNED",
    ON_BREAK: "ON_BREAK",
    OFFLINE: "OFFLINE",
};

export const RIDE_STATUS = {
    PENDING: "PENDING",
    ASSIGNED: "ASSIGNED",
    ARRIVED: "ARRIVED",
    PICKED_UP: "PICKED_UP",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};

export const ROUTES = {
    LOGIN: "/login",

    DASHBOARD: "/driver/dashboard",

    CURRENT_RIDE: "/driver/current-ride",

    RIDE_TIMELINE: "/driver/ride-timeline",

    RIDE_HISTORY: "/driver/ride-history",

    PROFILE: "/driver/profile",
};

const ROLE_HOME = {
    [ROLES.DRIVER]: ROUTES.DASHBOARD,
};

export const roleHomePath = (role) => {
    return (
        ROLE_HOME[role] ?? ROUTES.LOGIN
    );
};

export const isPortalRole = (role) => {
    return PORTAL_ROLES.includes(role);
};