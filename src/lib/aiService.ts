import { supabase } from "@/integrations/supabase/client";
import { modelRouter } from "@/lib/ai/modelRouter";
import { getConfiguredAIGatewayUrl } from "@/lib/ai/constants";

/**
 * MARGDARSHAK INTELLIGENCE CORE
 * -----------------------------
 * This service handles all AI interactions via Pollinations.ai with Gemini 2.5 Flash Lite.
 * @author Abhinav Jha
 */

// --- Global Types ---
export interface UserStats {
  studyStreak: number;
  tasksCompleted: number;
  hoursStudied: number;
  averageGrade?: number;
}

export interface AIBriefing {
  greeting: string;
  focus_area: string;
  message: string;
  color: string;
}

export interface BriefingScheduleEntry {
  class_name?: string;
  title?: string;
  subject?: string;
  start_time?: string;
}

export interface BriefingNoteEntry {
  title: string;
}

export interface BriefingSessionEntry {
  subject?: string;
  duration?: number;
}

export interface BriefingContext {
  tasks: any[];
  grades: any[];
  courses: any[];
  schedule: BriefingScheduleEntry[];
  notes?: BriefingNoteEntry[];
  sessions?: BriefingSessionEntry[];
  stats: UserStats;
}

// --- Configuration ---
const POLLINATIONS_API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY || "";
const UNIVERSAL_MODEL = "Gemini 2.5 Flash Lite";
const POLLINATIONS_IMAGE_MODEL = "pollinations-flux-schnell";

/**
 * A robust JSON parser that handles occasional AI formatting errors.
 */
const cleanAndParseJSON = (text: string): any => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.substring(start, end + 1));
  } catch (err) {
    console.warn("AI returned malformed JSON, using fallback.", err);
    return null;
  }
};

/**
 * UNIVERSAL CALLER: Pollinations.ai API
 */
const callPollinationsText = async (messages: any[], jsonMode = false): Promise<string> => {
  try {
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: UNIVERSAL_MODEL,
        jsonMode: jsonMode,
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    
    if (!response.ok) throw new Error(`Pollinations API Error: ${response.status}`);
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Pollinations Universal Call Failure:", error);
    throw error;
  }
};

// --- Core Service ---

export const aiService = {

  /**
   * RECALL CONTEXT (Memory)
   */
  getNeuralContext: async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_neural_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).reverse();
    } catch (e) {
      console.error("Failed to recall memory:", e);
      return [];
    }
  },

  /**
   * GENERATE IMAGE
   */
  generateImage: async (prompt: string) => {
    try {
      const finalPrompt = prompt
        .replace(/^(can you|please|kindly|just)\s+/i, "")
        .replace(/(draw|generate|create|show|make|visualize).*(image|picture|photo|diagram|sketch|illustration)( of)?/i, "")
        .trim() || prompt;

      const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
        },
        body: JSON.stringify({
          mode: "imagegen",
          model: POLLINATIONS_IMAGE_MODEL,
          messages: [{ role: "user", content: finalPrompt }],
        }),
      });
      
      const data = await response.json();
      return data?.image || "IMAGE_GENERATION_FAILED";
    } catch (error: any) {
      console.error("Image Gen Failed:", error);
      return `IMAGE_ERROR: ${error.message}`;
    }
  },

  /**
   * SEND MESSAGE (Chat)
   */
  sendMessage: async (userId: string, prompt: string) => {
    try {
      const history = await aiService.getNeuralContext(userId);
      const messages = [
        { role: "system", content: "You are MARGDARSHAK, an elite AI study companion." },
        ...history.map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: prompt }
      ];
      
      const aiResponse = await callPollinationsText(messages);
      await aiService.persistMessage(userId, prompt, aiResponse);
      return aiResponse;
    } catch (error: any) {
      console.error("Chat Error:", error);
      return `SYSTEM_ERROR: ${error.message || "Connection failed"}`;
    }
  },

  /**
   * PERSIST MESSAGE
   */
  persistMessage: async (userId: string, userMsg: string, aiMsg: string) => {
    try {
      const records = [
        { user_id: userId, role: "user", content: userMsg },
        { user_id: userId, role: "assistant", content: aiMsg }
      ];
      await (supabase as any).from('ai_neural_memory').insert(records);
    } catch (error) {
      console.error("Failed to persist message:", error);
    }
  },

  /**
   * DAILY BRIEFING
   */
  generateDailyBriefing: async (userId: string, userName: string, context?: BriefingContext): Promise<AIBriefing> => {
    let contextStr = "";
    if (context) {
      const { tasks = [], grades = [], courses = [], schedule = [], stats = {} } = context as any;
      contextStr = `CONTEXT: Tasks: ${tasks.length}, Streak: ${stats.studyStreak}, Focus: ${courses[0]?.name || 'Studies'}`;
    }

    const systemPrompt = `You are MARGDARSHAK. Generate a motivating morning briefing JSON. ${contextStr} 
    JSON: {"greeting":"...","focus_area":"...","message":"...","color":"text-emerald-400"}`;

    try {
      const raw = await callPollinationsText([{ role: "user", content: systemPrompt }], true);
      return cleanAndParseJSON(raw) || { greeting: "Welcome back!", focus_area: "Daily Overview", message: "Let's excel today.", color: "text-indigo-400" };
    } catch (e) {
      return { greeting: "Welcome back!", focus_area: "Daily Overview", message: "Let's excel today.", color: "text-indigo-400" };
    }
  },

  /**
   * EXPLAIN CONCEPT
   */
  explainConcept: async (topic: string): Promise<string | null> => {
    try {
      const systemPrompt = `Explain this concept clearly: ${topic}`;
      return await callPollinationsText([{ role: "user", content: systemPrompt }]);
    } catch (error) {
      return null;
    }
  },

  /**
   * SYLLABUS GENERATOR
   */
  generateCourseSyllabus: async (courseName: string, level: string): Promise<any> => {
    try {
      const systemPrompt = `Create a 4-module syllabus for ${courseName} at ${level} level. JSON format.`;
      const raw = await callPollinationsText([{ role: "user", content: systemPrompt }], true);
      return cleanAndParseJSON(raw) || { modules: [] };
    } catch (e) {
      return { modules: [] };
    }
  },

  /**
   * AI TUTOR
   */
  askCourseTutor: async (courseName: string, question: string): Promise<string> => {
    try {
      const systemPrompt = `As a tutor for ${courseName}, answer: ${question}`;
      return await callPollinationsText([{ role: "user", content: systemPrompt }]);
    } catch (e) {
      return "AI Tutor is currently offline.";
    }
  },

  /**
   * ACTIVE READING
   */
  chatWithDocument: async (documentContext: string, question: string): Promise<string> => {
    try {
      const systemPrompt = `Context: ${documentContext}\n\nQuestion: ${question}`;
      return await callPollinationsText([{ role: "user", content: systemPrompt }]);
    } catch (e) {
      return "Document analysis failed.";
    }
  },

  /**
   * FLASHCARDS
   */
  generateFlashcards: async (sourceMaterial: string, count: number = 10): Promise<any> => {
    try {
      const systemPrompt = `Generate ${count} flashcards JSON: {"flashcards": [{"front": "...", "back": "..."}]} from: ${sourceMaterial}`;
      const raw = await callPollinationsText([{ role: "user", content: systemPrompt }], true);
      return cleanAndParseJSON(raw) || { flashcards: [] };
    } catch (e) {
      return { flashcards: [] };
    }
  },

  /**
   * DOUBT SOLVER (Vision)
   */
  solveDoubtFromImage: async (imageUrlOrBase64: string, extraContext?: string): Promise<string> => {
    try {
      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this problem image. ${extraContext || ""}` },
            { type: "image_url", image_url: { url: imageUrlOrBase64 } }
          ]
        }
      ];
      return await callPollinationsText(messages);
    } catch (e) {
      return "Failed to process image.";
    }
  },

  /**
   * MOCK TEST
   */
  generateMockTest: async (topic: string, difficulty: string = "medium", count: number = 5): Promise<any> => {
    try {
      const systemPrompt = `Generate a ${count}-question MCQ test on ${topic} at ${difficulty} level. JSON format.`;
      const raw = await callPollinationsText([{ role: "user", content: systemPrompt }], true);
      return cleanAndParseJSON(raw) || { questions: [] };
    } catch (e) {
      return { questions: [] };
    }
  },

  /**
   * BURNOUT PREDICTOR
   */
  predictBurnout: async (stats: any): Promise<any> => {
    try {
      const systemPrompt = `Analyze stats for burnout. JSON: {"status": "...", "score": 0, "message": "...", "action": "..."} Stats: ${JSON.stringify(stats)}`;
      const raw = await callPollinationsText([{ role: "user", content: systemPrompt }], true);
      return cleanAndParseJSON(raw) || null;
    } catch (e) {
      return null;
    }
  },
};

export default aiService;
