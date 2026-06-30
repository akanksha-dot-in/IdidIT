import React from "react";
import { TrendingUp } from "lucide-react";
import { ResolutionHabit } from "../types";

interface ResolutionWidgetProps {
  resolutions: ResolutionHabit[];
}

export default function ResolutionWidget({ resolutions }: ResolutionWidgetProps) {
  return (
    <div className="bg-surface border border-outline-variant/60 rounded-[16px] p-5 space-y-4 hover:border-bloom/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-dusk" />
          <h4 className="text-[11px] font-mono uppercase tracking-widest text-ghost font-medium">
            Resolution Levels
          </h4>
        </div>
        <span className="text-[9px] font-mono text-dusk bg-dusk/10 border border-dusk/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-semibold">
          Daily Cultivation
        </span>
      </div>

      <div className="space-y-3">
        {resolutions.map((res) => (
          <div key={res.id} className="bg-void border border-outline-variant/30 p-3 rounded-[12px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink font-medium truncate max-w-[170px]">{res.name}</span>
              <span className="text-petal font-mono text-xs font-bold">
                Lvl {res.level}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-dusk to-petal transition-all duration-500"
                  style={{ width: `${res.xp}%` }}
                />
              </div>
              <span className="text-[10px] text-ghost font-mono w-10 text-right">
                {res.xp}% XP
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-ghost leading-relaxed italic font-sans">
        * No shame penalty: Missing a day doesn't reset your hard-earned levels. Keep moving non-linearly.
      </p>
    </div>
  );
}
