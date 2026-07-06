// models/Analysis.js
// Har baar jab koi resume analyze hota hai, ek record yahan save hota hai
// (agar user logged in hai). Isse Dashboard pe history dikhayi jaati hai,
// aur naya analysis purane se compare (before/after) kiya jaata hai.

const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: String,
    targetCompany: String,
    location: String,
    score: { type: Number, required: true },
    breakdown: {
      contactInfo: Number,
      actionVerbs: Number,
      quantifiedResults: Number,
      formatting: Number,
      keywordMatch: Number,
    },
    matchedSkills: [String],
    missingSkills: [String],
    suggestions: [String],
    resumeTextSnapshot: String, // resume text ka snapshot (edit history ke liye)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
