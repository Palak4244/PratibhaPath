import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Loader2, Edit3, ChevronRight, RefreshCw, PenLine } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useResume } from "../api/ResumeContext";
import { getAISuggestions } from "../api/api";
import PathStepper from "../components/PathStepper";

function getScoreColor(s) { return s >= 80 ? "#2DD4BF" : s >= 60 ? "#22D3EE" : s >= 40 ? "#FBBF24" : "#FB7185"; }
function getScoreLabel(s) { return s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Fair" : "Needs work"; }

const BAR_COLORS = { contactInfo: "#22D3EE", actionVerbs: "#818CF8", quantifiedResults: "#2DD4BF", formatting: "#FBBF24", keywordMatch: "#FB7185" };
const BAR_LABELS = { contactInfo: "Contact", actionVerbs: "Action verbs", quantifiedResults: "Quantified", formatting: "Format", keywordMatch: "Keywords" };

const CustomTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-slate mb-1">{label}</p>
      <p className="text-white font-mono font-bold">{payload[0].value}%</p>
    </div>
  ) : null;

// AI state machine: idle → loading → warming (model cold start) → done → error
const AI_STATUS = { IDLE: "idle", LOADING: "loading", WARMING: "warming", DONE: "done", ERROR: "error" };

export default function ResultsPage() {
  const { analysis, targetRole, targetCompany } = useResume();
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [aiStatus, setAiStatus] = useState(AI_STATUS.IDLE);
  const [aiText, setAiText] = useState("");
  const [warmingCountdown, setWarmingCountdown] = useState(20);
  const navigate = useNavigate();
  const warmingTimer = useRef(null);

  useEffect(() => {
    if (!analysis) { navigate("/upload"); return; }
    let f = 0;
    const t = setInterval(() => { f++; setScoreDisplay(Math.round(analysis.score * f / 50)); if (f >= 50) clearInterval(t); }, 18);
    if (analysis.score >= 80) confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 }, colors: ["#22D3EE", "#2DD4BF", "#818CF8", "#FBBF24"] });
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [analysis]);

  if (!analysis) return null;
  const { breakdown, matchedSkills, missingSkills, suggestions } = analysis;
  const color = getScoreColor(analysis.score);
  const chartData = Object.entries(BAR_LABELS).map(([k, name]) => ({ name, value: breakdown[k] || 0, key: k }));
  const r = 72, circ = 2 * Math.PI * r, offset = circ - (circ * scoreDisplay / 100);

  async function getAI() {
    setAiStatus(AI_STATUS.LOADING);
    setAiText("");
    clearInterval(warmingTimer.current);
    try {
      const data = await getAISuggestions({ resumeText: analysis.resumeText, targetRole, targetCompany, missingSkills, breakdown });
      setAiText(data.aiSuggestions);
      setAiStatus(AI_STATUS.DONE);
    } catch (err) {
      const errData = err.response?.data;
      // HF free tier: model cold-start takes ~20s — show friendly countdown
      if (errData?.error === "MODEL_LOADING") {
        const wait = errData?.waitTime || 20;
        setAiStatus(AI_STATUS.WARMING);
        setWarmingCountdown(wait);
        let c = wait;
        warmingTimer.current = setInterval(() => {
          c--;
          setWarmingCountdown(c);
          if (c <= 0) {
            clearInterval(warmingTimer.current);
            // Auto-retry after warmup
            retryAfterWarmup();
          }
        }, 1000);
      } else {
        // Don't show the raw error to users — just reset to idle so they can retry
        setAiStatus(AI_STATUS.IDLE);
        console.error("AI error (check HF_API_KEY in backend/.env):", errData?.error || err.message);
      }
    }
  }

  async function retryAfterWarmup() {
    setAiStatus(AI_STATUS.LOADING);
    try {
      const data = await getAISuggestions({ resumeText: analysis.resumeText, targetRole, targetCompany, missingSkills, breakdown });
      setAiText(data.aiSuggestions);
      setAiStatus(AI_STATUS.DONE);
    } catch {
      setAiStatus(AI_STATUS.IDLE);
    }
  }


  return (
    <div className="min-h-[calc(100vh-64px)] px-4 sm:px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 no-print"><PathStepper currentStep={3} /></div>

        {/* Row 1: gauge + meta */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5 no-print">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="glass-strong rounded-2xl p-6 flex flex-col items-center justify-center"
            style={{ boxShadow: `0 0 60px ${color}18` }}>
            <svg width="168" height="168" viewBox="0 0 168 168">
              <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              <circle cx="84" cy="84" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 84 84)"
                style={{ filter: `drop-shadow(0 0 12px ${color})`, transition: "stroke-dashoffset 0.05s" }} />
              <text x="84" y="80" textAnchor="middle" fontSize="36" fontWeight="700" fontFamily="JetBrains Mono,monospace" fill="#fff">{scoreDisplay}</text>
              <text x="84" y="100" textAnchor="middle" fontSize="12" fill={color}>ATS SCORE</text>
            </svg>
            <p className="font-semibold text-lg mt-1" style={{ color }}>{getScoreLabel(analysis.score)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6 lg:col-span-2">
            <p className="text-slate text-sm mb-1">Target role</p>
            <p className="font-display text-white text-xl font-bold mb-4">
              {targetRole || "—"}{targetCompany ? ` · ${targetCompany}` : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[["Score", `${analysis.score}/100`], ["Matched", matchedSkills.length], ["Missing", missingSkills.length], ["Status", getScoreLabel(analysis.score)]].map(([l, v]) => (
                <div key={l} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="font-mono text-white text-lg font-bold">{v}</p>
                  <p className="text-slate text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 2: chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 mb-5 no-print">
          <h2 className="text-white font-semibold mb-5">Score breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((d) => <Cell key={d.key} fill={BAR_COLORS[d.key]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Row 3: skills */}
        <div className="grid sm:grid-cols-2 gap-5 mb-5 no-print">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3">Identified skills <span className="text-slate font-normal text-sm">({matchedSkills.length})</span></h3>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length === 0 ? <p className="text-slate text-sm">None matched yet</p> : matchedSkills.map(s => <span key={s} className="chip-matched text-xs px-3 py-1 rounded-full">{s}</span>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3">Missing keywords <span className="text-slate font-normal text-sm">({missingSkills.length})</span></h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length === 0 ? <p className="text-teal text-sm">Nothing missing — great!</p> : missingSkills.map(s => <span key={s} className="chip-missing text-xs px-3 py-1 rounded-full">{s}</span>)}
            </div>
          </motion.div>
        </div>

        {/* Row 4: suggestions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-strong rounded-2xl p-6 mb-5 no-print">
          <h2 className="text-white font-semibold mb-4">Suggestions</h2>
          <ul className="space-y-3">
            {suggestions.map((t, i) => (
              <li key={i} className="flex gap-3 text-slate text-sm leading-relaxed">
                <ChevronRight size={16} className="text-cyan shrink-0 mt-0.5" />{t}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Row 5: AI suggestions — errors are hidden from user, just show retry */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-strong rounded-2xl p-6 mb-5 no-print">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-cyan" />AI-powered suggestions
            </h2>
            {aiStatus === AI_STATUS.IDLE && (
              <button onClick={getAI}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all"
                style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.25)" }}>
                <Sparkles size={14} />Get AI suggestions
              </button>
            )}
            {aiStatus === AI_STATUS.DONE && (
              <button onClick={getAI}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-slate hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <RefreshCw size={12} />Regenerate
              </button>
            )}
          </div>

          <p className="text-slate text-sm mb-4">
            The suggestions above come from fixed scoring rules. This uses real AI — it reads your actual resume content and gives personalized advice.
          </p>

          {/* Loading state */}
          {aiStatus === AI_STATUS.LOADING && (
            <div className="flex items-center gap-3 py-4 text-slate text-sm">
              <Loader2 size={18} className="animate-spin text-cyan" />
              Analyzing your resume…
            </div>
          )}

          {/* Warming state — model cold start (no scary error, just info) */}
          {aiStatus === AI_STATUS.WARMING && (
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <Loader2 size={16} className="animate-spin mt-0.5 shrink-0" style={{ color: "#FBBF24" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "#FBBF24" }}>AI model is warming up</p>
                <p className="text-slate text-xs mt-1">
                  The model is starting up (free tier cold start). Auto-retrying in {warmingCountdown}s…
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {aiStatus === AI_STATUS.DONE && aiText && (
            <div className="text-slate text-sm whitespace-pre-line leading-relaxed border-t pt-4 mt-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {aiText}
            </div>
          )}
        </motion.div>

        {/* Row 6: Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-strong rounded-2xl p-6 no-print">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Edit3 size={16} style={{ color: "#818CF8" }} />Next steps
          </h2>
          <p className="text-slate text-sm mb-5">
            Open the resume editor to annotate your original resume image, add missing keywords visually, and download the updated version as JPG or PDF.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => navigate("/editor")}
              className="gradient-btn text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
              <PenLine size={15} />Open resume editor
            </button>
            <button onClick={() => navigate("/jobs")}
              className="px-5 py-2.5 rounded-xl text-white font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              See matching jobs →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
