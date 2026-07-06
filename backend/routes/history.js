// routes/history.js
const express = require("express");
const router = express.Router();
const { listHistory, getHistoryItem, compareWithPrevious } = require("../controllers/historyController");
const { protect } = require("../middleware/auth");
const requireDB = require("../middleware/requireDB");

router.get("/history", requireDB, protect, listHistory);
router.get("/history/:id", requireDB, protect, getHistoryItem);
router.get("/history/:id/compare", requireDB, protect, compareWithPrevious);

module.exports = router;
