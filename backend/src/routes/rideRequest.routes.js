import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import { ROLES } from "../utils/constants.js";

import {
    createRideRequest,
    getRideRequests,
    approveRideRequest,
} from "../controllers/rideRequest.controller.js";

const router = express.Router();

router.use(authenticate);

router.post(
    "/",
    authorize(ROLES.ADMIN, ROLES.GUEST),
    createRideRequest
);

router.get(
    "/",
    authorize(ROLES.ADMIN),
    getRideRequests
);

router.patch(
    "/:id/approve",
    authorize(ROLES.ADMIN),
    approveRideRequest
);

export default router;