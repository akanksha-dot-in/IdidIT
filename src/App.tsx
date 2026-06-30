import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Video,
  VideoOff,
  LogOut,
  TrendingUp,
  Brain,
  Compass,
  Youtube,
  Send,
  Plus,
  Trash2,
  RefreshCw,
  Activity,
  Flame,
  ChevronRight,
  Home,
  Calendar,
  FileText,
  FileAudio,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import Onboarding from "./components/Onboarding";
import RescueBanner from "./components/RescueBanner";
import MetricCircle from "./components/MetricCircle";
import CycleSyncWidget from "./components/CycleSyncWidget";
import ResolutionWidget from "./components/ResolutionWidget";
import {
  BucketType,
  Chronotype,
  CyclePhase,
  OnboardingState,
  TaskIntention,
  LogEntry,
  ResolutionHabit,
  ReframeData
} from "./types";

export default function App() {
  // --- STATE ---
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem("ididit_onboarding");
    if (saved) return JSON.parse(saved);
    return {
      completed: false,
      name: "",
      chronotype: "morning",
      periodStartDate: new Date(Date.now() - 9 * 86400000).toISOString().split("T")[0],
      cycleLength: 28,
      resolution: "Cultivating inner peace",
      planningTime: "21:00"
    };
  });

  // Intentions
  const [intentions, setIntentions] = useState<TaskIntention[]>(() => {
    const saved = localStorage.getItem("ididit_intentions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "task-1",
        text: "Submit dynamic project outline",
        type: "Work",
        completed: false,
        deadline: "Today, 4:00 PM",
        priority: "high",
        energyMatch: "Peak energy block",
        createdAt: new Date().toISOString()
      },
      {
        id: "task-2",
        text: "Give Ma a call & check in on her garden",
        type: "People",
        completed: true,
        priority: "medium",
        createdAt: new Date().toISOString()
      },
      {
        id: "task-3",
        text: "Read 15 pages of mindset literature",
        type: "Growth",
        completed: false,
        priority: "low",
        createdAt: new Date().toISOString()
      },
      {
        id: "task-4",
        text: "Stretch for 10 minutes",
        type: "Self",
        completed: true,
        priority: "low",
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Daily logged activities
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem("ididit_logs");
    if (saved) return JSON.parse(saved);
    return [
      { id: "log-1", text: "Finished the design drafts on time", bucket: "Work", timestamp: "2:40 PM", date: new Date().toISOString().split("T")[0] },
      { id: "log-2", text: "Called Ma and talked about garden plans", bucket: "People", timestamp: "5:30 PM", date: new Date().toISOString().split("T")[0] },
      { id: "log-3", text: "Laughed with roomie over funny sketch videos", bucket: "Joy", timestamp: "9:00 PM", date: new Date().toISOString().split("T")[0] }
    ];
  });

  // Resolution Levels
  const [resolutions, setResolutions] = useState<ResolutionHabit[]>(() => {
    const saved = localStorage.getItem("ididit_resolutions");
    if (saved) return JSON.parse(saved);
    return [
      { id: "res-1", name: onboarding.resolution || "Cultivating inner peace", level: 2, xp: 45, completedDates: [] },
      { id: "res-2", name: "Daily Skincare Sync", level: 1, xp: 70, completedDates: [] },
      { id: "res-3", name: "Joyful Movement / Stretch", level: 3, xp: 12, completedDates: [] }
    ];
  });

  // Active Tab: "dashboard" | "chat" | "ritual" | "balance" | "reframe" | "youtube"
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isIntentionsDrawerOpen, setIsIntentionsDrawerOpen] = useState(false);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);
  const [isBioHudOpen, setIsBioHudOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // AI Chat states
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ida"; text: string; mode?: "companion" | "assist" }>>([
    {
      role: "ida",
      text: `Hey love! I'm Ida, your biological planning bestie. How is your energy level today? Let's take things one step at a time. Remember, rest is a beautiful part of productivity.`,
      mode: "companion"
    }
  ]);
  const [chatMode, setChatMode] = useState<"companion" | "assist">("companion");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Focus mode camera simulation
  const [focusSessionActive, setFocusSessionActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500); // 25 minutes
  const [focusTimerRun, setFocusTimerRun] = useState(false);
  const [focusLogs, setFocusLogs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // EOD Free logging input
  const [freeLogText, setFreeLogText] = useState("");
  const [isClassifyingLog, setIsClassifyingLog] = useState(false);

  // Planning Ritual state
  const [ritualStep, setRitualStep] = useState(1); // 1 to 4
  const [ritualBrainDump, setRitualBrainDump] = useState("");
  const [ritualRocks, setRitualRocks] = useState<string[]>(["", "", ""]);
  const [isRitualCompleted, setIsRitualCompleted] = useState(false);

  // Reframe engine states
  const [selfCriticism, setSelfCriticism] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [activeReframe, setActiveReframe] = useState<ReframeData | null>(null);
  const [isReframing, setIsReframing] = useState(false);

  // YouTube engine state
  const [youtubeInput, setYoutubeInput] = useState("");
  const [ytResult, setYtResult] = useState<{
    insight: string;
    suggestedAction: string;
    actionType: string;
    taskTitle: string;
    bucket: BucketType;
  } | null>(null);
  const [isYtAnalyzing, setIsYtAnalyzing] = useState(false);

  // Cycle phase computed
  const [cycleDay, setCycleDay] = useState(10);
  const [cyclePhase, setCyclePhase] = useState<CyclePhase>("follicular");

  // Notifications simulation queue
  const [customNotification, setCustomNotification] = useState<string | null>(null);

  // Calculate stats
  const [streakCount, setStreakCount] = useState(7);
  const [lifeScore, setLifeScore] = useState(72);

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    localStorage.setItem("ididit_intentions", JSON.stringify(intentions));
  }, [intentions]);

  useEffect(() => {
    localStorage.setItem("ididit_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("ididit_resolutions", JSON.stringify(resolutions));
  }, [resolutions]);

  useEffect(() => {
    if (onboarding.completed) {
      localStorage.setItem("ididit_onboarding", JSON.stringify(onboarding));
    }
  }, [onboarding]);

  // Compute Cycle Phase dynamically
  useEffect(() => {
    if (!onboarding.periodStartDate) return;
    const start = new Date(onboarding.periodStartDate);
    const today = new Date();
    const diffMs = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const dayOfCycle = (diffDays % (onboarding.cycleLength || 28)) + 1;
    setCycleDay(dayOfCycle);

    if (dayOfCycle <= 5) {
      setCyclePhase("menstrual");
    } else if (dayOfCycle <= 13) {
      setCyclePhase("follicular");
    } else if (dayOfCycle <= 16) {
      setCyclePhase("ovulation");
    } else {
      setCyclePhase("luteal");
    }
  }, [onboarding.periodStartDate, onboarding.cycleLength]);

  // Live Focus countdown timer
  useEffect(() => {
    let interval: any = null;
    if (focusTimerRun && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0 && focusTimerRun) {
      setFocusTimerRun(false);
      handleFocusSessionComplete();
    }
    return () => clearInterval(interval);
  }, [focusTimerRun, focusTimeLeft]);

  // Recalculate daily Life Score
  useEffect(() => {
    const completedCount = intentions.filter((t) => t.completed).length;
    const totalCount = intentions.length || 1;
    const intentionRatio = completedCount / totalCount;

    const logWeight = Math.min(100, logs.length * 20);
    let calculated = Math.round(intentionRatio * 50 + logWeight * 0.5);

    if (cyclePhase === "menstrual") {
      calculated = Math.min(100, calculated + 15);
    }

    setLifeScore(Math.max(12, Math.min(100, calculated)));
  }, [intentions, logs, cyclePhase]);

  // Smart Context-Aware Notifications simulation
  useEffect(() => {
    const notifyTimer = setTimeout(() => {
      if (cyclePhase === "menstrual") {
        setCustomNotification("Resting today IS the task, love. Warrior double XP is active! ✨");
      } else if (cyclePhase === "follicular") {
        setCustomNotification("You're in your rising energy window! Perfect week to initiate big ideas. 🌸");
      } else {
        setCustomNotification("Your brain is in beautiful detail mode. Ready to organize? 📝");
      }
    }, 4000);
    return () => clearTimeout(notifyTimer);
  }, [cyclePhase]);

  // --- HANDLERS ---

  const handleOnboardingComplete = (data: OnboardingState) => {
    setOnboarding(data);
    setResolutions((prev) =>
      prev.map((r, i) => (i === 0 ? { ...r, name: data.resolution } : r))
    );
  };

  const [newIntText, setNewIntText] = useState("");
  const [newIntType, setNewIntType] = useState<BucketType>("Work");
  const [newIntPriority, setNewIntPriority] = useState<"high" | "medium" | "low">("medium");

  const handleAddIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntText.trim()) return;

    const task: TaskIntention = {
      id: "user-task-" + Date.now(),
      text: newIntText.trim(),
      type: newIntType,
      completed: false,
      priority: newIntPriority,
      createdAt: new Date().toISOString()
    };

    setIntentions((prev) => [task, ...prev]);
    setNewIntText("");
    setCustomNotification(`Added intention: "${task.text}"! Let's handle it together.`);
  };

  const toggleIntention = (id: string) => {
    setIntentions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            rewardResolutionXP(t.type);
            setCustomNotification(`Look at you go! Completed task: "${t.text}". So proud! 💖`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const deleteIntention = (id: string) => {
    setIntentions((prev) => prev.filter((t) => t.id !== id));
  };

  const rewardResolutionXP = (bucket: BucketType) => {
    setResolutions((prev) =>
      prev.map((r) => {
        let xpGained = cyclePhase === "menstrual" ? 20 : 10;
        let nextXp = r.xp + xpGained;
        let nextLevel = r.level;
        if (nextXp >= 100) {
          nextXp = nextXp - 100;
          nextLevel = Math.min(5, r.level + 1);
          setCustomNotification(`LEVEL UP! Your resolution '${r.name}' is now Level ${nextLevel}! 🎉`);
        }
        return { ...r, xp: nextXp, level: nextLevel };
      })
    );
  };

  const handleFreeLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeLogText.trim()) return;

    setIsClassifyingLog(true);
    try {
      const res = await fetch("/api/classify-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: freeLogText.trim() })
      });
      const data = await res.json();
      if (data.entries && data.entries.length > 0) {
        const newLogs: LogEntry[] = data.entries.map((ent: any, i: number) => ({
          id: `classification-${Date.now()}-${i}`,
          text: ent.text,
          bucket: ent.bucket,
          timestamp: ent.inferredTime || "Evening",
          date: new Date().toISOString().split("T")[0]
        }));

        setLogs((prev) => [...prev, ...newLogs]);
        newLogs.forEach((l) => rewardResolutionXP(l.bucket));
        setFreeLogText("");
        setCustomNotification(`Logged ${newLogs.length} action(s) categorized automatically!`);
      }
    } catch (err) {
      console.error(err);
      const fallbackEntry: LogEntry = {
        id: `log-fallback-${Date.now()}`,
        text: freeLogText.trim(),
        bucket: "Self",
        timestamp: "Just now",
        date: new Date().toISOString().split("T")[0]
      };
      setLogs((prev) => [...prev, fallbackEntry]);
      setFreeLogText("");
    } finally {
      setIsClassifyingLog(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: chatHistory,
          cyclePhase: cyclePhase,
          onboardingState: onboarding,
          recentLogs: logs,
          recentTasks: intentions
        })
      });
      const data = await res.json();
      if (data.text) {
        setChatHistory((prev) => [
          ...prev,
          { role: "ida", text: data.text, mode: data.mode }
        ]);
        setChatMode(data.mode || "companion");

        if (data.extractedTasks && data.extractedTasks.length > 0) {
          data.extractedTasks.forEach((t: any) => {
            const newTask: TaskIntention = {
              id: "extracted-task-" + Date.now() + Math.random().toString(36).substr(2, 5),
              text: t.text,
              type: t.type || "Rescue",
              completed: false,
              deadline: t.deadline || "Soon",
              priority: t.priority || "medium",
              energyMatch: "Ida suggestion",
              createdAt: new Date().toISOString()
            };
            setIntentions((prev) => [newTask, ...prev]);
          });
          setCustomNotification(`Ida scheduled ${data.extractedTasks.length} task(s) on your dashboard!`);
        }
      }
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ida",
          text: "I'm right here with you, love. Let's make a cup of warm tea, take a breath, and focus on one tiny step. ❤️",
          mode: "companion"
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleToggleFocusSession = async () => {
    if (!focusSessionActive) {
      setFocusSessionActive(true);
      setFocusTimeLeft(1500);
      setFocusTimerRun(true);
      setFocusLogs(["Focus session initiated"]);

      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn("Camera permission not granted:", err);
        setCameraError("Camera unavailable. Operating in focus countdown mode.");
      }
    } else {
      stopFocusStream();
      setFocusSessionActive(false);
      setFocusTimerRun(false);
    }
  };

  const stopFocusStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleFocusSessionComplete = () => {
    stopFocusStream();
    setFocusSessionActive(false);
    rewardResolutionXP("Self");

    const focusLogItem: LogEntry = {
      id: "focus-log-" + Date.now(),
      text: "Completed deep focus session (25 mins) successfully",
      bucket: "Self",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0]
    };
    setLogs((prev) => [...prev, focusLogItem]);
    setCustomNotification("Deep focus session completed! You earned double XP and a Self reward point. ⏱️");
  };

  const handleNextRitualStep = () => {
    if (ritualStep < 4) {
      setRitualStep(ritualStep + 1);
    } else {
      const newRocks = ritualRocks.filter((r) => r.trim() !== "");
      newRocks.forEach((rockText, i) => {
        const priorityLevel: "high" | "medium" | "low" = i === 0 ? "high" : i === 1 ? "medium" : "low";
        const task: TaskIntention = {
          id: `ritual-rock-${Date.now()}-${i}`,
          text: rockText,
          type: "Work",
          completed: false,
          deadline: "Tomorrow",
          priority: priorityLevel,
          energyMatch: onboarding.chronotype === "morning" ? "Peak 6:00 AM - 10:00 AM" : "Peak 9:00 PM - 1:00 AM",
          createdAt: new Date().toISOString()
        };
        setIntentions((prev) => [task, ...prev]);
      });

      setIsRitualCompleted(true);
      setRitualStep(1);
      setRitualBrainDump("");
      setRitualRocks(["", "", ""]);
      setActiveTab("dashboard");
      setCustomNotification("Ritual locked! Tomorrow is scheduled safely. Rest now. 🌟");
    }
  };

  const handleReframeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfCriticism.trim()) return;

    setIsReframing(true);
    try {
      const res = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: userRating,
          badDayText: selfCriticism.trim(),
          recentLogs: logs
        })
      });
      const data = await res.json();
      if (data.reframeSentence) {
        setActiveReframe(data);
      }
    } catch (err) {
      console.error(err);
      setActiveReframe({
        whatSheSaid: selfCriticism.trim(),
        whatActuallyHappened: logs.map((l) => l.text).join(" and "),
        reframeSentence: `Hey love, I'm gently pushing back on that. You rested when your body needed it, checked in with your loved ones, and completed core tasks. That is a rich, beautifully spent day.`,
        correctedScore: 84
      });
    } finally {
      setIsReframing(false);
    }
  };

  const handleYtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeInput.trim()) return;

    setIsYtAnalyzing(true);
    try {
      const res = await fetch("/api/youtube-inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: youtubeInput.trim() })
      });
      const data = await res.json();
      if (data.insight) {
        setYtResult(data);
      }
    } catch (err) {
      console.error(err);
      setYtResult({
        insight: "Time-blocking is a commitment to yourself, not a rigid prison.",
        suggestedAction: "Create a 25-minute deep focus block to execute with high flow.",
        actionType: "habit",
        taskTitle: "25m Deep Focus block",
        bucket: "Growth"
      });
    } finally {
      setIsYtAnalyzing(false);
    }
  };

  const handleApplyYtAction = () => {
    if (!ytResult) return;
    const task: TaskIntention = {
      id: "yt-inspired-" + Date.now(),
      text: ytResult.taskTitle,
      type: ytResult.bucket || "Growth",
      completed: false,
      priority: "medium",
      energyMatch: "Inspiration block",
      createdAt: new Date().toISOString()
    };
    setIntentions((prev) => [task, ...prev]);
    setYtResult(null);
    setYoutubeInput("");
    setCustomNotification("YouTube insight converted to a trackable intention! 🎥");
  };

  const urgentRescueTask = intentions.find((t) => !t.completed && t.priority === "high") || null;

  const handleResetApp = () => {
    if (confirm("Reset application data back to default settings?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

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

  if (!onboarding.completed) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black text-ink font-sans selection:bg-bloom/30 select-none pb-24 relative overflow-x-hidden">
      {/* Decorative Orbs & Grid */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-bloom/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-dusk/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(var(--color-outline-variant) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Floating System Notification */}
      <AnimatePresence>
        {customNotification && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-4 right-4 z-50 max-w-sm mx-auto"
          >
            <div className="bg-surface/95 border border-outline-variant/60 shadow-2xl rounded-[16px] p-4 flex items-start justify-between gap-3 backdrop-blur-md">
              <div className="flex gap-2.5">
                <span className="text-base text-petal">🌸</span>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-petal font-bold">Ida says:</p>
                  <p className="text-xs text-ink/90 mt-0.5 leading-relaxed font-sans font-medium">{customNotification}</p>
                </div>
              </div>
              <button
                id="close-custom-notification"
                onClick={() => setCustomNotification(null)}
                className="text-ghost hover:text-ink text-xs px-1.5 py-0.5 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Header */}
      <header className="border-b border-white/5 bg-black/65 backdrop-blur-md sticky top-0 z-40 py-1.5 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold tracking-tighter text-lg text-white">ididit</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-ghost/50 ml-1.5 border-l border-white/10 pl-2">
            JUNE 2026
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider font-mono transition ${getCycleBadgeStyles()}`}>
            🌸 {cyclePhase}
          </div>
          <div className="h-3.5 w-[1px] bg-white/10 hidden sm:block" />
          <button
            onClick={() => setIsIntentionsDrawerOpen(true)}
            className="border border-white/10 hover:border-bloom/50 bg-white/5 text-ink hover:text-white px-3 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles size={10} className="text-petal animate-pulse" />
            {intentions.length === 0 ? "Add Intentions" : `Workspace (${intentions.length})`}
          </button>
          <div className="h-3.5 w-[1px] bg-white/10" />
          {showResetConfirm ? (
            <div className="flex items-center gap-1.5 animate-fade-in bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="bg-petal text-black px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-black tracking-widest hover:bg-petal/95 hover:scale-[1.03] active:scale-[0.97] transition cursor-pointer"
              >
                Reset!
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-ghost hover:text-white text-[8px] font-mono uppercase px-1 py-0.5 hover:bg-white/5 rounded transition cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              id="reset-app-header-btn"
              onClick={() => setShowResetConfirm(true)}
              title="Reset Application Settings"
              className="p-1 text-ghost hover:text-white rounded-md hover:bg-white/5 transition cursor-pointer"
            >
              <LogOut size={12} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mt-4 pb-36">
        
        {/* Dynamic Workspace */}
        <section className="space-y-6">
          
          {/* HUD Mini-Bar: Visible on all viewports when not in dashboard */}
          {activeTab !== "dashboard" && (
            <div className="bg-[#111115]/90 backdrop-blur-md border border-[#202028] rounded-[16px] p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-bloom/10 flex items-center justify-center text-bloom shrink-0">
                  <Activity size={14} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-ghost/70 block font-bold">Organic Indicators</span>
                  <p className="text-xs text-ink/90 font-medium truncate mt-0.5">
                    Life Score: <span className="text-white font-black">{lifeScore}</span> • Phase: <span className="text-petal font-bold uppercase text-[10px]">{cyclePhase}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBioHudOpen(true)}
                className="bg-white hover:bg-neutral-100 text-black font-mono uppercase text-[9px] tracking-widest font-black py-1.5 px-3.5 rounded-full shadow-md active:scale-95 transition cursor-pointer shrink-0"
              >
                HUD
              </button>
            </div>
          )}
          
          {/* Rescue Trigger Banner (Hidden on Home Dashboard as we place it inside the home view directly) */}
          {activeTab !== "dashboard" && (
            <div>
              <AnimatePresence>
                {urgentRescueTask && (
                  <RescueBanner
                    urgentTask={urgentRescueTask}
                    onActivateRescue={() => {
                      setActiveTab("chat");
                      setChatMode("assist");
                      setChatHistory((prev) => [
                        ...prev,
                        {
                          role: "ida",
                          text: "switching to Action Mode. Let's get you fully sorted. I see you have a high-priority task waiting. What is the biggest roadblock preventing you from starting right now?",
                          mode: "assist"
                        }
                      ]);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Clean Segmented Tab Navigation - Floating Capsule centered */}
          <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
            <div className="bg-[#0f0e13]/90 backdrop-blur-xl border border-white/10 rounded-[32px] px-8 py-3 pointer-events-auto shadow-2xl flex items-center justify-center gap-6 sm:gap-8 md:gap-12">
              {[
                { id: "dashboard", label: "Home", icon: Home },
                { id: "ritual", label: "Plan", icon: Compass },
                { id: "chat", label: "Ida", icon: Sparkles },
                { id: "reframe", label: "Shift", icon: Brain },
                { id: "youtube", label: "Sync", icon: Youtube },
                { id: "balance", label: "Score", icon: Activity }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-col items-center group cursor-pointer transition-colors ${
                      isActive ? "text-white" : "text-ghost hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-[3px] w-5 bg-bloom rounded-full" />
                    )}
                    <IconComponent
                      size={18}
                      className={`transition-colors ${
                        isActive ? "text-bloom" : "text-ghost group-hover:text-white"
                      }`}
                    />
                    <span className="text-[8px] font-mono uppercase tracking-widest mt-1 font-bold">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Screen */}
          <div className={`${
            activeTab === "dashboard" 
              ? "bg-transparent border-none p-0 shadow-none overflow-visible min-h-0" 
              : "bg-[#111115] border border-[#202028] rounded-[24px] p-4 sm:p-6 md:p-8 pb-24 sm:pb-28 min-h-[440px] shadow-2xl"
          } relative overflow-hidden transition-all duration-300`}>
            
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-fade-in pb-16">
                
                {/* Primary Recommendation Guide (Next Action Focus) */}
                <div className="bg-[#111115]/80 border border-[#2e2a3d] rounded-[24px] p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-bloom/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-bloom/20 text-petal border border-bloom/30 text-[8px] font-mono font-black tracking-widest px-2 py-0.5 rounded-md uppercase">
                        Active Priority Focus
                      </span>
                      <span className="text-white text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-petal animate-ping shrink-0" />
                        DO THIS FIRST
                      </span>
                    </div>
                    <p className="text-xs text-ink/90 font-sans leading-relaxed">
                      You are in your <span className="text-petal font-black capitalize">{cyclePhase}</span> phase today. Biological energy suggests running a quick <span className="text-white font-bold">Planning Ritual</span> or mapping your day's core priorities.
                    </p>
                  </div>
                  <div className="flex gap-2 relative z-10 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab("ritual")}
                      className="flex-1 md:flex-none bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest text-[9px] py-2.5 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-bloom/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Planning Ritual <ArrowRight size={11} />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        setChatMode("coach");
                      }}
                      className="flex-1 md:flex-none bg-[#111115] hover:bg-[#1f1e26] border border-white/10 hover:border-bloom/50 text-white font-mono font-black uppercase tracking-widest text-[9px] py-2.5 px-4 rounded-xl transition duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Brain Dump
                    </button>
                  </div>
                </div>
                
                {/* Hero block: Huge typography on left, tilted card on right */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 flex flex-col justify-between h-full pt-2">
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-tighter leading-[1.0] text-white">
                      the day<br />you lived<br />is a<br />productive<br />day.
                    </h1>

                    {/* Overlapping circle matrix */}
                    <div className="flex items-center gap-1.5 mt-5">
                      <div className="flex -space-x-3">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-7.5 h-7.5 rounded-full border border-dusk/30 bg-transparent flex items-center justify-center"
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-ghost/85 ml-3 font-bold">
                        INTEGRITY MATRIX
                      </span>
                    </div>

                    {/* Primary Call to Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                      <button
                        id="home-cta-workspace"
                        onClick={() => setIsIntentionsDrawerOpen(true)}
                        className="bg-white hover:bg-neutral-100 text-black font-mono font-black uppercase tracking-widest text-[10px] py-3.5 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-white/5 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus size={12} className="stroke-[3]" />
                        Open Workspace
                      </button>
                      <button
                        id="home-cta-ritual"
                        onClick={() => setActiveTab("ritual")}
                        className="bg-[#111115] hover:bg-[#1f1e26] text-white border border-white/10 hover:border-bloom/50 font-mono font-black uppercase tracking-widest text-[10px] py-3.5 px-6 rounded-xl transition duration-300 shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Calendar size={12} />
                        Planning Ritual
                      </button>
                    </div>
                  </div>

                  {/* Life Score card */}
                  <div className="md:col-span-4 flex justify-end w-full">
                    <div className="tilted-hero bg-[#111115] border border-[#202028] rounded-[20px] p-5 w-full max-w-[280px] aspect-square flex flex-col justify-between shadow-xl relative overflow-hidden group">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ghost/80 font-bold">
                          LIFE SCORE
                        </span>
                        <TrendingUp size={14} className="text-dusk" />
                      </div>

                      <div className="my-auto text-center relative py-3">
                        <div className="text-white text-5xl sm:text-6xl font-black tracking-tight leading-none font-display">
                          {lifeScore}
                        </div>
                        <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-ghost/75 mt-1 font-bold">
                          PEAK RESONANCE
                        </div>
                        <div className="absolute right-4 bottom-0 w-2 h-2 rounded-full border border-dusk/60 bg-transparent" />
                      </div>

                      <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3">
                        <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-ghost/90 uppercase font-bold">
                          <span>RECOVERY 92%</span>
                          <span>FOCUS 81%</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("balance")}
                          className="w-full text-center py-1.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 rounded-lg text-[8px] font-mono uppercase tracking-widest text-petal font-black cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-1"
                        >
                          See Breakdown <TrendingUp size={8} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rescue Banner Section */}
                <div className="max-w-3xl mx-auto pt-1 w-full">
                  <AnimatePresence>
                    {urgentRescueTask && (
                      <div className="bg-[#1b0d0f] border-l-[3px] border-l-petal rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 overflow-hidden border border-[#2c1517]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-petal/10 flex items-center justify-center text-petal">
                            <Zap size={14} className="fill-current animate-pulse text-petal" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white uppercase tracking-wider font-display">
                                Rescue Mode Active
                              </span>
                              <span className="bg-petal/10 text-petal border border-petal/25 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded">
                                Detected via Calendar Sync
                              </span>
                            </div>
                            <p className="text-[11px] text-ghost/95 mt-0.5 font-medium leading-relaxed">
                              Project draft is due in 3h. I've restructured your afternoon.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("chat");
                            setChatMode("assist");
                            setChatHistory((prev) => [
                              ...prev,
                              {
                                role: "ida",
                                text: "switching to Action Mode. Let's get you fully sorted. I see you have a high-priority task waiting. What is the biggest roadblock preventing you from starting right now?",
                                mode: "assist"
                              }
                            ]);
                          }}
                          className="bg-[#291114] hover:bg-[#3d161b] text-petal border border-petal/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap self-end md:self-auto hover:scale-[1.02]"
                        >
                          Build My Plan <ChevronRight size={11} />
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quote block: Ida Intelligence */}
                <div className="space-y-1 py-3 border-t border-b border-white/5 max-w-4xl w-full">
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-petal font-bold block">
                    IDA INTELLIGENCE
                  </span>
                  <p className="text-base sm:text-lg md:text-xl text-ink font-light leading-relaxed tracking-wide italic font-display">
                    "Peak focus is at <span className="text-petal font-medium italic">10am</span>. Noise silenced. Act on intent."
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-ghost/60 uppercase tracking-widest pt-0.5 font-bold">
                    <span>DEEP WORK PROTOCOL ENGAGED</span>
                  </div>
                </div>

                {/* Bottom Grid: Biological Rhythm chart & The Vault card */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 w-full">
                  
                  {/* Biological Rhythm */}
                  <div className="md:col-span-7 bg-[#111115]/50 border border-[#202028] rounded-[24px] p-5 hover:border-white/10 transition-colors duration-300 relative overflow-hidden flex flex-col justify-between min-h-[210px]">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-white">
                        Biological Rhythm
                      </h3>
                      <TrendingUp size={14} className="text-ghost" />
                    </div>

                    <div className="relative w-full h-24 mt-2 flex items-center">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#25242d" strokeWidth="1" strokeDasharray="3 3" />
                        <path
                          d="M 0 90 Q 60 85 120 20 T 240 100 T 360 80 T 500 95"
                          fill="none"
                          stroke="url(#curve-grad)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="curve-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6E6A7C" />
                            <stop offset="25%" stopColor="#B5477A" />
                            <stop offset="50%" stopColor="#E8779A" />
                            <stop offset="75%" stopColor="#5DCAA5" />
                            <stop offset="100%" stopColor="#AFA9EC" />
                          </linearGradient>
                        </defs>
                        <circle cx="120" cy="20" r="4" fill="#E8779A" />
                        <circle cx="120" cy="20" r="8" fill="none" stroke="#E8779A" strokeWidth="1" className="animate-pulse" />
                      </svg>
                      <div className="absolute top-[8%] left-[21%] bg-[#251319] text-petal border border-petal/35 text-[8px] font-mono px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                        PEAK
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-ghost/80 mt-2.5 uppercase tracking-widest font-bold">
                      <span>06:00</span>
                      <span>10:00</span>
                      <span>14:00</span>
                      <span>18:00</span>
                      <span>22:00</span>
                    </div>
                  </div>

                  {/* The Vault */}
                  <div className="md:col-span-5 bg-[#111115]/50 border border-[#202028] rounded-[24px] p-5 hover:border-white/10 transition-colors duration-300 flex flex-col justify-between space-y-3">
                    <div className="space-y-0.5">
                      <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-white">
                        The Vault
                      </h3>
                      <span className="text-[9px] font-mono text-ghost/70 uppercase tracking-widest block font-bold">
                        2.4GB of wisdom preserved this week.
                      </span>
                    </div>

                    <div className="space-y-2 my-auto py-1">
                      <div className="flex items-center justify-between p-3 bg-white/[0.015] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-dusk" />
                          <span className="text-xs text-ink/90 font-medium font-sans">
                            Deep Work Protocol
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-ghost tracking-wider uppercase font-bold">
                          SAVED 2H AGO
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/[0.015] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileAudio size={14} className="text-thrive animate-pulse" />
                          <span className="text-xs text-ink/90 font-medium font-sans flex items-center gap-1.5">
                            Nature 432Hz
                            <span className="inline-flex gap-0.5 h-2 items-end">
                              <span className="w-0.5 h-2 bg-thrive animate-[bounce_0.8s_infinite]" />
                              <span className="w-0.5 h-1.5 bg-thrive animate-[bounce_0.6s_infinite_0.1s]" />
                              <span className="w-0.5 h-2.5 bg-thrive animate-[bounce_0.9s_infinite_0.2s]" />
                            </span>
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-thrive tracking-wider uppercase font-black animate-pulse">
                          PLAYING NOW
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsLogsDrawerOpen(true)}
                      className="w-full bg-[#16151b] hover:bg-[#1f1e26] border border-white/5 hover:border-white/10 text-white font-mono font-bold uppercase tracking-widest text-[9px] py-2.5 rounded-xl transition duration-300 cursor-pointer text-center"
                    >
                      Open Repository
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* 1. INTENTIONS & FOCUS CAM WORKSPACE DRAWER */}
            <AnimatePresence>
              {isIntentionsDrawerOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsIntentionsDrawerOpen(false)}
                    className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-md pointer-events-auto"
                  />
                  {/* Content Drawer */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0e0d12] border-l border-white/10 z-[120] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between pointer-events-auto"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                        <div>
                          <h2 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                            Intentions Workspace
                          </h2>
                          <p className="text-xs text-ghost mt-0.5">Commitment to biological pacing.</p>
                        </div>
                        <button
                          onClick={() => setIsIntentionsDrawerOpen(false)}
                          className="text-ghost hover:text-white text-base px-2 py-1 bg-white/5 rounded transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* ADD INTENTION FORM */}
                      <div className="space-y-4 mb-8">
                        <div>
                          <h3 className="text-xs font-mono uppercase tracking-wider text-petal font-bold">Add Intention</h3>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleAddIntention(e); }} className="space-y-3">
                          <input
                            id="intention-input-text"
                            type="text"
                            value={newIntText}
                            onChange={(e) => setNewIntText(e.target.value)}
                            placeholder="e.g. Prep project outlines, call Sis, skincare block..."
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-ink placeholder-ghost focus:outline-none focus:border-bloom transition font-sans"
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              id="intention-input-type"
                              value={newIntType}
                              onChange={(e) => setNewIntType(e.target.value as BucketType)}
                              className="bg-black border border-white/10 text-xs rounded-xl px-3 py-2.5 text-ink focus:outline-none focus:border-bloom cursor-pointer font-sans"
                            >
                              <option value="Work">Work</option>
                              <option value="People">People</option>
                              <option value="Joy">Joy</option>
                              <option value="Self">Self care</option>
                              <option value="Growth">Growth</option>
                              <option value="Rescue">Rescue</option>
                            </select>

                            <select
                              id="intention-input-priority"
                              value={newIntPriority}
                              onChange={(e) => setNewIntPriority(e.target.value as "high" | "medium" | "low")}
                              className="bg-black border border-white/10 text-xs rounded-xl px-3 py-2.5 text-ink focus:outline-none focus:border-bloom cursor-pointer font-sans"
                            >
                              <option value="high">🔥 High</option>
                              <option value="medium">⚡ Medium</option>
                              <option value="low">🌱 Low</option>
                            </select>
                          </div>

                          <button
                            id="add-intention-submit"
                            type="submit"
                            className="w-full bg-bloom hover:bg-bloom/90 py-3 rounded-xl text-xs font-bold text-ink transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-[1.01]"
                          >
                            <Plus size={14} /> Add to Today
                          </button>
                        </form>
                      </div>

                      {/* ACTIVE INTENTIONS LIST */}
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-[10px] font-mono text-ghost font-bold uppercase tracking-wider">
                          <span>Active Intentions</span>
                          <span>{intentions.filter((t) => t.completed).length} / {intentions.length} Completed</span>
                        </div>

                        {intentions.length === 0 ? (
                          <div className="text-center py-8 text-ghost text-xs border border-dashed border-white/5 rounded-xl bg-black/20">
                            No intentions configured for today yet. Write one above!
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {intentions.map((task) => (
                              <div
                                key={task.id}
                                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                                  task.completed
                                    ? "bg-black/20 border-white/5 opacity-50"
                                    : task.priority === "high"
                                    ? "bg-bloom/5 border-bloom/20 hover:border-bloom/40"
                                    : "bg-black border-white/10 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <button
                                    id={`toggle-task-${task.id}`}
                                    onClick={() => toggleIntention(task.id)}
                                    className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                      task.completed
                                        ? "bg-thrive border-thrive text-void"
                                        : "border-white/20 hover:border-bloom"
                                    }`}
                                  >
                                    {task.completed && <CheckCircle2 size={12} className="text-void fill-current" />}
                                  </button>
                                  
                                  <div className="min-w-0">
                                    <p className={`text-xs text-ink font-semibold truncate ${task.completed ? "line-through text-ghost" : ""}`}>
                                      {task.text}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                                        task.type === "Work" ? "bg-bloom/10 text-petal border border-bloom/20" :
                                        task.type === "People" ? "bg-thrive/10 text-thrive border border-thrive/20" :
                                        task.type === "Joy" ? "bg-warmth/10 text-warmth border border-warmth/20" :
                                        task.type === "Self" ? "bg-growth/10 text-growth border border-growth/20" : "bg-dusk/10 text-dusk border border-dusk/20"
                                      }`}>
                                        {task.type}
                                      </span>
                                      {task.deadline && (
                                        <span className="text-[9px] text-petal font-mono flex items-center gap-0.5">
                                          <Clock size={8} /> {task.deadline}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  id={`delete-task-${task.id}`}
                                  onClick={() => deleteIntention(task.id)}
                                  className="text-ghost hover:text-rose-500 p-1.5 rounded hover:bg-white/5 transition cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* FOCUS SESSION CAM */}
                      <div className="bg-black/30 rounded-xl p-4.5 border border-white/5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                              <Video size={13} className="text-dusk" />
                              Focus Cam (Self-Watch)
                            </h4>
                            <p className="text-[10px] text-ghost leading-normal">
                              Optional secure interactive browser camera tracking Pomodoro.
                            </p>
                          </div>
                          <button
                            id="focus-cam-toggle-btn"
                            onClick={handleToggleFocusSession}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              focusSessionActive
                                ? "bg-rose-500 text-white"
                                : "bg-dusk text-void hover:bg-dusk/90"
                            }`}
                          >
                            {focusSessionActive ? <VideoOff size={10} /> : <Video size={10} />}
                            {focusSessionActive ? "Stop Focus" : "Start Session"}
                          </button>
                        </div>

                        {focusSessionActive && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                            <div className="bg-black rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-white/5">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full text-[8px] text-rose-500 uppercase tracking-widest font-mono font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                LIVE
                              </div>
                              {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/95">
                                  <VideoOff className="text-ghost mb-1" size={16} />
                                  <p className="text-[9px] text-ghost leading-normal">{cameraError}</p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="text-center bg-black/40 p-3.5 rounded-xl border border-white/5">
                                <div className="text-2xl font-extrabold text-dusk tracking-widest font-mono">
                                  {Math.floor(focusTimeLeft / 60)}:{(focusTimeLeft % 60).toString().padStart(2, "0")}
                                </div>
                                <p className="text-[8px] text-ghost mt-0.5 uppercase tracking-widest font-mono font-bold">Remaining</p>
                              </div>
                              
                              <div className="flex gap-1.5">
                                <button
                                  id="timer-pause-resume"
                                  onClick={() => setFocusTimerRun(!focusTimerRun)}
                                  className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold py-1.5 rounded-lg text-white border border-white/10 cursor-pointer"
                                >
                                  {focusTimerRun ? "Pause" : "Resume"}
                                </button>
                                <button
                                  id="timer-skip-complete"
                                  onClick={handleFocusSessionComplete}
                                  className="flex-1 bg-thrive hover:bg-thrive/90 text-[10px] font-bold py-1.5 rounded-lg text-void cursor-pointer"
                                >
                                  Mark Done
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto text-center">
                      <button
                        onClick={() => setIsIntentionsDrawerOpen(false)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition duration-300"
                      >
                        Close Workspace
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* 2. THE VAULT / DAILY LOGS DRAWER */}
            <AnimatePresence>
              {isLogsDrawerOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLogsDrawerOpen(false)}
                    className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-md pointer-events-auto"
                  />
                  {/* Content Drawer */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0e0d12] border-l border-white/10 z-[120] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between pointer-events-auto"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                        <div>
                          <h2 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                            The Vault Repository
                          </h2>
                          <p className="text-xs text-ghost mt-0.5">Your biological repository of daily achievements and insights.</p>
                        </div>
                        <button
                          onClick={() => setIsLogsDrawerOpen(false)}
                          className="text-ghost hover:text-white text-base px-2 py-1 bg-white/5 rounded transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* CASUAL LOG REFLECTIONS INPUT */}
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4.5 space-y-4 mb-6">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">Log Achievements</h3>
                          <p className="text-[11px] text-ghost">
                            Categorized automatically (e.g. "Called Ma, stretch session").
                          </p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleFreeLogSubmit(e); }} className="flex gap-2">
                          <input
                            id="free-log-text-box"
                            type="text"
                            value={freeLogText}
                            onChange={(e) => setFreeLogText(e.target.value)}
                            placeholder="Type reflections, quick wins, or details..."
                            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-ink placeholder-ghost focus:outline-none focus:border-bloom transition font-sans"
                          />
                          <button
                            id="free-log-submit-btn"
                            type="submit"
                            disabled={isClassifyingLog || !freeLogText.trim()}
                            className="bg-thrive hover:bg-thrive/90 text-void font-bold text-xs px-4 rounded-xl flex items-center gap-1.5 transition disabled:opacity-30 cursor-pointer"
                          >
                            {isClassifyingLog ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />} Log
                          </button>
                        </form>
                      </div>

                      {/* CLASSIFIED LOGS LIST */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono text-ghost uppercase tracking-widest block font-bold">Classified logs today</span>
                        {logs.length === 0 ? (
                          <div className="text-center py-6 text-ghost text-xs border border-dashed border-white/5 rounded-xl bg-black/10">
                            No achievements logged yet. Use the prompt box above to categorize your first today!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {logs.map((log) => (
                              <div key={log.id} className="p-3 bg-black border border-white/5 rounded-xl flex items-start justify-between gap-2.5 hover:border-white/10 transition-colors">
                                <div>
                                  <p className="text-xs text-ink font-medium font-sans">{log.text}</p>
                                  <span className="text-[9px] text-ghost font-mono mt-0.5 block font-bold">
                                    {log.timestamp}
                                  </span>
                                </div>
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0 ${
                                  log.bucket === "Work" ? "bg-bloom/10 text-petal border border-bloom/25" :
                                  log.bucket === "People" ? "bg-thrive/10 text-thrive border border-thrive/25" :
                                  log.bucket === "Joy" ? "bg-warmth/10 text-warmth border border-warmth/25" :
                                  log.bucket === "Self" ? "bg-growth/10 text-growth border border-growth/25" : "bg-dusk/10 text-dusk border border-dusk/25"
                                }`}>
                                  {log.bucket}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto text-center">
                      <button
                        onClick={() => setIsLogsDrawerOpen(false)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition duration-300"
                      >
                        Close Repository
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* 3. BIOLOGICAL HUD / METRICS DRAWER */}
            <AnimatePresence>
              {isBioHudOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsBioHudOpen(false)}
                    className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-md pointer-events-auto"
                  />
                  {/* Content Drawer */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0e0d12] border-l border-white/10 z-[120] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between pointer-events-auto"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div>
                          <h2 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                            Biological HUD
                          </h2>
                          <p className="text-xs text-ghost mt-0.5">Your real-time organic indicators and pacing matrix.</p>
                        </div>
                        <button
                          onClick={() => setIsBioHudOpen(false)}
                          className="text-ghost hover:text-white text-base px-2 py-1 bg-white/5 rounded transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-6">
                        <MetricCircle
                          lifeScore={lifeScore}
                          streakCount={streakCount}
                          cyclePhase={cyclePhase}
                          intentions={intentions}
                          logs={logs}
                        />
                        
                        <CycleSyncWidget
                          cycleDay={cycleDay}
                          cycleLength={onboarding.cycleLength}
                          cyclePhase={cyclePhase}
                        />

                        <ResolutionWidget resolutions={resolutions} />

                        {/* Chronotype Peak Slot Card */}
                        <div className="bg-[#111115] border border-[#202028] rounded-[16px] p-4 flex items-center justify-between hover:border-bloom/50 transition duration-300">
                          <div className="flex items-center gap-3">
                            <Clock className="text-warmth animate-pulse" size={16} />
                            <div>
                              <span className="text-[9px] font-mono text-ghost uppercase block">Active Rhythm Block</span>
                              <span className="text-xs font-semibold text-ink font-sans">
                                {onboarding.chronotype === "morning" ? "Deep Focus: 6AM - 10AM" : "Deep Focus: 9PM - 1AM"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-warmth/10 text-warmth border border-warmth/20 px-2.5 py-0.5 rounded-lg uppercase tracking-wider font-mono font-bold">
                            Peak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-8 text-center">
                      <button
                        onClick={() => setIsBioHudOpen(false)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition duration-300 cursor-pointer"
                      >
                        Close HUD
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* TAB 2: TALK TO IDA */}
            {activeTab === "chat" && (
              <div className="space-y-4 flex flex-col justify-between h-[450px] animate-fade-in">
                
                {/* Personality switch */}
                <div className="space-y-1.5 bg-void/30 px-4 py-3 rounded-xl border border-outline-variant/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${chatMode === "assist" ? "bg-signal animate-pulse" : "bg-thrive"}`} />
                      <span className="text-xs font-bold text-ink font-sans">
                        Ida {chatMode === "assist" ? "Assist (Action Mode)" : "Companion (Friendly Supporter)"}
                      </span>
                    </div>
                    <button
                      id="toggle-chat-personality"
                      type="button"
                      onClick={() => setChatMode(chatMode === "companion" ? "assist" : "companion")}
                      className="text-[10px] text-petal hover:underline font-mono font-bold cursor-pointer bg-white/5 hover:bg-white/10 px-2 rounded-md border border-white/5 transition"
                    >
                      Switch to {chatMode === "companion" ? "Action Mode" : "Companion Mode"}
                    </button>
                  </div>
                  <p className="text-[10px] text-ghost/70 leading-relaxed font-sans">
                    {chatMode === "assist" 
                      ? "⚡ ACTION MODE: Focused on task analysis, calendar structuring, and active obstacle clearing."
                      : "🌸 COMPANION MODE: Empathetic coaching, cycle rhythm guidance, stress relief, and reframing narratives."}
                  </p>
                </div>

                {/* History screen */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
                  {chatHistory.map((h, i) => (
                    <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-[16px] text-xs leading-relaxed ${
                        h.role === "user"
                          ? "bg-bloom text-ink rounded-br-none"
                          : h.mode === "assist"
                          ? "bg-signal/5 border border-signal/20 text-ink rounded-bl-none"
                          : "bg-void border border-outline-variant/40 text-ink rounded-bl-none"
                      }`}>
                        {h.role === "ida" && (
                          <span className="text-[9px] font-mono uppercase tracking-wider block text-petal mb-1 font-bold">
                            Ida {h.mode === "assist" ? "Assist" : "Companion"}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap font-sans font-medium">{h.text}</p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-void border border-outline-variant/40 p-3 rounded-xl text-xs text-ghost flex items-center gap-2 rounded-bl-none">
                        <RefreshCw size={11} className="animate-spin text-petal" />
                        <span className="font-mono text-[10px] uppercase">Ida is listening with warmth...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Assist Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[8px] font-mono text-ghost/50 uppercase tracking-widest block font-bold">Ask Ida about:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x scroll-smooth">
                    {[
                      { label: "⚡ Today's Rescue", prompt: "Give me Today's Rescue check-in based on my remaining work tasks and current phase energy." },
                      { label: "🌸 Cycle Advice", prompt: "Explain how I should shift my priorities today to align with my luteal detail-mode phase." },
                      { label: "🌅 Morning Energy", prompt: "Assess my morning biological focus block and suggest an optimal task schedule." },
                      { label: "🧘 Quick Stress Relief", prompt: "Help me run a 2-minute cognitive reframe of a high-pressure situation right now." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setChatInput(chip.prompt);
                        }}
                        className="snap-start shrink-0 bg-void/50 hover:bg-[#1f1d24] border border-outline-variant/40 hover:border-bloom/50 text-[10px] text-ink font-medium px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer text-left active:scale-[0.97]"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center items-center gap-1.5 text-[8px] text-ghost/50 font-mono uppercase tracking-widest py-1 border-t border-b border-white/[0.02]">
                  <ArrowUp size={8} /> Scroll chat history <ArrowDown size={8} />
                </div>

                {/* Form input */}
                <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2">
                  <input
                    id="ida-chat-text-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Ida: 'Help me plan this bill' or 'I feel overwhelmed today bestie'..."
                    className="flex-1 bg-void border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-ink focus:outline-none focus:border-bloom transition font-sans"
                  />
                  <button
                    id="send-chat-btn"
                    type="submit"
                    className="bg-bloom text-ink p-3.5 rounded-xl hover:bg-bloom/90 transition cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </form>

              </div>
            )}

            {/* TAB 3: PLANNING RITUAL */}
            {activeTab === "ritual" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-ink flex items-center gap-1.5 font-display uppercase tracking-wider">
                    <Sparkles className="text-petal" size={15} /> Planning Ritual
                  </h2>
                  <p className="text-xs text-ghost">
                    Clear your mind and map tomorrow.
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-ghost/50 font-mono uppercase tracking-widest pt-1.5">
                    <span>Active steps below</span>
                    <ChevronDown size={10} className="animate-bounce text-petal" />
                  </div>
                </div>

                {/* Connected Stepper Progress Bar */}
                <div className="relative py-2 pb-5 border-b border-outline-variant/20 z-10">
                  {/* Background progress track line */}
                  <div className="absolute top-[26px] left-4 right-4 h-0.5 bg-white/[0.05] -z-10" />
                  {/* Filled track line based on ritualStep */}
                  <div 
                    className="absolute top-[26px] left-4 h-0.5 bg-gradient-to-r from-bloom to-thrive transition-all duration-500 -z-10"
                    style={{ width: `${((ritualStep - 1) / 3) * 92}%` }}
                  />
                  
                  <div className="flex justify-between items-center">
                    {[
                      { s: 1, label: "Brain Dump" },
                      { s: 2, label: "Three Big Rocks" },
                      { s: 3, label: "Time Slotting" },
                      { s: 4, label: "Lock It" }
                    ].map((st) => (
                      <div key={st.s} className="flex flex-col items-center gap-2 flex-1 relative">
                        <button
                          type="button"
                          onClick={() => st.s < ritualStep && setRitualStep(st.s)}
                          disabled={st.s >= ritualStep}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black font-mono border-2 transition duration-300 ${
                            ritualStep === st.s
                              ? "bg-bloom text-white border-bloom shadow-lg shadow-bloom/20 scale-105"
                              : ritualStep > st.s
                              ? "bg-thrive text-void border-thrive cursor-pointer hover:bg-thrive/80"
                              : "bg-[#111115] text-ghost border-outline-variant/60 cursor-not-allowed"
                          }`}
                        >
                          {st.s}
                        </button>
                        <span className={`text-[9px] font-black uppercase tracking-wider font-mono mt-1 text-center truncate w-full ${ritualStep === st.s ? "text-petal" : ritualStep > st.s ? "text-thrive" : "text-ghost"}`}>
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content based on step */}
                <div className="min-h-[200px]">
                  {ritualStep === 1 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-ink font-display uppercase tracking-wider">Step 1 — Brain Dump (1-2 min)</h4>
                      <p className="text-xs text-ghost leading-relaxed">
                        What's cluttering your head? Fears, minor items, errands, or general thoughts. Dump it all out with zero formatting.
                      </p>
                      <textarea
                        id="ritual-brain-dump"
                        value={ritualBrainDump}
                        onChange={(e) => setRitualBrainDump(e.target.value)}
                        placeholder="What's stressing you? Write every single thought. Don't worry about organizing — I will structure it perfectly for you."
                        rows={4}
                        className="w-full bg-void border border-outline-variant/50 rounded-xl p-3.5 text-xs text-ink focus:outline-none focus:border-bloom transition font-sans"
                      />
                    </div>
                  )}

                  {ritualStep === 2 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-ink font-display uppercase tracking-wider">Step 2 — Three Big Rocks (1 min)</h4>
                      <p className="text-xs text-ghost leading-relaxed">
                        What are the <span className="text-petal font-semibold">3 items</span> that, if completed tomorrow, would make you feel fulfilled?
                      </p>
                      <div className="space-y-2">
                        {ritualRocks.map((rock, idx) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            <span className="text-[10px] font-mono text-ghost w-4 font-bold">#{idx + 1}</span>
                            <input
                              id={`ritual-rock-input-${idx}`}
                              type="text"
                              value={rock}
                              onChange={(e) => {
                                const copy = [...ritualRocks];
                                copy[idx] = e.target.value;
                                setRitualRocks(copy);
                              }}
                              placeholder={`Rock #${idx + 1}...`}
                              className="flex-1 bg-void border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-bloom transition font-sans"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ritualStep === 3 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-ink font-display uppercase tracking-wider">Step 3 — Bio-Rhythm Allocation</h4>
                      <p className="text-xs text-ghost leading-relaxed">
                        Ida will automatically configure these tasks based on your peak brain hours.
                      </p>

                      <div className="space-y-3.5 bg-void/30 border border-outline-variant/40 p-4 rounded-xl font-mono text-[11px] leading-relaxed">
                        <div className="text-ghost">Chronotype Alignment: <span className="text-ink font-bold capitalize">{onboarding.chronotype}</span></div>
                        
                        <div className="space-y-3.5 border-l border-bloom/40 pl-4.5 mt-2">
                          <div className="relative">
                            <span className="w-2 h-2 rounded-full bg-bloom absolute -left-[21.5px] top-1.5" />
                            <div className="text-ink font-bold">
                              {onboarding.chronotype === "morning" ? "06:00 AM – 10:00 AM" : "09:00 PM – 01:00 AM"} (Deep Peak)
                            </div>
                            <div className="text-petal mt-0.5 font-sans font-semibold">{ritualRocks[0] || "Rock #1 (First deep focus task)"}</div>
                          </div>

                          <div className="relative">
                            <span className="w-2 h-2 rounded-full bg-warmth absolute -left-[21.5px] top-1.5" />
                            <div className="text-ink font-bold">11:00 AM – 12:00 PM (Admin / Social block)</div>
                            <div className="text-warmth mt-0.5 font-sans font-semibold">{ritualRocks[1] || "Rock #2 (Secondary connection/calls)"}</div>
                          </div>

                          <div className="relative text-ghost italic font-sans text-xs">
                            <span className="w-2 h-2 rounded-full bg-thrive absolute -left-[21.5px] top-1.5" />
                            <div className="font-semibold">Mandatory Rest Break (Non-negotiable recovery interval)</div>
                          </div>

                          <div className="relative">
                            <span className="w-2 h-2 rounded-full bg-dusk absolute -left-[21.5px] top-1.5" />
                            <div className="text-ink font-bold">03:00 PM – 04:00 PM (Light learning/Growth block)</div>
                            <div className="text-dusk mt-0.5 font-sans font-semibold">{ritualRocks[2] || "Rock #3 (Optional lighter resolution XP task)"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {ritualStep === 4 && (
                    <div className="space-y-4 text-center py-6">
                      <div className="w-12 h-12 bg-thrive/10 text-thrive border border-thrive/20 rounded-full flex items-center justify-center mx-auto mb-2.5">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-ink font-display uppercase tracking-wider">Ritual Complete</h4>
                      <p className="text-xs text-ghost max-w-xs mx-auto leading-relaxed italic font-sans font-medium">
                        "Your tomorrow is planned. Go rest, love. You have done more than enough today."
                      </p>
                    </div>
                  )}
                </div>

                {/* Back / Next buttons */}
                <div className="flex gap-2.5 pt-4">
                  {ritualStep > 1 && (
                    <button
                      id="ritual-back-btn"
                      onClick={() => setRitualStep(ritualStep - 1)}
                      className="px-5 py-3 rounded-xl border border-outline-variant/60 text-ghost hover:text-ink hover:bg-void/40 transition text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    id="ritual-next-btn"
                    onClick={handleNextRitualStep}
                    className="flex-1 bg-bloom hover:bg-bloom/95 text-white font-mono font-black uppercase tracking-widest py-3 px-5 rounded-xl text-[10px] transition duration-300 shadow-lg hover:shadow-bloom/15 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {ritualStep === 4 ? "✓ Lock Tomorrow" : "Next Step"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: LIFE BALANCE MAP */}
            {activeTab === "balance" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-ink flex items-center gap-1.5 font-display uppercase tracking-wider">
                    <Activity className="text-thrive" size={15} /> Balance Map
                  </h2>
                  <p className="text-xs text-ghost">
                    Weekly biological mapping.
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-ghost/50 font-mono uppercase tracking-widest pt-1.5">
                    <span>Scroll to explore insights & streaks</span>
                    <ChevronDown size={10} className="animate-bounce text-thrive" />
                  </div>
                </div>

                {/* Visual Chart */}
                <div className="bg-void/20 border border-outline-variant/40 p-5 rounded-[16px] space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-mono text-ghost flex-wrap gap-2 uppercase tracking-wider font-bold">
                    <span>Sector Distribution</span>
                    <div className="flex gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-bloom rounded-full" />Work</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-thrive rounded-full" />People</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-warmth rounded-full" />Joy</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-growth rounded-full" />Self</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-dusk rounded-full" />Growth</span>
                    </div>
                  </div>

                  {/* Graphic stack bar container */}
                  <div className="grid grid-cols-7 gap-3 sm:gap-4 h-36 pt-4 items-end border-b border-outline-variant/30">
                    {[
                      { day: "Mon", vals: [30, 20, 10, 20, 10], score: 75, isPeriod: false },
                      { day: "Tue", vals: [45, 10, 15, 10, 10], score: 62, isPeriod: false },
                      { day: "Wed", vals: [10, 15, 20, 45, 10], score: 85, isPeriod: true },
                      { day: "Thu", vals: [20, 40, 15, 15, 10], score: 78, isPeriod: true },
                      { day: "Fri", vals: [50, 10, 10, 10, 10], score: 55, isPeriod: false },
                      { day: "Sat", vals: [10, 35, 35, 20, 0], score: 90, isPeriod: false },
                      { day: "Sun", vals: [0, 50, 25, 25, 0], score: 100, isPeriod: false }
                    ].map((d, index) => (
                      <div key={index} className="flex flex-col items-center h-full justify-end group cursor-pointer relative">
                        <div className="absolute -top-7 bg-void border border-outline-variant/60 px-2 py-0.5 rounded text-[9px] text-petal font-mono opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 font-bold">
                          Score: {d.score}/100
                        </div>

                        <div className="w-4 sm:w-6 rounded-t overflow-hidden flex flex-col justify-end h-28 space-y-0.5 bg-void/40">
                          {d.vals.map((v, idx) => {
                            const colors = ["bg-bloom", "bg-thrive", "bg-warmth", "bg-growth", "bg-dusk"];
                            return (
                              <div
                                key={idx}
                                className={`${colors[idx]} transition-all duration-300`}
                                style={{ height: `${v}%` }}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-ghost mt-2 font-mono flex items-center gap-0.5 font-bold">
                          {d.day}
                          {d.isPeriod && <span className="text-petal text-[9px]">🌸</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI generated insights list */}
                <div className="space-y-3.5">
                  <span className="text-[9px] font-mono text-ghost uppercase tracking-widest block font-bold">AI Bio-Insights & Trend Explanations</span>
                  <div className="space-y-2.5">
                    {[
                      { 
                        title: "⚠️ Self-Core Down 15%", 
                        text: "You skipped 3 planning rituals during your high-stress Luteal phase. Your body naturally requests slow-paced, detail-oriented recovery right now. Prioritize restorative rest over high-intensity focus." 
                      },
                      { 
                        title: "📈 Work Goals Correlate With Joy", 
                        text: "You execute professional tasks 22% faster when your morning Joy points are filled first. There is an evident positive biological correlation between peak state focus and pre-work endorphin release." 
                      },
                      { 
                        title: "💡 Connection Core Spiked", 
                        text: "Your People sync on Friday beautifully countered mid-week cortisol levels, raising your weekend Peak Resonance score from 62 to an exceptional 90." 
                      }
                    ].map((insight, idx) => (
                      <div key={idx} className="p-3.5 bg-void/15 border border-[#2e2a3d] rounded-xl text-xs text-ink/95 flex flex-col gap-1 leading-relaxed font-sans font-medium">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-black text-petal">
                          <span>✦</span>
                          <span>{insight.title}</span>
                        </div>
                        <p className="text-[11px] text-ghost/90 pl-3 leading-relaxed">
                          {insight.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloom streak calendar */}
                <div className="bg-void/20 border border-outline-variant/40 p-4.5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-mono text-ghost uppercase tracking-wider font-bold">
                    <span>Bloom Calendar (28-day overview)</span>
                    <span className="text-ink">Active streak: {streakCount} Days</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      let color = "bg-void/40 border border-outline-variant/20";
                      let label = "rest";
                      let textColor = "text-ghost/60";

                      if (dayNum >= 6 && dayNum <= 12) {
                        color = "bg-growth/70";
                        label = "bloom";
                        textColor = "text-void font-bold";
                      } else if (dayNum >= 1 && dayNum <= 5) {
                        color = "bg-bloom/15 border border-bloom/40";
                        label = "warrior";
                        textColor = "text-petal font-bold";
                      } else if (dayNum === 13 || dayNum === 14) {
                        color = "bg-warmth/60";
                        label = "partial";
                        textColor = "text-void font-bold";
                      }

                      return (
                        <div
                          key={idx}
                          className={`h-10 sm:h-11 rounded-md flex flex-col justify-between p-1 cursor-default text-right relative group ${color}`}
                        >
                          <span className={`text-[8px] font-mono ${textColor}`}>{dayNum}</span>
                          <span className={`text-[7px] text-left font-mono hidden sm:inline uppercase tracking-tighter truncate leading-none ${textColor}`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: REFRAME ENGINE */}
            {activeTab === "reframe" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-ink flex items-center gap-1.5 font-display uppercase tracking-wider">
                    <Brain className="text-bloom" size={15} /> Thought Shifter
                  </h2>
                  <p className="text-xs text-ghost">
                    Fact-check the inner critic.
                  </p>
                </div>

                <form onSubmit={handleReframeSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-ink/90 block font-semibold font-sans">What is your inner critic saying today?</label>
                    <input
                      id="self-criticism-text-input"
                      type="text"
                      value={selfCriticism}
                      onChange={(e) => setSelfCriticism(e.target.value)}
                      placeholder="e.g. 'I didn't finish anything today, total failure of a day.'"
                      className="w-full bg-void border border-outline-variant/50 rounded-xl px-4 py-3.5 text-xs text-ink placeholder-muted focus:outline-none focus:border-bloom transition font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-ghost font-mono font-bold uppercase tracking-wider">
                      <span>Emotional State Severity</span>
                      <span className="text-petal font-bold font-mono">
                        {(() => {
                          if (userRating <= 2) return "🌧️ Severe Criticism";
                          if (userRating <= 4) return "⛈️ High Anxiety";
                          if (userRating <= 6) return "☁️ Mild Self-Doubt";
                          if (userRating <= 8) return "🌤️ Balanced Perspective";
                          return "☀️ Deep Self-Compassion";
                        })()} ({userRating}/10)
                      </span>
                    </div>
                    <input
                      id="self-rating-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={userRating}
                      onChange={(e) => setUserRating(parseInt(e.target.value))}
                      className="w-full accent-bloom cursor-ew-resize bg-void/40 h-2 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      id="reframe-submit-btn"
                      type="submit"
                      disabled={isReframing || !selfCriticism.trim()}
                      className="w-full max-w-sm bg-bloom hover:bg-bloom/95 disabled:bg-bloom/20 disabled:text-ink/30 text-white font-mono font-black uppercase tracking-widest py-3.5 px-6 rounded-xl text-[10px] transition duration-300 shadow-lg hover:shadow-bloom/10 active:scale-[0.99] disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isReframing ? <RefreshCw size={11} className="animate-spin" /> : null}
                      Shift Narrative
                    </button>
                  </div>
                </form>

                {isReframing && (
                  <div className="bg-void/40 border border-bloom/30 rounded-xl p-5 text-center space-y-3.5 animate-pulse max-w-sm mx-auto mt-4">
                    <div className="flex justify-center items-center gap-1.5">
                      <RefreshCw className="animate-spin text-petal" size={14} />
                      <span className="font-mono text-[9px] uppercase text-petal font-black tracking-widest">
                        Re-weaving Narrative...
                      </span>
                    </div>
                    <p className="text-[10px] text-ghost leading-relaxed font-sans">
                      Ida is fact-checking your criticism against today's logged biological integrity indicators to produce a balanced reframe.
                    </p>
                    <div className="w-full bg-void h-1 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-bloom to-petal w-2/3 animate-[pulse_1.5s_infinite]" />
                    </div>
                  </div>
                )}

                {/* Shifter outputs */}
                <AnimatePresence>
                  {activeReframe && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-outline-variant/30"
                    >
                      <div className="bg-void/20 border border-signal/20 p-4 rounded-xl">
                        <span className="text-[9px] font-mono uppercase text-signal block mb-1 font-bold">What you said</span>
                        <p className="text-xs text-ghost line-through decoration-signal decoration-1 italic font-medium leading-relaxed font-sans">
                          "{activeReframe.whatSheSaid}"
                        </p>
                      </div>

                      <div className="bg-thrive/3 border border-thrive/25 p-4 rounded-xl">
                        <span className="text-[9px] font-mono uppercase text-thrive block mb-1 font-bold">What actually happened (Evidence)</span>
                        <p className="text-xs text-ink leading-relaxed font-sans font-medium">
                          {activeReframe.whatActuallyHappened}
                        </p>
                      </div>

                      <div className="md:col-span-2 bg-bloom/5 border border-bloom/25 p-4.5 rounded-xl space-y-1.5">
                        <span className="text-[9px] font-mono uppercase text-petal block font-bold">Ida's Correction</span>
                        <p className="text-xs text-ink/95 font-bold italic leading-relaxed font-sans">
                          "{activeReframe.reframeSentence}"
                        </p>
                        <div className="flex items-center gap-2 pt-2 text-xs text-ink font-sans font-semibold">
                          <span className="text-ghost text-[11px]">Corrected life score representation:</span>
                          <span className="bg-bloom px-2 py-0.5 rounded text-ink font-mono text-[10px] font-black border border-bloom/30">
                            {activeReframe.correctedScore}/100
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* TAB 6: YOUTUBE INSPIRATION */}
            {activeTab === "youtube" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-ink flex items-center gap-2 font-display uppercase tracking-wider">
                    <Youtube className="text-signal animate-pulse" size={16} /> Routine Sync
                  </h2>
                  <p className="text-xs text-ghost">
                    Convert routines into action steps.
                  </p>
                  <p className="text-[10px] text-[#AFA9EC] leading-relaxed font-sans pt-1.5 border-t border-white/[0.03]">
                    💡 <span className="text-white font-bold">Supported Inputs:</span> Paste a YouTube transcript, web article, famous creator routine (e.g. Huberman, Ali Abdaal), or raw notes. Ida will extract and align it with your biological rhythms.
                  </p>
                </div>

                <form onSubmit={handleYtSubmit} className="space-y-3.5">
                  <input
                    id="youtube-url-input"
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="e.g. Ali Abdaal video on alignment routine, morning block strategies..."
                    className="w-full bg-void border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-ink placeholder-muted focus:outline-none focus:border-bloom transition font-sans"
                  />
                  <button
                    id="youtube-analyze-btn"
                    type="submit"
                    disabled={isYtAnalyzing || !youtubeInput.trim()}
                    className="w-full bg-petal hover:bg-petal/90 disabled:bg-petal/20 disabled:text-ink/30 text-black font-mono font-black uppercase tracking-widest py-3 px-4 rounded-xl text-[10px] transition duration-300 shadow-lg hover:shadow-petal/10 active:scale-[0.99] disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isYtAnalyzing ? <RefreshCw size={11} className="animate-spin inline" /> : null}
                    Extract & Convert
                  </button>
                </form>

                {ytResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-void/20 border border-outline-variant/40 p-5 rounded-2xl space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-signal uppercase tracking-wider font-bold block">Extracted Insight</span>
                      <p className="text-xs text-ink/90 italic leading-relaxed font-sans font-medium">
                        "{ytResult.insight}"
                      </p>
                    </div>

                    <div className="p-4 bg-void/30 rounded-xl border border-outline-variant/40 flex justify-between items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-[9px] font-mono text-ghost uppercase block font-bold">Suggested Intention</span>
                        <p className="text-xs text-ink font-bold mt-0.5 font-sans">{ytResult.suggestedAction}</p>
                        <span className="text-[10px] text-petal font-mono block mt-1">XP Category: {ytResult.bucket}</span>
                      </div>
                      <button
                        id="youtube-apply-action"
                        onClick={handleApplyYtAction}
                        className="bg-dusk hover:bg-dusk/90 text-void font-mono font-black uppercase tracking-widest text-[9px] px-4 py-2.5 rounded-xl transition duration-300 shadow-md active:scale-[0.98] cursor-pointer"
                      >
                        Add to Today
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="bg-void/10 p-4 border border-outline-variant/40 rounded-xl text-[11px] text-ghost leading-relaxed space-y-1 font-medium">
                  <span className="font-bold text-ink block font-display uppercase tracking-wider">Mechanism:</span>
                  <p>Converts routine advice into small action items tailored to your cycle phase.</p>
                </div>
              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
}
