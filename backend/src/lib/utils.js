import jwt from 'jsonwebtoken';
import { ENV } from "./env.js";

export const generateToken = (userId,res) => {
    const token = jwt.sign({ userId: userId }, ENV.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("jwt", token, {
        httpOnly: true, // prevent XSS attacks: cross-site scripting attacks
        secure: ENV.NODE_ENV === "production", // Set secure flag in production
        sameSite: "strict", // CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
}