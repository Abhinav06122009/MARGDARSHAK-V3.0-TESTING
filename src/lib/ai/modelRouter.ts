import { type TaskType } from './modelConfig';
import cacheService from './cacheService';
import { supabase } from '@/integrations/supabase/client';
import { AI_GATEWAY_NOT_CONFIGURED_MESSAGE, getConfiguredAIGatewayUrl } from './constants';

export interface RouterOptions {
  task?: TaskType;
  tier?: string;
  userApiKey?: string;
  systemPrompt?: string;
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  jsonMode?: boolean;
  model?: string;
  mode?: 'chat' | 'deepresearch' | 'imagegen';
  imageFile?: File | null;
}

const AI_GATEWAY_URL = getConfiguredAIGatewayUrl();
const DEFAULT_TEXT_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';
const DOUBT_IMAGE_MODEL = 'google/gemini-1.5-flash'; // Google AI Studio based
const ELITE_TEXT_MODEL = 'nvidia/nemotron-4-340b-instruct'; // Top-tier Nemotron for elite

/**
 * Maps backend gateway response codes to user-facing errors.
 * Expected codes are returned by the configured AI gateway in the `response` field.
 */
const mapResponseCodeToError = (code: unknown) => {
  switch (code) {
    case 'AUTH_REQUIRED':
      return 'Please sign in to use AI features.';
    case 'UPGRADE_TO_EXTRA':
      return 'This AI feature requires an upgraded plan.';
    case 'KEY_REQUIRED':
      return 'An API key is required to continue.';
    case 'ORIGIN_NOT_ALLOWED':
      return 'This app origin is not authorized for AI access.';
    default:
      return null;
  }
};

const callBackendChat = async (messages: any[], options: RouterOptions): Promise<string> => {
  const payload = options.systemPrompt
    ? [{ role: 'system', content: options.systemPrompt }, ...messages]
    : messages;

  // All AI requests must go through the secure backend gateway.
  // We no longer allow client-side OpenRouter calls to prevent API key leakage.

  const { authedFetch, readErrorMessage } = await import('@/lib/ai/authedFetch');
  
  const isElite = options.tier === 'premium_elite' || options.tier === 'extra_plus' || options.tier === 'premium_plus';
  const isPremium = options.tier === 'premium' || isElite;

  // ROUTING LOGIC:
  // 1. Doubt Solver (research) and vision tasks ALWAYS use Google Gemini
  // 2. All other tasks use Nemotron (Nemotron 4 for elite, Nemotron 3 for others)
  const isDoubtOrVision = options.task === 'research' || options.mode === 'deepresearch' || options.imageFile instanceof File || options.jsonMode === true;
  
  const modelToUse = options.model || (
    isDoubtOrVision ? DOUBT_IMAGE_MODEL : 
    (isElite ? ELITE_TEXT_MODEL : DEFAULT_TEXT_MODEL)
  );

  const res = await authedFetch('/.netlify/functions/neuro-engine', {
    method: 'POST',
    body: JSON.stringify({ 
      messages: payload,
      model: modelToUse,
      task: options.task,
      jsonMode: options.jsonMode
    }),
  });
  if (!res.ok) {
    const errorMsg = await readErrorMessage(res);
    const rawBody = await res.clone().text().catch(() => '');
    console.error(`[AI-CHAT-DEBUG] Error: ${errorMsg} | Body: ${rawBody.substring(0, 100)}`);
    throw new Error(errorMsg);
  }
  const data = await res.json().catch(() => ({}));
  return typeof data?.response === 'string' ? data.response : '';
};

const callGateway = async (messages: any[], options: RouterOptions): Promise<string> => {
  const hasImage = options.imageFile instanceof File;

  // Text-only AND Image requests are now strictly proxied through the Netlify backend.
  // This provides a unified, secure path for all AI tasks.
  if (!hasImage) {
    return callBackendChat(messages, options);
  }

  // IMAGE HANDLING (Vision)
  const { authedFetch, readErrorMessage } = await import('@/lib/ai/authedFetch');
  
  const mode = options.mode || (options.task === 'research' ? 'deepresearch' : 'chat');
  const isDoubtOrVision = options.task === 'research' || mode === 'deepresearch' || hasImage;
  const model = options.model || (isDoubtOrVision ? DOUBT_IMAGE_MODEL : DEFAULT_TEXT_MODEL);

  // Convert File to Base64 for the proxy
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(options.imageFile as File);
  });
  const base64 = await base64Promise;

  const visionMessages = [
    ...messages,
    {
      role: 'user',
      content: [
        { type: "text", text: messages[messages.length - 1]?.content || "Analyze this image." },
        { type: "image_url", image_url: { url: base64 } }
      ]
    }
  ];

  // Remove the last plain text message if we just combined it with the image
  if (messages[messages.length - 1]?.role === 'user' && typeof messages[messages.length - 1]?.content === 'string') {
    visionMessages.splice(visionMessages.length - 2, 1);
  }

  const res = await authedFetch('/.netlify/functions/neuro-engine', {
    method: 'POST',
    body: JSON.stringify({ 
      messages: visionMessages,
      model: model,
      task: options.task
    }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  const data = await res.json();
  return typeof data?.response === 'string' ? data.response : JSON.stringify(data);
};

export const modelRouter = {
  chat: async (
    messages: Array<{ role: string; content: string }>,
    options: RouterOptions = {}
  ): Promise<string> => {
    const { useCache = false, cacheKey, cacheTtl } = options;

    if (useCache && cacheKey) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    let result: string;

    try {
      result = await callGateway(messages, options);
    } catch (error: any) {
      throw new Error(`AI request failed: ${error.message}`);
    }

    if (useCache && cacheKey && result) {
      cacheService.set(cacheKey, result, cacheTtl);
    }

    return result;
  },

  complete: async (prompt: string, options: RouterOptions = {}): Promise<string> => {
    return modelRouter.chat([{ role: 'user', content: prompt }], options);
  },

  generateJSON: async <T = any>(prompt: string, options: RouterOptions = {}): Promise<T | null> => {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown fences, no commentary, no explanation outside the JSON.`;
    const raw = await modelRouter.complete(jsonPrompt, { ...options, jsonMode: true });

    // Strip code fences if the model wrapped output in ```json ... ```
    let text = raw.trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) text = fence[1].trim();

    const tryParse = (s: string): T | null => {
      try { return JSON.parse(s) as T; } catch { return null; }
    };

    // 1) Direct parse
    const direct = tryParse(text);
    if (direct !== null) return direct;

    // 2) Choose the outermost JSON value (array or object), whichever starts first.
    const objStart = text.indexOf('{');
    const arrStart = text.indexOf('[');
    let start = -1;
    let openCh = '';
    let closeCh = '';
    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      start = arrStart; openCh = '['; closeCh = ']';
    } else if (objStart !== -1) {
      start = objStart; openCh = '{'; closeCh = '}';
    }

    if (start !== -1) {
      // Walk forward tracking string state and depth to find the matching close.
      let depth = 0;
      let inString = false;
      let escape = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (inString) {
          if (escape) escape = false;
          else if (ch === '\\') escape = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') { inString = true; continue; }
        if (ch === openCh) depth++;
        else if (ch === closeCh) {
          depth--;
          if (depth === 0) {
            const slice = text.substring(start, i + 1);
            const parsed = tryParse(slice);
            if (parsed !== null) return parsed;
            break;
          }
        }
      }

      // Fallback: greedy lastIndexOf for the matching close character.
      const end = text.lastIndexOf(closeCh);
      if (end > start) {
        const parsed = tryParse(text.substring(start, end + 1));
        if (parsed !== null) return parsed;
      }
    }

    console.error('[JSON-PARSE-ERROR] Raw output snippet:', text.substring(0, 200));
    throw new Error("AI output was not in a valid JSON format. This usually happens when the source text is too complex or the model adds commentary. Please try again with a shorter snippet.");
  },
};

export default modelRouter;
