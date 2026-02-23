const express = require("express");
const router = express.Router();

const bot = require("../controllers/chatbot.controller");

router.get("/:chatId", bot.getHistory);
router.post("/:chatId", bot.sendMessage);

module.exports = router;
