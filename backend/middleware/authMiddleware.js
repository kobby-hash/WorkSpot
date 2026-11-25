import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes by verifying JWT
const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Not authorized. User no longer exists.",
      });
    }

    // Attach user information to request
    req.user = user;

    // Continue to the next middleware or route
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

export default protect;
