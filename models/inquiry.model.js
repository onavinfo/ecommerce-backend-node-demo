const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    ticket: { type: String, required: true, unique: true }, // token/ticket
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
