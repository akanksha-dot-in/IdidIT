import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_FOR_STANDALONE",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. ENDPOINT: Ida Smart Assistant & Companion Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory, cyclePhase, onboardingState, recentLogs, recentTasks } = req.body;
    const ai = getAi();

    // Check if key is available. If not, use mock response.
    if (!process.env.GEMINI_API_KEY) {
      return res.json(getMockChatResponse(message));
    }

    const userName = onboardingState?.name || "love";
    const chronotype = onboardingState?.chronotype || "morning person";
    const phase = cyclePhase || "follicular";

    const systemInstruction = `You are Ida, the supportive AI brain inside 'IdidIT' — a women-centric life operating system and deadline rescue assistant.
You have two modes of presence:
1. Ida (Companion Mode - Default): Warm, emotional, Gen-Z fluent (use words like 'bestie', 'love', 'got you', 'no pressure', lowcaps occasionally if casual, very supportive), deeply wise about how women live. Calling home, laughing, resting on a period day ARE productive parts of life.
2. Ida Assist (Action Mode): Crisp, focused, deadline-obsessed, proactive. Automatically activates when she mentions a deadline, urgent tasks, late fees, bills, interviews, or when she feels completely overwhelmed.

YOUR RULES:
- Never say "you're behind" or "overdue". Use "this one needs your attention first" or "this one is waiting on you".
- Acknowledge the mental load (e.g. managing household/family and work at the same time is hard!).
- Body awareness: align suggestions with cycle phase (Menstrual = rest mode; Follicular = rising energy/big ideas; Ovulation = peak power week/hard conversations; Luteal = details/organization).
- Transition rule:
  - If shifting to Action Mode, prefix/start your response text with a friendly variation of: "okay, switching to action mode. let's get you sorted."
  - If returning to Companion Mode after answering a crisis, say: "you handled it. back to you now. how are you actually feeling?"
- Keep responses relatively brief, conversational, and split into paragraphs. No markdown headers. No clinical language.

You must respond in JSON with the following structure:
{
  "text": "Ida's conversational response",
  "mode": "companion" or "assist",
  "extractedTasks": [
    { "text": "Task text", "type": "Work" | "People" | "Joy" | "Self" | "Growth" | "Rescue", "deadline": "ISO date or friendly date description if mentioned", "priority": "high" | "medium" | "low" }
  ]
}
If no new tasks are mentioned in her input, return "extractedTasks": [].
Do not invent tasks unless she describes something she needs or wants to do.`;

    const promptContext = `User message: "${message}"
User Context:
- Name: ${userName}
- Chronotype: ${chronotype}
- Current Cycle Phase: ${phase}
- Recent Logs: ${JSON.stringify(recentLogs || [])}
- Open Tasks: ${JSON.stringify(recentTasks || [])}

Conversation history:
${(chatHistory || []).slice(-6).map((h: any) => `${h.role === "user" ? "User" : "Ida"}: ${h.text}`).join("\n")}

Respond with the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptContext,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            mode: { type: Type.STRING, enum: ["companion", "assist"] },
            extractedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Work", "People", "Joy", "Self", "Growth", "Rescue"] },
                  deadline: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
                },
                required: ["text", "type"]
              }
            }
          },
          required: ["text", "mode", "extractedTasks"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to call Gemini API" });
  }
});

// 2. ENDPOINT: End-of-Day Free Logging Classification
app.post("/api/classify-log", async (req, res) => {
  try {
    const { text } = req.body;
    const ai = getAi();

    if (!process.env.GEMINI_API_KEY) {
      return res.json(getMockClassification(text));
    }

    const systemInstruction = `You are Ida's log classifier. The user types casual, messy, or short reflections of what they did today.
Your job is to read her text, split it into separate actions if multiple are present, and classify each action into one of our six life buckets:
1. Work: tasks, deadlines, study, career
2. People: family calls, time with friends, showing up for someone
3. Joy: fun, play, hobbies, laughing, watching something she loves, relaxing with friends
4. Self: rest, sleep, exercise, eating well, skincare, meditation, journaling, body care
5. Growth: habits, reading books, learning skills, YouTube tutorials, resolutions
6. Rescue: emergency tasks, paying overdue bills, last minute deadline saves

Respond with a JSON object holding a list of entries.
Example output format:
{
  "entries": [
    {
      "text": "called ma and talked for an hour",
      "bucket": "People",
      "inferredTime": "5:30 PM"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Classify this user text: "${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            entries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "A summarized, cleaned single action done by the user" },
                  bucket: { type: Type.STRING, enum: ["Work", "People", "Joy", "Self", "Growth", "Rescue"] },
                  inferredTime: { type: Type.STRING, description: "Inferred time of day based on text or current evening default (e.g. 'Morning', 'Afternoon', '9:00 PM')" }
                },
                required: ["text", "bucket"]
              }
            }
          },
          required: ["entries"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Classification error:", error);
    res.status(500).json({ error: error.message || "Failed to classify" });
  }
});

// 3. ENDPOINT: Reframe / Thought Shift Engine
app.post("/api/reframe", async (req, res) => {
  try {
    const { rating, badDayText, recentLogs } = req.body;
    const ai = getAi();

    if (!process.env.GEMINI_API_KEY) {
      return res.json(getMockReframe(badDayText, recentLogs));
    }

    const systemInstruction = `You are Ida's Thought Shifter. When the user says she was unproductive, wasted the day, or did nothing, you perform the 'Samay Raina Reframe'.
Look at her self-critical statement (badDayText), and compare it against the actual logged facts (recentLogs).
Then construct a gentle, powerful, evidence-based pushback.

For example:
What she said: "I didn't finish anything today. total waste."
What actually happened: "You took your sister to the doctor, rested when your body asked you to, and made chai for your dad."
Reframe sentence: "That's not nothing. That's everything. You showed up for your loved ones and your body."
Corrected score: Choose a score out of 100 representing her rich life today, e.g., 78.

Rules:
- Be gentle but objective. Strikethrough her self-deprecating words.
- Base the reframe entirely on actual logs (like people time, self care, joy).
- If logs are empty, emphasize that resting is also a full, necessary productivity block for her cycle or wellness.

Respond in JSON matching the schema.`;

    const promptContext = `User bad day text: "${badDayText}"
Self-rated score: ${rating}/10
Recent logs: ${JSON.stringify(recentLogs || [])}

Provide the reframe JSON response.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptContext,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatSheSaid: { type: Type.STRING, description: "The self-critical text she said" },
            whatActuallyHappened: { type: Type.STRING, description: "The beautiful list of things she actually did based on logs" },
            reframeSentence: { type: Type.STRING, description: "A warm, high-impact reframe summary sentence" },
            correctedScore: { type: Type.INTEGER, description: "An enhanced, fair Full Life Score out of 100" }
          },
          required: ["whatSheSaid", "whatActuallyHappened", "reframeSentence", "correctedScore"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Reframe error:", error);
    res.status(500).json({ error: error.message || "Failed to reframe" });
  }
});

// 4. ENDPOINT: YouTube Inspiration Engine
app.post("/api/youtube-inspiration", async (req, res) => {
  try {
    const { input } = req.body;
    const ai = getAi();

    if (!process.env.GEMINI_API_KEY) {
      return res.json(getMockYoutubeInspiration(input));
    }

    const systemInstruction = `You are Ida's YouTube Inspiration Engine.
The user shares a YouTube link or describes a productive video they watched (e.g. on focus, sleep, routines).
Extract the core insight of this concept in 1 sentence.
Suggest a single, specific actionable task or habit to implement in her dashboard.

Respond in JSON matching:
{
  "insight": "Core concept summary in one warm sentence",
  "suggestedAction": "Suggested action description, e.g. 'Set a daily 20-min deep work block'",
  "actionType": "task" | "habit" | "resolution_xp",
  "taskTitle": "Specific 3-5 word name for the task/habit",
  "bucket": "Work" | "People" | "Joy" | "Self" | "Growth" | "Rescue"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Input from user: "${input}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            actionType: { type: Type.STRING, enum: ["task", "habit", "resolution_xp"] },
            taskTitle: { type: Type.STRING },
            bucket: { type: Type.STRING, enum: ["Work", "People", "Joy", "Self", "Growth", "Rescue"] }
          },
          required: ["insight", "suggestedAction", "actionType", "taskTitle", "bucket"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("YouTube error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze YouTube info" });
  }
});

// -------------------------------------------------------------
// Fallback Mocks for Standalone/No Key Environment
// -------------------------------------------------------------
function getMockChatResponse(msg: string) {
  const lowercase = msg.toLowerCase();
  let text = "hey love! i'm here for you. let's focus on taking care of yourself today. what's on your mind?";
  let mode = "companion";
  const extractedTasks: any[] = [];

  if (lowercase.includes("deadline") || lowercase.includes("due") || lowercase.includes("urgent") || lowercase.includes("forgot") || lowercase.includes("bill") || lowercase.includes("interview")) {
    text = "okay, switching to action mode. let's get you sorted. we have got this. let's break down whatever is due soon so you can breathe.";
    mode = "assist";
    
    // Attempt basic regex or keyword match for mockup task
    if (lowercase.includes("bill") || lowercase.includes("pay")) {
      extractedTasks.push({
        text: "Pay upcoming bill",
        type: "Rescue",
        deadline: "Today",
        priority: "high"
      });
    } else if (lowercase.includes("interview") || lowercase.includes("job")) {
      extractedTasks.push({
        text: "Prepare for interview",
        type: "Work",
        deadline: "Tomorrow",
        priority: "high"
      });
    } else {
      extractedTasks.push({
        text: "Complete urgent deadline item",
        type: "Rescue",
        deadline: "Within 24 hours",
        priority: "high"
      });
    }
  } else if (lowercase.includes("tired") || lowercase.includes("exhausted") || lowercase.includes("period") || lowercase.includes("cramp")) {
    text = "bestie, i hear you. your body is doing hard work right now. resting today IS the actual task. let's clear your plate and focus on comforting you.";
  } else if (lowercase.includes("called") || lowercase.includes("mom") || lowercase.includes("sister") || lowercase.includes("friend")) {
    text = "aw, that's beautiful. taking time for the people you love is such a rich part of a beautiful day. counting this as People time in your logs!";
  }

  return { text, mode, extractedTasks };
}

function getMockClassification(text: string) {
  const lowercase = text.toLowerCase();
  const entries: any[] = [];

  if (lowercase.includes("project") || lowercase.includes("report") || lowercase.includes("study") || lowercase.includes("assignment") || lowercase.includes("work")) {
    entries.push({
      text: text,
      bucket: "Work",
      inferredTime: "2:30 PM"
    });
  } else if (lowercase.includes("call") || lowercase.includes("mom") || lowercase.includes("friend") || lowercase.includes("sister") || lowercase.includes("dad") || lowercase.includes("family")) {
    entries.push({
      text: text,
      bucket: "People",
      inferredTime: "6:00 PM"
    });
  } else if (lowercase.includes("laugh") || lowercase.includes("reel") || lowercase.includes("movie") || lowercase.includes("fun") || lowercase.includes("game")) {
    entries.push({
      text: text,
      bucket: "Joy",
      inferredTime: "9:00 PM"
    });
  } else if (lowercase.includes("sleep") || lowercase.includes("meditation") || lowercase.includes("rest") || lowercase.includes("nap") || lowercase.includes("bath") || lowercase.includes("skincare")) {
    entries.push({
      text: text,
      bucket: "Self",
      inferredTime: "Morning"
    });
  } else if (lowercase.includes("read") || lowercase.includes("learn") || lowercase.includes("exercise") || lowercase.includes("workout")) {
    entries.push({
      text: text,
      bucket: "Growth",
      inferredTime: "10:30 AM"
    });
  } else if (lowercase.includes("bill") || lowercase.includes("late") || lowercase.includes("rescue")) {
    entries.push({
      text: text,
      bucket: "Rescue",
      inferredTime: "Afternoon"
    });
  } else {
    // Generous fallback
    entries.push({
      text: text,
      bucket: "Self",
      inferredTime: "Evening"
    });
  }

  return { entries };
}

function getMockReframe(badDayText: string, recentLogs: any[]) {
  const logSummary = (recentLogs || []).length > 0 
    ? recentLogs.map((l: any) => l.text).join(", ")
    : "rested, drank water, took deep breaths";

  return {
    whatSheSaid: badDayText,
    whatActuallyHappened: `You successfully handled: ${logSummary}.`,
    reframeSentence: "That is not nothing. That is exactly what makes a rich, beautiful, and fully lived day. Let's celebrate those wins!",
    correctedScore: 82
  };
}

function getMockYoutubeInspiration(input: string) {
  return {
    insight: "Time-blocking and routine design are acts of self-care and commitment, not just work logs.",
    suggestedAction: "Implement a daily 25-minute deep focus window matching your chronotype block.",
    actionType: "habit",
    taskTitle: "25m Deep Focus",
    bucket: "Growth"
  };
}


// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IdidIT fullstack server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
