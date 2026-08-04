import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const dashboard = asyncHandler(
  async (req, res) => {
    return successResponse(
      res,
      {
        user: req.user,
      },
      "Admin Dashboard"
    );
  }
);

export {
  dashboard,
};