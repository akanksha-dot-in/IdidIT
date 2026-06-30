import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { TaskIntention } from "../types";

interface RescueBannerProps {
  urgentTask: TaskIntention | null;
  onActivateRescue: () => void;
}

export default function RescueBanner({ urgentTask, onActivateRescue }: RescueBannerProps) {
  if (!urgentTask) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full bg-signal/5 border border-signal/20 rounded-[16px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-signal/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-3.5 relative">
        <div className="p-2.5 bg-signal/15 rounded-xl text-signal">
          <Zap size={18} fill="currentColor" className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-widest text-signal font-bold">
            Rescue Assistant Active
          </h4>
          <p className="text-xs text-ink/90 mt-1 font-sans">
            I noticed <span className="text-white font-semibold">"{urgentTask.text}"</span> is high-priority. Want Ida to structure a custom breakdown?
          </p>
        </div>
      </div>

      <button
        id="rescue-activate-btn"
        onClick={onActivateRescue}
        className="w-full sm:w-auto bg-signal hover:bg-signal/90 text-ink text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap font-sans cursor-pointer hover:scale-[1.02]"
      >
        Break it down with Ida
      </button>
    </motion.div>
  );
}
