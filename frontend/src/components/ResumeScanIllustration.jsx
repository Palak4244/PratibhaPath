// src/components/ResumeScanIllustration.jsx
import { motion } from "framer-motion";
import { Search, Gauge, ListChecks } from "lucide-react";

export default function ResumeScanIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative glass rounded-2xl p-5 shadow-glowcyan overflow-hidden">
        {/* animated scanning beam */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute left-0 right-0 h-1/3 bg-gradient-to-b from-transparent via-cyan/25 to-transparent animate-scan" />
        </div>

        <div className="relative space-y-3">
          <div className="h-3 w-24 bg-white/20 rounded" />
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-white/10 rounded" />
            <div className="h-2 w-5/6 bg-white/10 rounded" />
          </div>
          <div className="h-2.5 w-16 bg-cyan/40 rounded mt-4" />
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-white/10 rounded" />
            <div className="h-2 w-4/6 bg-white/10 rounded" />
            <div className="h-2 w-5/6 bg-white/10 rounded" />
          </div>
          <div className="h-2.5 w-16 bg-teal/40 rounded mt-4" />
          <div className="flex gap-1.5 flex-wrap">
            {["React", "Node", "SQL", "Git"].map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* floating chips around the card */}
      <motion.div
        className="absolute -right-6 top-6 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-glowcyan"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Gauge size={16} className="text-cyan" />
        <span className="text-xs text-white font-data">87% score</span>
      </motion.div>

      <motion.div
        className="absolute -left-8 top-1/2 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-glowteal"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Search size={16} className="text-teal" />
        <span className="text-xs text-white">Keywords found</span>
      </motion.div>

      <motion.div
        className="absolute -right-4 bottom-0 glass rounded-xl px-3 py-2 flex items-center gap-2"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <ListChecks size={16} className="text-amberglow" />
        <span className="text-xs text-white">Matching skills</span>
      </motion.div>
    </div>
  );
}
