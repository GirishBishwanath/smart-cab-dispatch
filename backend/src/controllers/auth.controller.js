import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await authService.login(
    email,
    password
  );

  return successResponse(
    res,
    data,
    "Login successful"
  );
});

const getCurrentUser = asyncHandler(
  async (req, res) => {
    return successResponse(
      res,
      req.user,
      "User fetched successfully"
    );
  }
);

export {
  login,
  getCurrentUser,
};