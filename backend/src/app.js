import express from "express";
import cors from "cors";

import { ALLOWED_ORIGINS } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import guestRoutes from "./routes/guest.routes.js";
import rideRequestRoutes from "./routes/rideRequest.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Not allowed by CORS: ${origin}`));
            }
        },
        credentials: true,
    })
);
app.use(express.json());

app.get("/", (req, res) =>
    res.json({
        success: true,
        message: "Smart Cab Dispatch API Running",
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/ride-requests", rideRequestRoutes);
app.use("/api/rides", rideRoutes);

app.use(errorHandler);

export default app;