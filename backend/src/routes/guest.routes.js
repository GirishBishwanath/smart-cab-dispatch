import express from "express";

import {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  deleteGuest,
} from "../controllers/guest.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.use(authenticate);

router.use(authorize(ROLES.ADMIN));

router.post("/", createGuest);

router.get("/", getGuests);

router.get("/:id", getGuestById);

router.patch("/:id", updateGuest);

router.delete("/:id", deleteGuest);

export default router;