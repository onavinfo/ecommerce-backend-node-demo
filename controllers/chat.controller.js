const Message = require("../models/message.model");

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(500);

    res.json({ success: true, messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load messages" });
  }
};
