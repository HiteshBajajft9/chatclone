import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      console.log("No token provided in socket handshake");
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.log("Invalid token in socket handshake");
      return next(new Error("Authentication error: Invalid token"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("Invalid token"));
    }

    console.log(`Socket authenticated for user: ${user.username}`);
    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    console.error("Error in socketAuthMiddleware:", error);
    next(new Error("Invalid token"));
  }
};
