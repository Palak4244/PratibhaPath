import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, Loader2, MapPin, Briefcase, ChevronDown } from "lucide-react";
import { useResume } from "../api/ResumeContext";
import { analyzeResume } from "../api/api";
import PathStepper from "../components/PathStepper";

const ANALYZING_STEPS = [
  "Reading your file…",
  "Extracting text…",
  "Calculating ATS score…",
  "Matching keywords to your role…",
  "Building your report…",
];

// Popular roles for autocomplete
const COMMON_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Data Scientist", "DevOps Engineer",
  "ML Engineer", "Data Analyst", "Android Developer", "iOS Developer",
  "Cloud Engineer", "Security Engineer", "Product Manager",
  "UI/UX Designer", "System Administrator",
];

const INP = {
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
  padding: "11px 14px", fontSize: "14px", color: "#fff", outline: "none",
};

export default function UploadPage() {
  const { userName, targetRole, setTargetRole, targetCompany, setTargetCompany, location, setLocation, setAnalysis, setUploadedFile, setUploadedFileURL } = useResume();
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [roleDropdown, setRoleDropdown] = useState(false);
  const navigate = useNavigate();
  const dropRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStepIdx(i => (i + 1) % ANALYZING_STEPS.length), 1200);
    return () => clearInterval(t);
  }, [loading]);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e) => { if (!dropRef.current?.contains(e.target)) setRoleDropdown(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filteredRoles = COMMON_ROLES.filter(r =>
    r.toLowerCase().includes(targetRole.toLowerCase()) && r.toLowerCase() !== targetRole.toLowerCase()
  );

  function onDrop(e) { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!file) { setError("Please select your resume file (PDF, JPG, or PNG)."); return; }
    if (!targetRole.trim()) { setError("Position applying for is required — this determines which skills are checked."); return; }
    if (!location.trim()) { setError("Location is required — used to find jobs near you."); return; }
    setLoading(true);
    try {
      // Store file for image editor on results page
      setUploadedFile(file);
      setUploadedFileURL(URL.createObjectURL(file));
      const result = await analyzeResume({ file, targetRole, targetCompany, location, targetSkills: "" });
      setAnalysis(result);
      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Make sure the backend is running on port 5000.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-6 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-10"><PathStepper currentStep={1} /></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-white text-2xl sm:text-3xl font-bold mb-1 text-center">
            {userName ? `Ready, ${userName} — let's analyze your resume` : "Upload your resume"}
          </h1>
          <p className="text-slate text-center text-sm mb-8">PDF or image (JPG/PNG) · Max 5MB</p>

          <form onSubmit={submit} className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className="rounded-2xl p-8 text-center transition-all duration-300"
              style={{ background: drag ? "rgba(34,211,238,0.05)" : "rgba(255,255,255,0.03)", border: drag ? "2px dashed #22D3EE" : "2px dashed rgba(255,255,255,0.12)", boxShadow: drag ? "0 0 20px rgba(34,211,238,0.15)" : "none" }}
            >
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" id="rf" className="hidden" onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="rf" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(34,211,238,0.1)" }}>
                  {file ? <FileText size={26} className="text-cyan" /> : <UploadCloud size={26} className="text-cyan" />}
                </div>
                {file ? (
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{file.name}</p>
                    <button type="button" onClick={e => { e.preventDefault(); setFile(null); }} className="text-slate hover:text-rose transition-colors"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-white font-medium mb-1">Drag and drop your resume here</p>
                    <p className="text-slate text-sm mb-4">or click to browse your computer</p>
                    <span className="text-xs px-4 py-2 rounded-lg" style={{ background: "rgba(34,211,238,0.08)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.25)" }}>Browse files</span>
                  </>
                )}
              </label>
            </div>

            {/* Role with autocomplete — REQUIRED */}
            <div ref={dropRef} className="relative">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                <Briefcase size={11} className="inline mr-1" />Position applying for <span className="text-rose">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => { setTargetRole(e.target.value); setRoleDropdown(true); }}
                  onFocus={() => setRoleDropdown(true)}
                  placeholder="e.g. Software Engineer, Frontend Developer"
                  style={INP}
                  onFocus2={e => e.target.style.borderColor = "rgba(34,211,238,0.5)"}
                />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
              </div>
              {roleDropdown && filteredRoles.length > 0 && targetRole.length > 0 && (
                <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden" style={{ background: "#0D1425", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  {filteredRoles.slice(0, 6).map(r => (
                    <button key={r} type="button" onClick={() => { setTargetRole(r); setRoleDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate hover:text-white transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      onMouseEnter={e => e.target.style.background = "rgba(34,211,238,0.06)"}
                      onMouseLeave={e => e.target.style.background = "transparent"}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Company + Location row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Target company <span className="text-slate/50">(optional)</span></label>
                <input type="text" value={targetCompany} onChange={e => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, TCS, Infosys" style={INP}
                  onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                  <MapPin size={11} className="inline mr-1" />Your location <span className="text-rose">*</span>
                </label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Lucknow, Delhi, Mumbai" style={INP}
                  onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            </div>

            <p className="text-xs" style={{ color: "#64748B" }}>
              <span className="text-rose">*</span> Required fields — the position determines which skills are checked against your resume.
            </p>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.2)", color: "#FB7185" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-bg gradient-btn disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <AnimatePresence mode="wait">
                    <motion.span key={stepIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                      {ANALYZING_STEPS[stepIdx]}
                    </motion.span>
                  </AnimatePresence>
                </>
              ) : "Analyze my resume →"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
