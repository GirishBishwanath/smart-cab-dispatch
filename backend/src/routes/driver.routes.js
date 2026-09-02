import express from "express";

import {
    createDriver,
    getMyProfile,
    getDrivers,
    getDriverById,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
} from "../controllers/driver.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.use(authenticate);

router.get(
    "/me",
    authorize(ROLES.DRIVER),
    getMyProfile
);

router.use(
    authorize(ROLES.ADMIN)
);

router.post(
    "/",
    createDriver
);

router.get(
    "/",
    getDrivers
);

router.get(
    "/:id",
    getDriverById
);

router.patch(
    "/:id",
    updateDriver
);

router.patch(
    "/:id/status",
    updateDriverStatus
);

router.delete(
    "/:id",
    deleteDriver
);

export default router;