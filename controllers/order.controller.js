const Order = require("../models/order.model");

// CUSTOMER: Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;

    const { items, shippingAddress } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order items required" });
    }

    // Calculate total from items
    let totalAmount = 0;
    for (const it of items) {
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 0);
      if (!it.product || !price || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid item (product, price, qty required)",
        });
      }
      totalAmount += price * qty;
    }

    const order = await Order.create({
      user: userId,
      items: items.map((it) => ({
        product: it.product,
        name: it.name || "",
        price: Number(it.price),
        qty: Number(it.qty),
        image: it.image || "",
      })),
      shippingAddress: shippingAddress || {},
      totalAmount,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created",
      order,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// CUSTOMER: Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ADMIN: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone role")
      .populate("items.product");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ADMIN: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};
