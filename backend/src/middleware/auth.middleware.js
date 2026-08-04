import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import userDTO from "../dto/user.dto.js";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            throw new ApiError(
                401,
                "Authentication required"
            );
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id);

        req.user = userDTO(user);

        if (!user || !user.isActive) {
            throw new ApiError(
                401,
                "Invalid authentication token"
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default authenticate;