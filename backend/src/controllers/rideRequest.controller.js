import rideRequestService from "../services/rideRequest.service.js";

import asyncHandler from "../utils/asyncHandler.js";

import { successResponse } from "../utils/response.js";

const createRideRequest = asyncHandler(async (req, res) => {
    const rideRequest =
        await rideRequestService.createRideRequest(
            req.user.id,
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

const declineRideRequest = asyncHandler(async (req, res) => {
    const request =
        await rideRequestService.declineRideRequest(
            req.params.id,
            req.body.reason
        );

    return successResponse(
        res,
        request,
        "Ride request declined successfully"
    );
});

export {
    createRideRequest,
    getRideRequests,
    approveRideRequest,
    declineRideRequest,
};