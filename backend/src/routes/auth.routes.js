import express from "express";

import {
    login,
    signup,
    googleLogin,
    getCurrentUser,
} from "../controllers/auth.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/google", googleLogin);

router.get(
    "/me",
    authenticate,
    getCurrentUser
);

export default router;