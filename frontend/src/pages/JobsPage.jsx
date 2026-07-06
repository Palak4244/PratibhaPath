import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, MapPin, ExternalLink, AlertCircle, Briefcase } from "lucide-react";
import { useResume } from "../api/ResumeContext";
import { getJobMatches } from "../api/api";
import PathStepper from "../components/PathStepper";

export default function JobsPage() {
  const { analysis, userName, location } = useResume();
  const navigate = useNavigate();
  const [jobs,setJobs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [source,setSource]=useState("");

  useEffect(()=>{
    if(!analysis){navigate("/upload");return;}
    const skills=analysis.matchedSkills.length?analysis.matchedSkills:["javascript","react"];
    getJobMatches(skills,location)
      .then(d=>{setJobs(d.jobs||[]);setSource(d.source||"");})
      .catch(()=>setError("Could not load live jobs. Make sure the backend is running, or try again shortly."))
      .finally(()=>setLoading(false));
    //eslint-disable-next-line
  },[analysis]);

  if(!analysis) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10"><PathStepper currentStep={4}/></div>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
          <h1 className="font-display text-white text-2xl font-bold mb-2">
            {userName?`${userName}'s`:"Your"} job matches
          </h1>
          <p className="text-slate text-sm mb-1">Based on your identified skills{location?` · near ${location}`:""}</p>
          {source&&<p className="text-slate/50 text-xs mb-8">Source: {source}</p>}
          {!source&&<div className="mb-8"/>}
        </motion.div>

        {loading&&(
          <div className="flex items-center justify-center gap-3 py-20 text-slate">
            <Loader2 className="animate-spin" size={20}/><span>Fetching live jobs…</span>
          </div>
        )}
        {!loading&&error&&(
          <div className="glass rounded-2xl p-5 flex gap-3 items-start text-rose">
            <AlertCircle size={18} className="shrink-0 mt-0.5"/><p className="text-sm">{error}</p>
          </div>
        )}
        {!loading&&!error&&jobs.length===0&&(
          <div className="glass rounded-2xl p-10 text-center">
            <Briefcase size={32} className="text-slate mx-auto mb-3"/>
            <p className="text-white mb-1">No matching jobs found right now.</p>
            <p className="text-slate text-sm">Try again shortly, or check that ADZUNA keys are set in backend/.env</p>
          </div>
        )}
        <div className="space-y-3">
          {jobs.map((job,i)=>(
            <motion.a key={job.id||i} href={job.url} target="_blank" rel="noopener noreferrer"
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="glass rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-white/20 border border-transparent transition-all duration-200 block">
              <div className="min-w-0">
                <p className="text-white font-medium truncate group-hover:text-cyan transition-colors">{job.title}</p>
                <p className="text-slate text-sm">{job.company}</p>
                <p className="text-slate/60 text-xs flex items-center gap-1 mt-1"><MapPin size={11}/>{job.location}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${job.matchPercent>=50?"chip-matched":"chip-neutral"}`}>
                  {job.matchPercent}%
                </span>
                <ExternalLink size={14} className="text-slate group-hover:text-cyan transition-colors"/>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
