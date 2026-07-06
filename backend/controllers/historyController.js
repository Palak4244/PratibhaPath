// controllers/historyController.js
const Analysis = require("../models/Analysis");

// Naya analysis history mein save karta hai (analyzeController se call hota hai)
async function saveToHistory(userId, analysisData) {
  try {
    return await Analysis.create({ user: userId, ...analysisData });
  } catch (err) {
    console.error("Save history error:", err.message);
    return null;
  }
}

// GET /api/history — logged-in user ki saari past analyses (newest first)
async function listHistory(req, res) {
  try {
    const items = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-resumeTextSnapshot");
    return res.status(200).json({ count: items.length, history: items });
  } catch (err) {
    console.error("List history error:", err.message);
    return res.status(500).json({ error: "Could not load history." });
  }
}

// GET /api/history/:id — ek specific analysis ka pura detail
async function getHistoryItem(req, res) {
  try {
    const item = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ error: "Analysis not found." });
    return res.status(200).json({ analysis: item });
  } catch (err) {
    return res.status(500).json({ error: "Could not load analysis." });
  }
}

// GET /api/history/compare/:id — diye gaye analysis ko usi role ki
// SABSE PURANI analysis se compare karta hai (before/after score)
async function compareWithPrevious(req, res) {
  try {
    const current = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ error: "Analysis not found." });

    const previous = await Analysis.findOne({
      user: req.user._id,
      targetRole: current.targetRole,
      _id: { $ne: current._id },
      createdAt: { $lt: current.createdAt },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      current: { score: current.score, createdAt: current.createdAt },
      previous: previous ? { score: previous.score, createdAt: previous.createdAt } : null,
      improvement: previous ? current.score - previous.score : null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Could not compare analyses." });
  }
}

module.exports = { saveToHistory, listHistory, getHistoryItem, compareWithPrevious };
