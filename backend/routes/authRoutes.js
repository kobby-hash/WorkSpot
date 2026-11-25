import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Registration route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Get the currently logged-in user
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    message: "Authenticated user retrieved successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Test route for workers
router.get("/worker-test", protect, authorizeRoles("worker"), (req, res) => {
  res.status(200).json({
    message: "Worker access granted",
  });
});

// Test route for admins
router.get("/admin-test", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    message: "Admin access granted",
  });
});

export default router;
