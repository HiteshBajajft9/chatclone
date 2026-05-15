import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import { sendWelcomeEmail } from "../email/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if(!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if(password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    const user = await User.findOne({email : email});
    if(user) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });

    if(!newUser) {
      return res.status(400).json({ message: "Error creating user" });
    }
    else {
        const savedUser = await newUser.save();
        const token = generateToken(savedUser._id,res);
       

        
        res.status(201).json({ message: "User registered successfully", user: { _id: savedUser._id, username, email }, token });

        try {
          
          await sendWelcomeEmail(savedUser.email, savedUser.username, ENV.CLIENT_URL);
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
        }
    }

  } 
  catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try{
    const user = await User.findOne({email: email});
    if(!user) {
      return res.status(400).json({ message: "Invalid email or password" }); // never tell which is invalid email or password for security reasons
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const token = generateToken(user._id,res);
    res.status(200).json({ message: "Login successful", user: { _id: user._id, username: user.username, email }, token }); 
  }
  catch(error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" }); 
  }
};
 
export const logout = (_, res) => {
  res.cookie("jwt","",{maxAge:0});
  res.status(200).json({ message: "Logout successful" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if(!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    
  } catch (error) {
    console.error("Error during profile update:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};