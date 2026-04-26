import { createClient } from '@supabase/supabase-js';
import { OpenRouter } from '@openrouter/sdk';

type Provider = 'sambanova' | 'huggingface' | 'github' | 'pollinations' | 'openrouter';

export interface Env {
  AI: {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SERPER_API_KEY: string;
  SAMBANOVA_API_KEY: string;
  HF_TOKEN: string;
  GITHUB_OPENAI_TOKEN: string;
  OPENROUTER_API_KEY?: string;
  POLLINATIONS_API_KEY?: string;
  POLLINATIONS_TEXT_API_URL?: string;
  POLLINATIONS_IMAGE_API_URL?: string;
  ALLOWED_ORIGINS?: string;
}

type Message = { content: string };
type ParsedPayload = {
  messages: Message[];
  mode: string;
  model?: string;
  imageFile: File | null;
};

const MODEL_CATALOG: Record<string, { provider: Provider; id: string }> = {
  'sambanova-llama': { provider: 'sambanova', id: 'Meta-Llama-3.1-8B-Instruct' },
  'gemma-27b': { provider: 'huggingface', id: 'google/gemma-2-27b-it' },
  'qwen-27b': { provider: 'huggingface', id: 'Qwen/Qwen2.5-32B-Instruct' },
  'github-gpt4o': { provider: 'github', id: 'gpt-4o' },
  'openrouter-nemotron-3-super': { provider: 'openrouter', id: 'nvidia/nemotron-3-super-120b-a12b:free' },
  // Legacy alias retained so previously saved model keys continue to resolve.
  'openrouter-nemotron-3': { provider: 'openrouter', id: 'nvidia/nemotron-3-super-120b-a12b:free' },
  'pollinations-qwen3guard': { provider: 'pollinations', id: 'qwen3-8b' },
  'pollinations-flux-schnell': { provider: 'pollinations', id: 'flux-schnell' },
};

// Models that support the OpenRouter extended `reasoning` parameter.
const OPENROUTER_REASONING_MODELS = new Set([
  'nvidia/nemotron-3-super-120b-a12b:free',
]);

const MAX_QUERY_LENGTH = 8000;
// 2MB body cap limits abuse for oversized JSON/multipart uploads (DoS guardrail).
const MAX_BODY_BYTES = 2_000_000;
const DEFAULT_POLLINATIONS_TEXT_API_URL = 'https://text.pollinations.ai/openai';
const DEFAULT_POLLINATIONS_IMAGE_API_URL = 'https://image.pollinations.ai';
const PRODUCTION_ORIGIN = 'https://margdarshak-ai.netlify.app';

class BadRequestError extends Error {}

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === 'object' && value !== null) return value as Record<string, unknown>;
  return null;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  return 'Unknown error';
};


const parseMessages = (raw: unknown): Message[] => {
  if (!Array.isArray(raw)) return [];
  const parsed = raw
    .map((item) => {
      const obj = toObject(item);
      const content = obj?.content;
      if (typeof content !== 'string') return null;
      const trimmed = content.trim();
      if (!trimmed) return null;
      return { content: trimmed };
    })
    .filter((msg): msg is Message => Boolean(msg));
  return parsed;
};

const parseBody = async (request: Request): Promise<ParsedPayload> => {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  let messages: Message[] = [];
  let mode = 'chat';
  let model: string | undefined;
  let imageFile: File | null = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const rawMessages = formData.get('messages');
    const rawMode = formData.get('mode');
    const rawModel = formData.get('model');
    const rawImage = formData.get('image');
    if (typeof rawMessages === 'string') {
      try {
        messages = parseMessages(JSON.parse(rawMessages));
      } catch {
        throw new BadRequestError('Invalid messages payload.');
      }
    }
    if (typeof rawMode === 'string' && rawMode.trim()) mode = rawMode.trim().toLowerCase();
    if (typeof rawModel === 'string' && rawModel.trim()) model = rawModel.trim();
    if (rawImage instanceof File) imageFile = rawImage;
  } else {
    let body: unknown;
    try {
      body = (await request.json()) as unknown;
    } catch {
      throw new BadRequestError('Invalid JSON body.');
    }
    const bodyObj = toObject(body);
    if (!bodyObj) throw new BadRequestError('Invalid JSON body.');
    const rawMessages = bodyObj.messages;
    const rawMode = bodyObj.mode;
    const rawModel = bodyObj.model;
    if (typeof rawMessages === 'string') {
      try {
        messages = parseMessages(JSON.parse(rawMessages));
      } catch {
        throw new BadRequestError('Invalid messages payload.');
      }
    } else {
      messages = parseMessages(rawMessages);
    }
    if (typeof rawMode === 'string' && rawMode.trim()) mode = rawMode.trim().toLowerCase();
    if (typeof rawModel === 'string' && rawModel.trim()) model = rawModel.trim();
  }

  return { messages, mode, model, imageFile };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || "";
    let allowedOrigin = "https://margdarshak-ai.netlify.app";

    if (origin) {
      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;
        if (
          hostname === "margdarshak-ai.netlify.app" ||
          hostname.endsWith("--margdarshak-ai.netlify.app") ||
          hostname === "localhost"
        ) {
          allowedOrigin = origin;
        }
      } catch (_e) {
        // Invalid URL, use safe default origin.
      }
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    };

    const jsonResponse = (body: Record<string, unknown>, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: corsHeaders });

    // Explicit 200 is intentional to satisfy deploy-preview/browser preflight handling expectations.
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") return jsonResponse({ response: "METHOD_NOT_ALLOWED" }, 405);

    try {
      const contentLength = Number(request.headers.get("content-length") || "0");
      if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        return jsonResponse({ response: "REQUEST_TOO_LARGE" }, 413);
      }

      const userApiKey = request.headers.get("X-User-API-Key");
      const authHeader = request.headers.get("Authorization");

      if (!authHeader) {
        return jsonResponse({ response: "AUTH_REQUIRED" }, 401);
      }

      if (!authHeader.startsWith("Bearer ")) {
        return jsonResponse({ response: "INVALID_AUTH_HEADER" }, 401);
      }

      let parsedPayload: ParsedPayload;
      try {
        parsedPayload = await parseBody(request);
      } catch (error: unknown) {
        if (error instanceof BadRequestError) {
          return jsonResponse({ response: "System Error: Request body format unreadable." }, 400);
        }
        throw error;
      }

      const { messages, mode, model, imageFile } = parsedPayload;
      if (!messages.length) return jsonResponse({ response: "INVALID_MESSAGES" }, 400);

      const rawUserQuery = messages[messages.length - 1].content.trim();
      if (!rawUserQuery) return jsonResponse({ response: "INVALID_QUERY" }, 400);
      if (rawUserQuery.length > MAX_QUERY_LENGTH) {
        return jsonResponse({ response: "QUERY_TOO_LONG" }, 400);
      }

      const selectedModelKey = model && MODEL_CATALOG[model] ? model : 'openrouter-nemotron-3-super';
      const selectedModel = MODEL_CATALOG[selectedModelKey];

      let agentType = "GENERAL";
      let optimizedQuery = rawUserQuery;

      let tier = 'free';
      const isDeepResearch = mode === 'deepsearch' || mode === 'deepresearch';
      const isAdvancedMode = isDeepResearch || mode === 'imagegen' || !!imageFile;

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return jsonResponse({ response: "AUTH_REQUIRED" }, 401);
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (typeof profile?.subscription_tier === 'string' && profile.subscription_tier.trim()) {
        tier = profile.subscription_tier.toLowerCase().trim();
      }

      const VALID_PREMIUM_AI_IDS = [
        'extra_plus',
        'premium_ai',
        'premium_plus',
        'premium+ai',
        'premium + ai'
      ];

      const IS_PREMIUM_AI = VALID_PREMIUM_AI_IDS.includes(tier);

      if (isAdvancedMode && !IS_PREMIUM_AI) {
        return jsonResponse({ response: "UPGRADE_TO_EXTRA" }, 403);
      }

        const resolveProviderKey = (provider: Provider) => {
          if (provider === 'openrouter' && userApiKey) return userApiKey;
          if (!IS_PREMIUM_AI) return null;
          if (provider === 'huggingface') return env.HF_TOKEN;
          if (provider === 'github') return env.GITHUB_OPENAI_TOKEN;
          if (provider === 'openrouter') return env.OPENROUTER_API_KEY || null;
          if (provider === 'pollinations') return env.POLLINATIONS_API_KEY || null;
          return env.SAMBANOVA_API_KEY;
        };

        const providerKey = resolveProviderKey(selectedModel.provider);

        if (!providerKey) {
          return jsonResponse({ response: "KEY_REQUIRED" }, 401);
        }

      async function runOpenRouterModel(
          apiKey: string,
          modelId: string,
          systemPrompt: string,
          userPrompt: string,
          maxTokens = 1000
        ) {
          try {
            const openrouter = new OpenRouter({ apiKey });
            const completion = await openrouter.chat.completions.create({
              model: modelId,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: maxTokens,
              temperature: 0.2,
              ...(OPENROUTER_REASONING_MODELS.has(modelId) ? { reasoning: { enabled: true } } : {}),
            });
            const content = completion.choices?.[0]?.message?.content;
            if (typeof content === 'string') return content;
            if (Array.isArray(content)) {
              const textChunk = content.find((chunk) => {
                const chunkObj = toObject(chunk);
                return typeof chunkObj?.text === 'string';
              });
              const textChunkObj = toObject(textChunk);
              return typeof textChunkObj?.text === 'string' ? textChunkObj.text : '';
            }
            return '';
          } catch (error: unknown) {
            return `CONNECTION ERROR: ${getErrorMessage(error)}`;
          }
        }

      const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i += 8192) {
          const chunk = bytes.subarray(i, i + 8192);
          for (let j = 0; j < chunk.length; j += 1) {
            binary += String.fromCharCode(chunk[j]);
          }
        }
        return btoa(binary);
      };

      const toBodyInit = (value: unknown): BodyInit => {
        if (typeof value === 'string' || value instanceof Blob || value instanceof ReadableStream) {
          return value;
        }
        if (value instanceof URLSearchParams || value instanceof FormData || value instanceof ArrayBuffer) {
          return value;
        }
        if (ArrayBuffer.isView(value)) return value;
        throw new Error('Unsupported AI image response format.');
      };

      async function runSambaNovaModel(
          apiKey: string,
          modelId: string,
          systemPrompt: string,
          userPrompt: string,
          maxTokens = 1000,
          jsonMode = false
        ) {
          try {
            const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({
                model: modelId,
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                temperature: 0.1,
                max_tokens: maxTokens,
                response_format: jsonMode ? { type: "json_object" } : undefined
              })
            });

            if (!response.ok) {
              if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
              if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
              return `SAMBANOVA ERROR (${response.status})`;
            }
            const data = (await response.json()) as unknown;
            const dataObj = toObject(data);
            const choices = Array.isArray(dataObj?.choices) ? dataObj.choices : [];
            const firstChoice = toObject(choices[0]);
            const message = toObject(firstChoice?.message);
            return typeof message?.content === 'string' ? message.content : "";
          } catch (error: unknown) {
            return `CONNECTION ERROR: ${getErrorMessage(error)}`;
          }
        }

      const buildChatPrompt = (systemPrompt: string, userPrompt: string) => {
        return `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`;
      };

      async function runHuggingFaceModel(
          apiKey: string,
          modelId: string,
          systemPrompt: string,
          userPrompt: string,
          maxTokens = 1000
        ) {
          try {
            const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({
                inputs: buildChatPrompt(systemPrompt, userPrompt),
                parameters: {
                  max_new_tokens: maxTokens,
                  temperature: 0.2,
                  return_full_text: false
                }
              })
            });

            if (!response.ok) {
              if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
              if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
              return `HUGGINGFACE ERROR (${response.status})`;
            }
            const data = (await response.json()) as unknown;
            if (Array.isArray(data)) {
              const first = toObject(data[0]);
              return typeof first?.generated_text === 'string' ? first.generated_text : "";
            }
            const dataObj = toObject(data);
            return typeof dataObj?.generated_text === 'string' ? dataObj.generated_text : "";
          } catch (error: unknown) {
            return `CONNECTION ERROR: ${getErrorMessage(error)}`;
          }
        }

      async function runGitHubOpenAIModel(
          apiKey: string,
          modelId: string,
          systemPrompt: string,
          userPrompt: string,
          maxTokens = 1000,
          jsonMode = false
        ) {
          try {
            const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "api-key": apiKey },
              body: JSON.stringify({
                model: modelId,
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                temperature: 0.2,
                max_tokens: maxTokens,
                response_format: jsonMode ? { type: "json_object" } : undefined
              })
            });

            if (!response.ok) {
              if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
              if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
              return `GITHUB OPENAI ERROR (${response.status})`;
            }
            const data = (await response.json()) as unknown;
            const dataObj = toObject(data);
            const choices = Array.isArray(dataObj?.choices) ? dataObj.choices : [];
            const firstChoice = toObject(choices[0]);
            const message = toObject(firstChoice?.message);
            return typeof message?.content === 'string' ? message.content : "";
          } catch (error: unknown) {
            return `CONNECTION ERROR: ${getErrorMessage(error)}`;
          }
        }

      async function runPollinationsModel(
          apiKey: string,
          modelId: string,
          systemPrompt: string,
          userPrompt: string,
          maxTokens = 1000
        ) {
          try {
            const textApiUrl = env.POLLINATIONS_TEXT_API_URL || DEFAULT_POLLINATIONS_TEXT_API_URL;
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };
            if (apiKey?.trim()) {
              headers.Authorization = `Bearer ${apiKey}`;
            }
            const response = await fetch(textApiUrl, {
              method: "POST",
              headers,
              body: JSON.stringify({
                model: modelId,
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                temperature: 0.2,
                max_tokens: maxTokens,
              })
            });

            if (!response.ok) {
              if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
              if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
              return `POLLINATIONS ERROR (${response.status})`;
            }

            const data = (await response.json()) as unknown;
            const dataObj = toObject(data);
            const choices = Array.isArray(dataObj?.choices) ? dataObj.choices : [];
            const firstChoice = toObject(choices[0]);
            const message = toObject(firstChoice?.message);
            return typeof message?.content === 'string' ? message.content : "";
          } catch (error: unknown) {
            return `CONNECTION ERROR: ${getErrorMessage(error)}`;
          }
        }

      async function runChatModel(options: {
          provider: Provider;
          modelId: string;
          apiKey: string;
          systemPrompt: string;
          userPrompt: string;
          maxTokens?: number;
          jsonMode?: boolean;
        }) {
          const { provider, modelId, apiKey, systemPrompt, userPrompt, maxTokens = 1000, jsonMode = false } = options;
          if (provider === 'sambanova') {
            return runSambaNovaModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens, jsonMode);
          }
          if (provider === 'huggingface') {
            return runHuggingFaceModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens);
          }
          if (provider === 'pollinations') {
            return runPollinationsModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens);
          }
          if (provider === 'openrouter') {
            return runOpenRouterModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens);
          }
          return runGitHubOpenAIModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens, jsonMode);
        }

      const generateImage = async (prompt: string, modelId = "flux-schnell") => {
          const imageKey = resolveProviderKey('pollinations');
          const styledPrompt = `${prompt}, scientific diagram, textbook style, white background`;

          if (imageKey) {
            const imageApiBase = env.POLLINATIONS_IMAGE_API_URL || DEFAULT_POLLINATIONS_IMAGE_API_URL;
            const query = new URLSearchParams({
              model: modelId,
              prompt: styledPrompt,
              nologo: "true",
            });
            const url = `${imageApiBase}/?${query.toString()}`;
            const response = await fetch(url, {
              method: "GET",
              headers: { Authorization: `Bearer ${imageKey}` }
            });

            if (!response.ok) {
              throw new Error(`Pollinations image error (${response.status})`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
          }

        const imgResponse = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
          prompt: styledPrompt,
          num_steps: 4
        });
        const arrayBuffer = await new Response(toBodyInit(imgResponse)).arrayBuffer();
          return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
      };

      if (mode !== 'imagegen') {
          const routerConfig = { provider: selectedModel.provider, modelId: selectedModel.id, apiKey: providerKey };

          const planStr = await runChatModel({
            ...routerConfig,
            systemPrompt: `Router: Classify (PHYSICS/CHEMISTRY/MATH/BIOLOGY/GENERAL). Output JSON: {"agent": "...", "optimized_query": "..."}`,
            userPrompt: rawUserQuery,
            maxTokens: 150,
            jsonMode: true
          });
          try {
            const plan = toObject(JSON.parse(planStr));
            if (typeof plan?.agent === 'string' && plan.agent.trim()) agentType = plan.agent.trim();
            if (typeof plan?.optimized_query === 'string' && plan.optimized_query.trim()) {
              optimizedQuery = plan.optimized_query.trim().slice(0, MAX_QUERY_LENGTH);
            }
          } catch {
            // Fallback to default routing values.
          }
        }

      let visionContext = "";
      if (imageFile) {
          const imageArrayBuffer = await imageFile.arrayBuffer();
          const visionResult = await env.AI.run("@cf/llava-1.5-7b-hf", {
            image: [...new Uint8Array(imageArrayBuffer)],
            prompt: "Extract all text and diagrams.",
          });
          const visionObj = toObject(visionResult);
          const description = typeof visionObj?.description === 'string' ? visionObj.description : '';
          visionContext = description ? `[VISUAL DATA]: ${description}` : '';
        }

      let pdfContext = "";
      let webContext = "";
      if (mode !== 'imagegen') {
          const embeddings = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [optimizedQuery] });
          const embeddingsObj = toObject(embeddings);
          const embeddingsData = Array.isArray(embeddingsObj?.data) ? embeddingsObj.data : [];
          const firstEmbedding = embeddingsData[0];
          if (!Array.isArray(firstEmbedding)) {
            return jsonResponse({ response: "EMBEDDING_ERROR" }, 500);
          }

          const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
            global: { headers: authHeader ? { Authorization: authHeader } : undefined }
          });

          const { data: vaultChunks } = await supabase.rpc('match_pcmb_knowledge', {
            query_embedding: firstEmbedding,
            match_threshold: 0.25,
            match_count: 6
          });
          pdfContext = (vaultChunks || [])
            .map((chunk) => {
              const chunkObj = toObject(chunk);
              return typeof chunkObj?.content === 'string' ? `[Vault]: ${chunkObj.content}` : null;
            })
            .filter((chunk): chunk is string => Boolean(chunk))
            .join("\n\n");

          if (isDeepResearch) {
            const searchRes = await fetch("https://google.serper.dev/search", {
              method: "POST",
              headers: { "X-API-KEY": env.SERPER_API_KEY, "Content-Type": "application/json" },
              body: JSON.stringify({ q: optimizedQuery, gl: "in" })
            });
            if (searchRes.ok) {
              const searchData = (await searchRes.json()) as unknown;
              const searchObj = toObject(searchData);
              const organic = Array.isArray(searchObj?.organic) ? searchObj.organic : [];
              webContext = organic
                .slice(0, 3)
                .map((entry) => {
                  const entryObj = toObject(entry);
                  return typeof entryObj?.snippet === 'string' ? `[Web]: ${entryObj.snippet}` : null;
                })
                .filter((entry): entry is string => Boolean(entry))
                .join("\n");
            }
          }
        }

      let generatedImgBase64: string | null = null;
      let finalAnswer = "Visual generated.";

      if (mode === 'imagegen' || /draw|diagram|image/i.test(rawUserQuery)) {
        try {
          const imageModelId = selectedModel.provider === 'pollinations' ? selectedModel.id : 'flux-schnell';
          generatedImgBase64 = await generateImage(optimizedQuery, imageModelId);
        } catch (imgError: unknown) {
          finalAnswer = `Visual gen failed: ${getErrorMessage(imgError)}`;
        }
      }

      if (mode !== 'imagegen') {
        const VISUAL_INSTRUCTION = `
         - Visuals: Use 

[Image of X]
 ONLY if contextually useful.
         - LaTeX: Use $...$ for inline, $$...$$ for block math.
         - Citation: Cite [Vault] if used.
         `;
        const masterPrompt = `ACT AS: ${agentType} AGENT.\n${VISUAL_INSTRUCTION}\nCONTEXT:\n${pdfContext}\n${webContext}\n${visionContext}\nINSTRUCTIONS:\nAnswer "${optimizedQuery}".`;
        finalAnswer = await runChatModel({
          provider: selectedModel.provider,
          modelId: selectedModel.id,
          apiKey: providerKey,
          systemPrompt: masterPrompt,
          userPrompt: optimizedQuery,
          maxTokens: 2000
        });
      }

      return jsonResponse({
        response: finalAnswer,
        image: generatedImgBase64,
        agent: agentType
      });
    } catch {
      return jsonResponse({ response: "System Critical Error." }, 500);
    }
  },
};
