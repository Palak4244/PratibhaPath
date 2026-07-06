import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Download, Briefcase, CheckCircle2 } from "lucide-react";
import { useResume } from "../api/ResumeContext";

const FEATURES = [
  { icon: Zap, title: "Instant ATS score", desc: "Get a weighted score across keywords, formatting, action verbs, and achievements.", color: "#22D3EE" },
  { icon: Target, title: "Keyword gap analysis", desc: "See exactly which skills and keywords are missing for your target role.", color: "#818CF8" },
  { icon: Download, title: "Edit and download", desc: "Edit your resume inline and download a polished PDF — no extra tools needed.", color: "#2DD4BF" },
  { icon: Briefcase, title: "Live job matches", desc: "Real job listings ranked by how well they match your skill set.", color: "#FBBF24" },
];

const STATS = [
  { value: "90%", label: "Resumes rejected by ATS" },
  { value: "3×", label: "More interview calls with optimized resumes" },
  { value: "Free", label: "No signup required for analysis" },
];

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      <div className="animate-pulse-ring absolute inset-0 rounded-2xl" style={{background:"radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 70%)"}}/>
      <div className="glass-strong rounded-2xl p-5 relative overflow-hidden glow-cyan">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute left-0 right-0 h-24 animate-scan" style={{background:"linear-gradient(180deg,transparent 0%,rgba(34,211,238,0.15) 50%,transparent 100%)"}}/>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{background:"linear-gradient(135deg,#22D3EE,#818CF8)",color:"#050B18"}}>RS</div>
          <div>
            <p className="text-white text-sm font-medium">Riya Sharma</p>
            <p className="text-slate text-xs">Software Engineer applicant</p>
          </div>
        </div>
        <div className="space-y-2.5 mb-5">
          {[["Keyword match","78%","#22D3EE"],["Action verbs","85%","#2DD4BF"],["Formatting","92%","#818CF8"],["Quantified results","60%","#FBBF24"]].map(([l,v,c])=>(
            <div key={l}>
              <div className="flex justify-between text-xs mb-1"><span className="text-slate">{l}</span><span className="font-mono" style={{color:c}}>{v}</span></div>
              <div className="h-1.5 rounded-full" style={{background:"rgba(255,255,255,0.08)"}}>
                <motion.div className="h-full rounded-full" style={{background:c}} initial={{width:0}} animate={{width:v}} transition={{duration:1.2,ease:"easeOut",delay:0.5}}/>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["React","Node.js","REST API","Git"].map(s=><span key={s} className="chip-matched text-xs px-2.5 py-0.5 rounded-full">{s}</span>)}
          {["Docker","GraphQL"].map(s=><span key={s} className="chip-missing text-xs px-2.5 py-0.5 rounded-full">{s}</span>)}
        </div>
      </div>
      <motion.div animate={{y:[0,-8,0]}} transition={{duration:3.5,repeat:Infinity,ease:"easeInOut"}}
        className="absolute -right-8 top-4 glass rounded-xl px-3 py-2 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-teal"/><span className="text-xs text-white font-mono font-semibold">82 / 100</span>
      </motion.div>
      <motion.div animate={{y:[0,8,0]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut",delay:1}}
        className="absolute -left-8 bottom-8 glass rounded-xl px-3 py-2">
        <p className="text-xs text-slate">Missing keyword</p>
        <p className="text-xs text-rose font-medium">Docker · GraphQL</p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [name, setName] = useState("");
  const { setUserName } = useResume();
  const navigate = useNavigate();
  function go(e) { e.preventDefault(); if(!name.trim()) return; setUserName(name.trim()); navigate("/upload"); }
  return (
    <div className="px-6">
      <section className="max-w-6xl mx-auto pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{duration:0.6}}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 border border-cyan/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"/>
            <span className="text-xs text-cyan font-medium tracking-wide uppercase">AI Resume Analyzer</span>
          </div>
          <h1 className="font-display text-white text-4xl sm:text-5xl font-bold leading-tight mb-5">
            Beat the <span className="gradient-text">ATS</span>.<br/>Land your <span className="gradient-text">dream job</span>.
          </h1>
          <p className="text-slate text-lg mb-8 max-w-md leading-relaxed">
            Upload your resume, get an instant ATS score, discover what's missing, and find real jobs that match your skills.
          </p>
          <form onSubmit={go} className="flex flex-col sm:flex-row gap-3 max-w-md mb-3">
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name to get started"
              className="flex-1 px-4 py-3.5 rounded-xl text-white placeholder-slate focus:outline-none focus:border-glow transition-all"
              style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}/>
            <button type="submit" disabled={!name.trim()} className="gradient-btn px-6 py-3.5 rounded-xl font-semibold text-bg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
              Analyze free <ArrowRight size={16}/>
            </button>
          </form>
          <p className="text-slate/60 text-sm">Free · Instant · No credit card needed</p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {STATS.map(s=>(
              <div key={s.label} className="glass rounded-xl p-3 text-center">
                <p className="font-display text-white font-bold text-lg">{s.value}</p>
                <p className="text-slate text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.7,delay:0.15}} className="flex justify-center">
          <HeroVisual/>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto pb-28">
        <motion.p initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center text-slate text-sm uppercase tracking-widest mb-3">What you get</motion.p>
        <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="font-display text-white text-2xl sm:text-3xl font-bold text-center mb-12">
          Everything to get your resume noticed
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f,i)=>(
            <motion.div key={f.title} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-50px"}} transition={{delay:i*0.1}} className="glass rounded-2xl p-5 hover:border-white/15 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:`${f.color}18`}}>
                <f.icon size={20} style={{color:f.color}}/>
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
