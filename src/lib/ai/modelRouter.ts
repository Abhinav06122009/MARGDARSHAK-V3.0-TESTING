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
const PREMIUM_TEXT_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

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

  // Local testing bypass - Enhanced with real OpenRouter linkage
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('webcontainer')) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      try {
        const modelToUse = options.model || (options.tier === 'premium' ? PREMIUM_TEXT_MODEL : DEFAULT_TEXT_MODEL);
        
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://margdarshak.ai',
            'X-Title': 'Margdarshak AI Orchestrator',
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: payload,
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`OpenRouter Error (${res.status}): ${errorText}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (e: any) {
        console.error("OpenRouter API error:", e);
        throw new Error(`AI Linkage Failed: ${e.message}`);
      }
    }
  }

  const { authedFetch, readErrorMessage } = await import('@/lib/ai/authedFetch');
  const res = await authedFetch('/api/ai-chat', {
    method: 'POST',
    body: JSON.stringify({ messages: payload }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const data = await res.json().catch(() => ({}));
  return typeof data?.response === 'string' ? data.response : '';
};

const callGateway = async (messages: any[], options: RouterOptions): Promise<string> => {
  const hasImage = options.imageFile instanceof File;

  // Local testing bypass for images
  if (hasImage && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      try {
        // Convert File to Base64
        const fileToBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        };
        const base64Image = await fileToBase64(options.imageFile as File);
        
        // Construct vision payload
        const visionMessages = messages.map(msg => {
          if (msg.role === 'user') {
            return {
              role: 'user',
              content: [
                { type: 'text', text: msg.content },
                { type: 'image_url', image_url: { url: base64Image } }
              ]
            };
          }
          return msg;
        });

        const payload = options.systemPrompt
          ? [{ role: 'system', content: options.systemPrompt }, ...visionMessages]
          : visionMessages;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Margdarshak Local Vision Test',
          },
          body: JSON.stringify({
            model: options.model || 'google/gemini-2.5-flash',
            messages: payload,
          }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Local OpenRouter Vision request failed (${res.status}): ${errorText}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (e: any) {
        console.error("Local testing API error:", e);
        throw new Error(`Local OpenRouter Vision error: ${e.message}. Please check your API key in .env`);
      }
    }
  }

  // Text-only requests use our own secure backend endpoint that calls
  // OpenRouter (NVIDIA Nemotron 3) using the server-side OPENAI_API_KEY.
  if (!hasImage) {
    return callBackendChat(messages, options);
  }

  if (!AI_GATEWAY_URL) {
    throw new Error(AI_GATEWAY_NOT_CONFIGURED_MESSAGE);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Please sign in to use AI features.');
  }

  const payload = options.systemPrompt
    ? [{ role: 'system', content: options.systemPrompt }, ...messages]
    : messages;

  const mode = options.mode || (options.task === 'research' ? 'deepresearch' : 'chat');
  const model = options.model || DEFAULT_TEXT_MODEL;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`,
  };

  if (options.userApiKey?.trim()) {
    headers['X-User-API-Key'] = options.userApiKey.trim();
  }

  let res: Response;

  if (hasImage) {
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('model', model);
    formData.append('messages', JSON.stringify(payload));
    formData.append('image', options.imageFile as File);
    res = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers,
      body: formData,
    });
  } else {
    res = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        model,
        messages: payload,
      }),
    });
  }

  if (!res.ok) {
    throw new Error(`AI service request failed (${res.status}).`);
  }

  const data = await res.json();
  const response = data?.response;
  const knownError = mapResponseCodeToError(response);
  if (knownError) {
    throw new Error(knownError);
  }

  if (typeof response === 'string') return response;
  return JSON.stringify(data ?? {});
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

    return null;
  },
};

export default modelRouter;
