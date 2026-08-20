import express from "express";

import {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  getMyProfile,
  updateMyProfile,
  deleteGuest,
} from "../controllers/guest.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/me",
  authorize(ROLES.GUEST),
  getMyProfile
);

router.patch(
  "/me",
  authorize(ROLES.GUEST),
  updateMyProfile
);

router.post(
  "/",
  authorize(ROLES.ADMIN),
  createGuest
);

router.get(
  "/",
  authorize(ROLES.ADMIN),
  getGuests
);

router.get(
  "/:id",
  authorize(ROLES.ADMIN),
  getGuestById
);

router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  updateGuest
);

router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  deleteGuest
);

export default router;