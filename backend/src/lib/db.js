import mongoose from "mongoose";
import {ENV  } from "./env.js";

export const connectDB = async () => {
  try {
    
    const comm = await mongoose.connect(ENV.MONGO_URL);
    
    console.log("Connected to MongoDB", comm.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};