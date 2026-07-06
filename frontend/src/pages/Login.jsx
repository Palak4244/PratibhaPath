import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "../api/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (msg.includes("MongoDB") || msg.includes("503")) {
        setError("Login requires database setup. See backend/README.md to connect MongoDB.");
      } else {
        setError(msg || "Login failed. Please check your credentials.");
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
          <LogIn size={20} className="text-cyan" />
        </div>
        <h1 className="font-display text-white text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-slate text-sm mb-6">Log in to view your history and saved analyses.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" required placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(251,113,133,0.08)", color: "#94A3B8", border: "1px solid rgba(251,113,133,0.15)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-bg gradient-btn disabled:opacity-50 mt-1">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-slate text-sm text-center mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-cyan hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
