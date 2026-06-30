import React from "react";
import { Flame } from "lucide-react";
import { BucketType, TaskIntention, LogEntry } from "../types";

interface MetricCircleProps {
  lifeScore: number;
  streakCount: number;
  cyclePhase: string;
  intentions: TaskIntention[];
  logs: LogEntry[];
}

export default function MetricCircle({
  lifeScore,
  streakCount,
  cyclePhase,
  intentions,
  logs
}: MetricCircleProps) {
  // Compute category counts
  const getCount = (bucket: BucketType) => {
    const taskCount = intentions.filter((t) => t.type === bucket).length;
    const logCount = logs.filter((l) => l.bucket === bucket).length;
    return taskCount + logCount;
  };

  const buckets = [
    { name: "Work" as BucketType, color: "bg-bloom", activeColor: "#B5477A" },
    { name: "People" as BucketType, color: "bg-thrive", activeColor: "#5DCAA5" },
    { name: "Joy" as BucketType, color: "bg-warmth", activeColor: "#EF9F27" },
    { name: "Self" as BucketType, color: "bg-growth", activeColor: "#7D9B3A" },
    { name: "Growth" as BucketType, color: "bg-dusk", activeColor: "#AFA9EC" }
  ];

  const strokeDash = 2 * Math.PI * 48;
  const strokeOffset = strokeDash * (1 - lifeScore / 100);

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-[16px] p-6 relative overflow-hidden transition-all duration-300 hover:border-bloom/50">
      {/* Subtle background radial light for depth */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(var(--color-bloom) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="text-[11px] font-mono uppercase tracking-widest text-ghost font-medium">
          Life Score Resonance
        </h3>
        <span className="flex items-center gap-1 text-[11px] font-mono text-petal bg-bloom/10 px-2.5 py-0.5 rounded-full font-semibold border border-bloom/20">
          <Flame size={12} className="animate-pulse text-bloom" /> {streakCount} Days Streak
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        {/* SVG Circle Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="rgba(240, 237, 248, 0.03)"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="url(#bloomGradient)"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={strokeDash}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="bloomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B5477A" />
                <stop offset="100%" stopColor="#E8779A" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center z-10">
            <span className="text-4xl font-extrabold tracking-tight text-ink font-display">
              {lifeScore}
            </span>
            <span className="text-[10px] text-ghost block font-mono">/100</span>
          </div>
        </div>

        {/* Short info block */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <p className="text-xs text-ghost leading-relaxed font-sans">
            Your balanced bio-rhythm representation score across Work, Connections, Joy, Self Care, and Growth.
          </p>
          {cyclePhase === "menstrual" && (
            <div className="inline-block text-[10px] bg-warmth/10 border border-warmth/20 text-warmth px-2.5 py-0.5 rounded-md font-mono uppercase tracking-wide">
              ✨ +15 Warrior bonus applied
            </div>
          )}
        </div>
      </div>

      {/* Categories summary progress bars */}
      <div className="grid grid-cols-5 gap-1.5 mt-6 pt-5 border-t border-outline-variant/40 relative z-10">
        {buckets.map((b) => {
          const count = getCount(b.name);
          const percent = Math.min(100, count * 25);
          
          const getLabel = (type: BucketType, c: number) => {
            switch (type) {
              case "Work":
                return c === 1 ? "1 Task" : `${c} Tasks`;
              case "People":
                return c === 1 ? "1 Connection" : `${c} Conns`;
              case "Joy":
                return c === 1 ? "1 Activity" : `${c} Acts`;
              case "Self":
                return c === 1 ? "1 Ritual" : `${c} Rituals`;
              case "Growth":
                return c === 1 ? "1 Lesson" : `${c} Lessons`;
              default:
                return `${c}`;
            }
          };

          return (
            <div key={b.name} className="text-center space-y-1.5">
              <span className="text-[9px] text-ghost block truncate font-mono uppercase tracking-tight">
                {b.name}
              </span>
              <div className="h-1 bg-void rounded-full overflow-hidden">
                <div
                  className={`h-full ${b.color} transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-ink block font-bold leading-none bg-void/50 py-0.5 px-1 rounded truncate">
                {getLabel(b.name, count)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
