const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/auth.controller");
const upload = require("../middleware/upload.middleware");

// SIGNUP WITH IMAGE
router.post("/signup", upload.single("profileImage"), signup);

// LOGIN
router.post("/login", login);

module.exports = router;
