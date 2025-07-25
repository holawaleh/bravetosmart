// /middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Token Verification
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// 2. Role Permission Checker
const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permission" });
    }
    next();
  };
};

module.exports = { verifyToken, permit };
