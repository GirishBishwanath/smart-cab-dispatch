/**
 * Mirrors backend/src/utils/constants.js — keep the role strings in sync.
 */
export const ROLES = {
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
  GUEST: "GUEST",
};

/**
 * The backend login endpoint authenticates every role against the same route,
 * so the portal decides for itself which roles it is willing to admit.
 */
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
