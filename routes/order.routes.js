const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// simple role guard
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden" });
  }
  next();
};

// CUSTOMER
// POST /api/orders  -> create order
router.post("/", verifyToken, orderController.createOrder);

// GET /api/orders/my -> get my orders
router.get("/my", verifyToken, orderController.getMyOrders);

// ADMIN
// GET /api/orders -> all orders
router.get("/", verifyToken, requireRole("admin"), orderController.getAllOrders);

// PATCH /api/orders/:id/status -> update order status
router.patch(
  "/:id/status",
  verifyToken,
  requireRole("admin"),
  orderController.updateOrderStatus,
);

module.exports = router;
