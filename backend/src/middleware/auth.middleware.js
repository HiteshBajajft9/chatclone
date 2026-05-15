import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";

export const protectRoute = async(req, res, next /*next function*/) => {
    try {
        const token = req.cookies.jwt; //use cokie parser to get the token from cookies
        if(!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password"); // exclude password field and get all other details of user
        if(!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        req.user = user; // attach user to request object for use in next middleware or route handler

        next(); // pass control to the next middleware or route handler
    }
    catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};