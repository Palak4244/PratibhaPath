// routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const requireDB = require("../middleware/requireDB");

router.post("/auth/register", requireDB, register);
router.post("/auth/login", requireDB, login);
router.get("/auth/me", requireDB, protect, getMe);

module.exports = router;
