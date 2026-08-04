import rideRequestService from "../services/rideRequest.service.js";

import asyncHandler from "../utils/asyncHandler.js";

import { successResponse } from "../utils/response.js";

const createRideRequest = asyncHandler(async (req, res) => {
    const rideRequest =
        await rideRequestService.createRideRequest(
            req.body.guestId,
            req.body
        );

    return successResponse(
        res,
        rideRequest,
        "Ride request created successfully"
    );
});

const getRideRequests = asyncHandler(async (req, res) => {
    const requests =
        await rideRequestService.getRideRequests();

    return successResponse(
        res,
        requests,
        "Ride requests fetched successfully"
    );
});

const approveRideRequest = asyncHandler(async (req, res) => {
    const ride =
        await rideRequestService.approveRideRequest(
            req.params.id
        );

    return successResponse(
        res,
        ride,
        "Ride assigned successfully"
    );
});

export {
    createRideRequest,
    getRideRequests,
    approveRideRequest,
};