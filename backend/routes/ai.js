// routes/ai.js
const express = require("express");
const router = express.Router();
const { getAISuggestions } = require("../controllers/aiController");

router.post("/ai-suggestions", getAISuggestions);

module.exports = router;
