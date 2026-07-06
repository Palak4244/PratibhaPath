// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center">
      <Compass size={48} className="text-cyan mb-4" />
      <h1 className="font-display text-white text-3xl font-bold mb-2">Raasta bhatak gaya</h1>
      <p className="text-slate mb-6">This page doesn't exist. Let's get you back on the right path.</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-lg bg-cyan text-bgdeep font-semibold hover:shadow-glowcyan transition"
      >
        Home pe wapas jao
      </Link>
    </div>
  );
}
