import jwt from "jsonwebtoken";

import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};