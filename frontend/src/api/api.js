import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function analyzeResume({ file, targetRole, targetCompany, targetSkills, location }) {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("targetRole", targetRole || "");
  formData.append("targetCompany", targetCompany || "");
  formData.append("targetSkills", targetSkills || ""); // empty → backend picks role-based skills
  formData.append("location", location || "");
  const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getJobMatches(skills, location) {
  const response = await axios.get(`${API_BASE_URL}/jobs`, {
    params: { skills: skills.join(","), location: location || "" },
  });
  return response.data;
}

// HF AI suggestions — returns { aiSuggestions: string }
export async function getAISuggestions({ resumeText, targetRole, targetCompany, missingSkills, breakdown }) {
  const response = await axios.post(`${API_BASE_URL}/ai-suggestions`, {
    resumeText, targetRole, targetCompany, missingSkills, breakdown,
  });
  return response.data; // { aiSuggestions: "..." }
}
