const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    by: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSchema = new mongoose.Schema(
  {
    chatId: { type: String, unique: true, index: true }, // chat_<userId> or chat_<guestId>
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatbotChat", ChatSchema);
