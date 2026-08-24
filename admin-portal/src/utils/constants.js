export const ROLES = {
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
  GUEST: "GUEST",
};

export const LANDING_URL = import.meta.env.VITE_LANDING_URL || "http://localhost:5176";

export const PORTAL_ROLES = [ROLES.ADMIN, ROLES.DRIVER];

export const ROUTES = {
  LOGIN: "/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  DRIVER_DASHBOARD: "/driver/dashboard",
};

const ROLE_HOME = {
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.DRIVER]: ROUTES.DRIVER_DASHBOARD,
};

export const roleHomePath = (role) => ROLE_HOME[role] ?? ROUTES.LOGIN;

export const isPortalRole = (role) => PORTAL_ROLES.includes(role);
