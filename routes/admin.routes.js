// server/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// ✅ admin guard
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// ✅ GET /api/admin/summary
router.get("/summary", verifyToken, requireAdmin, adminController.getAdminSummary);

module.exports = router;
