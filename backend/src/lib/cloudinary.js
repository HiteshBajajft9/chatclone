import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

cloudinary.config({
    cloud_name: ENV.COUDINARY_CLOUD_NAME,
    api_key: ENV.COUDINARY_API_KEY,
    api_secret: ENV.COUDINARY_API_SECRET
});

export default cloudinary;