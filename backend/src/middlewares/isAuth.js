import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please Login - No auth header",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Please Login - Token missing",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SEC);
    if (!decodedData || !decodedData._id) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user = await User.findById(decodedData._id);
    if (!user) {
      return res.status(401).json({
        message: "User not found or token expired",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(401).json({
      message: "Invalid or expired token, Please Login",
    });
  }
};
