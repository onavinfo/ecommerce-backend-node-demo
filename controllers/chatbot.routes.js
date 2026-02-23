const ChatbotChat = require("../models/chatbot.model");

// ✅ simple dynamic bot logic (you can expand anytime)
function getBotReply(text = "") {
  const t = text.toLowerCase();

  if (t.includes("hello") || t.includes("hi") || t.includes("hey"))
    return "Hi 👋 I’m your assistant. Ask about orders, shipping, returns, payment, or contact.";

  if (t.includes("order") || t.includes("track") || t.includes("tracking"))
    return "To track your order: My Orders → select order → check status (Placed/Shipped/Delivered).";

  if (t.includes("return") || t.includes("refund"))
    return "Return/Refund: request within 7 days (if eligible). My Orders → Request Return.";

  if (t.includes("shipping") || t.includes("delivery") || t.includes("time"))
    return "Delivery usually takes 2–7 days depending on your location.";

  if (t.includes("payment") || t.includes("upi") || t.includes("card") || t.includes("cod"))
    return "We support UPI & Cards (COD if enabled in your area). If payment fails, retry after 2 minutes.";

  if (t.includes("contact") || t.includes("support") || t.includes("help"))
    return "Support: use Contact Us page or email support@myapp.com (change email in code).";

  return "Sorry 😅 I didn’t understand. Try: order, shipping, return, payment, contact.";
}

// ✅ GET /api/chatbot/:chatId
exports.getHistory = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatbotChat.findOne({ chatId });
    return res.json({ success: true, messages: chat?.messages || [] });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ POST /api/chatbot/:chatId  { text }
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Text required" });
    }

    const userId = req.user?.id; // from verifyToken middleware

    let chat = await ChatbotChat.findOne({ chatId });
    if (!chat) chat = await ChatbotChat.create({ chatId, userId, messages: [] });

    // (optional security check)
    // if (String(chat.userId) !== String(userId)) return res.status(403).json({ success:false, message:"Forbidden" });

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
