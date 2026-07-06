// utils/jobMatcher.js
// Yeh file real job listings ko user ki matched skills se compare karke
// ek match % deti hai, aur best matches upar la deti hai (sort).

function computeMatch(job, userSkills) {
  const haystack = `${job.title} ${(job.tags || []).join(" ")} ${job.description || ""}`.toLowerCase();
  const skills = userSkills.map((s) => s.toLowerCase());

  const hits = skills.filter((skill) => haystack.includes(skill));
  const matchPercent = skills.length
    ? Math.round((hits.length / skills.length) * 100)
    : 0;

  return { matchPercent, matchedOn: hits };
}

// Jobs ko match % ke hisaab se rank karta hai, best wale upar
function rankJobs(jobs, userSkills, limit = 12) {
  return jobs
    .map((job) => {
      const { matchPercent, matchedOn } = computeMatch(job, userSkills);
      return { ...job, matchPercent, matchedOn };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);
}

module.exports = { computeMatch, rankJobs };
