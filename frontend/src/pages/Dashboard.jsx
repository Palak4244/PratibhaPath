// src/pages/Dashboard.jsx
// Logged-in user ki saari past analyses dikhata hai, aur har item pe
// "Compare with previous" se before/after score improvement dikhata hai.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Loader2, FileSearch } from "lucide-react";
import { useAuth } from "../api/AuthContext";
import { getHistory, compareAnalysis } from "../api/api";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comparisons, setComparisons] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    getHistory()
      .then((data) => setHistory(data.history || []))
      .catch((err) => setError(err.response?.data?.error || "Could not load history."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  async function handleCompare(id) {
    try {
      const data = await compareAnalysis(id);
      setComparisons((prev) => ({ ...prev, [id]: data }));
    } catch (err) {
      // silently ignore — comparison optional feature hai
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-white text-2xl font-bold mb-1">
          {user ? `${user.name}'s dashboard` : "Dashboard"}
        </h1>
        <p className="text-slate text-sm mb-8">All of your past resume analyses.</p>

        {loading && (
          <div className="flex items-center gap-2 text-slate py-12 justify-center">
            <Loader2 className="animate-spin" size={20} /> Loading history...
          </div>
        )}

        {!loading && error && <p className="text-rose text-sm">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <FileSearch size={32} className="text-slate mx-auto mb-3" />
            <p className="text-white mb-3">No analysis history yet.</p>
            <Link to="/upload" className="text-cyan hover:underline text-sm">
              Analyze your first resume →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {history.map((item, i) => {
            const cmp = comparisons[item._id];
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {item.targetRole || "No role specified"} {item.targetCompany ? `· ${item.targetCompany}` : ""}
                    </p>
                    <p className="text-slate text-xs mt-1">
                      {new Date(item.createdAt).toLocaleDateString()} · {item.location || "No location"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-data text-xl text-cyan font-semibold">{item.score}</p>
                    <button
                      onClick={() => handleCompare(item._id)}
                      className="text-xs text-slate hover:text-cyan transition"
                    >
                      Compare with previous
                    </button>
                  </div>
                </div>

                {cmp && (
                  <div className="mt-3 pt-3 border-t border-line flex items-center gap-2 text-sm">
                    {cmp.previous ? (
                      <>
                        {cmp.improvement > 0 && <TrendingUp size={16} className="text-teal" />}
                        {cmp.improvement < 0 && <TrendingDown size={16} className="text-rose" />}
                        {cmp.improvement === 0 && <Minus size={16} className="text-slate" />}
                        <span className={cmp.improvement > 0 ? "text-teal" : cmp.improvement < 0 ? "text-rose" : "text-slate"}>
                          {cmp.improvement > 0 ? "+" : ""}{cmp.improvement} points vs previous ({cmp.previous.score})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate">No earlier analysis found for this role.</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
