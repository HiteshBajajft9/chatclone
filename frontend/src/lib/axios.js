import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
  withCredentials: true, // will send cookies with every request, needed for authentication
});
