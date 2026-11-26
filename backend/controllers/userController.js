import User from "../models/User.js";

// Get the currently logged-in user's profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving profile",
    });
  }
};

// Update the currently logged-in user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Ensure at least one field is provided
    if (name === undefined && email === undefined) {
      return res.status(400).json({
        message: "Please provide a name or email to update",
      });
    }

    // Validate name
    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({
        message: "Please provide a valid name",
      });
    }

    // Validate email
    if (
      email !== undefined &&
      (typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Build the fields that are allowed to be updated
    const updates = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (email !== undefined) {
      updates.email = email.trim().toLowerCase();
    }

    // Update only the authenticated user's account
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    // Handle duplicate email addresses
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    console.error("Update profile error:", error.message);

    return res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};
