const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Dashboard (protected)
router.get("/dashboard", verifyToken, userController.getDashboard);

// Update profile
router.put(
  "/update-profile",
  verifyToken,
  upload.single("profileImage"),
  userController.updateProfile
);

// ✅ ADMIN GUARD
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// ✅ GET ALL CUSTOMERS (ADMIN)
router.get(
  "/customers",
  verifyToken,
  requireAdmin,
  userController.getAllCustomers
);

router.post(
  "/customers",
  verifyToken,
  requireAdmin,
  upload.single("profileImage"),
  userController.createCustomerByAdmin
);

// ✅ UPDATE CUSTOMER (ADMIN)
router.patch(
  "/customers/:id",
  verifyToken,
  requireAdmin,
  upload.single("profileImage"),
  userController.updateCustomerByAdmin
);

// ✅ DELETE CUSTOMER (ADMIN)
router.delete(
  "/customers/:id",
  verifyToken,
  requireAdmin,
  userController.deleteCustomerByAdmin
);



module.exports = router;