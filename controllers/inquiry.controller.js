const Inquiry = require("../models/inquiry.model");

// simple ticket generator
const makeTicket = () => {
  // ex: INQ-8F3A1C
  return (
    "INQ-" +
    Math.random().toString(16).slice(2, 8).toUpperCase()
  );
};

// ✅ PUBLIC: create inquiry (from Contact Us)
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // ensure unique ticket
    let ticket = makeTicket();
    let exists = await Inquiry.findOne({ ticket });
    while (exists) {
      ticket = makeTicket();
      exists = await Inquiry.findOne({ ticket });
    }

    const inquiry = await Inquiry.create({
      ticket,
      name,
      email,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Request submitted ✅ We will contact you shortly.",
      inquiry,
    });
  } catch (error) {
    console.error("createInquiry error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADMIN: list inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, inquiries });
  } catch (error) {
    console.error("getAllInquiries error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADMIN: update status (optional)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "resolved"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updated = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry updated ✅",
      inquiry: updated,
    });
  } catch (error) {
    console.error("updateInquiryStatus error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
