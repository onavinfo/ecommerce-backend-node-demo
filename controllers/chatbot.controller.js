const Chat = require("../models/chatbot.model");

function getBotReply(text = "") {
  const t = text.toLowerCase();

  if (t.includes("hello") || t.includes("hi") || t.includes("hey"))
    return "Hi 👋 How can I help you? Try: order, shipping, return, payment.";

  if (t.includes("order") || t.includes("track"))
    return "Track order: My Orders → select order → status.";

  if (t.includes("return") || t.includes("refund"))
    return "Return/Refund: request within 7 days if eligible.";

  if (t.includes("shipping") || t.includes("delivery"))
    return "Delivery usually takes 2–7 days.";

  if (t.includes("payment") || t.includes("upi") || t.includes("card"))
    return "Payment supported: UPI + Cards (COD if enabled).";

  if (t.includes("contact") || t.includes("support"))
    return "Support: use Contact Us page or email support@myapp.com.";

  return "Sorry 😅 Try: order, shipping, return, payment, contact.";
}

exports.getHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ chatId });
    return res.json({ success: true, messages: chat?.messages || [] });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Text required" });
    }

    let chat = await Chat.findOne({ chatId });
    if (!chat) chat = await Chat.create({ chatId, messages: [] });

    chat.messages.push({ by: "user", text: text.trim() });

    const botText = getBotReply(text.trim());
    chat.messages.push({ by: "bot", text: botText });

    await chat.save();

    return res.json({ success: true, messages: chat.messages });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
