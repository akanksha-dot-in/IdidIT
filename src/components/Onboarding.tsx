import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Calendar, Moon, Sun, Clock } from "lucide-react";
import { OnboardingState, Chronotype } from "../types";

interface OnboardingProps {
  onComplete: (state: OnboardingState) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [chronotype, setChronotype] = useState<Chronotype>("morning");
  const [periodStartDate, setPeriodStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split("T")[0];
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [resolution, setResolution] = useState("");
  const [planningTime, setPlanningTime] = useState("21:00");
  const [calendarConnected, setCalendarConnected] = useState(false);

  const nextStep = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      onComplete({
        completed: true,
        name: name.trim() || "love",
        chronotype,
        periodStartDate,
        cycleLength,
        resolution: resolution.trim() || "Being gentle with myself",
        planningTime,
      });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-void text-ink flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background grain and ambient highlights */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-bloom/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-dusk/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Elegant wordmark header */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="text-2xl font-extrabold tracking-[-0.03em] text-ink font-display">IdidIT</span>
        <span className="text-[9px] font-mono font-bold bg-bloom/10 text-petal border border-bloom/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
          v4.0
        </span>
      </div>

      <div className="w-full max-w-lg bg-surface border border-outline-variant/60 rounded-[20px] p-8 md:p-10 shadow-2xl relative">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-outline-variant/20 rounded-t-[20px] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-bloom to-petal transition-all duration-500"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">01 / Welcome</span>
                <h1 className="text-2xl font-bold tracking-tight text-ink font-display">
                  What's your name, love?
                </h1>
                <p className="text-xs text-ghost leading-relaxed">
                  I'm Ida, your biological pacing bestie. How should I address you?
                </p>
              </div>

              <input
                id="onboarding-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && name.trim() && nextStep()}
                className="w-full bg-void border border-outline-variant/60 rounded-xl px-4 py-3.5 text-base text-ink placeholder-muted focus:outline-none focus:border-bloom transition font-sans"
              />

              <button
                id="step1-next-btn"
                onClick={nextStep}
                disabled={!name.trim()}
                className="w-full bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01] text-[10px] shadow-lg hover:shadow-bloom/10"
              >
                Let's begin <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">02 / Biological Rhythm</span>
                <h1 className="text-2xl font-bold tracking-tight text-ink font-display">
                  Are you a morning owl or a night owl?
                </h1>
                <p className="text-xs text-ghost leading-relaxed">
                  We will map deep focus intervals to your peak biological hours.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  id="morning-person-btn"
                  type="button"
                  onClick={() => setChronotype("morning")}
                  className={`p-5 rounded-xl border text-left flex flex-col justify-between h-36 transition-all duration-300 ${
                    chronotype === "morning"
                      ? "bg-bloom/5 border-bloom text-ink"
                      : "bg-void border-outline-variant/40 text-ghost hover:border-ghost/50"
                  }`}
                >
                  <Sun size={24} className={chronotype === "morning" ? "text-petal" : "text-muted"} />
                  <div>
                    <div className="font-bold text-sm text-ink">Morning Owl</div>
                    <div className="text-[11px] text-ghost mt-0.5 font-mono">Peak: 6 AM – 10 AM</div>
                  </div>
                </button>

                <button
                  id="night-owl-btn"
                  type="button"
                  onClick={() => setChronotype("night")}
                  className={`p-5 rounded-xl border text-left flex flex-col justify-between h-36 transition-all duration-300 ${
                    chronotype === "night"
                      ? "bg-dusk/5 border-dusk text-ink"
                      : "bg-void border-outline-variant/40 text-ghost hover:border-ghost/50"
                  }`}
                >
                  <Moon size={24} className={chronotype === "night" ? "text-dusk" : "text-muted"} />
                  <div>
                    <div className="font-bold text-sm text-ink">Night Owl</div>
                    <div className="text-[11px] text-ghost mt-0.5 font-mono">Peak: 9 PM – 1 AM</div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  id="step2-prev-btn"
                  onClick={prevStep}
                  className="px-5 py-3.5 rounded-xl border border-outline-variant/60 text-ghost hover:text-ink hover:bg-void/40 transition text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="step2-next-btn"
                  onClick={nextStep}
                  className="flex-1 bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-[10px] shadow-lg hover:shadow-bloom/10"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">03 / Cycle Alignment</span>
                <h1 className="text-2xl font-bold tracking-tight text-ink font-display">
                  When did your last period start?
                </h1>
                <p className="text-xs text-ghost leading-relaxed">
                  Customizes workload recommendations to your current cycle phase.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-muted" size={16} />
                  <input
                    id="period-date-input"
                    type="date"
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    className="w-full bg-void border border-outline-variant/60 rounded-xl pl-12 pr-4 py-3.5 text-ink focus:outline-none focus:border-bloom transition text-xs font-sans"
                  />
                </div>

                <div className="flex items-center justify-between bg-void border border-outline-variant/40 px-4 py-3 rounded-xl">
                  <span className="text-xs text-ghost">Typical Cycle Length</span>
                  <div className="flex items-center gap-2">
                    <input
                      id="cycle-length-input"
                      type="number"
                      value={cycleLength}
                      onChange={(e) => setCycleLength(Math.max(20, parseInt(e.target.value) || 28))}
                      className="w-14 bg-surface border border-outline-variant/60 rounded-lg text-center py-1 text-ink text-xs focus:outline-none font-mono"
                    />
                    <span className="text-xs text-ghost">days</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  id="step3-prev-btn"
                  onClick={prevStep}
                  className="px-5 py-3.5 rounded-xl border border-outline-variant/60 text-ghost hover:text-ink hover:bg-void/40 transition text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="step3-next-btn"
                  onClick={nextStep}
                  className="flex-1 bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-[10px] shadow-lg hover:shadow-bloom/10"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">04 / Long-Term Focus</span>
                <h1 className="text-2xl font-bold tracking-tight text-ink font-display">
                  What is one thing you want to cultivate?
                </h1>
                <p className="text-xs text-ghost leading-relaxed">
                  Primary resolution tracking. No shame penalties.
                </p>
              </div>

              <input
                id="onboarding-resolution-input"
                type="text"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="e.g. Reading mindfully, Morning hydration, Yoga stretching..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && resolution.trim() && nextStep()}
                className="w-full bg-void border border-outline-variant/60 rounded-xl px-4 py-3.5 text-base text-ink placeholder-muted focus:outline-none focus:border-bloom transition font-sans"
              />

              <div className="flex gap-3">
                <button
                  id="step4-prev-btn"
                  onClick={prevStep}
                  className="px-5 py-3.5 rounded-xl border border-outline-variant/60 text-ghost hover:text-ink hover:bg-void/40 transition text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="step4-next-btn"
                  onClick={nextStep}
                  disabled={!resolution.trim()}
                  className="flex-1 bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed text-[10px] shadow-lg hover:shadow-bloom/10"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">05 / Daily Planning</span>
                <h1 className="text-2xl font-bold tracking-tight text-ink font-display">
                  Let's time our evening lock
                </h1>
                <p className="text-xs text-ghost leading-relaxed">
                  Clear your brain each evening to protect your peace of mind.
                </p>
              </div>

              <div className="flex items-center justify-between bg-void border border-outline-variant/40 px-4 py-3.5 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Clock className="text-bloom" size={16} />
                  <span className="text-xs text-ghost">Set planning alert:</span>
                </div>
                <input
                  id="planning-time-picker"
                  type="time"
                  value={planningTime}
                  onChange={(e) => setPlanningTime(e.target.value)}
                  className="bg-surface border border-outline-variant/60 rounded-lg text-ink px-3 py-1 text-xs focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  id="step5-prev-btn"
                  onClick={prevStep}
                  className="px-5 py-3.5 rounded-xl border border-outline-variant/60 text-ghost hover:text-ink hover:bg-void/40 transition text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="step5-next-btn"
                  onClick={nextStep}
                  className="flex-1 bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-[10px] shadow-lg hover:shadow-bloom/10"
                >
                  Set Ritual <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">06 / Final Steps</span>
                <h1 className="text-2xl font-bold tracking-tight text-ink font-display">
                  Connect local schedules?
                </h1>
                <p className="text-xs text-ghost leading-relaxed">
                  Scan local calendars to coordinate focus slots seamlessly.
                </p>
              </div>

              <div className="p-4 bg-void rounded-xl border border-outline-variant/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-ink">Local Integration</span>
                  <span className="text-[9px] font-mono font-bold bg-growth/15 text-growth px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-ghost leading-relaxed">
                  Private and local-only. No logins or accounts required.
                </p>
                <button
                  id="connect-calendar-btn"
                  type="button"
                  onClick={() => setCalendarConnected(!calendarConnected)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all ${
                    calendarConnected
                      ? "bg-growth text-ink"
                      : "bg-surface text-ghost hover:text-ink hover:bg-surface-variant/40 border border-outline-variant/40"
                  }`}
                >
                  {calendarConnected ? "✓ Calendar Connected" : "Connect Local Calendar"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  id="step6-prev-btn"
                  onClick={prevStep}
                  className="px-5 py-3.5 rounded-xl border border-outline-variant/60 text-ghost hover:text-ink hover:bg-void/40 transition text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="complete-onboarding-btn"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-bloom to-petal hover:opacity-95 text-ink font-mono font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition hover:scale-[1.01] text-[10px] shadow-lg hover:shadow-bloom/15"
                >
                  Enter IdidIT <Sparkles size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
