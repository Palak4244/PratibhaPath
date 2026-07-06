// routes/analyze.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { optionalAuth } = require("../middleware/auth");
const { analyzeResume } = require("../controllers/analyzeController");

// POST /api/analyze
// Frontend yahan FormData bhejega: field name "resume" (file) + targetRole,
// targetCompany, targetSkills, location. Login optional hai — agar token
// bheja gaya hai to history automatically save ho jaayegi.
router.post("/analyze", optionalAuth, upload.single("resume"), analyzeResume);

module.exports = router;
