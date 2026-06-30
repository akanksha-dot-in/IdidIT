export type BucketType = "Work" | "People" | "Joy" | "Self" | "Growth" | "Rescue";

export type Chronotype = "morning" | "night";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface OnboardingState {
  completed: boolean;
  name: string;
  chronotype: Chronotype;
  periodStartDate: string; // YYYY-MM-DD
  cycleLength: number; // e.g. 28
  resolution: string;
  planningTime: string; // e.g. "21:00"
}

export interface TaskIntention {
  id: string;
  text: string;
  type: BucketType;
  completed: boolean;
  deadline?: string;
  priority: "high" | "medium" | "low";
  energyMatch?: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  text: string;
  bucket: BucketType;
  timestamp: string; // friendly time or raw
  date: string; // YYYY-MM-DD
}

export interface ResolutionHabit {
  id: string;
  name: string;
  level: number; // 1 to 5
  xp: number; // 0 to 100
  completedDates: string[]; // YYYY-MM-DD format
}

export interface ReframeData {
  whatSheSaid: string;
  whatActuallyHappened: string;
  reframeSentence: string;
  correctedScore: number;
}

export interface DailyHistoryItem {
  date: string; // YYYY-MM-DD
  lifeScore: number;
  bucketScores: Record<BucketType, number>;
  rating?: number; // user rating 1-10
  reframeData?: ReframeData;
}
