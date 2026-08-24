export const PORTAL_URLS = {
  GUEST: import.meta.env.VITE_GUEST_PORTAL_URL || "http://localhost:5173",
  DRIVER: import.meta.env.VITE_DRIVER_PORTAL_URL || "http://localhost:5174",
  ADMIN: import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:5175",
};

export const ROLE_COLORS = {
  ADMIN: {
    text: "text-blue-400",
    ring: "ring-blue-500/30",
    bg: "bg-blue-500/10",
    solid: "bg-blue-600",
    solidHover: "hover:bg-blue-500",
    glow: "before:bg-blue-600/20",
  },
  DRIVER: {
    text: "text-violet-400",
    ring: "ring-violet-500/30",
    bg: "bg-violet-500/10",
    solid: "bg-violet-600",
    solidHover: "hover:bg-violet-500",
    glow: "before:bg-violet-600/20",
  },
  GUEST: {
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
    bg: "bg-emerald-500/10",
    solid: "bg-emerald-600",
    solidHover: "hover:bg-emerald-500",
    glow: "before:bg-emerald-600/20",
  },
};

export const ROUTES = {
  HOME: "/",
  FEATURES: "/features",
  ABOUT: "/about",
  CONTACT: "/contact",
};

export const NAV_LINKS = [
  { label: "Features", to: ROUTES.FEATURES },
  { label: "How it works", to: `${ROUTES.HOME}#how-it-works` },
  { label: "About", to: ROUTES.ABOUT },
  { label: "Contact", to: ROUTES.CONTACT },
];

export const RIDE_LIFECYCLE = [
  { key: "PENDING", label: "Requested", style: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" },
  { key: "APPROVED", label: "Approved", style: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  { key: "ASSIGNED", label: "Assigned", style: "bg-violet-50 text-violet-700 ring-1 ring-violet-200" },
  { key: "ARRIVED", label: "Driver arrived", style: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  { key: "PICKED_UP", label: "Trip started", style: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" },
  { key: "COMPLETED", label: "Completed", style: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
];
