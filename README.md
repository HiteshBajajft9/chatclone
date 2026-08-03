# Chitchat 💬

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Chitchat** is a full-stack real-time messaging application built with the MERN stack. It features low-latency communication, secure user authentication, and a responsive modern UI. 

[Live Link](https://chitchat-723h.onrender.com)

## ✨ Features

- **Real-Time Messaging**: Low-latency bidirectional communication powered by Socket.io.
- **Presence Tracking**: Live online and offline status indicators for users.
- **Media Sharing**: Secure image and media uploads integrated with Cloudinary.
- **Audio Notifications**: Instant sound alerts for incoming messages.
- **Robust Security**: 
  - JWT-based authentication for secure REST APIs.
  - **Arcjet** rate limiting implemented to protect endpoints against abuse and brute-force attacks.
- **Automated Onboarding**: Welcome and onboarding emails triggered automatically via **Resend**.
- **Modern UI/UX**: Fully responsive interface built with Tailwind CSS, utilizing Zustand for lightweight and fast global state management.

## 🛠️ Tech Stack

**Frontend:**
- React
- Zustand (State Management)
- Tailwind CSS (Styling)

**Backend:**
- Node.js & Express.js
- MongoDB (Database)
- Socket.io (WebSockets)
- JWT (Authentication)

**Third-Party Services:**
- Cloudinary (Media storage)
- Arcjet (Rate limiting & security)
- Resend (Email automation)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/chitchat.git](https://github.com/yourusername/chitchat.git)
   cd chitchat
   ```

2. **Install Dependencies**
   
   For the backend:
   ```bash
   cd backend
   npm install
   ```

   For the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the `backend` directory and add the following variables:
   
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   
   # Cloudinary Setup
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Security & Emails
   ARCJET_KEY=your_arcjet_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the Application**

   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

   Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## 📈 Development & Deployment
This project follows a structured Git workflow for version control. Feel free to fork, open issues, or submit PRs.

---
*Developed by Hitesh Bajaj*
