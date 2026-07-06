import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  const { pathname } = useLocation();
  const lc = (p) => `text-sm transition-colors duration-200 ${pathname === p ? "text-cyan font-medium" : "text-slate hover:text-white"}`;
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-line/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/"><Logo size={32} /></Link>
        <nav className="hidden sm:flex items-center gap-8">
          <Link to="/" className={lc("/")}>Home</Link>
          <Link to="/upload" className={lc("/upload")}>Analyze</Link>
          <Link to="/jobs" className={lc("/jobs")}>Jobs</Link>
        </nav>
        <Link to="/upload" className="gradient-btn text-bg text-sm font-semibold px-4 py-2 rounded-lg">
          Analyze resume
        </Link>
      </div>
    </header>
  );
}
