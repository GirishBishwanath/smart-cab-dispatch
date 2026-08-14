import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import {
    ROLES,
} from "../utils/constants.js";

import {
    getRides,
    getRideById,
    getCurrentDriverRide,
    getDriverRideHistory,
    acknowledgeRide,
    updateRideStatus,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.use(authenticate);


/*
|--------------------------------------------------------------------------
| Admin + Driver
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authorize(
        ROLES.ADMIN,
        ROLES.DRIVER
    ),
    getRides
);


/*
|--------------------------------------------------------------------------
| Driver
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Individual ride
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    authorize(
        ROLES.ADMIN,
        ROLES.DRIVER
    ),
    getRideById
);


router.patch(
    "/:id/acknowledge",
    authorize(ROLES.DRIVER),
    acknowledgeRide
);


router.patch(
    "/:id/status",
    authorize(
        ROLES.ADMIN,
        ROLES.DRIVER
    ),
    updateRideStatus
);


export default router;