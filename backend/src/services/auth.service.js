import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import userDTO from "../dto/user.dto.js";

class AuthService {
    async login(email, password) {
        const user = await User.findOne({
            email,
            isActive: true,
        }).select("+password");

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid email or password");
        }

        user.lastLogin = new Date();

        await user.save();

        const token = generateToken(user);

        return {
            token,
            user: userDTO(user),
        };
    }
}

export default new AuthService();