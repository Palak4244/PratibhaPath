// utils/atsScore.js — Role-aware ATS scoring engine

const WEAK_VERBS = ["worked on","helped with","responsible for","involved in","did","handled"];
const STRONG_VERBS = ["built","led","designed","developed","implemented","created","optimized","improved","launched","managed","automated","architected","deployed","reduced","increased","achieved","engineered","delivered","spearheaded","streamlined","founded","directed","oversaw","produced","established"];

// Role-specific skill sets — matched against the target position
const ROLE_SKILLS = {
  "software engineer":    ["javascript","python","data structures","algorithms","system design","git","sql","rest api","problem solving","oop","testing","debugging"],
  "frontend developer":   ["javascript","react","html","css","typescript","responsive design","git","webpack","performance","accessibility","figma","vue"],
  "backend developer":    ["node","express","python","rest api","sql","mongodb","system design","docker","git","microservices","postgresql","redis"],
  "full stack":           ["javascript","react","node","express","mongodb","sql","git","rest api","html","css","typescript","docker"],
  "data scientist":       ["python","machine learning","pandas","numpy","sql","statistics","visualization","tensorflow","scikit-learn","jupyter","r","deep learning"],
  "devops":               ["docker","kubernetes","ci/cd","linux","aws","terraform","git","monitoring","bash","networking","ansible","jenkins"],
  "android":              ["java","kotlin","android","rest api","git","sqlite","mvvm","firebase","testing","xml","jetpack"],
  "ios":                  ["swift","xcode","rest api","git","core data","mvvm","uikit","swiftui","testing","objective-c"],
  "ml engineer":          ["python","machine learning","tensorflow","pytorch","sql","git","data preprocessing","model deployment","statistics","deep learning","mlops"],
  "data analyst":         ["sql","python","excel","tableau","power bi","statistics","visualization","pandas","reporting","data cleaning"],
  "cloud":                ["aws","azure","gcp","docker","kubernetes","terraform","networking","security","monitoring","iac"],
  "security":             ["network security","penetration testing","vulnerability","siem","firewall","encryption","compliance","owasp","linux","python"],
  "default":              ["javascript","python","java","git","sql","rest api","problem solving","communication","teamwork","documentation"],
};

function getSkillsForRole(targetRole) {
  if (!targetRole) return ROLE_SKILLS["default"];
  const role = targetRole.toLowerCase().trim();
  for (const [key, skills] of Object.entries(ROLE_SKILLS)) {
    if (key !== "default" && role.includes(key.split(" ")[0])) return skills;
  }
  return ROLE_SKILLS["default"];
}

const SKILL_ALIASES = {
  sql:     ["mysql","postgresql","postgres","sqlite","mssql","nosql"],
  css:     ["css3","styled-components","sass","scss"],
  html:    ["html5"],
  node:    ["node.js","nodejs"],
  react:   ["react.js","reactjs"],
  "next.js": ["nextjs","next js"],
  "ci/cd": ["cicd","ci-cd","continuous integration","github actions","jenkins"],
  aws:     ["amazon web services","ec2","s3","lambda","cloudformation"],
  docker:  ["containerization","containers"],
  git:     ["github","gitlab","bitbucket","version control"],
};

function buildSkillRegex(skill) {
  const variants = [skill.toLowerCase(), ...(SKILL_ALIASES[skill.toLowerCase()] || [])];
  const escaped = variants.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})s?\\b`, "i");
}

function countWholeWordMatches(text, phrases) {
  let count = 0; const matched = [];
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) { count++; matched.push(phrase); }
  }
  return { count, matched };
}

function calculateATSScore(resumeText, targetSkills = [], targetRole = "") {
  const text = resumeText.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Contact info (10%)
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\d{10}/.test(resumeText);
  const contactScore = (hasEmail ? 50 : 0) + (hasPhone ? 50 : 0);

  // 2. Action verbs (20%)
  const { count: strongCount } = countWholeWordMatches(text, STRONG_VERBS);
  const { count: weakCount, matched: weakMatches } = countWholeWordMatches(text, WEAK_VERBS);
  const actionVerbScore = Math.min(100, (strongCount / 8) * 100) - weakCount * 5;

  // 3. Quantified achievements (15%)
  const numberMatches = resumeText.match(/\d+%|\d+x|\$\d+|\d+\+|\d+k\b/gi) || [];
  const quantScore = Math.min(100, numberMatches.length * 20);

  // 4. Formatting (20%)
  let formatScore = 100;
  if (wordCount < 150) formatScore -= 40;
  if (wordCount > 1200) formatScore -= 20;
  const hasSections = ["experience","education","skills","projects"].filter((s) => text.includes(s)).length;
  formatScore -= Math.max(0, 3 - hasSections) * 15;
  formatScore = Math.max(0, formatScore);

  // 5. Keyword match (35%) — role-based
  const skillsToCheck = targetSkills.length ? targetSkills : getSkillsForRole(targetRole);
  let matchedSkills = [], missingSkills = [];
  for (const skill of skillsToCheck) {
    if (buildSkillRegex(skill).test(text)) matchedSkills.push(skill);
    else missingSkills.push(skill);
  }
  const keywordScore = skillsToCheck.length ? Math.round((matchedSkills.length / skillsToCheck.length) * 100) : 50;

  const breakdown = {
    contactInfo:       clamp(contactScore),
    actionVerbs:       clamp(actionVerbScore),
    quantifiedResults: clamp(quantScore),
    formatting:        clamp(formatScore),
    keywordMatch:      clamp(keywordScore),
  };
  const finalScore = Math.round(
    breakdown.contactInfo * 0.10 + breakdown.actionVerbs * 0.20 +
    breakdown.quantifiedResults * 0.15 + breakdown.formatting * 0.20 +
    breakdown.keywordMatch * 0.35
  );
  return { score: clamp(finalScore), breakdown, matchedSkills, missingSkills, weakPhrasesFound: weakMatches, suggestions: buildSuggestions(breakdown, weakMatches, numberMatches.length, missingSkills) };
}

function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

function buildSuggestions(breakdown, weakMatches, numberCount, missingSkills) {
  const tips = [];
  if (breakdown.contactInfo < 100) tips.push("Add your email address and phone number clearly at the top of your resume.");
  if (breakdown.actionVerbs < 60) tips.push("Replace weak phrases with strong action verbs — use 'built', 'led', 'optimized', 'delivered' instead of 'worked on' or 'responsible for'.");
  if (weakMatches.length > 0) tips.push(`Found weak phrase(s): "${weakMatches.join('", "')}". Replace each with a specific achievement and strong verb.`);
  if (numberCount < 3) tips.push("Quantify your achievements — numbers are powerful. Instead of 'improved performance', write 'improved performance by 35%'.");
  if (breakdown.formatting < 80) tips.push("Include clear section headings: Experience, Education, Skills, and Projects. ATS systems scan for these labels.");
  if (breakdown.keywordMatch < 60) tips.push(`Your resume is missing several keywords for this role. Consider adding: ${missingSkills.slice(0, 4).join(", ")}.`);
  if (tips.length === 0) tips.push("Your resume scores well across all categories. Tailor your bullet points more specifically to the job description for best results.");
  return tips;
}

module.exports = { calculateATSScore, getSkillsForRole, ROLE_SKILLS };
