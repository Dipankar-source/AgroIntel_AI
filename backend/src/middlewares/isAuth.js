const jwt = require("jsonwebtoken");
const User = require("../models/User/userData");

const isAuth = async (req, res, next) => {
  try {
    // Check for token in cookies first, then Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded?.userId || decoded?.id;

    if (!userId) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Invalid token payload"
      });
    }

    // Verify user still exists in database
    const user = await User.findById(userId).select("-password");

    if (!user) {
      // Clear invalid token
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        error: "Unauthorized - User not found"
      });
    }

    req.user = user;
    req.userId = userId;
    req.auth = decoded;

    next();
  } catch (error) {
    // Clear invalid token on error
    res.clearCookie("token");

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Invalid token"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Token expired"
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

module.exports = isAuth;