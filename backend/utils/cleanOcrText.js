// utils/cleanOcrText.js
// Tesseract OCR misreads styled fonts, icons, ligatures in resumes.
// This applies targeted fixes for the most common resume OCR artifacts.

const WORD_FIXES = [
  // JavaScript variants
  [/\bJiaScrp[t]?\b/gi, "JavaScript"], [/\bJavaScrip[t]?\b/gi, "JavaScript"],
  [/\bJavaScrpt\b/gi, "JavaScript"],   [/\bJavaScrpt\b/gi, "JavaScript"],
  [/\bJS\b/g, "JavaScript"],
  // TypeScript
  [/\bTypeSerp[t]?\b/gi, "TypeScript"], [/\bTypeScrp[t]?\b/gi, "TypeScript"],
  [/\bTypScrpt\b/gi, "TypeScript"],
  // React / Node
  [/\bReact\.?\s*J\.?\b/gi, "React.js"], [/\bNode\.?\s*J\.?\b/gi, "Node.js"],
  [/\bReacJS\b/gi, "React.js"],
  // Databases
  [/\bMongoD[Bb8]\b/gi, "MongoDB"], [/\bPostgreS[Qq][Ll1]\b/gi, "PostgreSQL"],
  [/\bMySQ[L1I]\b/gi, "MySQL"],
  // Tools / platforms
  [/\bGitHu[b6pb]\b/gi, "GitHub"],  [/\bTailwi[nm]d\b/gi, "Tailwind"],
  [/\bW?TNLS\b/g, "Tailwind"],      [/\bBastin\b/g, "Bootstrap"],
  [/\bBootstrp\b/gi, "Bootstrap"],  [/\bExpres[s5]\b/gi, "Express"],
  [/\bPytho[nm]\b/gi, "Python"],    [/\bTypescri[pb]t\b/gi, "TypeScript"],
  // C++ often read as "C+" or "C +"
  [/\bC\+\s*\+?\b/g, "C++"],        [/\bC\+\b/g, "C++"],
  // Cities / places (common OCR errors on Indian resumes)
  [/\bGiaziabad\b/gi, "Ghaziabad"], [/\bVarwnasi\b/gi, "Varanasi"],
  [/\bVaranasil\b/gi, "Varanasi"],  [/\bDelh[il1]\b/gi, "Delhi"],
  [/\bMumba[il1]\b/gi, "Mumbai"],
  // Symbol misreads
  [/©/g, "@"], [/\u00a9/g, "@"], [/\u00ae/g, ""],
  // Broken dates like "202 2007" → "2023 - 2027"
  [/\b(20\d\d)\s+(20\d\d)\b/g, "$1 – $2"],
];

// These patterns at line-start are almost always OCR noise from icons/bullets
const NOISE_LINE_PATTERNS = [
  /^[•\-–—●○◆◇▪▫]+$/,                   // pure bullet lines
  /^[\s\W]{0,3}$/,                        // near-empty or only symbols
  /^[A-Z]{1,3}\s+\d+\s+[A-Za-z]/,        // e.g. "CLT 8 Baring gion" — icon misread
  /^[A-Z]{1,2}\s+[a-z]{1,4}$/,           // short garbled icon text
  /^\w{1,3}\s+\d\s+/,                     // short code + number + more
];

function cleanOcrText(raw) {
  if (!raw) return "";

  let text = raw;
  // Apply word-level corrections
  for (const [pattern, replacement] of WORD_FIXES) {
    text = text.replace(pattern, replacement);
  }

  // Process line by line
  const lines = text.split("\n").map((line) => {
    const trimmed = line.trim();
    // Drop lines that are clearly OCR noise
    if (NOISE_LINE_PATTERNS.some((p) => p.test(trimmed))) return null;
    // Drop lines that are <3 chars and not a section heading separator
    if (trimmed.length > 0 && trimmed.length < 3) return null;
    // Lines where >50% chars are non-alphanumeric are likely garbage
    if (trimmed.length > 0) {
      const alnum = (trimmed.match(/[a-zA-Z0-9 @.+]/g) || []).length;
      if (alnum / trimmed.length < 0.45) return null;
    }
    return line;
  });

  return lines
    .filter((l) => l !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // collapse multiple blank lines
    .trim();
}

module.exports = { cleanOcrText };