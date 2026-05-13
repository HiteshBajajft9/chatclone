import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const comm = await mongoose.connect(process.env.MONGO_URL);
    
    console.log("Connected to MongoDB", comm.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};