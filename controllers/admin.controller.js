// server/controllers/admin.controller.js
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

// ✅ GET /api/admin/summary
exports.getAdminSummary = async (req, res) => {
  try {
    // ✅ 1) COUNTS
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();

    // ✅ 2) TOTAL SALES (only delivered or confirmed -> you can change)
    const salesAgg = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = salesAgg?.[0]?.total || 0;

    // ✅ 3) RECENT ORDERS (table)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .select("user totalAmount status createdAt");

    // ✅ 4) SALES OVERVIEW GRAPH (Monthly)
    const salesByMonth = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
      { $limit: 12 },
    ]);

    // ✅ 4B) WEEKLY (ISO week)
    const salesByWeek = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      { $limit: 10 },
    ]);

    // ✅ 4C) YEARLY
    const salesByYear = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1 } },
      { $limit: 7 },
    ]);

    // ✅ 5) TOP SELLING PRODUCTS (donut)
    // Your Order model stores: items: [{ product, name, price, qty, image }]
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } }, // ✅ important
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 4 },
    ]);

    // ✅ convert topProducts to % for donut
    const totalTopQty = topProducts.reduce((s, p) => s + (p.qty || 0), 0) || 1;

    // IMPORTANT: frontend can calculate % itself too, but we keep as % for your current UI
    const donut = topProducts.map((p) => ({
      label: p.name || "Product",
      value: Math.round(((p.qty || 0) / totalTopQty) * 100),
    }));

    // ✅ 6) NOTIFICATIONS
    const latestCustomer = await User.findOne({ role: "customer" })
      .sort({ createdAt: -1 })
      .select("name createdAt");

    const notifications = [];

    if (latestCustomer) {
      notifications.push({
        type: "info",
        text: `New customer ${latestCustomer.name} has joined.`,
        time: latestCustomer.createdAt,
      });
    }

    if (recentOrders[0]) {
      notifications.push({
        type: "success",
        text: `New order placed by ${recentOrders[0]?.user?.name || "Customer"}.`,
        time: recentOrders[0].createdAt,
      });
    }

    notifications.push({
      type: "warn",
      text: "Tip: Add 'stock' field in product to enable low stock alerts.",
      time: new Date(),
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
      },
      recentOrders,

      // ✅ IMPORTANT: send all 3 for Monthly/Weekly/Yearly tabs
      salesByMonth: salesByMonth.map((x) => ({
        year: x._id.y,
        month: x._id.m,
        total: x.total,
        orders: x.orders,
      })),
      salesByWeek: salesByWeek.map((x) => ({
        year: x._id.year,
        week: x._id.week,
        total: x.total,
        orders: x.orders,
      })),
      salesByYear: salesByYear.map((x) => ({
        year: x._id.year,
        total: x.total,
        orders: x.orders,
      })),

      donut,
      notifications,
    });
  } catch (error) {
    console.error("ADMIN SUMMARY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
