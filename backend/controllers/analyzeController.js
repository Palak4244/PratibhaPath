const fs = require("fs");
const { extractText } = require("../utils/extractText");
const { calculateATSScore, getSkillsForRole } = require("../utils/atsScore");

async function analyzeResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "Resume file is required." });

    const { path: filePath, mimetype } = req.file;
    const { targetRole, targetCompany, targetSkills, location } = req.body;

    // Use role-based skills if no custom skills provided
    const skillsArray = targetSkills && targetSkills.trim()
      ? targetSkills.split(",").map((s) => s.trim().toLowerCase())
      : getSkillsForRole(targetRole || "");

    const resumeText = await extractText(filePath, mimetype);
    fs.unlink(filePath, () => {});

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(422).json({ error: "Could not read enough text from this file. Try a clearer PDF or image." });
    }

    const analysis = calculateATSScore(resumeText, skillsArray, targetRole || "");

    return res.status(200).json({
      targetRole: targetRole || null,
      targetCompany: targetCompany || null,
      location: location || null,
      checkedSkills: skillsArray,
      resumeText,
      savedId: null,
      ...analysis,
    });
  } catch (err) {
    console.error("Analyze error:", err.message);
    return res.status(500).json({ error: "Something went wrong while analyzing the resume." });
  }
}

module.exports = { analyzeResume };
