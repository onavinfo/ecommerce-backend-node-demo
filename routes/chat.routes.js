const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth.middleware");
const chatController = require("../controllers/chat.controller");

router.get("/:chatId/messages", verifyToken, chatController.getMessages);

module.exports = router;
