import express from "express";

import { dashboard } from "../controllers/admin.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(ROLES.ADMIN),
  dashboard
);

export default router;