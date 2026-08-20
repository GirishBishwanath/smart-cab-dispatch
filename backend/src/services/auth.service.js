import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import bcrypt from "bcrypt";
import User from "../models/User.js";

import Guest from "../models/Guest.js";
import { hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { ROLES } from "../utils/constants.js";
import { GOOGLE_CLIENT_ID } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import userDTO from "../dto/user.dto.js";

const googleClient = GOOGLE_CLIENT_ID
    ? new OAuth2Client(GOOGLE_CLIENT_ID)
    : null;

const createAuthResponse = async (user) => {
    user.lastLogin = new Date();
    await user.save();

    return {
        token: generateToken(user),
        user: userDTO(user),
    };
};

class AuthService {
    async login(email, password) {
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            isActive: true,
        }).select("+password");

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new ApiError(401, "Invalid email or password");
        }

        return createAuthResponse(user);
    }

    async signup(data) {
        const {
            fullName,
            email,
            password,
            phone = "",
        } = data;

        if (!fullName?.trim() || !email?.trim() || !password) {
            throw new ApiError(400, "Name, email and password are required.");
        }

        if (password.length < 6) {
            throw new ApiError(
                400,
                "Password must be at least 6 characters."
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            throw new ApiError(
                400,
                "An account with this email already exists."
            );
        }

        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: await hashPassword(password),
            phone: phone.trim(),
            role: ROLES.GUEST,
            authProvider: "LOCAL",
        });

        await Guest.create({
            user: user._id,
            groupSize: 1,
            luggageCount: 0,
        });

        return createAuthResponse(user);
    }

    async googleLogin(idToken) {
        if (!googleClient) {
            throw new ApiError(
                500,
                "Google authentication is not configured."
            );
        }

        if (!idToken) {
            throw new ApiError(
                400,
                "Google authentication credential is missing."
            );
        }

        let payload;

        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            });

            payload = ticket.getPayload();
        } catch {
            throw new ApiError(
                401,
                "Unable to verify your Google account."
            );
        }

        if (!payload?.email || payload.email_verified !== true) {
            throw new ApiError(
                401,
                "Your Google email could not be verified."
            );
        }

        const email = payload.email.toLowerCase();

        let user = await User.findOne({
            $or: [
                { googleId: payload.sub },
                { email },
            ],
        }).select("+password");

        if (user) {
            if (user.role !== ROLES.GUEST) {
                throw new ApiError(
                    403,
                    "This Google account cannot access the Guest Portal."
                );
            }

            user.googleId = payload.sub;
            user.authProvider = "GOOGLE";
            user.avatar = payload.picture || user.avatar;

            if (!user.fullName && payload.name) {
                user.fullName = payload.name;
            }

            await user.save();
        } else {
            user = await User.create({
                fullName: payload.name || "Guest",
                email,
                password: await bcrypt.hash(
                    crypto.randomBytes(32).toString("hex"),
                    12
                ),
                role: ROLES.GUEST,
                avatar: payload.picture || "",
                googleId: payload.sub,
                authProvider: "GOOGLE",
            });

            await Guest.create({
                user: user._id,
                groupSize: 1,
                luggageCount: 0,
            });
        }

        const guestExists = await Guest.exists({
            user: user._id,
        });

        if (!guestExists) {
            await Guest.create({
                user: user._id,
                groupSize: 1,
                luggageCount: 0,
            });
        }

        return createAuthResponse(user);
    }
}

export default new AuthService();