// controllers/aiController.js
const { callGroq } = require("../utils/aiClient");

async function getAISuggestions(req, res) {
  try {
    const { resumeText, targetRole, targetCompany, missingSkills, breakdown } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required." });
    }

    const prompt =
      `Review this resume for a ${targetRole || "software engineer"} position` +
      (targetCompany ? ` at ${targetCompany}` : "") + `.\n\n` +
      `Resume:\n"""\n${resumeText.slice(0, 2500)}\n"""\n\n` +
      `Missing skills from ATS scan: ${(missingSkills || []).join(", ") || "none"}\n\n` +
      `Give exactly 5 specific, numbered suggestions. Each must reference actual content from ` +
      `this resume — no generic advice. Format:\n` +
      `1. ...\n2. ...\n3. ...\n4. ...\n5. ...`;

    const text = await callGroq(prompt);
    return res.status(200).json({ aiSuggestions: text });

  } catch (err) {
    console.error("AI error:", err.message);
    return res.status(502).json({ error: err.message });
  }
}

module.exports = { getAISuggestions };
