import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import { ROLES } from "../utils/constants.js";

import {
  getRides,
  updateRideStatus,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.DRIVER),
  getRides
);

router.patch(
  "/:id/status",
  authorize(ROLES.ADMIN, ROLES.DRIVER),
  updateRideStatus
);

export default router;