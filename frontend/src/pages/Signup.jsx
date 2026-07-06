import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useAuth } from "../api/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "";
      // MongoDB not connected — show friendly message, not a technical error
      if (msg.includes("MongoDB") || msg.includes("503")) {
        setError("Account creation requires database setup. See backend/README.md to connect MongoDB.");
      } else {
        setError(msg || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    padding: "12px 14px", fontSize: "14px", color: "#fff", outline: "none",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-sm">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
          style={{ background: "rgba(34,211,238,0.1)" }}>
          <UserPlus size={20} className="text-cyan" />
        </div>
        <h1 className="font-display text-white text-2xl font-bold mb-1">Create account</h1>
        <p className="text-slate text-sm mb-6">Save your analysis history and track your score over time.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <input type="email" required placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <input type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(251,113,133,0.08)", color: "#94A3B8", border: "1px solid rgba(251,113,133,0.15)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-bg gradient-btn disabled:opacity-50 mt-1">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="text-slate text-sm text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
