import { Github, Linkedin } from "lucide-react";
import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/50 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={26}/>
        <p className="text-slate text-sm">AI-powered resume analysis for job seekers</p>
        <div className="flex gap-4">
          <a href="#" className="text-slate hover:text-cyan transition-colors"><Github size={18}/></a>
          <a href="#" className="text-slate hover:text-cyan transition-colors"><Linkedin size={18}/></a>
        </div>
      </div>
      <p className="text-center text-slate/50 text-xs pb-5">© {new Date().getFullYear()} PratibhaPath</p>
    </footer>
  );
}
