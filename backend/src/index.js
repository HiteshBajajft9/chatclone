import express from "express";
import cookieParser from "cookie-parser";
import { ENV } from "./lib/env.js";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";

const app = express(); //limited to 10mb to prevent large payloads that could cause performance issues or crashes
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "10mb" })); // req.body // to get data given by user in json format
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // to allow cross-origin requests from frontend to backend
app.use(cookieParser()); // to parse cookies from incoming requests

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "dist", " index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
