// Restrict access based on user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized. Please log in.",
      });
    }

    // Check if the user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Forbidden. You do not have permission to perform this action.",
      });
    }

    // Allow the request to continue
    next();
  };
};

export default authorizeRoles;
