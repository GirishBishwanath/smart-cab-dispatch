import authService from "../services/auth.service.js";
import {
  successResponse,
  errorResponse,
} from "../utils/response.js";

const login = async (req, res) => {
  try {
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
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      error.statusCode || 500
    );
  }
};

export { login };