// utils/testScore.js
// Yeh sirf ek test script hai — isse tum atsScore.js ko bina server chalaye
// directly test kar sakte ho: npm run test:score

const { calculateATSScore } = require("./atsScore");

const sampleResumeText = `
Riya Sharma
riya.sharma@email.com | 9876543210

SUMMARY
Computer science student passionate about web development.

EXPERIENCE
Worked on a college project for managing student records.
Helped with bug fixes in a team project.

SKILLS
JavaScript, HTML, CSS, Git

EDUCATION
B.Tech Computer Science, 2024
`;

const targetSkills = [
  "javascript", "react", "node", "express", "mongodb",
  "rest api", "git", "docker", "system design",
];

const result = calculateATSScore(sampleResumeText, targetSkills);

console.log("\n=== PratibhaPath ATS Score Test ===\n");
console.log("Final score:", result.score, "/ 100");
console.log("\nBreakdown:");
console.table(result.breakdown);
console.log("\nMatched skills:", result.matchedSkills);
console.log("Missing skills:", result.missingSkills);
console.log("\nSuggestions:");
result.suggestions.forEach((s, i) => console.log(`${i + 1}. ${s}`));
