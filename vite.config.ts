import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const FORMATTING_SYSTEM_PROMPT = `You are Margdarshak Saarthi, the elite AI study companion for the Margdarshak Platform.
Your persona: Professional, brilliant, academic, and extremely helpful.
Your identity: Developed exclusively by the Margdarshak Team to assist students with advanced learning and cognitive tasks.

CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Under no circumstances should you output math delimiters like \\(, \\), \\[, \\], or $$, nor should you use backslash commands like \\frac, \\theta, \\sqrt, \\times, or \\cdot.

For all mathematics, physics, equations, and scientific notation, you MUST use plain text, standard Markdown, and Unicode characters.

Variables & Greek Letters: Use standard text or Unicode (e.g., x, y, θ, π, Δ, Σ).

Fractions: Use a forward slash and parentheses for clear grouping (e.g., (m * v^2) / r instead of \\frac{mv^2}{r}).

Exponents & Roots: Use the caret symbol ^ or Unicode superscripts (e.g., v^2 or v²), and use the Unicode square root symbol √ (e.g., √(r * g)).

Multiplication: Use * or simply place variables next to each other (e.g., m * g or mg).

Your output must be 100% human-readable on platforms that do not have any math rendering capabilities. Prioritize extreme clarity in plain text.`;

const SECURITY_SYSTEM_PROMPT = `You are a senior application security advisor for a student platform. You audit a user's account/device snapshot and return concise, actionable, prioritized recommendations.

Strict output rules:
1. Reply with ONLY valid JSON. No prose, no markdown, no code fences, no commentary.
2. Use this exact schema:
{
  "score": <integer 0-100, higher is better>,
  "summary": "<one short sentence>",
  "recommendations": [
    {
      "title": "<short title>",
      "severity": "low" | "medium" | "high" | "critical",
      "description": "<one or two sentences of plain text>",
      "action": "<concrete next step the user can take>"
    }
  ]
}
3. Order recommendations by severity (critical first).
4. Maximum 6 recommendations.
5. Never use LaTeX, MathJax, math delimiters, or backslash math commands.
6. Use plain text and Unicode only. No emojis.
7. Be concrete, calm, and helpful. No alarmism.`;

const MAX_BODY_BYTES = 20 * 1024 * 1024; // 20MB for Vision support
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const buckets = new Map<string, { start: number; count: number }>();

const rateLimit = (key: string) => {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > RATE_WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true };
  }
  b.count += 1;
  if (b.count > RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((b.start + RATE_WINDOW_MS - now) / 1000) };
  }
  return { allowed: true };
};

const isOriginAllowed = (origin: string | null) => {
  if (!origin) return true; // dev tools without origin (e.g. curl) are fine in dev
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (u.hostname.endsWith(".replit.dev")) return true;
    if (u.hostname.endsWith(".replit.app")) return true;
    if (u.hostname.endsWith(".netlify.app")) return true;
    if (u.hostname === "margdarshan.tech" || u.hostname.endsWith(".margdarshan.tech")) return true;
  } catch {
    return false;
  }
  return false;
};

const setCors = (req: any, res: any) => {
  const origin = req.headers.origin || null;
  res.setHeader("Access-Control-Allow-Origin", isOriginAllowed(origin) ? origin || "*" : "null");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
};

type VerifyResult =
  | { ok: true; user: { id: string } }
  | { ok: false; status: number; code: string; message: string };

const verifyUser = async (auth: string | undefined): Promise<VerifyResult> => {
  if (!auth || !/^Bearer\s+/i.test(auth)) {
    return { ok: false, status: 401, code: "no_token", message: "Error: Missing Authentication header (Authorization Bearer token required)" };
  }
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, code: "no_token", message: "Empty bearer token" };

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { ok: false, status: 401, code: "invalid_token", message: "Invalid token format: expected 3 parts" };
    }
    
    let payload;
    try {
      const decoded = Buffer.from(parts[1], 'base64').toString();
      payload = JSON.parse(decoded);
    } catch (e: any) {
      return { ok: false, status: 401, code: "invalid_token", message: "Failed to parse token payload: " + e.message };
    }
    
    if (!payload || !payload.sub) {
      return { ok: false, status: 401, code: "no_user", message: "Token is missing the required 'sub' (user ID) claim" };
    }

    // Success! Return the Clerk user ID.
    return { ok: true, user: { id: payload.sub } };
  } catch (err: any) {
    console.error("[ai] Local verify error", err);
    return { ok: false, status: 401, code: "invalid_token", message: "Security verification failed." };
  }
};

const readBody = (req: any, max = MAX_BODY_BYTES): Promise<string> =>
  new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > max) {
        reject(new Error("BODY_TOO_LARGE"));
        try { req.destroy(); } catch { /* noop */ }
        return;
      }
      body += chunk.toString("utf8");
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const json = (res: any, status: number, payload: any) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const getIp = (req: any): string => {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return (req.socket?.remoteAddress as string) || "unknown";
};

const aiPlugin = (): Plugin => ({
  name: "dev-ai-endpoints",
  configureServer(server) {
    const callOpenRouter = async (body: any, origin: string | null, userApiKey?: string) => {
      // Logic: If user provides a key, use it. Otherwise, use inbuilt if it's elite context.
      const inbuiltKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
      const apiKeyToUse = userApiKey || inbuiltKey;

      if (!apiKeyToUse) return { status: 500, body: { error: "No AI API Key available" } };
      
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKeyToUse}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin || "http://localhost:5000",
          "X-Title": "MARGDARSHAK (Dev)",
        },
        body: JSON.stringify(body),
      });
      const data: any = await upstream.json();
      if (!upstream.ok) {
        const isInvalidKey = upstream.status === 401 || data?.error?.code === 'invalid_api_key' || (typeof data?.error?.message === 'string' && data.error.message.toLowerCase().includes('api key'));
        return { 
          status: upstream.status, 
          body: { 
            error: isInvalidKey ? "🔑 Invalid API Key: The OpenRouter key provided is incorrect or has expired. Please check your settings." : (data?.error?.message || "OpenRouter request failed"),
            code: isInvalidKey ? "INVALID_KEY" : "UPSTREAM_ERROR"
          } 
        };
      }
      return { status: 200, body: data };
    };

    const handle = async (
      req: any,
      res: any,
      kind: "chat" | "image" | "sec",
      handler: (payload: any, origin: string | null, userTier: string, userApiKey?: string) => Promise<{ status: number; body: any }>
    ) => {
      setCors(req, res);
      if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

      const origin = (req.headers.origin as string | undefined) || null;
      if (!isOriginAllowed(origin)) return json(res, 403, { error: "Origin not allowed" });

      const ip = getIp(req);
      const rl = rateLimit(`${kind}:${ip}`);
      if (!rl.allowed) {
        res.setHeader("Retry-After", String(rl.retryAfter || 60));
        return json(res, 429, { error: "Too many requests. Please slow down." });
      }

      const auth = await verifyUser(req.headers.authorization || req.headers.Authorization);
      if (!auth.ok) return json(res, auth.status, { error: auth.message, code: auth.code });

      // Fetch User Tier from Supabase
      let userTier = 'free';
      try {
        const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (supaUrl && supaKey) {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supaUrl, supaKey);
          const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', auth.user.id).single();
          userTier = profile?.subscription_tier || 'free';
        }
      } catch (e) {
        console.error("[ai] Tier check failed:", e);
      }

      // MASTER OVERRIDE: If it's Abhinav Jha, force elite tier in backend
      if (auth.user.id === 'user_3CwM4tADcqKhELg4ZX9r2xIRC4L') {
        userTier = 'premium_elite';
      }

      const userApiKey = (req.headers["x-user-api-key"] as string) || undefined;

      let raw: string;
      try {
        raw = await readBody(req);
      } catch (e: any) {
        if (e?.message === "BODY_TOO_LARGE") return json(res, 413, { error: "Request body too large" });
        return json(res, 400, { error: "Invalid request body" });
      }

      let payload: any;
      try { payload = raw ? JSON.parse(raw) : {}; }
      catch { return json(res, 400, { error: "Invalid JSON body" }); }

      try {
        const { status, body } = await handler(payload, origin, userTier, userApiKey);
        return json(res, status, body);
      } catch (err) {
        console.error(`[${kind}] handler error:`, err);
        return json(res, 502, { error: err instanceof Error ? err.message : "Upstream error" });
      }
    };

    server.middlewares.use("/api/ai-chat", (req, res) =>
      handle(req, res, "chat", async (payload, origin, userTier, userApiKey) => {
        const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite'];
        const isElite = ELITE_TIERS.includes(userTier);

        if (!isElite && !userApiKey) {
          return { status: 403, body: { error: "API Key Required: Your current plan (Premium) requires you to provide your own OpenRouter API key. Inbuilt keys are reserved for Elite members only.", code: "KEY_REQUIRED" } };
        }

        const incoming = Array.isArray(payload?.messages) ? payload.messages : null;
        if (!incoming || incoming.length === 0) return { status: 400, body: { error: "messages[] is required" } };
        if (incoming.length > 60) return { status: 400, body: { error: "Too many messages" } };
        for (const m of incoming) {
          if (!m || typeof m.role !== "string")
            return { status: 400, body: { error: "Each message needs a role" } };
          if (m.content === undefined || m.content === null)
            return { status: 400, body: { error: "Each message needs content" } };
        }
        const messages = incoming[0]?.role === "system"
          ? [{ role: "system", content: `${FORMATTING_SYSTEM_PROMPT}\n\n${incoming[0].content}` }, ...incoming.slice(1)]
          : [{ role: "system", content: FORMATTING_SYSTEM_PROMPT }, ...incoming];

        // Detect intent
        const hasVision = messages.some(m => Array.isArray(m.content) && m.content.some((c: any) => c.type === "image_url"));
        const fullPrompt = messages.map(m => typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" ").toLowerCase();
        const isImageGen = fullPrompt.includes("generate image") || fullPrompt.includes("create image") || fullPrompt.includes("draw me");

        const model = isImageGen
          ? "sourceful/riverflow-v2-pro"
          : (hasVision ? "openai/gpt-4o-mini" : "nvidia/nemotron-3-super-120b-a12b:free");

        const { status, body } = await callOpenRouter(
          { 
            model, 
            messages, 
            reasoning: { enabled: !hasVision && !isImageGen },
            modalities: isImageGen ? ["image"] : undefined
          },
          origin,
          userApiKey
        );
        if (status !== 200) return { status, body };
        
        const choice = body?.choices?.[0]?.message;
        let responseText = choice?.content ?? "";

        // If images were generated, append them to the response text
        if (choice?.images) {
          const imgs = choice.images.map((img: any) => `![Generated Image](${img.image_url.url})`).join("\n\n");
          responseText += `\n\n${imgs}`;
        }

        return {
          status: 200,
          body: {
            response: responseText,
            reasoning_details: choice?.reasoning_details ?? null,
            model,
          },
        };
      })
    );

    server.middlewares.use("/api/ai-image", (req, res) =>
      handle(req, res, "image", async (payload, origin, userTier, userApiKey) => {
        const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite'];
        if (!ELITE_TIERS.includes(userTier) && !userApiKey) {
          return { status: 403, body: { error: "API Key Required for AI Images (Premium plan).", code: "KEY_REQUIRED" } };
        }

        const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
        if (!prompt) return { status: 400, body: { error: "prompt is required" } };
        if (prompt.length > 4000) return { status: 400, body: { error: "prompt is too long" } };
        const { status, body } = await callOpenRouter(
          {
            model: "sourceful/riverflow-v2-pro",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image"],
          },
          origin,
          userApiKey
        );
        if (status !== 200) return { status, body: { error: body?.error?.message || "OpenRouter image request failed" } };
        const message = body?.choices?.[0]?.message;
        const imageUrl = message?.images?.[0]?.image_url?.url ?? null;
        return {
          status: 200,
          body: { image: imageUrl, response: message?.content ?? "", model: "sourceful/riverflow-v2-pro" },
        };
      })
    );

    server.middlewares.use("/api/security-advisor", (req, res) =>
      handle(req, res, "sec", async (payload, origin, userTier, userApiKey) => {
        const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite'];
        if (!ELITE_TIERS.includes(userTier) && !userApiKey) {
          return { status: 403, body: { error: "API Key Required for Security Advisor (Premium plan).", code: "KEY_REQUIRED" } };
        }

        const snapshot = payload?.snapshot;
        if (!snapshot || typeof snapshot !== "object")
          return { status: 400, body: { error: "snapshot object is required" } };
        let snapshotStr = "";
        try { snapshotStr = JSON.stringify(snapshot).slice(0, 6000); }
        catch { return { status: 400, body: { error: "snapshot must be JSON-serialisable" } }; }
        const { status, body } = await callOpenRouter(
          {
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: [
              { role: "system", content: SECURITY_SYSTEM_PROMPT },
              { role: "user", content: `Audit this user/device snapshot and return JSON only:\n${snapshotStr}` },
            ],
          },
          origin,
          userApiKey
        );
        if (status !== 200) return { status, body: { error: body?.error?.message || "OpenRouter request failed" } };
        const content = body?.choices?.[0]?.message?.content || "";
        return { status: 200, body: { raw: content, model: "nvidia/nemotron-3-super-120b-a12b:free" } };
      })
    );
  },
});

export default defineConfig(async ({ mode }) => {
  // Load .env values into process.env so server-side middleware (auth verification,
  // OpenRouter calls, etc.) can read SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY /
  // OPENAI_API_KEY in development. Vite normally only exposes these via
  // import.meta.env to the client.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined && typeof v === "string") {
      process.env[k] = v;
    }
  }
  return {
    base: "/",
    server: {
      host: "0.0.0.0",
      port: 5000,
      allowedHosts: true,
      headers: {
        "Permissions-Policy": "publickey-credentials-create=(self), publickey-credentials-get=(self)",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    plugins: [react(), aiPlugin()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    build: {
      manifest: true,
      emptyOutDir: true,
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
  };
});
