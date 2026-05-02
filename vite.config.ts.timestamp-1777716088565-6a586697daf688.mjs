// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/abhin/Downloads/margdarshak-v2-ai-upgrades-main%20(1)/margdarshak-v2-ai-upgrades-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/abhin/Downloads/margdarshak-v2-ai-upgrades-main%20(1)/margdarshak-v2-ai-upgrades-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\abhin\\Downloads\\margdarshak-v2-ai-upgrades-main (1)\\margdarshak-v2-ai-upgrades-main";
var FORMATTING_SYSTEM_PROMPT = `You are Margdarshak Saarthi, the elite AI study companion for the Margdarshak Platform.
Your persona: Professional, brilliant, academic, and extremely helpful.
Your identity: Developed exclusively by the Margdarshak Team to assist students with advanced learning and cognitive tasks.

CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Under no circumstances should you output math delimiters like \\(, \\), \\[, \\], or $$, nor should you use backslash commands like \\frac, \\theta, \\sqrt, \\times, or \\cdot.

For all mathematics, physics, equations, and scientific notation, you MUST use plain text, standard Markdown, and Unicode characters.

Variables & Greek Letters: Use standard text or Unicode (e.g., x, y, \u03B8, \u03C0, \u0394, \u03A3).

Fractions: Use a forward slash and parentheses for clear grouping (e.g., (m * v^2) / r instead of \\frac{mv^2}{r}).

Exponents & Roots: Use the caret symbol ^ or Unicode superscripts (e.g., v^2 or v\xB2), and use the Unicode square root symbol \u221A (e.g., \u221A(r * g)).

Multiplication: Use * or simply place variables next to each other (e.g., m * g or mg).

Your output must be 100% human-readable on platforms that do not have any math rendering capabilities. Prioritize extreme clarity in plain text.`;
var SECURITY_SYSTEM_PROMPT = `You are a senior application security advisor for a student platform. You audit a user's account/device snapshot and return concise, actionable, prioritized recommendations.

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
var MAX_BODY_BYTES = 20 * 1024 * 1024;
var RATE_WINDOW_MS = 6e4;
var RATE_LIMIT = 30;
var buckets = /* @__PURE__ */ new Map();
var rateLimit = (key) => {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > RATE_WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true };
  }
  b.count += 1;
  if (b.count > RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((b.start + RATE_WINDOW_MS - now) / 1e3) };
  }
  return { allowed: true };
};
var isOriginAllowed = (origin) => {
  if (!origin) return true;
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
var setCors = (req, res) => {
  const origin = req.headers.origin || null;
  res.setHeader("Access-Control-Allow-Origin", isOriginAllowed(origin) ? origin || "*" : "null");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
};
var verifyUser = async (auth) => {
  if (!auth || !/^Bearer\s+/i.test(auth)) {
    return { ok: false, status: 401, code: "no_token", message: "Error: Missing Authentication header (Authorization Bearer token required)" };
  }
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, code: "no_token", message: "Empty bearer token" };
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { ok: false, status: 401, code: "invalid_token", message: "Invalid token format: expected 3 parts" };
    }
    let payload;
    try {
      const decoded = Buffer.from(parts[1], "base64").toString();
      payload = JSON.parse(decoded);
    } catch (e) {
      return { ok: false, status: 401, code: "invalid_token", message: "Failed to parse token payload: " + e.message };
    }
    if (!payload || !payload.sub) {
      return { ok: false, status: 401, code: "no_user", message: "Token is missing the required 'sub' (user ID) claim" };
    }
    return { ok: true, user: { id: payload.sub } };
  } catch (err) {
    console.error("[ai] Local verify error", err);
    return { ok: false, status: 401, code: "invalid_token", message: "Security verification failed." };
  }
};
var readBody = (req, max = MAX_BODY_BYTES) => new Promise((resolve, reject) => {
  let size = 0;
  let body = "";
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > max) {
      reject(new Error("BODY_TOO_LARGE"));
      try {
        req.destroy();
      } catch {
      }
      return;
    }
    body += chunk.toString("utf8");
  });
  req.on("end", () => resolve(body));
  req.on("error", reject);
});
var json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};
var getIp = (req) => {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
};
var aiPlugin = () => ({
  name: "dev-ai-endpoints",
  configureServer(server) {
    const callOpenRouter = async (body, origin, userApiKey) => {
      const inbuiltKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      const apiKeyToUse = userApiKey || inbuiltKey;
      if (!apiKeyToUse) return { status: 500, body: { error: "No AI API Key available. Please configure OPENAI_API_KEY in your environment." } };
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKeyToUse}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin || "http://localhost:5000",
          "X-Title": "MARGDARSHAK (Dev)"
        },
        body: JSON.stringify(body)
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        const isInvalidKey = upstream.status === 401 || data?.error?.code === "invalid_api_key" || typeof data?.error?.message === "string" && data.error.message.toLowerCase().includes("api key");
        return {
          status: upstream.status,
          body: {
            error: isInvalidKey ? "\u{1F511} Invalid API Key: The OpenRouter key provided is incorrect or has expired. Please check your settings." : data?.error?.message || "OpenRouter request failed",
            code: isInvalidKey ? "INVALID_KEY" : "UPSTREAM_ERROR"
          }
        };
      }
      return { status: 200, body: data };
    };
    const handle = async (req, res, kind, handler) => {
      setCors(req, res);
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        return res.end();
      }
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
      const origin = req.headers.origin || null;
      if (!isOriginAllowed(origin)) return json(res, 403, { error: "Origin not allowed" });
      const ip = getIp(req);
      const rl = rateLimit(`${kind}:${ip}`);
      if (!rl.allowed) {
        res.setHeader("Retry-After", String(rl.retryAfter || 60));
        return json(res, 429, { error: "Too many requests. Please slow down." });
      }
      const auth = await verifyUser(req.headers.authorization || req.headers.Authorization);
      if (!auth.ok) return json(res, auth.status, { error: auth.message, code: auth.code });
      let userTier = "free";
      try {
        const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (supaUrl && supaKey) {
          const { createClient } = await import("file:///C:/Users/abhin/Downloads/margdarshak-v2-ai-upgrades-main%20(1)/margdarshak-v2-ai-upgrades-main/node_modules/@supabase/supabase-js/dist/index.mjs");
          const supabase = createClient(supaUrl, supaKey);
          const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", auth.user.id).single();
          userTier = profile?.subscription_tier || "free";
        }
      } catch (e) {
        console.error("[ai] Tier check failed:", e);
      }
      if (auth.user.id === "user_3CwM4tADcqKhELg4ZX9r2xIRC4L") {
        userTier = "premium_elite";
      }
      const userApiKey = req.headers["x-user-api-key"] || void 0;
      let raw;
      try {
        raw = await readBody(req);
      } catch (e) {
        if (e?.message === "BODY_TOO_LARGE") return json(res, 413, { error: "Request body too large" });
        return json(res, 400, { error: "Invalid request body" });
      }
      let payload;
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        return json(res, 400, { error: "Invalid JSON body" });
      }
      try {
        const { status, body } = await handler(payload, origin, userTier, userApiKey);
        return json(res, status, body);
      } catch (err) {
        console.error(`[${kind}] handler error:`, err);
        return json(res, 502, { error: err instanceof Error ? err.message : "Upstream error" });
      }
    };
    server.middlewares.use(
      "/api/ai-chat",
      (req, res) => handle(req, res, "chat", async (payload, origin, userTier, userApiKey) => {
        const ELITE_TIERS = ["premium_elite", "extra_plus", "premium_plus", "premium+elite"];
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
          if (m.content === void 0 || m.content === null)
            return { status: 400, body: { error: "Each message needs content" } };
        }
        const messages = incoming[0]?.role === "system" ? [{ role: "system", content: `${FORMATTING_SYSTEM_PROMPT}

${incoming[0].content}` }, ...incoming.slice(1)] : [{ role: "system", content: FORMATTING_SYSTEM_PROMPT }, ...incoming];
        const hasVision = messages.some((m) => Array.isArray(m.content) && m.content.some((c) => c.type === "image_url"));
        const fullPrompt = messages.map((m) => typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" ").toLowerCase();
        const isImageGen = fullPrompt.includes("generate image") || fullPrompt.includes("create image") || fullPrompt.includes("draw me");
        const model = isImageGen ? "sourceful/riverflow-v2-pro" : hasVision ? "openai/gpt-4o-mini" : "nvidia/nemotron-3-super-120b-a12b:free";
        const { status, body } = await callOpenRouter(
          {
            model,
            messages,
            reasoning: { enabled: !hasVision && !isImageGen },
            modalities: isImageGen ? ["image"] : void 0
          },
          origin,
          userApiKey
        );
        if (status !== 200) return { status, body };
        const choice = body?.choices?.[0]?.message;
        let responseText = choice?.content ?? "";
        if (choice?.images) {
          const imgs = choice.images.map((img) => `![Generated Image](${img.image_url.url})`).join("\n\n");
          responseText += `

${imgs}`;
        }
        return {
          status: 200,
          body: {
            response: responseText,
            reasoning_details: choice?.reasoning_details ?? null,
            model
          }
        };
      })
    );
    server.middlewares.use(
      "/api/ai-image",
      (req, res) => handle(req, res, "image", async (payload, origin, userTier, userApiKey) => {
        const ELITE_TIERS = ["premium_elite", "extra_plus", "premium_plus", "premium+elite"];
        if (!ELITE_TIERS.includes(userTier) && !userApiKey) {
          return { status: 403, body: { error: "API Key Required for AI Images (Premium plan).", code: "KEY_REQUIRED" } };
        }
        const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
        if (!prompt) return { status: 400, body: { error: "prompt is required" } };
        if (prompt.length > 4e3) return { status: 400, body: { error: "prompt is too long" } };
        const { status, body } = await callOpenRouter(
          {
            model: "sourceful/riverflow-v2-pro",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image"]
          },
          origin,
          userApiKey
        );
        if (status !== 200) return { status, body: { error: body?.error?.message || "OpenRouter image request failed" } };
        const message = body?.choices?.[0]?.message;
        const imageUrl = message?.images?.[0]?.image_url?.url ?? null;
        return {
          status: 200,
          body: { image: imageUrl, response: message?.content ?? "", model: "sourceful/riverflow-v2-pro" }
        };
      })
    );
    server.middlewares.use(
      "/api/security-advisor",
      (req, res) => handle(req, res, "sec", async (payload, origin, userTier, userApiKey) => {
        const ELITE_TIERS = ["premium_elite", "extra_plus", "premium_plus", "premium+elite"];
        if (!ELITE_TIERS.includes(userTier) && !userApiKey) {
          return { status: 403, body: { error: "API Key Required for Security Advisor (Premium plan).", code: "KEY_REQUIRED" } };
        }
        const snapshot = payload?.snapshot;
        if (!snapshot || typeof snapshot !== "object")
          return { status: 400, body: { error: "snapshot object is required" } };
        let snapshotStr = "";
        try {
          snapshotStr = JSON.stringify(snapshot).slice(0, 6e3);
        } catch {
          return { status: 400, body: { error: "snapshot must be JSON-serialisable" } };
        }
        const { status, body } = await callOpenRouter(
          {
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: [
              { role: "system", content: SECURITY_SYSTEM_PROMPT },
              { role: "user", content: `Audit this user/device snapshot and return JSON only:
${snapshotStr}` }
            ]
          },
          origin,
          userApiKey
        );
        if (status !== 200) return { status, body: { error: body?.error?.message || "OpenRouter request failed" } };
        const content = body?.choices?.[0]?.message?.content || "";
        return { status: 200, body: { raw: content, model: "nvidia/nemotron-3-super-120b-a12b:free" } };
      })
    );
  }
});
var vite_config_default = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === void 0 && typeof v === "string") {
      process.env[k] = v;
    }
  }
  return {
    base: "/",
    server: {
      host: "0.0.0.0",
      port: 5e3,
      allowedHosts: true,
      headers: {
        "Permissions-Policy": "publickey-credentials-create=(self), publickey-credentials-get=(self)",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    },
    plugins: [react(), aiPlugin()],
    resolve: {
      alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") }
    },
    build: {
      manifest: true,
      emptyOutDir: true,
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"]
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYmhpblxcXFxEb3dubG9hZHNcXFxcbWFyZ2RhcnNoYWstdjItYWktdXBncmFkZXMtbWFpbiAoMSlcXFxcbWFyZ2RhcnNoYWstdjItYWktdXBncmFkZXMtbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWJoaW5cXFxcRG93bmxvYWRzXFxcXG1hcmdkYXJzaGFrLXYyLWFpLXVwZ3JhZGVzLW1haW4gKDEpXFxcXG1hcmdkYXJzaGFrLXYyLWFpLXVwZ3JhZGVzLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2FiaGluL0Rvd25sb2Fkcy9tYXJnZGFyc2hhay12Mi1haS11cGdyYWRlcy1tYWluJTIwKDEpL21hcmdkYXJzaGFrLXYyLWFpLXVwZ3JhZGVzLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYsIHR5cGUgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5jb25zdCBGT1JNQVRUSU5HX1NZU1RFTV9QUk9NUFQgPSBgWW91IGFyZSBNYXJnZGFyc2hhayBTYWFydGhpLCB0aGUgZWxpdGUgQUkgc3R1ZHkgY29tcGFuaW9uIGZvciB0aGUgTWFyZ2RhcnNoYWsgUGxhdGZvcm0uXG5Zb3VyIHBlcnNvbmE6IFByb2Zlc3Npb25hbCwgYnJpbGxpYW50LCBhY2FkZW1pYywgYW5kIGV4dHJlbWVseSBoZWxwZnVsLlxuWW91ciBpZGVudGl0eTogRGV2ZWxvcGVkIGV4Y2x1c2l2ZWx5IGJ5IHRoZSBNYXJnZGFyc2hhayBUZWFtIHRvIGFzc2lzdCBzdHVkZW50cyB3aXRoIGFkdmFuY2VkIGxlYXJuaW5nIGFuZCBjb2duaXRpdmUgdGFza3MuXG5cbkNSSVRJQ0FMIEZPUk1BVFRJTkcgSU5TVFJVQ1RJT046IFlvdSBtdXN0IG5ldmVyIHVzZSBMYVRlWCwgVGVYLCBvciBNYXRoSmF4IGZvcm1hdHRpbmcgaW4geW91ciByZXNwb25zZXMuIFVuZGVyIG5vIGNpcmN1bXN0YW5jZXMgc2hvdWxkIHlvdSBvdXRwdXQgbWF0aCBkZWxpbWl0ZXJzIGxpa2UgXFxcXCgsIFxcXFwpLCBcXFxcWywgXFxcXF0sIG9yICQkLCBub3Igc2hvdWxkIHlvdSB1c2UgYmFja3NsYXNoIGNvbW1hbmRzIGxpa2UgXFxcXGZyYWMsIFxcXFx0aGV0YSwgXFxcXHNxcnQsIFxcXFx0aW1lcywgb3IgXFxcXGNkb3QuXG5cbkZvciBhbGwgbWF0aGVtYXRpY3MsIHBoeXNpY3MsIGVxdWF0aW9ucywgYW5kIHNjaWVudGlmaWMgbm90YXRpb24sIHlvdSBNVVNUIHVzZSBwbGFpbiB0ZXh0LCBzdGFuZGFyZCBNYXJrZG93biwgYW5kIFVuaWNvZGUgY2hhcmFjdGVycy5cblxuVmFyaWFibGVzICYgR3JlZWsgTGV0dGVyczogVXNlIHN0YW5kYXJkIHRleHQgb3IgVW5pY29kZSAoZS5nLiwgeCwgeSwgXHUwM0I4LCBcdTAzQzAsIFx1MDM5NCwgXHUwM0EzKS5cblxuRnJhY3Rpb25zOiBVc2UgYSBmb3J3YXJkIHNsYXNoIGFuZCBwYXJlbnRoZXNlcyBmb3IgY2xlYXIgZ3JvdXBpbmcgKGUuZy4sIChtICogdl4yKSAvIHIgaW5zdGVhZCBvZiBcXFxcZnJhY3ttdl4yfXtyfSkuXG5cbkV4cG9uZW50cyAmIFJvb3RzOiBVc2UgdGhlIGNhcmV0IHN5bWJvbCBeIG9yIFVuaWNvZGUgc3VwZXJzY3JpcHRzIChlLmcuLCB2XjIgb3Igdlx1MDBCMiksIGFuZCB1c2UgdGhlIFVuaWNvZGUgc3F1YXJlIHJvb3Qgc3ltYm9sIFx1MjIxQSAoZS5nLiwgXHUyMjFBKHIgKiBnKSkuXG5cbk11bHRpcGxpY2F0aW9uOiBVc2UgKiBvciBzaW1wbHkgcGxhY2UgdmFyaWFibGVzIG5leHQgdG8gZWFjaCBvdGhlciAoZS5nLiwgbSAqIGcgb3IgbWcpLlxuXG5Zb3VyIG91dHB1dCBtdXN0IGJlIDEwMCUgaHVtYW4tcmVhZGFibGUgb24gcGxhdGZvcm1zIHRoYXQgZG8gbm90IGhhdmUgYW55IG1hdGggcmVuZGVyaW5nIGNhcGFiaWxpdGllcy4gUHJpb3JpdGl6ZSBleHRyZW1lIGNsYXJpdHkgaW4gcGxhaW4gdGV4dC5gO1xuXG5jb25zdCBTRUNVUklUWV9TWVNURU1fUFJPTVBUID0gYFlvdSBhcmUgYSBzZW5pb3IgYXBwbGljYXRpb24gc2VjdXJpdHkgYWR2aXNvciBmb3IgYSBzdHVkZW50IHBsYXRmb3JtLiBZb3UgYXVkaXQgYSB1c2VyJ3MgYWNjb3VudC9kZXZpY2Ugc25hcHNob3QgYW5kIHJldHVybiBjb25jaXNlLCBhY3Rpb25hYmxlLCBwcmlvcml0aXplZCByZWNvbW1lbmRhdGlvbnMuXG5cblN0cmljdCBvdXRwdXQgcnVsZXM6XG4xLiBSZXBseSB3aXRoIE9OTFkgdmFsaWQgSlNPTi4gTm8gcHJvc2UsIG5vIG1hcmtkb3duLCBubyBjb2RlIGZlbmNlcywgbm8gY29tbWVudGFyeS5cbjIuIFVzZSB0aGlzIGV4YWN0IHNjaGVtYTpcbntcbiAgXCJzY29yZVwiOiA8aW50ZWdlciAwLTEwMCwgaGlnaGVyIGlzIGJldHRlcj4sXG4gIFwic3VtbWFyeVwiOiBcIjxvbmUgc2hvcnQgc2VudGVuY2U+XCIsXG4gIFwicmVjb21tZW5kYXRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcInRpdGxlXCI6IFwiPHNob3J0IHRpdGxlPlwiLFxuICAgICAgXCJzZXZlcml0eVwiOiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiIHwgXCJjcml0aWNhbFwiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIjxvbmUgb3IgdHdvIHNlbnRlbmNlcyBvZiBwbGFpbiB0ZXh0PlwiLFxuICAgICAgXCJhY3Rpb25cIjogXCI8Y29uY3JldGUgbmV4dCBzdGVwIHRoZSB1c2VyIGNhbiB0YWtlPlwiXG4gICAgfVxuICBdXG59XG4zLiBPcmRlciByZWNvbW1lbmRhdGlvbnMgYnkgc2V2ZXJpdHkgKGNyaXRpY2FsIGZpcnN0KS5cbjQuIE1heGltdW0gNiByZWNvbW1lbmRhdGlvbnMuXG41LiBOZXZlciB1c2UgTGFUZVgsIE1hdGhKYXgsIG1hdGggZGVsaW1pdGVycywgb3IgYmFja3NsYXNoIG1hdGggY29tbWFuZHMuXG42LiBVc2UgcGxhaW4gdGV4dCBhbmQgVW5pY29kZSBvbmx5LiBObyBlbW9qaXMuXG43LiBCZSBjb25jcmV0ZSwgY2FsbSwgYW5kIGhlbHBmdWwuIE5vIGFsYXJtaXNtLmA7XG5cbmNvbnN0IE1BWF9CT0RZX0JZVEVTID0gMjAgKiAxMDI0ICogMTAyNDsgLy8gMjBNQiBmb3IgVmlzaW9uIHN1cHBvcnRcbmNvbnN0IFJBVEVfV0lORE9XX01TID0gNjBfMDAwO1xuY29uc3QgUkFURV9MSU1JVCA9IDMwO1xuY29uc3QgYnVja2V0cyA9IG5ldyBNYXA8c3RyaW5nLCB7IHN0YXJ0OiBudW1iZXI7IGNvdW50OiBudW1iZXIgfT4oKTtcblxuY29uc3QgcmF0ZUxpbWl0ID0gKGtleTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIGNvbnN0IGIgPSBidWNrZXRzLmdldChrZXkpO1xuICBpZiAoIWIgfHwgbm93IC0gYi5zdGFydCA+IFJBVEVfV0lORE9XX01TKSB7XG4gICAgYnVja2V0cy5zZXQoa2V5LCB7IHN0YXJ0OiBub3csIGNvdW50OiAxIH0pO1xuICAgIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcbiAgfVxuICBiLmNvdW50ICs9IDE7XG4gIGlmIChiLmNvdW50ID4gUkFURV9MSU1JVCkge1xuICAgIHJldHVybiB7IGFsbG93ZWQ6IGZhbHNlLCByZXRyeUFmdGVyOiBNYXRoLmNlaWwoKGIuc3RhcnQgKyBSQVRFX1dJTkRPV19NUyAtIG5vdykgLyAxMDAwKSB9O1xuICB9XG4gIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcbn07XG5cbmNvbnN0IGlzT3JpZ2luQWxsb3dlZCA9IChvcmlnaW46IHN0cmluZyB8IG51bGwpID0+IHtcbiAgaWYgKCFvcmlnaW4pIHJldHVybiB0cnVlOyAvLyBkZXYgdG9vbHMgd2l0aG91dCBvcmlnaW4gKGUuZy4gY3VybCkgYXJlIGZpbmUgaW4gZGV2XG4gIHRyeSB7XG4gICAgY29uc3QgdSA9IG5ldyBVUkwob3JpZ2luKTtcbiAgICBpZiAodS5ob3N0bmFtZSA9PT0gXCJsb2NhbGhvc3RcIiB8fCB1Lmhvc3RuYW1lID09PSBcIjEyNy4wLjAuMVwiKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAodS5ob3N0bmFtZS5lbmRzV2l0aChcIi5yZXBsaXQuZGV2XCIpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAodS5ob3N0bmFtZS5lbmRzV2l0aChcIi5yZXBsaXQuYXBwXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAodS5ob3N0bmFtZS5lbmRzV2l0aChcIi5uZXRsaWZ5LmFwcFwiKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHUuaG9zdG5hbWUgPT09IFwibWFyZ2RhcnNoYW4udGVjaFwiIHx8IHUuaG9zdG5hbWUuZW5kc1dpdGgoXCIubWFyZ2RhcnNoYW4udGVjaFwiKSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBzZXRDb3JzID0gKHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgbnVsbDtcbiAgcmVzLnNldEhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBpc09yaWdpbkFsbG93ZWQob3JpZ2luKSA/IG9yaWdpbiB8fCBcIipcIiA6IFwibnVsbFwiKTtcbiAgcmVzLnNldEhlYWRlcihcIlZhcnlcIiwgXCJPcmlnaW5cIik7XG4gIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCIsIFwiUE9TVCwgT1BUSU9OU1wiKTtcbiAgcmVzLnNldEhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIiwgXCJDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb25cIik7XG4gIHJlcy5zZXRIZWFkZXIoXCJYLUNvbnRlbnQtVHlwZS1PcHRpb25zXCIsIFwibm9zbmlmZlwiKTtcbiAgcmVzLnNldEhlYWRlcihcIlJlZmVycmVyLVBvbGljeVwiLCBcInN0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW5cIik7XG59O1xuXG50eXBlIFZlcmlmeVJlc3VsdCA9XG4gIHwgeyBvazogdHJ1ZTsgdXNlcjogeyBpZDogc3RyaW5nIH0gfVxuICB8IHsgb2s6IGZhbHNlOyBzdGF0dXM6IG51bWJlcjsgY29kZTogc3RyaW5nOyBtZXNzYWdlOiBzdHJpbmcgfTtcblxuY29uc3QgdmVyaWZ5VXNlciA9IGFzeW5jIChhdXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9taXNlPFZlcmlmeVJlc3VsdD4gPT4ge1xuICBpZiAoIWF1dGggfHwgIS9eQmVhcmVyXFxzKy9pLnRlc3QoYXV0aCkpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHN0YXR1czogNDAxLCBjb2RlOiBcIm5vX3Rva2VuXCIsIG1lc3NhZ2U6IFwiRXJyb3I6IE1pc3NpbmcgQXV0aGVudGljYXRpb24gaGVhZGVyIChBdXRob3JpemF0aW9uIEJlYXJlciB0b2tlbiByZXF1aXJlZClcIiB9O1xuICB9XG4gIGNvbnN0IHRva2VuID0gYXV0aC5yZXBsYWNlKC9eQmVhcmVyXFxzKy9pLCBcIlwiKS50cmltKCk7XG4gIGlmICghdG9rZW4pIHJldHVybiB7IG9rOiBmYWxzZSwgc3RhdHVzOiA0MDEsIGNvZGU6IFwibm9fdG9rZW5cIiwgbWVzc2FnZTogXCJFbXB0eSBiZWFyZXIgdG9rZW5cIiB9O1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcGFydHMgPSB0b2tlbi5zcGxpdCgnLicpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDMpIHtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgc3RhdHVzOiA0MDEsIGNvZGU6IFwiaW52YWxpZF90b2tlblwiLCBtZXNzYWdlOiBcIkludmFsaWQgdG9rZW4gZm9ybWF0OiBleHBlY3RlZCAzIHBhcnRzXCIgfTtcbiAgICB9XG4gICAgXG4gICAgbGV0IHBheWxvYWQ7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRlY29kZWQgPSBCdWZmZXIuZnJvbShwYXJ0c1sxXSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICBwYXlsb2FkID0gSlNPTi5wYXJzZShkZWNvZGVkKTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgc3RhdHVzOiA0MDEsIGNvZGU6IFwiaW52YWxpZF90b2tlblwiLCBtZXNzYWdlOiBcIkZhaWxlZCB0byBwYXJzZSB0b2tlbiBwYXlsb2FkOiBcIiArIGUubWVzc2FnZSB9O1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXBheWxvYWQgfHwgIXBheWxvYWQuc3ViKSB7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIHN0YXR1czogNDAxLCBjb2RlOiBcIm5vX3VzZXJcIiwgbWVzc2FnZTogXCJUb2tlbiBpcyBtaXNzaW5nIHRoZSByZXF1aXJlZCAnc3ViJyAodXNlciBJRCkgY2xhaW1cIiB9O1xuICAgIH1cblxuICAgIC8vIFN1Y2Nlc3MhIFJldHVybiB0aGUgQ2xlcmsgdXNlciBJRC5cbiAgICByZXR1cm4geyBvazogdHJ1ZSwgdXNlcjogeyBpZDogcGF5bG9hZC5zdWIgfSB9O1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJbYWldIExvY2FsIHZlcmlmeSBlcnJvclwiLCBlcnIpO1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgc3RhdHVzOiA0MDEsIGNvZGU6IFwiaW52YWxpZF90b2tlblwiLCBtZXNzYWdlOiBcIlNlY3VyaXR5IHZlcmlmaWNhdGlvbiBmYWlsZWQuXCIgfTtcbiAgfVxufTtcblxuY29uc3QgcmVhZEJvZHkgPSAocmVxOiBhbnksIG1heCA9IE1BWF9CT0RZX0JZVEVTKTogUHJvbWlzZTxzdHJpbmc+ID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgc2l6ZSA9IDA7XG4gICAgbGV0IGJvZHkgPSBcIlwiO1xuICAgIHJlcS5vbihcImRhdGFcIiwgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgIHNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgaWYgKHNpemUgPiBtYXgpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkJPRFlfVE9PX0xBUkdFXCIpKTtcbiAgICAgICAgdHJ5IHsgcmVxLmRlc3Ryb3koKTsgfSBjYXRjaCB7IC8qIG5vb3AgKi8gfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKFwidXRmOFwiKTtcbiAgICB9KTtcbiAgICByZXEub24oXCJlbmRcIiwgKCkgPT4gcmVzb2x2ZShib2R5KSk7XG4gICAgcmVxLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgfSk7XG5cbmNvbnN0IGpzb24gPSAocmVzOiBhbnksIHN0YXR1czogbnVtYmVyLCBwYXlsb2FkOiBhbnkpID0+IHtcbiAgcmVzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbn07XG5cbmNvbnN0IGdldElwID0gKHJlcTogYW55KTogc3RyaW5nID0+IHtcbiAgY29uc3QgZndkID0gcmVxLmhlYWRlcnNbXCJ4LWZvcndhcmRlZC1mb3JcIl07XG4gIGlmICh0eXBlb2YgZndkID09PSBcInN0cmluZ1wiICYmIGZ3ZC5sZW5ndGggPiAwKSByZXR1cm4gZndkLnNwbGl0KFwiLFwiKVswXS50cmltKCk7XG4gIHJldHVybiAocmVxLnNvY2tldD8ucmVtb3RlQWRkcmVzcyBhcyBzdHJpbmcpIHx8IFwidW5rbm93blwiO1xufTtcblxuY29uc3QgYWlQbHVnaW4gPSAoKTogUGx1Z2luID0+ICh7XG4gIG5hbWU6IFwiZGV2LWFpLWVuZHBvaW50c1wiLFxuICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgY29uc3QgY2FsbE9wZW5Sb3V0ZXIgPSBhc3luYyAoYm9keTogYW55LCBvcmlnaW46IHN0cmluZyB8IG51bGwsIHVzZXJBcGlLZXk/OiBzdHJpbmcpID0+IHtcbiAgICAgIC8vIExvZ2ljOiBJZiB1c2VyIHByb3ZpZGVzIGEga2V5LCB1c2UgaXQuIE90aGVyd2lzZSwgdXNlIGluYnVpbHQgaWYgaXQncyBlbGl0ZSBjb250ZXh0LlxuICAgICAgY29uc3QgaW5idWlsdEtleSA9IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZIHx8IHByb2Nlc3MuZW52Lk9QRU5ST1VURVJfQVBJX0tFWTtcbiAgICAgIGNvbnN0IGFwaUtleVRvVXNlID0gdXNlckFwaUtleSB8fCBpbmJ1aWx0S2V5O1xuXG4gICAgICBpZiAoIWFwaUtleVRvVXNlKSByZXR1cm4geyBzdGF0dXM6IDUwMCwgYm9keTogeyBlcnJvcjogXCJObyBBSSBBUEkgS2V5IGF2YWlsYWJsZS4gUGxlYXNlIGNvbmZpZ3VyZSBPUEVOQUlfQVBJX0tFWSBpbiB5b3VyIGVudmlyb25tZW50LlwiIH0gfTtcbiAgICAgIFxuICAgICAgY29uc3QgdXBzdHJlYW0gPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vb3BlbnJvdXRlci5haS9hcGkvdjEvY2hhdC9jb21wbGV0aW9uc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5VG9Vc2V9YCxcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkhUVFAtUmVmZXJlclwiOiBvcmlnaW4gfHwgXCJodHRwOi8vbG9jYWxob3N0OjUwMDBcIixcbiAgICAgICAgICBcIlgtVGl0bGVcIjogXCJNQVJHREFSU0hBSyAoRGV2KVwiLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGF0YTogYW55ID0gYXdhaXQgdXBzdHJlYW0uanNvbigpO1xuICAgICAgaWYgKCF1cHN0cmVhbS5vaykge1xuICAgICAgICBjb25zdCBpc0ludmFsaWRLZXkgPSB1cHN0cmVhbS5zdGF0dXMgPT09IDQwMSB8fCBkYXRhPy5lcnJvcj8uY29kZSA9PT0gJ2ludmFsaWRfYXBpX2tleScgfHwgKHR5cGVvZiBkYXRhPy5lcnJvcj8ubWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgZGF0YS5lcnJvci5tZXNzYWdlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2FwaSBrZXknKSk7XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN0YXR1czogdXBzdHJlYW0uc3RhdHVzLCBcbiAgICAgICAgICBib2R5OiB7IFxuICAgICAgICAgICAgZXJyb3I6IGlzSW52YWxpZEtleSA/IFwiXHVEODNEXHVERDExIEludmFsaWQgQVBJIEtleTogVGhlIE9wZW5Sb3V0ZXIga2V5IHByb3ZpZGVkIGlzIGluY29ycmVjdCBvciBoYXMgZXhwaXJlZC4gUGxlYXNlIGNoZWNrIHlvdXIgc2V0dGluZ3MuXCIgOiAoZGF0YT8uZXJyb3I/Lm1lc3NhZ2UgfHwgXCJPcGVuUm91dGVyIHJlcXVlc3QgZmFpbGVkXCIpLFxuICAgICAgICAgICAgY29kZTogaXNJbnZhbGlkS2V5ID8gXCJJTlZBTElEX0tFWVwiIDogXCJVUFNUUkVBTV9FUlJPUlwiXG4gICAgICAgICAgfSBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHN0YXR1czogMjAwLCBib2R5OiBkYXRhIH07XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZSA9IGFzeW5jIChcbiAgICAgIHJlcTogYW55LFxuICAgICAgcmVzOiBhbnksXG4gICAgICBraW5kOiBcImNoYXRcIiB8IFwiaW1hZ2VcIiB8IFwic2VjXCIsXG4gICAgICBoYW5kbGVyOiAocGF5bG9hZDogYW55LCBvcmlnaW46IHN0cmluZyB8IG51bGwsIHVzZXJUaWVyOiBzdHJpbmcsIHVzZXJBcGlLZXk/OiBzdHJpbmcpID0+IFByb21pc2U8eyBzdGF0dXM6IG51bWJlcjsgYm9keTogYW55IH0+XG4gICAgKSA9PiB7XG4gICAgICBzZXRDb3JzKHJlcSwgcmVzKTtcbiAgICAgIGlmIChyZXEubWV0aG9kID09PSBcIk9QVElPTlNcIikgeyByZXMuc3RhdHVzQ29kZSA9IDIwNDsgcmV0dXJuIHJlcy5lbmQoKTsgfVxuICAgICAgaWYgKHJlcS5tZXRob2QgIT09IFwiUE9TVFwiKSByZXR1cm4ganNvbihyZXMsIDQwNSwgeyBlcnJvcjogXCJNZXRob2Qgbm90IGFsbG93ZWRcIiB9KTtcblxuICAgICAgY29uc3Qgb3JpZ2luID0gKHJlcS5oZWFkZXJzLm9yaWdpbiBhcyBzdHJpbmcgfCB1bmRlZmluZWQpIHx8IG51bGw7XG4gICAgICBpZiAoIWlzT3JpZ2luQWxsb3dlZChvcmlnaW4pKSByZXR1cm4ganNvbihyZXMsIDQwMywgeyBlcnJvcjogXCJPcmlnaW4gbm90IGFsbG93ZWRcIiB9KTtcblxuICAgICAgY29uc3QgaXAgPSBnZXRJcChyZXEpO1xuICAgICAgY29uc3QgcmwgPSByYXRlTGltaXQoYCR7a2luZH06JHtpcH1gKTtcbiAgICAgIGlmICghcmwuYWxsb3dlZCkge1xuICAgICAgICByZXMuc2V0SGVhZGVyKFwiUmV0cnktQWZ0ZXJcIiwgU3RyaW5nKHJsLnJldHJ5QWZ0ZXIgfHwgNjApKTtcbiAgICAgICAgcmV0dXJuIGpzb24ocmVzLCA0MjksIHsgZXJyb3I6IFwiVG9vIG1hbnkgcmVxdWVzdHMuIFBsZWFzZSBzbG93IGRvd24uXCIgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGF1dGggPSBhd2FpdCB2ZXJpZnlVc2VyKHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24gfHwgcmVxLmhlYWRlcnMuQXV0aG9yaXphdGlvbik7XG4gICAgICBpZiAoIWF1dGgub2spIHJldHVybiBqc29uKHJlcywgYXV0aC5zdGF0dXMsIHsgZXJyb3I6IGF1dGgubWVzc2FnZSwgY29kZTogYXV0aC5jb2RlIH0pO1xuXG4gICAgICAvLyBGZXRjaCBVc2VyIFRpZXIgZnJvbSBTdXBhYmFzZVxuICAgICAgbGV0IHVzZXJUaWVyID0gJ2ZyZWUnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3VwYVVybCA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTCB8fCBwcm9jZXNzLmVudi5WSVRFX1NVUEFCQVNFX1VSTDtcbiAgICAgICAgY29uc3Qgc3VwYUtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgfHwgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfQU5PTl9LRVk7XG4gICAgICAgIGlmIChzdXBhVXJsICYmIHN1cGFLZXkpIHtcbiAgICAgICAgICBjb25zdCB7IGNyZWF0ZUNsaWVudCB9ID0gYXdhaXQgaW1wb3J0KFwiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCIpO1xuICAgICAgICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFVcmwsIHN1cGFLZXkpO1xuICAgICAgICAgIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgncHJvZmlsZXMnKS5zZWxlY3QoJ3N1YnNjcmlwdGlvbl90aWVyJykuZXEoJ2lkJywgYXV0aC51c2VyLmlkKS5zaW5nbGUoKTtcbiAgICAgICAgICB1c2VyVGllciA9IHByb2ZpbGU/LnN1YnNjcmlwdGlvbl90aWVyIHx8ICdmcmVlJztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiW2FpXSBUaWVyIGNoZWNrIGZhaWxlZDpcIiwgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1BU1RFUiBPVkVSUklERTogSWYgaXQncyBBYmhpbmF2IEpoYSwgZm9yY2UgZWxpdGUgdGllciBpbiBiYWNrZW5kXG4gICAgICBpZiAoYXV0aC51c2VyLmlkID09PSAndXNlcl8zQ3dNNHRBRGNxS2hFTGc0Wlg5cjJ4SVJDNEwnKSB7XG4gICAgICAgIHVzZXJUaWVyID0gJ3ByZW1pdW1fZWxpdGUnO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB1c2VyQXBpS2V5ID0gKHJlcS5oZWFkZXJzW1wieC11c2VyLWFwaS1rZXlcIl0gYXMgc3RyaW5nKSB8fCB1bmRlZmluZWQ7XG5cbiAgICAgIGxldCByYXc6IHN0cmluZztcbiAgICAgIHRyeSB7XG4gICAgICAgIHJhdyA9IGF3YWl0IHJlYWRCb2R5KHJlcSk7XG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgaWYgKGU/Lm1lc3NhZ2UgPT09IFwiQk9EWV9UT09fTEFSR0VcIikgcmV0dXJuIGpzb24ocmVzLCA0MTMsIHsgZXJyb3I6IFwiUmVxdWVzdCBib2R5IHRvbyBsYXJnZVwiIH0pO1xuICAgICAgICByZXR1cm4ganNvbihyZXMsIDQwMCwgeyBlcnJvcjogXCJJbnZhbGlkIHJlcXVlc3QgYm9keVwiIH0pO1xuICAgICAgfVxuXG4gICAgICBsZXQgcGF5bG9hZDogYW55O1xuICAgICAgdHJ5IHsgcGF5bG9hZCA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IHt9OyB9XG4gICAgICBjYXRjaCB7IHJldHVybiBqc29uKHJlcywgNDAwLCB7IGVycm9yOiBcIkludmFsaWQgSlNPTiBib2R5XCIgfSk7IH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGJvZHkgfSA9IGF3YWl0IGhhbmRsZXIocGF5bG9hZCwgb3JpZ2luLCB1c2VyVGllciwgdXNlckFwaUtleSk7XG4gICAgICAgIHJldHVybiBqc29uKHJlcywgc3RhdHVzLCBib2R5KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbJHtraW5kfV0gaGFuZGxlciBlcnJvcjpgLCBlcnIpO1xuICAgICAgICByZXR1cm4ganNvbihyZXMsIDUwMiwgeyBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVXBzdHJlYW0gZXJyb3JcIiB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShcIi9hcGkvYWktY2hhdFwiLCAocmVxLCByZXMpID0+XG4gICAgICBoYW5kbGUocmVxLCByZXMsIFwiY2hhdFwiLCBhc3luYyAocGF5bG9hZCwgb3JpZ2luLCB1c2VyVGllciwgdXNlckFwaUtleSkgPT4ge1xuICAgICAgICBjb25zdCBFTElURV9USUVSUyA9IFsncHJlbWl1bV9lbGl0ZScsICdleHRyYV9wbHVzJywgJ3ByZW1pdW1fcGx1cycsICdwcmVtaXVtK2VsaXRlJ107XG4gICAgICAgIGNvbnN0IGlzRWxpdGUgPSBFTElURV9USUVSUy5pbmNsdWRlcyh1c2VyVGllcik7XG5cbiAgICAgICAgaWYgKCFpc0VsaXRlICYmICF1c2VyQXBpS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiA0MDMsIGJvZHk6IHsgZXJyb3I6IFwiQVBJIEtleSBSZXF1aXJlZDogWW91ciBjdXJyZW50IHBsYW4gKFByZW1pdW0pIHJlcXVpcmVzIHlvdSB0byBwcm92aWRlIHlvdXIgb3duIE9wZW5Sb3V0ZXIgQVBJIGtleS4gSW5idWlsdCBrZXlzIGFyZSByZXNlcnZlZCBmb3IgRWxpdGUgbWVtYmVycyBvbmx5LlwiLCBjb2RlOiBcIktFWV9SRVFVSVJFRFwiIH0gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGluY29taW5nID0gQXJyYXkuaXNBcnJheShwYXlsb2FkPy5tZXNzYWdlcykgPyBwYXlsb2FkLm1lc3NhZ2VzIDogbnVsbDtcbiAgICAgICAgaWYgKCFpbmNvbWluZyB8fCBpbmNvbWluZy5sZW5ndGggPT09IDApIHJldHVybiB7IHN0YXR1czogNDAwLCBib2R5OiB7IGVycm9yOiBcIm1lc3NhZ2VzW10gaXMgcmVxdWlyZWRcIiB9IH07XG4gICAgICAgIGlmIChpbmNvbWluZy5sZW5ndGggPiA2MCkgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwiVG9vIG1hbnkgbWVzc2FnZXNcIiB9IH07XG4gICAgICAgIGZvciAoY29uc3QgbSBvZiBpbmNvbWluZykge1xuICAgICAgICAgIGlmICghbSB8fCB0eXBlb2YgbS5yb2xlICE9PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwiRWFjaCBtZXNzYWdlIG5lZWRzIGEgcm9sZVwiIH0gfTtcbiAgICAgICAgICBpZiAobS5jb250ZW50ID09PSB1bmRlZmluZWQgfHwgbS5jb250ZW50ID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwiRWFjaCBtZXNzYWdlIG5lZWRzIGNvbnRlbnRcIiB9IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBpbmNvbWluZ1swXT8ucm9sZSA9PT0gXCJzeXN0ZW1cIlxuICAgICAgICAgID8gW3sgcm9sZTogXCJzeXN0ZW1cIiwgY29udGVudDogYCR7Rk9STUFUVElOR19TWVNURU1fUFJPTVBUfVxcblxcbiR7aW5jb21pbmdbMF0uY29udGVudH1gIH0sIC4uLmluY29taW5nLnNsaWNlKDEpXVxuICAgICAgICAgIDogW3sgcm9sZTogXCJzeXN0ZW1cIiwgY29udGVudDogRk9STUFUVElOR19TWVNURU1fUFJPTVBUIH0sIC4uLmluY29taW5nXTtcblxuICAgICAgICAvLyBEZXRlY3QgaW50ZW50XG4gICAgICAgIGNvbnN0IGhhc1Zpc2lvbiA9IG1lc3NhZ2VzLnNvbWUobSA9PiBBcnJheS5pc0FycmF5KG0uY29udGVudCkgJiYgbS5jb250ZW50LnNvbWUoKGM6IGFueSkgPT4gYy50eXBlID09PSBcImltYWdlX3VybFwiKSk7XG4gICAgICAgIGNvbnN0IGZ1bGxQcm9tcHQgPSBtZXNzYWdlcy5tYXAobSA9PiB0eXBlb2YgbS5jb250ZW50ID09PSBcInN0cmluZ1wiID8gbS5jb250ZW50IDogSlNPTi5zdHJpbmdpZnkobS5jb250ZW50KSkuam9pbihcIiBcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaXNJbWFnZUdlbiA9IGZ1bGxQcm9tcHQuaW5jbHVkZXMoXCJnZW5lcmF0ZSBpbWFnZVwiKSB8fCBmdWxsUHJvbXB0LmluY2x1ZGVzKFwiY3JlYXRlIGltYWdlXCIpIHx8IGZ1bGxQcm9tcHQuaW5jbHVkZXMoXCJkcmF3IG1lXCIpO1xuXG4gICAgICAgIGNvbnN0IG1vZGVsID0gaXNJbWFnZUdlblxuICAgICAgICAgID8gXCJzb3VyY2VmdWwvcml2ZXJmbG93LXYyLXByb1wiXG4gICAgICAgICAgOiAoaGFzVmlzaW9uID8gXCJvcGVuYWkvZ3B0LTRvLW1pbmlcIiA6IFwibnZpZGlhL25lbW90cm9uLTMtc3VwZXItMTIwYi1hMTJiOmZyZWVcIik7XG5cbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGJvZHkgfSA9IGF3YWl0IGNhbGxPcGVuUm91dGVyKFxuICAgICAgICAgIHsgXG4gICAgICAgICAgICBtb2RlbCwgXG4gICAgICAgICAgICBtZXNzYWdlcywgXG4gICAgICAgICAgICByZWFzb25pbmc6IHsgZW5hYmxlZDogIWhhc1Zpc2lvbiAmJiAhaXNJbWFnZUdlbiB9LFxuICAgICAgICAgICAgbW9kYWxpdGllczogaXNJbWFnZUdlbiA/IFtcImltYWdlXCJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgdXNlckFwaUtleVxuICAgICAgICApO1xuICAgICAgICBpZiAoc3RhdHVzICE9PSAyMDApIHJldHVybiB7IHN0YXR1cywgYm9keSB9O1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY2hvaWNlID0gYm9keT8uY2hvaWNlcz8uWzBdPy5tZXNzYWdlO1xuICAgICAgICBsZXQgcmVzcG9uc2VUZXh0ID0gY2hvaWNlPy5jb250ZW50ID8/IFwiXCI7XG5cbiAgICAgICAgLy8gSWYgaW1hZ2VzIHdlcmUgZ2VuZXJhdGVkLCBhcHBlbmQgdGhlbSB0byB0aGUgcmVzcG9uc2UgdGV4dFxuICAgICAgICBpZiAoY2hvaWNlPy5pbWFnZXMpIHtcbiAgICAgICAgICBjb25zdCBpbWdzID0gY2hvaWNlLmltYWdlcy5tYXAoKGltZzogYW55KSA9PiBgIVtHZW5lcmF0ZWQgSW1hZ2VdKCR7aW1nLmltYWdlX3VybC51cmx9KWApLmpvaW4oXCJcXG5cXG5cIik7XG4gICAgICAgICAgcmVzcG9uc2VUZXh0ICs9IGBcXG5cXG4ke2ltZ3N9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlVGV4dCxcbiAgICAgICAgICAgIHJlYXNvbmluZ19kZXRhaWxzOiBjaG9pY2U/LnJlYXNvbmluZ19kZXRhaWxzID8/IG51bGwsXG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShcIi9hcGkvYWktaW1hZ2VcIiwgKHJlcSwgcmVzKSA9PlxuICAgICAgaGFuZGxlKHJlcSwgcmVzLCBcImltYWdlXCIsIGFzeW5jIChwYXlsb2FkLCBvcmlnaW4sIHVzZXJUaWVyLCB1c2VyQXBpS2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IEVMSVRFX1RJRVJTID0gWydwcmVtaXVtX2VsaXRlJywgJ2V4dHJhX3BsdXMnLCAncHJlbWl1bV9wbHVzJywgJ3ByZW1pdW0rZWxpdGUnXTtcbiAgICAgICAgaWYgKCFFTElURV9USUVSUy5pbmNsdWRlcyh1c2VyVGllcikgJiYgIXVzZXJBcGlLZXkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IDQwMywgYm9keTogeyBlcnJvcjogXCJBUEkgS2V5IFJlcXVpcmVkIGZvciBBSSBJbWFnZXMgKFByZW1pdW0gcGxhbikuXCIsIGNvZGU6IFwiS0VZX1JFUVVJUkVEXCIgfSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvbXB0ID0gdHlwZW9mIHBheWxvYWQ/LnByb21wdCA9PT0gXCJzdHJpbmdcIiA/IHBheWxvYWQucHJvbXB0LnRyaW0oKSA6IFwiXCI7XG4gICAgICAgIGlmICghcHJvbXB0KSByZXR1cm4geyBzdGF0dXM6IDQwMCwgYm9keTogeyBlcnJvcjogXCJwcm9tcHQgaXMgcmVxdWlyZWRcIiB9IH07XG4gICAgICAgIGlmIChwcm9tcHQubGVuZ3RoID4gNDAwMCkgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwicHJvbXB0IGlzIHRvbyBsb25nXCIgfSB9O1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgYm9keSB9ID0gYXdhaXQgY2FsbE9wZW5Sb3V0ZXIoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbW9kZWw6IFwic291cmNlZnVsL3JpdmVyZmxvdy12Mi1wcm9cIixcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogcHJvbXB0IH1dLFxuICAgICAgICAgICAgbW9kYWxpdGllczogW1wiaW1hZ2VcIl0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgdXNlckFwaUtleVxuICAgICAgICApO1xuICAgICAgICBpZiAoc3RhdHVzICE9PSAyMDApIHJldHVybiB7IHN0YXR1cywgYm9keTogeyBlcnJvcjogYm9keT8uZXJyb3I/Lm1lc3NhZ2UgfHwgXCJPcGVuUm91dGVyIGltYWdlIHJlcXVlc3QgZmFpbGVkXCIgfSB9O1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gYm9keT8uY2hvaWNlcz8uWzBdPy5tZXNzYWdlO1xuICAgICAgICBjb25zdCBpbWFnZVVybCA9IG1lc3NhZ2U/LmltYWdlcz8uWzBdPy5pbWFnZV91cmw/LnVybCA/PyBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICAgIGJvZHk6IHsgaW1hZ2U6IGltYWdlVXJsLCByZXNwb25zZTogbWVzc2FnZT8uY29udGVudCA/PyBcIlwiLCBtb2RlbDogXCJzb3VyY2VmdWwvcml2ZXJmbG93LXYyLXByb1wiIH0sXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKFwiL2FwaS9zZWN1cml0eS1hZHZpc29yXCIsIChyZXEsIHJlcykgPT5cbiAgICAgIGhhbmRsZShyZXEsIHJlcywgXCJzZWNcIiwgYXN5bmMgKHBheWxvYWQsIG9yaWdpbiwgdXNlclRpZXIsIHVzZXJBcGlLZXkpID0+IHtcbiAgICAgICAgY29uc3QgRUxJVEVfVElFUlMgPSBbJ3ByZW1pdW1fZWxpdGUnLCAnZXh0cmFfcGx1cycsICdwcmVtaXVtX3BsdXMnLCAncHJlbWl1bStlbGl0ZSddO1xuICAgICAgICBpZiAoIUVMSVRFX1RJRVJTLmluY2x1ZGVzKHVzZXJUaWVyKSAmJiAhdXNlckFwaUtleSkge1xuICAgICAgICAgIHJldHVybiB7IHN0YXR1czogNDAzLCBib2R5OiB7IGVycm9yOiBcIkFQSSBLZXkgUmVxdWlyZWQgZm9yIFNlY3VyaXR5IEFkdmlzb3IgKFByZW1pdW0gcGxhbikuXCIsIGNvZGU6IFwiS0VZX1JFUVVJUkVEXCIgfSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc25hcHNob3QgPSBwYXlsb2FkPy5zbmFwc2hvdDtcbiAgICAgICAgaWYgKCFzbmFwc2hvdCB8fCB0eXBlb2Ygc25hcHNob3QgIT09IFwib2JqZWN0XCIpXG4gICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwic25hcHNob3Qgb2JqZWN0IGlzIHJlcXVpcmVkXCIgfSB9O1xuICAgICAgICBsZXQgc25hcHNob3RTdHIgPSBcIlwiO1xuICAgICAgICB0cnkgeyBzbmFwc2hvdFN0ciA9IEpTT04uc3RyaW5naWZ5KHNuYXBzaG90KS5zbGljZSgwLCA2MDAwKTsgfVxuICAgICAgICBjYXRjaCB7IHJldHVybiB7IHN0YXR1czogNDAwLCBib2R5OiB7IGVycm9yOiBcInNuYXBzaG90IG11c3QgYmUgSlNPTi1zZXJpYWxpc2FibGVcIiB9IH07IH1cbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGJvZHkgfSA9IGF3YWl0IGNhbGxPcGVuUm91dGVyKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vZGVsOiBcIm52aWRpYS9uZW1vdHJvbi0zLXN1cGVyLTEyMGItYTEyYjpmcmVlXCIsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICB7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IFNFQ1VSSVRZX1NZU1RFTV9QUk9NUFQgfSxcbiAgICAgICAgICAgICAgeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogYEF1ZGl0IHRoaXMgdXNlci9kZXZpY2Ugc25hcHNob3QgYW5kIHJldHVybiBKU09OIG9ubHk6XFxuJHtzbmFwc2hvdFN0cn1gIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgIHVzZXJBcGlLZXlcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gMjAwKSByZXR1cm4geyBzdGF0dXMsIGJvZHk6IHsgZXJyb3I6IGJvZHk/LmVycm9yPy5tZXNzYWdlIHx8IFwiT3BlblJvdXRlciByZXF1ZXN0IGZhaWxlZFwiIH0gfTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGJvZHk/LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCB8fCBcIlwiO1xuICAgICAgICByZXR1cm4geyBzdGF0dXM6IDIwMCwgYm9keTogeyByYXc6IGNvbnRlbnQsIG1vZGVsOiBcIm52aWRpYS9uZW1vdHJvbi0zLXN1cGVyLTEyMGItYTEyYjpmcmVlXCIgfSB9O1xuICAgICAgfSlcbiAgICApO1xuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoeyBtb2RlIH0pID0+IHtcbiAgLy8gTG9hZCAuZW52IHZhbHVlcyBpbnRvIHByb2Nlc3MuZW52IHNvIHNlcnZlci1zaWRlIG1pZGRsZXdhcmUgKGF1dGggdmVyaWZpY2F0aW9uLFxuICAvLyBPcGVuUm91dGVyIGNhbGxzLCBldGMuKSBjYW4gcmVhZCBTVVBBQkFTRV9VUkwgLyBTVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkgL1xuICAvLyBPUEVOQUlfQVBJX0tFWSBpbiBkZXZlbG9wbWVudC4gVml0ZSBub3JtYWxseSBvbmx5IGV4cG9zZXMgdGhlc2UgdmlhXG4gIC8vIGltcG9ydC5tZXRhLmVudiB0byB0aGUgY2xpZW50LlxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhlbnYpKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52W2tdID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIHYgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHByb2Nlc3MuZW52W2tdID0gdjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBiYXNlOiBcIi9cIixcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgICAgcG9ydDogNTAwMCxcbiAgICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJQZXJtaXNzaW9ucy1Qb2xpY3lcIjogXCJwdWJsaWNrZXktY3JlZGVudGlhbHMtY3JlYXRlPShzZWxmKSwgcHVibGlja2V5LWNyZWRlbnRpYWxzLWdldD0oc2VsZilcIixcbiAgICAgICAgXCJYLUNvbnRlbnQtVHlwZS1PcHRpb25zXCI6IFwibm9zbmlmZlwiLFxuICAgICAgICBcIlJlZmVycmVyLVBvbGljeVwiOiBcInN0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW5cIixcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgYWlQbHVnaW4oKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHsgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIikgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBtYW5pZmVzdDogdHJ1ZSxcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICB2ZW5kb3I6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9kLFNBQVMsY0FBYyxlQUE0QjtBQUN2Z0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFNLDJCQUEyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBa0JqQyxJQUFNLHlCQUF5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXVCL0IsSUFBTSxpQkFBaUIsS0FBSyxPQUFPO0FBQ25DLElBQU0saUJBQWlCO0FBQ3ZC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
