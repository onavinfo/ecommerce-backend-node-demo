const express = require("express");
const router = express.Router();

const inquiryController = require("../controllers/inquiry.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// ✅ ADMIN GUARD
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// ✅ PUBLIC (Contact Us)
router.post("/", inquiryController.createInquiry);

// ✅ ADMIN
router.get("/", verifyToken, requireAdmin, inquiryController.getAllInquiries);
router.patch(
  "/:id/status",
  verifyToken,
  requireAdmin,
  inquiryController.updateInquiryStatus
);

module.exports = router;
