// controllers/jobsController.js
// PRIMARY source: Adzuna (India, location-aware) — signup chahiye (free,
// instant). Agar Adzuna keys .env mein nahi hain, automatically Arbeitnow
// (free, no-key, mostly remote/Europe roles) pe fallback ho jaata hai —
// taaki bina kisi signup ke bhi project chal sake.

const { rankJobs } = require("../utils/jobMatcher");

const ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api";

async function fetchFromAdzuna(skills, location) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return null; // keys nahi hain -> fallback trigger hoga

  const what = encodeURIComponent(skills.slice(0, 3).join(" ")); // top 3 skills se search query
  const where = encodeURIComponent(location || "India");
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&what=${what}&where=${where}&results_per_page=20&content-type=application/json`;

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Adzuna API returned ${response.status}`);

  const data = await response.json();
  return (data.results || []).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.display_name || "Unknown company",
    location: job.location?.display_name || location || "India",
    remote: false,
    url: job.redirect_url,
    tags: [],
    description: (job.description || "").slice(0, 240),
    source: "Adzuna",
  }));
}

async function fetchFromArbeitnow() {
  const response = await fetch(ARBEITNOW_URL, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Arbeitnow API returned ${response.status}`);

  const payload = await response.json();
  const rawJobs = payload.data || payload.jobs || [];

  return rawJobs.map((job) => ({
    id: job.slug || job.id,
    title: job.title,
    company: job.company_name || job.company || "Unknown company",
    location: job.location || (job.remote ? "Remote" : "Not specified"),
    remote: Boolean(job.remote),
    url: job.url,
    tags: job.tags || [],
    description: (job.description || "").replace(/<[^>]+>/g, " ").slice(0, 240),
    source: "Arbeitnow",
  }));
}

async function getJobs(req, res) {
  try {
    const skillsParam = req.query.skills || "";
    const location = (req.query.location || "").trim();
    const userSkills = skillsParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (userSkills.length === 0) {
      return res.status(400).json({ error: "Provide at least one skill via ?skills=" });
    }

    let normalized = null;
    let source = null;

    try {
      normalized = await fetchFromAdzuna(userSkills, location);
      if (normalized) source = "Adzuna (India)";
    } catch (err) {
      console.error("Adzuna fetch failed, falling back to Arbeitnow:", err.message);
    }

    if (!normalized) {
      normalized = await fetchFromArbeitnow();
      source = "Arbeitnow (remote/global fallback — Adzuna keys not configured)";
    }

    const ranked = rankJobs(normalized, userSkills, 15);
    return res.status(200).json({ source, count: ranked.length, jobs: ranked });
  } catch (err) {
    console.error("Jobs fetch error:", err.message);
    return res.status(502).json({
      error: "Could not fetch live jobs right now. Try again in a moment.",
    });
  }
}

module.exports = { getJobs };
