import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Get the logged-in user's profile
router.get("/profile", protect, getUserProfile);

// Update the logged-in user's profile
router.put("/profile", protect, updateUserProfile);

export default router;
