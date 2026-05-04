import { getConfiguredAIGatewayUrl } from './constants';

/**
 * UNIVERSAL MODEL ROUTER (Pollinations.ai Edition)
 * -----------------------------------------------
 * This router has been migrated to use Pollinations.ai with Gemini 2.5 Flash Lite
 * as the primary intelligence engine for the entire platform.
 */

const POLLINATIONS_API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY || "";
const UNIVERSAL_MODEL = "gemini-fast";

export interface RouterOptions {
  task?: string;
  tier?: string;
  jsonMode?: boolean;
  model?: string;
  mode?: 'chat' | 'imagegen';
  imageFile?: File | null;
}

/**
 * Universal Pollinations Caller
 */
const callPollinations = async (messages: any[], options: RouterOptions): Promise<string> => {
  try {
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: options.model || UNIVERSAL_MODEL,
        jsonMode: options.jsonMode,
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    
    if (!response.ok) throw new Error(`Pollinations API Error: ${response.status}`);
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Pollinations Router Failure:", error);
    return "AI system is currently re-routing. Please try again in a moment.";
  }
};

export const modelRouter = {
  chat: async (
    messages: Array<{ role: string; content: string }>,
    options: RouterOptions = {}
  ): Promise<string> => {
    return callPollinations(messages, options);
  },

  complete: async (prompt: string, options: RouterOptions = {}): Promise<string> => {
    return modelRouter.chat([{ role: 'user', content: prompt }], options);
  },

  generateJSON: async <T = any>(prompt: string, options: RouterOptions = {}): Promise<T | null> => {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only.`;
    const raw = await modelRouter.complete(jsonPrompt, { ...options, jsonMode: true });
    
    try {
      // Basic cleaning for JSON
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) return null;
      return JSON.parse(raw.substring(start, end + 1)) as T;
    } catch (e) {
      console.error("JSON Parse Error in Router", e);
      return null;
    }
  }
};

export default modelRouter;
