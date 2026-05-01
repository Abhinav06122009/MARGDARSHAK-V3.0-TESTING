import { supabase } from "@/integrations/supabase/client";
import { modelRouter } from "@/lib/ai/modelRouter";
import { AI_GATEWAY_NOT_CONFIGURED_MESSAGE, getConfiguredAIGatewayUrl } from "@/lib/ai/constants";

/**
 * MARGDARSHAK INTELLIGENCE CORE
 * -----------------------------
 * This service handles all AI interactions via the Puter.js bridge.
 * It manages context (memory), image generation, and chat persistence.
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

// --- Utilities ---

/**
 * A robust JSON parser that handles occasional AI formatting errors.
 * Sometimes the AI adds text before/after the JSON, this cleans it up.
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

// --- Core Service ---

const AI_GATEWAY_URL = getConfiguredAIGatewayUrl();
const POLLINATIONS_IMAGE_MODEL = "pollinations-flux-schnell";

const getGatewayAuthHeaders = async () => {
  if (!AI_GATEWAY_URL) {
    throw new Error(AI_GATEWAY_NOT_CONFIGURED_MESSAGE);
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in to use AI features.");
  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
};

export const aiService = {
  
  /**
   * RECALL CONTEXT (Memory)
   * Fetches the last 10 interactions so the AI remembers the conversation context.
   */
  getNeuralContext: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_neural_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Reverse to chronological order (Oldest -> Newest)
      return (data || []).reverse();

    } catch (e) {
      console.error("Failed to recall memory:", e);
      return [];
    }
  },

  /**
   * GENERATE IMAGE
   * Takes a user prompt and converts it into an image using the AI driver.
   */
  generateImage: async (prompt: string) => {
    try {
      const visualPrompt = prompt
        .replace(/^(can you|please|kindly|just)\s+/i, "")
        .replace(
          /(draw|generate|create|show|make|visualize).*(image|picture|photo|diagram|sketch|illustration)( of)?/i,
          ""
        )
        .trim();

      // Use the raw prompt if cleanup emptied it
      const finalPrompt = visualPrompt || prompt;
      const headers = await getGatewayAuthHeaders();
      const res = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          mode: "imagegen",
          model: POLLINATIONS_IMAGE_MODEL,
          messages: [{ role: "user", content: finalPrompt }],
        }),
      });
      if (!res.ok) throw new Error(`Image request failed (${res.status})`);
      const data = await res.json();
      return data?.image || "IMAGE_GENERATION_FAILED";

    } catch (error: any) {
      console.error("Image Gen Failed:", error);
      return `IMAGE_ERROR: ${error.message}`;
    }
  },

  /**
   * SEND MESSAGE (Chat)
   * The main loop: Get context -> Send to AI -> Save response.
   */
  sendMessage: async (userId: string, prompt: string) => {
    try {
      const history = await aiService.getNeuralContext(userId);
      const messages = history.map((m) => ({ role: m.role, content: m.content }));
      const aiResponse = await modelRouter.chat([...messages, { role: "user", content: prompt }], {
        tier: 'premium',
      });
      await aiService.persistMessage(userId, prompt, aiResponse);
      
      return aiResponse;

    } catch (error: any) {
      console.error("Chat Error:", error);
      return `SYSTEM_ERROR: ${error.message || "Connection failed"}`;
    }
  },

  /**
   * PERSIST MESSAGE
   * Saves the interaction to the database for future context.
   */
  persistMessage: async (userId: string, userMsg: string, aiMsg: string) => {
    try {
      const records = [
        { 
          user_id: userId, 
          role: "user", 
          content: userMsg
        },
        { 
          user_id: userId, 
          role: "assistant", 
          content: aiMsg
        }
      ];

      const { error } = await supabase.from('ai_neural_memory').insert(records);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to persist message:", error);
    }
  },

  /**
   * DAILY BRIEFING
   * Generates the personalized dashboard greeting using tasks, grades, and schedule.
   */
  generateDailyBriefing: async (
    userId: string,
    userName: string,
    context?: BriefingContext // New optional parameter for rich context
  ): Promise<AIBriefing> => {
    
    // Construct a rich prompt based on available data
    let contextStr = "";
    if (context) {
      const { tasks, grades, courses, schedule, stats } = context;
      const notes = context.notes || [];
      const sessions = context.sessions || [];
      
      const pendingTasks = tasks?.filter(t => t.status !== 'completed').slice(0, 5).map(t => t.title).join(", ") || "None";
      const recentGrades = grades?.slice(0, 3).map(g => `${g.subject}: ${g.percentage}%`).join(", ") || "None";
      const activeCourses = courses?.map(c => c.name).join(", ") || "General Studies";
      const todaySchedule = schedule?.slice(0, 4).map((entry) => {
        const title = entry.class_name || entry.title || entry.subject || "Class";
        return `${title} (${entry.start_time || "time TBD"})`;
      }).join(", ") || "None";
      const recentNotes = notes?.slice(0, 4).map(n => n.title).join(", ") || "None";
      const recentSessions = sessions?.slice(0, 3).map(s => `${s.subject || "Study"} ${s.duration || 0}m`).join(", ") || "None";
      
      contextStr = `
        CONTEXT DATA:
        - Pending Tasks: ${pendingTasks}
        - Recent Grades: ${recentGrades}
        - Active Courses: ${activeCourses}
        - Today's Timetable: ${todaySchedule}
        - Recent Notes: ${recentNotes}
        - Recent Study Sessions: ${recentSessions}
        - Study Streak: ${stats.studyStreak} days
        - Hours Studied: ${stats.hoursStudied}
      `;
    }

    const systemPrompt = `
      SYSTEM_PROTOCOL: DAILY_BRIEFING
      USER: ${userName}
      ROLE: You are MARGDARSHAK, an AI academic mentor.
      ${contextStr}
      TASK: Generate a concise, motivating morning briefing based on the user's real academic data.
      GUIDELINES:
      - If they have low grades, be encouraging and suggest a focus area.
      - If they have a high streak, congratulate them.
      - If they have many tasks, suggest prioritizing.
      FORMAT: Valid JSON Only. No markdown blocks.
      STRUCTURE: {"greeting":"<Short greeting>","focus_area":"<One specific subject/topic to focus on today>","message":"<2 sentences max advice>","color":"text-emerald-400"}
    `;

    try {
      const briefing = await modelRouter.generateJSON(systemPrompt, {
        tier: 'premium',
      });

      if (!briefing) throw new Error("Invalid JSON from AI");

      return briefing;

    } catch (e) {
      // Graceful fallback so the dashboard doesn't break
      return {
        greeting: `Welcome back, ${userName}`,
        focus_area: "General Review",
        message: "I'm ready to help you organize your studies today.",
        color: "text-indigo-400"
      };
    }
  },

  /**
   * LANDING PAGE - EXPLAIN CONCEPT (Puter.js)
   * Generates a simple academic explanation for the public landing page demo.
   * Uses robust detection for the Puter.js chat function location.
   */
  explainConcept: async (topic: string): Promise<string | null> => {
    try {
      const systemPrompt = `You are an expert tutor named MARGDARSHAK. Explain the following academic concept clearly and concisely, as if for a college student. Use short paragraphs and simple language. Do not use markdown formatting like asterisks for bolding. Concept: ${topic}`;
      return await modelRouter.complete(systemPrompt, { tier: 'premium' });

    } catch (error) {
      console.error("Landing Page AI Error:", error);
      return null;
    }
  },

  // -----------------------------------------------------
  // NEW COURSE MANAGEMENT AI FEATURES ADDED BELOW
  // -----------------------------------------------------

  /**
   * COURSE SYLLABUS GENERATOR
   * Generates a structured syllabus JSON based on a course name and description.
   */
  generateCourseSyllabus: async (courseName: string, level: string): Promise<any> => {
    try {
      const systemPrompt = `
        You are an expert curriculum developer. 
        Create a 4-module syllabus for a course titled "${courseName}" at the "${level}" level.
        Return ONLY valid JSON. No text before or after.
        JSON Structure:
        {
          "modules": [
            {
              "title": "Module Title",
              "lessons": [
                { "title": "Lesson Title", "duration": "45m" },
                { "title": "Lesson Title", "duration": "1h" }
              ]
            }
          ]
        }
      `;

      const syllabus = await modelRouter.generateJSON(systemPrompt, {
        tier: 'premium',
      });
      return syllabus || { modules: [] };
    } catch (e) {
      console.error("AI Syllabus Error", e);
      return { modules: [] };
    }
  },

  /**
   * AI TUTOR FOR COURSE
   * Provides specific advice or explanation for a selected course context.
   */
  askCourseTutor: async (courseName: string, question: string): Promise<string> => {
    try {
      const systemPrompt = `You are an expert tutor for the course "${courseName}". Answer this student question clearly and concisely: "${question}"`;
      return await modelRouter.complete(systemPrompt, { tier: 'premium' });
    } catch (e) {
      return "AI Tutor is currently offline.";
    }
  },

  // -----------------------------------------------------
  // ADVANCED AI LEARNING TOOLS (ACTIVE READING, SRS, VISION, TESTS)
  // -----------------------------------------------------

  /**
   * CHAT WITH DOCUMENT (Active Reading)
   * Answers a question based STRICTLY on the provided document context (RAG).
   */
  chatWithDocument: async (documentContext: string, question: string): Promise<string> => {
    try {
      const systemPrompt = `
        You are an expert academic assistant. Use ONLY the following document excerpt to answer the student's question.
        If the answer is not in the text, politely inform the student that the document does not cover this.
        
        DOCUMENT EXCERPT:
        """
        ${documentContext}
        """
        
        QUESTION: ${question}
      `;
      return await modelRouter.complete(systemPrompt, { tier: 'premium' });
    } catch (e) {
      console.error("Document Chat Error", e);
      return "Sorry, I encountered an error analyzing this document.";
    }
  },

  /**
   * AI FLASHCARD GENERATOR (Spaced Repetition)
   * Extracts key concepts from notes and creates structured flashcards.
   */
  generateFlashcards: async (sourceMaterial: string, count: number = 10): Promise<any> => {
    try {
      const systemPrompt = `
        You are an expert educational AI. Extract exactly ${count} key concepts from the provided material 
        and create high-yield flashcards for a Spaced Repetition System (SRS).
        
        Return ONLY valid JSON.
        JSON Structure:
        {
          "flashcards": [
            { "front": "Question or Concept", "back": "Clear, concise answer or definition" }
          ]
        }
        
        SOURCE MATERIAL:
        ${sourceMaterial}
      `;
      const result = await modelRouter.generateJSON(systemPrompt, { tier: 'premium' });
      return result || { flashcards: [] };
    } catch (e) {
      console.error("Flashcard Gen Error", e);
      return { flashcards: [] };
    }
  },

  /**
   * AI DOUBT SOLVER (Image to Solution)
   * Takes an image URL or Base64 and breaks down the solution step-by-step.
   */
  solveDoubtFromImage: async (imageUrlOrBase64: string, extraContext?: string): Promise<string> => {
    try {
      // Note: This requires a vision-capable model in your modelRouter (e.g., Llama 3.2 Vision, GPT-4o, etc.)
      const messages = [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `You are an expert tutor. Analyze this image of a problem. Break down the solution step-by-step so I can understand the underlying concepts. Do not just give the final answer. ${extraContext ? `\nAdditional context: ${extraContext}` : ""}`
            },
            {
              type: "image_url",
              image_url: { url: imageUrlOrBase64 }
            }
          ]
        }
      ];
      
      // Use a vision-supported model configuration here
      return await modelRouter.chat(messages, { model: "meta-llama/llama-3.2-11b-vision-instruct" });
    } catch (e) {
      console.error("Vision Doubt Solver Error", e);
      return "Sorry, I couldn't process this image. Please ensure the image is clear and try again.";
    }
  },

  /**
   * MOCK TEST GENERATOR
   * Creates a timed MCQ test based on a syllabus topic.
   */
  generateMockTest: async (topic: string, difficulty: string = "medium", count: number = 5): Promise<any> => {
    try {
      const systemPrompt = `
        You are a strict examiner. Generate a ${count}-question Multiple Choice Question (MCQ) test 
        on the topic "${topic}" at a "${difficulty}" difficulty level.
        
        Return ONLY valid JSON.
        JSON Structure:
        {
          "questions": [
            { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Step-by-step reason why A is correct." }
          ]
        }
      `;
      const result = await modelRouter.generateJSON(systemPrompt, { tier: 'premium' });
      return result || { questions: [] };
    } catch (e) {
      console.error("Mock Test Gen Error", e);
      return { questions: [] };
    }
  },
  /**
   * BURNOUT PREDICTOR
   * Analyzes real user stats and provides AI insights on burnout risk.
   */
  predictBurnout: async (stats: any): Promise<any> => {
    try {
      const systemPrompt = `
        You are an empathetic academic AI mentor. Analyze the following student statistics and predict their burnout risk.
        Return ONLY valid JSON.
        JSON Structure:
        {
          "status": "critical" | "warning" | "healthy",
          "score": <number between 0 and 100 representing burnout risk>,
          "message": "<1-2 sentences of observation based on the stats>",
          "action": "<1 specific actionable advice like a break or scheduling tip>"
        }
        
        STUDENT STATS:
        - Daily Study Hours: ${stats.todayStudyTime / 60}
        - Current Streak: ${stats.studyStreak} days
        - In-Progress/Pending Tasks: ${stats.inProgressTasks + stats.pendingTasks}
        - Overdue Tasks: ${stats.overdueTasks}
        - Completion Rate: ${stats.completionRate}%
      `;
      const result = await modelRouter.generateJSON(systemPrompt, { tier: 'premium' });
      return result || null;
    } catch (e) {
      console.error("Burnout Predictor Error", e);
      return null;
    }
  },
};

export default aiService;
