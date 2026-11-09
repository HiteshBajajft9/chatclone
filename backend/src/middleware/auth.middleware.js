import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";

// In-memory cache of logged-in users: userId -> { user, expires }
// Avoids hitting the database on every request for the same user
const userCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // keep each cached user for 60 seconds

// Call this whenever a user's details change (e.g. profile picture update)
// so the next request fetches fresh data from the database
export const invalidateUserCache = (userId) => userCache.delete(userId.toString());

export const protectRoute = async (req, res, next /*next function*/) => {
  try {
    const token = req.cookies.jwt; //use cokie parser to get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const cached = userCache.get(decoded.userId);
    let user;
    if (cached && cached.expires > Date.now()) {
      user = cached.user; // cache hit: user found in memory, no database call needed
    } else {
      // cache miss or expired: fetch from database
      // exclude password field and get all other details of user
      // .lean() returns a plain JS object, which is faster than a full Mongoose document
      user = await User.findById(decoded.userId).select("-password").lean();
      if (user) {
        userCache.set(decoded.userId, { user, expires: Date.now() + CACHE_TTL_MS }); // store for next requests
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    req.user = user; // attach user to request object for use in next middleware or route handler

    next(); // pass control to the next middleware or route handler
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
