import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_EXPIRES_IN = "7d";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://smart-cab-dispatch.vercel.app",
    "https://smart-cab-dispatch-admin.vercel.app",
    "https://smart-cab-dispatch-guest.vercel.app",
    "https://smart-cab-dispatch-driver.vercel.app",
];