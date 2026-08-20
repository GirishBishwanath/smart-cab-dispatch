import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { ROLES } from "../utils/constants.js";

import {
    getRides,
    getRideById,
    getCurrentDriverRide,
    getDriverRideHistory,
    getCurrentGuestRide,
    getGuestRideHistory,
    acknowledgeRide,
    declineRide,
    cancelGuestRide,
    updateRideStatus,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.use(authenticate);

router.get(
    "/",
    authorize(ROLES.ADMIN, ROLES.DRIVER),
    getRides
);

router.get(
    "/current",
    authorize(ROLES.DRIVER),
    getCurrentDriverRide
);

router.get(
    "/history",
    authorize(ROLES.DRIVER),
    getDriverRideHistory
);

router.get(
    "/guest/current",
    authorize(ROLES.GUEST),
    getCurrentGuestRide
);

router.get(
    "/guest/history",
    authorize(ROLES.GUEST),
    getGuestRideHistory
);

router.patch(
    "/:id/acknowledge",
    authorize(ROLES.DRIVER),
    acknowledgeRide
);

router.patch(
    "/:id/decline",
    authorize(ROLES.DRIVER),
    declineRide
);

router.patch(
    "/:id/cancel",
    authorize(ROLES.GUEST),
    cancelGuestRide
);

router.patch(
    "/:id/status",
    authorize(ROLES.ADMIN, ROLES.DRIVER),
    updateRideStatus
);

router.get(
    "/:id",
    authorize(ROLES.ADMIN, ROLES.DRIVER),
    getRideById
);

export default router;