import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const data = await authService.login(email, password);

    return successResponse(res, data, "Login successful");
});

const signup = asyncHandler(async (req, res) => {
    const data = await authService.signup(req.body);

    return successResponse(
        res,
        data,
        "Guest account created successfully"
    );
});

const googleLogin = asyncHandler(async (req, res) => {
    const data = await authService.googleLogin(req.body.idToken);

    return successResponse(
        res,
        data,
        "Google authentication successful"
    );
});

const getCurrentUser = asyncHandler(async (req, res) =>
    successResponse(
        res,
        req.user,
        "User fetched successfully"
    )
);

export {
    login,
    signup,
    googleLogin,
    getCurrentUser,
};