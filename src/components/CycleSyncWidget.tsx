import React from "react";
import { Activity } from "lucide-react";
import { CyclePhase } from "../types";

interface CycleSyncWidgetProps {
  cycleDay: number;
  cycleLength: number;
  cyclePhase: CyclePhase;
}

export default function CycleSyncWidget({
  cycleDay,
  cycleLength,
  cyclePhase
}: CycleSyncWidgetProps) {
  const getCycleBadgeStyles = () => {
    switch (cyclePhase) {
      case "menstrual":
        return "bg-warmth/15 text-warmth border-warmth/25";
      case "follicular":
        return "bg-thrive/15 text-thrive border-thrive/25";
      case "ovulation":
        return "bg-petal/15 text-petal border-petal/25";
      case "luteal":
        return "bg-dusk/15 text-dusk border-dusk/25";
    }
  };

  const getPhaseDescription = () => {
    switch (cyclePhase) {
      case "menstrual":
        return "REST MODE • Your energy is naturally drawing inward. Rest IS the productive action today. Warrior XP bonus active!";
      case "follicular":
        return "RISING ENERGY • Estrogen is rising. Ideal window to initiate new projects, learn fast, and map creative pathways.";
      case "ovulation":
        return "PEAK POWER WEEK • Peak communication and magnetic charm. Best time for interviews, hard conversations, and social goals.";
      case "luteal":
        return "DETAIL MODE • Mind is focused on organization, edits, and tidying loose ends. Excellent time for planning routines.";
    }
  };

  const percent = Math.min(100, Math.round((cycleDay / cycleLength) * 100));

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-[16px] p-5 space-y-4 hover:border-bloom/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-bloom" />
          <h4 className="text-[11px] font-mono uppercase tracking-widest text-ghost font-medium">
            Biorhythmic Rhythm Guide
          </h4>
        </div>
        <span
          className={`px-3 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest font-mono ${getCycleBadgeStyles()}`}
        >
          🌸 {cyclePhase}
        </span>
      </div>

      <p className="text-xs text-ink/90 leading-relaxed font-sans">
        {getPhaseDescription()}
      </p>

      <div className="bg-void p-3.5 rounded-[12px] border border-outline-variant/30 space-y-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-ghost">Phase Progress (Day {cycleDay} of {cycleLength})</span>
          <span className="text-ink font-medium">{percent}%</span>
        </div>
        <div className="h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-bloom to-petal transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
