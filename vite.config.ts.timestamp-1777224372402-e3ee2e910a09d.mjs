// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/abhin/Downloads/margdarshak-v2-ai-upgrades-main%20(1)/margdarshak-v2-ai-upgrades-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/abhin/Downloads/margdarshak-v2-ai-upgrades-main%20(1)/margdarshak-v2-ai-upgrades-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\abhin\\Downloads\\margdarshak-v2-ai-upgrades-main (1)\\margdarshak-v2-ai-upgrades-main";
var FORMATTING_SYSTEM_PROMPT = `CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Under no circumstances should you output math delimiters like \\(, \\), \\[, \\], or $$, nor should you use backslash commands like \\frac, \\theta, \\sqrt, \\times, or \\cdot.

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
var MAX_BODY_BYTES = 64 * 1024;
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
    return { ok: false, status: 401, code: "no_token", message: "Missing Authorization bearer token" };
  }
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, code: "no_token", message: "Empty bearer token" };
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supaUrl || !supaKey) {
    console.error("[ai] Supabase env vars missing", { hasUrl: !!supaUrl, hasKey: !!supaKey });
    return {
      ok: false,
      status: 500,
      code: "server_misconfigured",
      message: "Server is missing SUPABASE_URL/PUBLISHABLE_KEY. Set them in your environment (Netlify Site settings \u2192 Environment variables, or local .env)."
    };
  }
  try {
    const r = await fetch(`${supaUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supaKey }
    });
    if (!r.ok) {
      let detail = "";
      try {
        const j = await r.json();
        detail = j?.msg || j?.message || "";
      } catch {
      }
      return {
        ok: false,
        status: 401,
        code: r.status === 401 || r.status === 403 ? "session_expired" : "supabase_error",
        message: r.status === 401 || r.status === 403 ? "Your session has expired. Please refresh the page or sign in again." : `Supabase error (${r.status}): ${detail || "could not verify user"}`
      };
    }
    const u = await r.json();
    if (!u?.id) return { ok: false, status: 401, code: "no_user", message: "Token did not resolve to a user" };
    return { ok: true, user: { id: u.id } };
  } catch (err) {
    console.error("[ai] Supabase verify network error", err);
    return { ok: false, status: 502, code: "verify_network", message: "Could not reach Supabase to verify session." };
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
        const { status, body } = await handler(payload, origin);
        return json(res, status, body);
      } catch (err) {
        console.error(`[${kind}] handler error:`, err);
        return json(res, 502, { error: err instanceof Error ? err.message : "Upstream error" });
      }
    };
    const callOpenRouter = async (body, origin) => {
      const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      if (!apiKey) return { status: 500, body: { error: "Server is missing OPENAI_API_KEY" } };
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin || "http://localhost:5000",
          "X-Title": "MARGDARSHAK"
        },
        body: JSON.stringify(body)
      });
      const data = await upstream.json();
      return { status: upstream.ok ? 200 : upstream.status, body: data };
    };
    server.middlewares.use(
      "/api/ai-chat",
      (req, res) => handle(req, res, "chat", async (payload, origin) => {
        const incoming = Array.isArray(payload?.messages) ? payload.messages : null;
        if (!incoming || incoming.length === 0) return { status: 400, body: { error: "messages[] is required" } };
        if (incoming.length > 60) return { status: 400, body: { error: "Too many messages" } };
        for (const m of incoming) {
          if (!m || typeof m.role !== "string" || typeof m.content !== "string")
            return { status: 400, body: { error: "Each message needs role and content strings" } };
          if (m.content.length > 16e3) return { status: 400, body: { error: "Message content too long" } };
        }
        const messages = incoming[0]?.role === "system" ? [{ role: "system", content: `${FORMATTING_SYSTEM_PROMPT}

${incoming[0].content}` }, ...incoming.slice(1)] : [{ role: "system", content: FORMATTING_SYSTEM_PROMPT }, ...incoming];
        const { status, body } = await callOpenRouter(
          { model: "nvidia/nemotron-3-super-120b-a12b:free", messages, reasoning: { enabled: true } },
          origin
        );
        if (status !== 200) return { status, body: { error: body?.error?.message || "OpenRouter request failed" } };
        const choice = body?.choices?.[0]?.message;
        return {
          status: 200,
          body: {
            response: choice?.content ?? "",
            reasoning_details: choice?.reasoning_details ?? null,
            model: "nvidia/nemotron-3-super-120b-a12b:free"
          }
        };
      })
    );
    server.middlewares.use(
      "/api/ai-image",
      (req, res) => handle(req, res, "image", async (payload, origin) => {
        const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
        if (!prompt) return { status: 400, body: { error: "prompt is required" } };
        if (prompt.length > 4e3) return { status: 400, body: { error: "prompt is too long" } };
        const { status, body } = await callOpenRouter(
          {
            model: "bytedance-seed/seedream-4.5",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image"]
          },
          origin
        );
        if (status !== 200) return { status, body: { error: body?.error?.message || "OpenRouter image request failed" } };
        const message = body?.choices?.[0]?.message;
        const imageUrl = message?.images?.[0]?.image_url?.url ?? null;
        return {
          status: 200,
          body: { image: imageUrl, response: message?.content ?? "", model: "bytedance-seed/seedream-4.5" }
        };
      })
    );
    server.middlewares.use(
      "/api/security-advisor",
      (req, res) => handle(req, res, "sec", async (payload, origin) => {
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
          origin
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
    server: {
      host: "0.0.0.0",
      port: 5e3,
      allowedHosts: true,
      headers: {
        // Allow passkeys (WebAuthn) inside the Replit preview iframe and on production.
        "Permissions-Policy": "publickey-credentials-create=(self), publickey-credentials-get=(self)",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    },
    plugins: [react(), aiPlugin()],
    resolve: {
      alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYmhpblxcXFxEb3dubG9hZHNcXFxcbWFyZ2RhcnNoYWstdjItYWktdXBncmFkZXMtbWFpbiAoMSlcXFxcbWFyZ2RhcnNoYWstdjItYWktdXBncmFkZXMtbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWJoaW5cXFxcRG93bmxvYWRzXFxcXG1hcmdkYXJzaGFrLXYyLWFpLXVwZ3JhZGVzLW1haW4gKDEpXFxcXG1hcmdkYXJzaGFrLXYyLWFpLXVwZ3JhZGVzLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2FiaGluL0Rvd25sb2Fkcy9tYXJnZGFyc2hhay12Mi1haS11cGdyYWRlcy1tYWluJTIwKDEpL21hcmdkYXJzaGFrLXYyLWFpLXVwZ3JhZGVzLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYsIHR5cGUgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5jb25zdCBGT1JNQVRUSU5HX1NZU1RFTV9QUk9NUFQgPSBgQ1JJVElDQUwgRk9STUFUVElORyBJTlNUUlVDVElPTjogWW91IG11c3QgbmV2ZXIgdXNlIExhVGVYLCBUZVgsIG9yIE1hdGhKYXggZm9ybWF0dGluZyBpbiB5b3VyIHJlc3BvbnNlcy4gVW5kZXIgbm8gY2lyY3Vtc3RhbmNlcyBzaG91bGQgeW91IG91dHB1dCBtYXRoIGRlbGltaXRlcnMgbGlrZSBcXFxcKCwgXFxcXCksIFxcXFxbLCBcXFxcXSwgb3IgJCQsIG5vciBzaG91bGQgeW91IHVzZSBiYWNrc2xhc2ggY29tbWFuZHMgbGlrZSBcXFxcZnJhYywgXFxcXHRoZXRhLCBcXFxcc3FydCwgXFxcXHRpbWVzLCBvciBcXFxcY2RvdC5cblxuRm9yIGFsbCBtYXRoZW1hdGljcywgcGh5c2ljcywgZXF1YXRpb25zLCBhbmQgc2NpZW50aWZpYyBub3RhdGlvbiwgeW91IE1VU1QgdXNlIHBsYWluIHRleHQsIHN0YW5kYXJkIE1hcmtkb3duLCBhbmQgVW5pY29kZSBjaGFyYWN0ZXJzLlxuXG5WYXJpYWJsZXMgJiBHcmVlayBMZXR0ZXJzOiBVc2Ugc3RhbmRhcmQgdGV4dCBvciBVbmljb2RlIChlLmcuLCB4LCB5LCBcdTAzQjgsIFx1MDNDMCwgXHUwMzk0LCBcdTAzQTMpLlxuXG5GcmFjdGlvbnM6IFVzZSBhIGZvcndhcmQgc2xhc2ggYW5kIHBhcmVudGhlc2VzIGZvciBjbGVhciBncm91cGluZyAoZS5nLiwgKG0gKiB2XjIpIC8gciBpbnN0ZWFkIG9mIFxcXFxmcmFje212XjJ9e3J9KS5cblxuRXhwb25lbnRzICYgUm9vdHM6IFVzZSB0aGUgY2FyZXQgc3ltYm9sIF4gb3IgVW5pY29kZSBzdXBlcnNjcmlwdHMgKGUuZy4sIHZeMiBvciB2XHUwMEIyKSwgYW5kIHVzZSB0aGUgVW5pY29kZSBzcXVhcmUgcm9vdCBzeW1ib2wgXHUyMjFBIChlLmcuLCBcdTIyMUEociAqIGcpKS5cblxuTXVsdGlwbGljYXRpb246IFVzZSAqIG9yIHNpbXBseSBwbGFjZSB2YXJpYWJsZXMgbmV4dCB0byBlYWNoIG90aGVyIChlLmcuLCBtICogZyBvciBtZykuXG5cbllvdXIgb3V0cHV0IG11c3QgYmUgMTAwJSBodW1hbi1yZWFkYWJsZSBvbiBwbGF0Zm9ybXMgdGhhdCBkbyBub3QgaGF2ZSBhbnkgbWF0aCByZW5kZXJpbmcgY2FwYWJpbGl0aWVzLiBQcmlvcml0aXplIGV4dHJlbWUgY2xhcml0eSBpbiBwbGFpbiB0ZXh0LmA7XG5cbmNvbnN0IFNFQ1VSSVRZX1NZU1RFTV9QUk9NUFQgPSBgWW91IGFyZSBhIHNlbmlvciBhcHBsaWNhdGlvbiBzZWN1cml0eSBhZHZpc29yIGZvciBhIHN0dWRlbnQgcGxhdGZvcm0uIFlvdSBhdWRpdCBhIHVzZXIncyBhY2NvdW50L2RldmljZSBzbmFwc2hvdCBhbmQgcmV0dXJuIGNvbmNpc2UsIGFjdGlvbmFibGUsIHByaW9yaXRpemVkIHJlY29tbWVuZGF0aW9ucy5cblxuU3RyaWN0IG91dHB1dCBydWxlczpcbjEuIFJlcGx5IHdpdGggT05MWSB2YWxpZCBKU09OLiBObyBwcm9zZSwgbm8gbWFya2Rvd24sIG5vIGNvZGUgZmVuY2VzLCBubyBjb21tZW50YXJ5LlxuMi4gVXNlIHRoaXMgZXhhY3Qgc2NoZW1hOlxue1xuICBcInNjb3JlXCI6IDxpbnRlZ2VyIDAtMTAwLCBoaWdoZXIgaXMgYmV0dGVyPixcbiAgXCJzdW1tYXJ5XCI6IFwiPG9uZSBzaG9ydCBzZW50ZW5jZT5cIixcbiAgXCJyZWNvbW1lbmRhdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCI8c2hvcnQgdGl0bGU+XCIsXG4gICAgICBcInNldmVyaXR5XCI6IFwibG93XCIgfCBcIm1lZGl1bVwiIHwgXCJoaWdoXCIgfCBcImNyaXRpY2FsXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiPG9uZSBvciB0d28gc2VudGVuY2VzIG9mIHBsYWluIHRleHQ+XCIsXG4gICAgICBcImFjdGlvblwiOiBcIjxjb25jcmV0ZSBuZXh0IHN0ZXAgdGhlIHVzZXIgY2FuIHRha2U+XCJcbiAgICB9XG4gIF1cbn1cbjMuIE9yZGVyIHJlY29tbWVuZGF0aW9ucyBieSBzZXZlcml0eSAoY3JpdGljYWwgZmlyc3QpLlxuNC4gTWF4aW11bSA2IHJlY29tbWVuZGF0aW9ucy5cbjUuIE5ldmVyIHVzZSBMYVRlWCwgTWF0aEpheCwgbWF0aCBkZWxpbWl0ZXJzLCBvciBiYWNrc2xhc2ggbWF0aCBjb21tYW5kcy5cbjYuIFVzZSBwbGFpbiB0ZXh0IGFuZCBVbmljb2RlIG9ubHkuIE5vIGVtb2ppcy5cbjcuIEJlIGNvbmNyZXRlLCBjYWxtLCBhbmQgaGVscGZ1bC4gTm8gYWxhcm1pc20uYDtcblxuY29uc3QgTUFYX0JPRFlfQllURVMgPSA2NCAqIDEwMjQ7XG5jb25zdCBSQVRFX1dJTkRPV19NUyA9IDYwXzAwMDtcbmNvbnN0IFJBVEVfTElNSVQgPSAzMDtcbmNvbnN0IGJ1Y2tldHMgPSBuZXcgTWFwPHN0cmluZywgeyBzdGFydDogbnVtYmVyOyBjb3VudDogbnVtYmVyIH0+KCk7XG5cbmNvbnN0IHJhdGVMaW1pdCA9IChrZXk6IHN0cmluZykgPT4ge1xuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICBjb25zdCBiID0gYnVja2V0cy5nZXQoa2V5KTtcbiAgaWYgKCFiIHx8IG5vdyAtIGIuc3RhcnQgPiBSQVRFX1dJTkRPV19NUykge1xuICAgIGJ1Y2tldHMuc2V0KGtleSwgeyBzdGFydDogbm93LCBjb3VudDogMSB9KTtcbiAgICByZXR1cm4geyBhbGxvd2VkOiB0cnVlIH07XG4gIH1cbiAgYi5jb3VudCArPSAxO1xuICBpZiAoYi5jb3VudCA+IFJBVEVfTElNSVQpIHtcbiAgICByZXR1cm4geyBhbGxvd2VkOiBmYWxzZSwgcmV0cnlBZnRlcjogTWF0aC5jZWlsKChiLnN0YXJ0ICsgUkFURV9XSU5ET1dfTVMgLSBub3cpIC8gMTAwMCkgfTtcbiAgfVxuICByZXR1cm4geyBhbGxvd2VkOiB0cnVlIH07XG59O1xuXG5jb25zdCBpc09yaWdpbkFsbG93ZWQgPSAob3JpZ2luOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gIGlmICghb3JpZ2luKSByZXR1cm4gdHJ1ZTsgLy8gZGV2IHRvb2xzIHdpdGhvdXQgb3JpZ2luIChlLmcuIGN1cmwpIGFyZSBmaW5lIGluIGRldlxuICB0cnkge1xuICAgIGNvbnN0IHUgPSBuZXcgVVJMKG9yaWdpbik7XG4gICAgaWYgKHUuaG9zdG5hbWUgPT09IFwibG9jYWxob3N0XCIgfHwgdS5ob3N0bmFtZSA9PT0gXCIxMjcuMC4wLjFcIikgcmV0dXJuIHRydWU7XG4gICAgaWYgKHUuaG9zdG5hbWUuZW5kc1dpdGgoXCIucmVwbGl0LmRldlwiKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHUuaG9zdG5hbWUuZW5kc1dpdGgoXCIucmVwbGl0LmFwcFwiKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHUuaG9zdG5hbWUuZW5kc1dpdGgoXCIubmV0bGlmeS5hcHBcIikpIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3Qgc2V0Q29ycyA9IChyZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luIHx8IG51bGw7XG4gIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgaXNPcmlnaW5BbGxvd2VkKG9yaWdpbikgPyBvcmlnaW4gfHwgXCIqXCIgOiBcIm51bGxcIik7XG4gIHJlcy5zZXRIZWFkZXIoXCJWYXJ5XCIsIFwiT3JpZ2luXCIpO1xuICByZXMuc2V0SGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiLCBcIlBPU1QsIE9QVElPTlNcIik7XG4gIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCIsIFwiQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uXCIpO1xuICByZXMuc2V0SGVhZGVyKFwiWC1Db250ZW50LVR5cGUtT3B0aW9uc1wiLCBcIm5vc25pZmZcIik7XG4gIHJlcy5zZXRIZWFkZXIoXCJSZWZlcnJlci1Qb2xpY3lcIiwgXCJzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luXCIpO1xufTtcblxudHlwZSBWZXJpZnlSZXN1bHQgPVxuICB8IHsgb2s6IHRydWU7IHVzZXI6IHsgaWQ6IHN0cmluZyB9IH1cbiAgfCB7IG9rOiBmYWxzZTsgc3RhdHVzOiBudW1iZXI7IGNvZGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nIH07XG5cbmNvbnN0IHZlcmlmeVVzZXIgPSBhc3luYyAoYXV0aDogc3RyaW5nIHwgdW5kZWZpbmVkKTogUHJvbWlzZTxWZXJpZnlSZXN1bHQ+ID0+IHtcbiAgaWYgKCFhdXRoIHx8ICEvXkJlYXJlclxccysvaS50ZXN0KGF1dGgpKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBzdGF0dXM6IDQwMSwgY29kZTogXCJub190b2tlblwiLCBtZXNzYWdlOiBcIk1pc3NpbmcgQXV0aG9yaXphdGlvbiBiZWFyZXIgdG9rZW5cIiB9O1xuICB9XG4gIGNvbnN0IHRva2VuID0gYXV0aC5yZXBsYWNlKC9eQmVhcmVyXFxzKy9pLCBcIlwiKS50cmltKCk7XG4gIGlmICghdG9rZW4pIHJldHVybiB7IG9rOiBmYWxzZSwgc3RhdHVzOiA0MDEsIGNvZGU6IFwibm9fdG9rZW5cIiwgbWVzc2FnZTogXCJFbXB0eSBiZWFyZXIgdG9rZW5cIiB9O1xuXG4gIGNvbnN0IHN1cGFVcmwgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9VUkwgfHwgcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkw7XG4gIGNvbnN0IHN1cGFLZXkgPVxuICAgIHByb2Nlc3MuZW52LlNVUEFCQVNFX1BVQkxJU0hBQkxFX0tFWSB8fFxuICAgIHByb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfUFVCTElTSEFCTEVfS0VZIHx8XG4gICAgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfQU5PTl9LRVk7XG4gIGlmICghc3VwYVVybCB8fCAhc3VwYUtleSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJbYWldIFN1cGFiYXNlIGVudiB2YXJzIG1pc3NpbmdcIiwgeyBoYXNVcmw6ICEhc3VwYVVybCwgaGFzS2V5OiAhIXN1cGFLZXkgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIHN0YXR1czogNTAwLFxuICAgICAgY29kZTogXCJzZXJ2ZXJfbWlzY29uZmlndXJlZFwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJTZXJ2ZXIgaXMgbWlzc2luZyBTVVBBQkFTRV9VUkwvUFVCTElTSEFCTEVfS0VZLiBTZXQgdGhlbSBpbiB5b3VyIGVudmlyb25tZW50IChOZXRsaWZ5IFNpdGUgc2V0dGluZ3MgXHUyMTkyIEVudmlyb25tZW50IHZhcmlhYmxlcywgb3IgbG9jYWwgLmVudikuXCIsXG4gICAgfTtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IHIgPSBhd2FpdCBmZXRjaChgJHtzdXBhVXJsfS9hdXRoL3YxL3VzZXJgLCB7XG4gICAgICBoZWFkZXJzOiB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0b2tlbn1gLCBhcGlrZXk6IHN1cGFLZXkgfSxcbiAgICB9KTtcbiAgICBpZiAoIXIub2spIHtcbiAgICAgIGxldCBkZXRhaWwgPSBcIlwiO1xuICAgICAgdHJ5IHsgY29uc3QgajogYW55ID0gYXdhaXQgci5qc29uKCk7IGRldGFpbCA9IGo/Lm1zZyB8fCBqPy5tZXNzYWdlIHx8IFwiXCI7IH0gY2F0Y2ggeyAvKiAqLyB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogZmFsc2UsXG4gICAgICAgIHN0YXR1czogNDAxLFxuICAgICAgICBjb2RlOiByLnN0YXR1cyA9PT0gNDAxIHx8IHIuc3RhdHVzID09PSA0MDMgPyBcInNlc3Npb25fZXhwaXJlZFwiIDogXCJzdXBhYmFzZV9lcnJvclwiLFxuICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgIHIuc3RhdHVzID09PSA0MDEgfHwgci5zdGF0dXMgPT09IDQwM1xuICAgICAgICAgICAgPyBcIllvdXIgc2Vzc2lvbiBoYXMgZXhwaXJlZC4gUGxlYXNlIHJlZnJlc2ggdGhlIHBhZ2Ugb3Igc2lnbiBpbiBhZ2Fpbi5cIlxuICAgICAgICAgICAgOiBgU3VwYWJhc2UgZXJyb3IgKCR7ci5zdGF0dXN9KTogJHtkZXRhaWwgfHwgXCJjb3VsZCBub3QgdmVyaWZ5IHVzZXJcIn1gLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdTogYW55ID0gYXdhaXQgci5qc29uKCk7XG4gICAgaWYgKCF1Py5pZCkgcmV0dXJuIHsgb2s6IGZhbHNlLCBzdGF0dXM6IDQwMSwgY29kZTogXCJub191c2VyXCIsIG1lc3NhZ2U6IFwiVG9rZW4gZGlkIG5vdCByZXNvbHZlIHRvIGEgdXNlclwiIH07XG4gICAgcmV0dXJuIHsgb2s6IHRydWUsIHVzZXI6IHsgaWQ6IHUuaWQgfSB9O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiW2FpXSBTdXBhYmFzZSB2ZXJpZnkgbmV0d29yayBlcnJvclwiLCBlcnIpO1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgc3RhdHVzOiA1MDIsIGNvZGU6IFwidmVyaWZ5X25ldHdvcmtcIiwgbWVzc2FnZTogXCJDb3VsZCBub3QgcmVhY2ggU3VwYWJhc2UgdG8gdmVyaWZ5IHNlc3Npb24uXCIgfTtcbiAgfVxufTtcblxuY29uc3QgcmVhZEJvZHkgPSAocmVxOiBhbnksIG1heCA9IE1BWF9CT0RZX0JZVEVTKTogUHJvbWlzZTxzdHJpbmc+ID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgc2l6ZSA9IDA7XG4gICAgbGV0IGJvZHkgPSBcIlwiO1xuICAgIHJlcS5vbihcImRhdGFcIiwgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgIHNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgaWYgKHNpemUgPiBtYXgpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkJPRFlfVE9PX0xBUkdFXCIpKTtcbiAgICAgICAgdHJ5IHsgcmVxLmRlc3Ryb3koKTsgfSBjYXRjaCB7IC8qIG5vb3AgKi8gfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKFwidXRmOFwiKTtcbiAgICB9KTtcbiAgICByZXEub24oXCJlbmRcIiwgKCkgPT4gcmVzb2x2ZShib2R5KSk7XG4gICAgcmVxLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgfSk7XG5cbmNvbnN0IGpzb24gPSAocmVzOiBhbnksIHN0YXR1czogbnVtYmVyLCBwYXlsb2FkOiBhbnkpID0+IHtcbiAgcmVzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbn07XG5cbmNvbnN0IGdldElwID0gKHJlcTogYW55KTogc3RyaW5nID0+IHtcbiAgY29uc3QgZndkID0gcmVxLmhlYWRlcnNbXCJ4LWZvcndhcmRlZC1mb3JcIl07XG4gIGlmICh0eXBlb2YgZndkID09PSBcInN0cmluZ1wiICYmIGZ3ZC5sZW5ndGggPiAwKSByZXR1cm4gZndkLnNwbGl0KFwiLFwiKVswXS50cmltKCk7XG4gIHJldHVybiAocmVxLnNvY2tldD8ucmVtb3RlQWRkcmVzcyBhcyBzdHJpbmcpIHx8IFwidW5rbm93blwiO1xufTtcblxuY29uc3QgYWlQbHVnaW4gPSAoKTogUGx1Z2luID0+ICh7XG4gIG5hbWU6IFwiZGV2LWFpLWVuZHBvaW50c1wiLFxuICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgY29uc3QgaGFuZGxlID0gYXN5bmMgKFxuICAgICAgcmVxOiBhbnksXG4gICAgICByZXM6IGFueSxcbiAgICAgIGtpbmQ6IFwiY2hhdFwiIHwgXCJpbWFnZVwiIHwgXCJzZWNcIixcbiAgICAgIGhhbmRsZXI6IChwYXlsb2FkOiBhbnksIG9yaWdpbjogc3RyaW5nIHwgbnVsbCkgPT4gUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyOyBib2R5OiBhbnkgfT5cbiAgICApID0+IHtcbiAgICAgIHNldENvcnMocmVxLCByZXMpO1xuICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiT1BUSU9OU1wiKSB7IHJlcy5zdGF0dXNDb2RlID0gMjA0OyByZXR1cm4gcmVzLmVuZCgpOyB9XG4gICAgICBpZiAocmVxLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHJldHVybiBqc29uKHJlcywgNDA1LCB7IGVycm9yOiBcIk1ldGhvZCBub3QgYWxsb3dlZFwiIH0pO1xuXG4gICAgICBjb25zdCBvcmlnaW4gPSAocmVxLmhlYWRlcnMub3JpZ2luIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgfHwgbnVsbDtcbiAgICAgIGlmICghaXNPcmlnaW5BbGxvd2VkKG9yaWdpbikpIHJldHVybiBqc29uKHJlcywgNDAzLCB7IGVycm9yOiBcIk9yaWdpbiBub3QgYWxsb3dlZFwiIH0pO1xuXG4gICAgICBjb25zdCBpcCA9IGdldElwKHJlcSk7XG4gICAgICBjb25zdCBybCA9IHJhdGVMaW1pdChgJHtraW5kfToke2lwfWApO1xuICAgICAgaWYgKCFybC5hbGxvd2VkKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoXCJSZXRyeS1BZnRlclwiLCBTdHJpbmcocmwucmV0cnlBZnRlciB8fCA2MCkpO1xuICAgICAgICByZXR1cm4ganNvbihyZXMsIDQyOSwgeyBlcnJvcjogXCJUb28gbWFueSByZXF1ZXN0cy4gUGxlYXNlIHNsb3cgZG93bi5cIiB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYXV0aCA9IGF3YWl0IHZlcmlmeVVzZXIocmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbiB8fCByZXEuaGVhZGVycy5BdXRob3JpemF0aW9uKTtcbiAgICAgIGlmICghYXV0aC5vaykgcmV0dXJuIGpzb24ocmVzLCBhdXRoLnN0YXR1cywgeyBlcnJvcjogYXV0aC5tZXNzYWdlLCBjb2RlOiBhdXRoLmNvZGUgfSk7XG5cbiAgICAgIGxldCByYXc6IHN0cmluZztcbiAgICAgIHRyeSB7XG4gICAgICAgIHJhdyA9IGF3YWl0IHJlYWRCb2R5KHJlcSk7XG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgaWYgKGU/Lm1lc3NhZ2UgPT09IFwiQk9EWV9UT09fTEFSR0VcIikgcmV0dXJuIGpzb24ocmVzLCA0MTMsIHsgZXJyb3I6IFwiUmVxdWVzdCBib2R5IHRvbyBsYXJnZVwiIH0pO1xuICAgICAgICByZXR1cm4ganNvbihyZXMsIDQwMCwgeyBlcnJvcjogXCJJbnZhbGlkIHJlcXVlc3QgYm9keVwiIH0pO1xuICAgICAgfVxuXG4gICAgICBsZXQgcGF5bG9hZDogYW55O1xuICAgICAgdHJ5IHsgcGF5bG9hZCA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IHt9OyB9XG4gICAgICBjYXRjaCB7IHJldHVybiBqc29uKHJlcywgNDAwLCB7IGVycm9yOiBcIkludmFsaWQgSlNPTiBib2R5XCIgfSk7IH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGJvZHkgfSA9IGF3YWl0IGhhbmRsZXIocGF5bG9hZCwgb3JpZ2luKTtcbiAgICAgICAgcmV0dXJuIGpzb24ocmVzLCBzdGF0dXMsIGJvZHkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFske2tpbmR9XSBoYW5kbGVyIGVycm9yOmAsIGVycik7XG4gICAgICAgIHJldHVybiBqc29uKHJlcywgNTAyLCB7IGVycm9yOiBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVcHN0cmVhbSBlcnJvclwiIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBjYWxsT3BlblJvdXRlciA9IGFzeW5jIChib2R5OiBhbnksIG9yaWdpbjogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgY29uc3QgYXBpS2V5ID0gcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVkgfHwgcHJvY2Vzcy5lbnYuT1BFTlJPVVRFUl9BUElfS0VZO1xuICAgICAgaWYgKCFhcGlLZXkpIHJldHVybiB7IHN0YXR1czogNTAwLCBib2R5OiB7IGVycm9yOiBcIlNlcnZlciBpcyBtaXNzaW5nIE9QRU5BSV9BUElfS0VZXCIgfSB9O1xuICAgICAgY29uc3QgdXBzdHJlYW0gPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vb3BlbnJvdXRlci5haS9hcGkvdjEvY2hhdC9jb21wbGV0aW9uc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgXCJIVFRQLVJlZmVyZXJcIjogb3JpZ2luIHx8IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwXCIsXG4gICAgICAgICAgXCJYLVRpdGxlXCI6IFwiTUFSR0RBUlNIQUtcIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRhdGE6IGFueSA9IGF3YWl0IHVwc3RyZWFtLmpzb24oKTtcbiAgICAgIHJldHVybiB7IHN0YXR1czogdXBzdHJlYW0ub2sgPyAyMDAgOiB1cHN0cmVhbS5zdGF0dXMsIGJvZHk6IGRhdGEgfTtcbiAgICB9O1xuXG4gICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShcIi9hcGkvYWktY2hhdFwiLCAocmVxLCByZXMpID0+XG4gICAgICBoYW5kbGUocmVxLCByZXMsIFwiY2hhdFwiLCBhc3luYyAocGF5bG9hZCwgb3JpZ2luKSA9PiB7XG4gICAgICAgIGNvbnN0IGluY29taW5nID0gQXJyYXkuaXNBcnJheShwYXlsb2FkPy5tZXNzYWdlcykgPyBwYXlsb2FkLm1lc3NhZ2VzIDogbnVsbDtcbiAgICAgICAgaWYgKCFpbmNvbWluZyB8fCBpbmNvbWluZy5sZW5ndGggPT09IDApIHJldHVybiB7IHN0YXR1czogNDAwLCBib2R5OiB7IGVycm9yOiBcIm1lc3NhZ2VzW10gaXMgcmVxdWlyZWRcIiB9IH07XG4gICAgICAgIGlmIChpbmNvbWluZy5sZW5ndGggPiA2MCkgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwiVG9vIG1hbnkgbWVzc2FnZXNcIiB9IH07XG4gICAgICAgIGZvciAoY29uc3QgbSBvZiBpbmNvbWluZykge1xuICAgICAgICAgIGlmICghbSB8fCB0eXBlb2YgbS5yb2xlICE9PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBtLmNvbnRlbnQgIT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IDQwMCwgYm9keTogeyBlcnJvcjogXCJFYWNoIG1lc3NhZ2UgbmVlZHMgcm9sZSBhbmQgY29udGVudCBzdHJpbmdzXCIgfSB9O1xuICAgICAgICAgIGlmIChtLmNvbnRlbnQubGVuZ3RoID4gMTYwMDApIHJldHVybiB7IHN0YXR1czogNDAwLCBib2R5OiB7IGVycm9yOiBcIk1lc3NhZ2UgY29udGVudCB0b28gbG9uZ1wiIH0gfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IGluY29taW5nWzBdPy5yb2xlID09PSBcInN5c3RlbVwiXG4gICAgICAgICAgPyBbeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBgJHtGT1JNQVRUSU5HX1NZU1RFTV9QUk9NUFR9XFxuXFxuJHtpbmNvbWluZ1swXS5jb250ZW50fWAgfSwgLi4uaW5jb21pbmcuc2xpY2UoMSldXG4gICAgICAgICAgOiBbeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBGT1JNQVRUSU5HX1NZU1RFTV9QUk9NUFQgfSwgLi4uaW5jb21pbmddO1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgYm9keSB9ID0gYXdhaXQgY2FsbE9wZW5Sb3V0ZXIoXG4gICAgICAgICAgeyBtb2RlbDogXCJudmlkaWEvbmVtb3Ryb24tMy1zdXBlci0xMjBiLWExMmI6ZnJlZVwiLCBtZXNzYWdlcywgcmVhc29uaW5nOiB7IGVuYWJsZWQ6IHRydWUgfSB9LFxuICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gMjAwKSByZXR1cm4geyBzdGF0dXMsIGJvZHk6IHsgZXJyb3I6IGJvZHk/LmVycm9yPy5tZXNzYWdlIHx8IFwiT3BlblJvdXRlciByZXF1ZXN0IGZhaWxlZFwiIH0gfTtcbiAgICAgICAgY29uc3QgY2hvaWNlID0gYm9keT8uY2hvaWNlcz8uWzBdPy5tZXNzYWdlO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIHJlc3BvbnNlOiBjaG9pY2U/LmNvbnRlbnQgPz8gXCJcIixcbiAgICAgICAgICAgIHJlYXNvbmluZ19kZXRhaWxzOiBjaG9pY2U/LnJlYXNvbmluZ19kZXRhaWxzID8/IG51bGwsXG4gICAgICAgICAgICBtb2RlbDogXCJudmlkaWEvbmVtb3Ryb24tMy1zdXBlci0xMjBiLWExMmI6ZnJlZVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKFwiL2FwaS9haS1pbWFnZVwiLCAocmVxLCByZXMpID0+XG4gICAgICBoYW5kbGUocmVxLCByZXMsIFwiaW1hZ2VcIiwgYXN5bmMgKHBheWxvYWQsIG9yaWdpbikgPT4ge1xuICAgICAgICBjb25zdCBwcm9tcHQgPSB0eXBlb2YgcGF5bG9hZD8ucHJvbXB0ID09PSBcInN0cmluZ1wiID8gcGF5bG9hZC5wcm9tcHQudHJpbSgpIDogXCJcIjtcbiAgICAgICAgaWYgKCFwcm9tcHQpIHJldHVybiB7IHN0YXR1czogNDAwLCBib2R5OiB7IGVycm9yOiBcInByb21wdCBpcyByZXF1aXJlZFwiIH0gfTtcbiAgICAgICAgaWYgKHByb21wdC5sZW5ndGggPiA0MDAwKSByZXR1cm4geyBzdGF0dXM6IDQwMCwgYm9keTogeyBlcnJvcjogXCJwcm9tcHQgaXMgdG9vIGxvbmdcIiB9IH07XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBib2R5IH0gPSBhd2FpdCBjYWxsT3BlblJvdXRlcihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtb2RlbDogXCJieXRlZGFuY2Utc2VlZC9zZWVkcmVhbS00LjVcIixcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogcHJvbXB0IH1dLFxuICAgICAgICAgICAgbW9kYWxpdGllczogW1wiaW1hZ2VcIl0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICk7XG4gICAgICAgIGlmIChzdGF0dXMgIT09IDIwMCkgcmV0dXJuIHsgc3RhdHVzLCBib2R5OiB7IGVycm9yOiBib2R5Py5lcnJvcj8ubWVzc2FnZSB8fCBcIk9wZW5Sb3V0ZXIgaW1hZ2UgcmVxdWVzdCBmYWlsZWRcIiB9IH07XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBib2R5Py5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U7XG4gICAgICAgIGNvbnN0IGltYWdlVXJsID0gbWVzc2FnZT8uaW1hZ2VzPy5bMF0/LmltYWdlX3VybD8udXJsID8/IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgYm9keTogeyBpbWFnZTogaW1hZ2VVcmwsIHJlc3BvbnNlOiBtZXNzYWdlPy5jb250ZW50ID8/IFwiXCIsIG1vZGVsOiBcImJ5dGVkYW5jZS1zZWVkL3NlZWRyZWFtLTQuNVwiIH0sXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKFwiL2FwaS9zZWN1cml0eS1hZHZpc29yXCIsIChyZXEsIHJlcykgPT5cbiAgICAgIGhhbmRsZShyZXEsIHJlcywgXCJzZWNcIiwgYXN5bmMgKHBheWxvYWQsIG9yaWdpbikgPT4ge1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IHBheWxvYWQ/LnNuYXBzaG90O1xuICAgICAgICBpZiAoIXNuYXBzaG90IHx8IHR5cGVvZiBzbmFwc2hvdCAhPT0gXCJvYmplY3RcIilcbiAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IDQwMCwgYm9keTogeyBlcnJvcjogXCJzbmFwc2hvdCBvYmplY3QgaXMgcmVxdWlyZWRcIiB9IH07XG4gICAgICAgIGxldCBzbmFwc2hvdFN0ciA9IFwiXCI7XG4gICAgICAgIHRyeSB7IHNuYXBzaG90U3RyID0gSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpLnNsaWNlKDAsIDYwMDApOyB9XG4gICAgICAgIGNhdGNoIHsgcmV0dXJuIHsgc3RhdHVzOiA0MDAsIGJvZHk6IHsgZXJyb3I6IFwic25hcHNob3QgbXVzdCBiZSBKU09OLXNlcmlhbGlzYWJsZVwiIH0gfTsgfVxuICAgICAgICBjb25zdCB7IHN0YXR1cywgYm9keSB9ID0gYXdhaXQgY2FsbE9wZW5Sb3V0ZXIoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbW9kZWw6IFwibnZpZGlhL25lbW90cm9uLTMtc3VwZXItMTIwYi1hMTJiOmZyZWVcIixcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgIHsgcm9sZTogXCJzeXN0ZW1cIiwgY29udGVudDogU0VDVVJJVFlfU1lTVEVNX1BST01QVCB9LFxuICAgICAgICAgICAgICB7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBgQXVkaXQgdGhpcyB1c2VyL2RldmljZSBzbmFwc2hvdCBhbmQgcmV0dXJuIEpTT04gb25seTpcXG4ke3NuYXBzaG90U3RyfWAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICk7XG4gICAgICAgIGlmIChzdGF0dXMgIT09IDIwMCkgcmV0dXJuIHsgc3RhdHVzLCBib2R5OiB7IGVycm9yOiBib2R5Py5lcnJvcj8ubWVzc2FnZSB8fCBcIk9wZW5Sb3V0ZXIgcmVxdWVzdCBmYWlsZWRcIiB9IH07XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBib2R5Py5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgXCJcIjtcbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiAyMDAsIGJvZHk6IHsgcmF3OiBjb250ZW50LCBtb2RlbDogXCJudmlkaWEvbmVtb3Ryb24tMy1zdXBlci0xMjBiLWExMmI6ZnJlZVwiIH0gfTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgLmVudiB2YWx1ZXMgaW50byBwcm9jZXNzLmVudiBzbyBzZXJ2ZXItc2lkZSBtaWRkbGV3YXJlIChhdXRoIHZlcmlmaWNhdGlvbixcbiAgLy8gT3BlblJvdXRlciBjYWxscywgZXRjLikgY2FuIHJlYWQgU1VQQUJBU0VfVVJMIC8gU1VQQUJBU0VfUFVCTElTSEFCTEVfS0VZIC9cbiAgLy8gT1BFTkFJX0FQSV9LRVkgaW4gZGV2ZWxvcG1lbnQuIFZpdGUgbm9ybWFsbHkgb25seSBleHBvc2VzIHRoZXNlIHZpYVxuICAvLyBpbXBvcnQubWV0YS5lbnYgdG8gdGhlIGNsaWVudC5cbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcbiAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoZW52KSkge1xuICAgIGlmIChwcm9jZXNzLmVudltrXSA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwcm9jZXNzLmVudltrXSA9IHY7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIHBvcnQ6IDUwMDAsXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIC8vIEFsbG93IHBhc3NrZXlzIChXZWJBdXRobikgaW5zaWRlIHRoZSBSZXBsaXQgcHJldmlldyBpZnJhbWUgYW5kIG9uIHByb2R1Y3Rpb24uXG4gICAgICBcIlBlcm1pc3Npb25zLVBvbGljeVwiOiBcInB1YmxpY2tleS1jcmVkZW50aWFscy1jcmVhdGU9KHNlbGYpLCBwdWJsaWNrZXktY3JlZGVudGlhbHMtZ2V0PShzZWxmKVwiLFxuICAgICAgXCJYLUNvbnRlbnQtVHlwZS1PcHRpb25zXCI6IFwibm9zbmlmZlwiLFxuICAgICAgXCJSZWZlcnJlci1Qb2xpY3lcIjogXCJzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luXCIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCksIGFpUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHsgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIikgfSxcbiAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvZCxTQUFTLGNBQWMsZUFBNEI7QUFDdmdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTSwyQkFBMkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFjakMsSUFBTSx5QkFBeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF1Qi9CLElBQU0saUJBQWlCLEtBQUs7QUFDNUIsSUFBTSxpQkFBaUI7QUFDdkIsSUFBTSxhQUFhO0FBQ25CLElBQU0sVUFBVSxvQkFBSSxJQUE4QztBQUVsRSxJQUFNLFlBQVksQ0FBQyxRQUFnQjtBQUNqQyxRQUFNLE1BQU0sS0FBSyxJQUFJO0FBQ3JCLFFBQU0sSUFBSSxRQUFRLElBQUksR0FBRztBQUN6QixNQUFJLENBQUMsS0FBSyxNQUFNLEVBQUUsUUFBUSxnQkFBZ0I7QUFDeEMsWUFBUSxJQUFJLEtBQUssRUFBRSxPQUFPLEtBQUssT0FBTyxFQUFFLENBQUM7QUFDekMsV0FBTyxFQUFFLFNBQVMsS0FBSztBQUFBLEVBQ3pCO0FBQ0EsSUFBRSxTQUFTO0FBQ1gsTUFBSSxFQUFFLFFBQVEsWUFBWTtBQUN4QixXQUFPLEVBQUUsU0FBUyxPQUFPLFlBQVksS0FBSyxNQUFNLEVBQUUsUUFBUSxpQkFBaUIsT0FBTyxHQUFJLEVBQUU7QUFBQSxFQUMxRjtBQUNBLFNBQU8sRUFBRSxTQUFTLEtBQUs7QUFDekI7QUFFQSxJQUFNLGtCQUFrQixDQUFDLFdBQTBCO0FBQ2pELE1BQUksQ0FBQyxPQUFRLFFBQU87QUFDcEIsTUFBSTtBQUNGLFVBQU0sSUFBSSxJQUFJLElBQUksTUFBTTtBQUN4QixRQUFJLEVBQUUsYUFBYSxlQUFlLEVBQUUsYUFBYSxZQUFhLFFBQU87QUFDckUsUUFBSSxFQUFFLFNBQVMsU0FBUyxhQUFhLEVBQUcsUUFBTztBQUMvQyxRQUFJLEVBQUUsU0FBUyxTQUFTLGFBQWEsRUFBRyxRQUFPO0FBQy9DLFFBQUksRUFBRSxTQUFTLFNBQVMsY0FBYyxFQUFHLFFBQU87QUFBQSxFQUNsRCxRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxJQUFNLFVBQVUsQ0FBQyxLQUFVLFFBQWE7QUFDdEMsUUFBTSxTQUFTLElBQUksUUFBUSxVQUFVO0FBQ3JDLE1BQUksVUFBVSwrQkFBK0IsZ0JBQWdCLE1BQU0sSUFBSSxVQUFVLE1BQU0sTUFBTTtBQUM3RixNQUFJLFVBQVUsUUFBUSxRQUFRO0FBQzlCLE1BQUksVUFBVSxnQ0FBZ0MsZUFBZTtBQUM3RCxNQUFJLFVBQVUsZ0NBQWdDLDZCQUE2QjtBQUMzRSxNQUFJLFVBQVUsMEJBQTBCLFNBQVM7QUFDakQsTUFBSSxVQUFVLG1CQUFtQixpQ0FBaUM7QUFDcEU7QUFNQSxJQUFNLGFBQWEsT0FBTyxTQUFvRDtBQUM1RSxNQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsS0FBSyxJQUFJLEdBQUc7QUFDdEMsV0FBTyxFQUFFLElBQUksT0FBTyxRQUFRLEtBQUssTUFBTSxZQUFZLFNBQVMscUNBQXFDO0FBQUEsRUFDbkc7QUFDQSxRQUFNLFFBQVEsS0FBSyxRQUFRLGVBQWUsRUFBRSxFQUFFLEtBQUs7QUFDbkQsTUFBSSxDQUFDLE1BQU8sUUFBTyxFQUFFLElBQUksT0FBTyxRQUFRLEtBQUssTUFBTSxZQUFZLFNBQVMscUJBQXFCO0FBRTdGLFFBQU0sVUFBVSxRQUFRLElBQUksZ0JBQWdCLFFBQVEsSUFBSTtBQUN4RCxRQUFNLFVBQ0osUUFBUSxJQUFJLDRCQUNaLFFBQVEsSUFBSSxpQ0FDWixRQUFRLElBQUk7QUFDZCxNQUFJLENBQUMsV0FBVyxDQUFDLFNBQVM7QUFDeEIsWUFBUSxNQUFNLGtDQUFrQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3hGLFdBQU87QUFBQSxNQUNMLElBQUk7QUFBQSxNQUNKLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLFNBQ0U7QUFBQSxJQUNKO0FBQUEsRUFDRjtBQUNBLE1BQUk7QUFDRixVQUFNLElBQUksTUFBTSxNQUFNLEdBQUcsT0FBTyxpQkFBaUI7QUFBQSxNQUMvQyxTQUFTLEVBQUUsZUFBZSxVQUFVLEtBQUssSUFBSSxRQUFRLFFBQVE7QUFBQSxJQUMvRCxDQUFDO0FBQ0QsUUFBSSxDQUFDLEVBQUUsSUFBSTtBQUNULFVBQUksU0FBUztBQUNiLFVBQUk7QUFBRSxjQUFNLElBQVMsTUFBTSxFQUFFLEtBQUs7QUFBRyxpQkFBUyxHQUFHLE9BQU8sR0FBRyxXQUFXO0FBQUEsTUFBSSxRQUFRO0FBQUEsTUFBUTtBQUMxRixhQUFPO0FBQUEsUUFDTCxJQUFJO0FBQUEsUUFDSixRQUFRO0FBQUEsUUFDUixNQUFNLEVBQUUsV0FBVyxPQUFPLEVBQUUsV0FBVyxNQUFNLG9CQUFvQjtBQUFBLFFBQ2pFLFNBQ0UsRUFBRSxXQUFXLE9BQU8sRUFBRSxXQUFXLE1BQzdCLHdFQUNBLG1CQUFtQixFQUFFLE1BQU0sTUFBTSxVQUFVLHVCQUF1QjtBQUFBLE1BQzFFO0FBQUEsSUFDRjtBQUNBLFVBQU0sSUFBUyxNQUFNLEVBQUUsS0FBSztBQUM1QixRQUFJLENBQUMsR0FBRyxHQUFJLFFBQU8sRUFBRSxJQUFJLE9BQU8sUUFBUSxLQUFLLE1BQU0sV0FBVyxTQUFTLGtDQUFrQztBQUN6RyxXQUFPLEVBQUUsSUFBSSxNQUFNLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQUEsRUFDeEMsU0FBUyxLQUFLO0FBQ1osWUFBUSxNQUFNLHNDQUFzQyxHQUFHO0FBQ3ZELFdBQU8sRUFBRSxJQUFJLE9BQU8sUUFBUSxLQUFLLE1BQU0sa0JBQWtCLFNBQVMsOENBQThDO0FBQUEsRUFDbEg7QUFDRjtBQUVBLElBQU0sV0FBVyxDQUFDLEtBQVUsTUFBTSxtQkFDaEMsSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQy9CLE1BQUksT0FBTztBQUNYLE1BQUksT0FBTztBQUNYLE1BQUksR0FBRyxRQUFRLENBQUMsVUFBa0I7QUFDaEMsWUFBUSxNQUFNO0FBQ2QsUUFBSSxPQUFPLEtBQUs7QUFDZCxhQUFPLElBQUksTUFBTSxnQkFBZ0IsQ0FBQztBQUNsQyxVQUFJO0FBQUUsWUFBSSxRQUFRO0FBQUEsTUFBRyxRQUFRO0FBQUEsTUFBYTtBQUMxQztBQUFBLElBQ0Y7QUFDQSxZQUFRLE1BQU0sU0FBUyxNQUFNO0FBQUEsRUFDL0IsQ0FBQztBQUNELE1BQUksR0FBRyxPQUFPLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFDakMsTUFBSSxHQUFHLFNBQVMsTUFBTTtBQUN4QixDQUFDO0FBRUgsSUFBTSxPQUFPLENBQUMsS0FBVSxRQUFnQixZQUFpQjtBQUN2RCxNQUFJLGFBQWE7QUFDakIsTUFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsTUFBSSxJQUFJLEtBQUssVUFBVSxPQUFPLENBQUM7QUFDakM7QUFFQSxJQUFNLFFBQVEsQ0FBQyxRQUFxQjtBQUNsQyxRQUFNLE1BQU0sSUFBSSxRQUFRLGlCQUFpQjtBQUN6QyxNQUFJLE9BQU8sUUFBUSxZQUFZLElBQUksU0FBUyxFQUFHLFFBQU8sSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSztBQUM3RSxTQUFRLElBQUksUUFBUSxpQkFBNEI7QUFDbEQ7QUFFQSxJQUFNLFdBQVcsT0FBZTtBQUFBLEVBQzlCLE1BQU07QUFBQSxFQUNOLGdCQUFnQixRQUFRO0FBQ3RCLFVBQU0sU0FBUyxPQUNiLEtBQ0EsS0FDQSxNQUNBLFlBQ0c7QUFDSCxjQUFRLEtBQUssR0FBRztBQUNoQixVQUFJLElBQUksV0FBVyxXQUFXO0FBQUUsWUFBSSxhQUFhO0FBQUssZUFBTyxJQUFJLElBQUk7QUFBQSxNQUFHO0FBQ3hFLFVBQUksSUFBSSxXQUFXLE9BQVEsUUFBTyxLQUFLLEtBQUssS0FBSyxFQUFFLE9BQU8scUJBQXFCLENBQUM7QUFFaEYsWUFBTSxTQUFVLElBQUksUUFBUSxVQUFpQztBQUM3RCxVQUFJLENBQUMsZ0JBQWdCLE1BQU0sRUFBRyxRQUFPLEtBQUssS0FBSyxLQUFLLEVBQUUsT0FBTyxxQkFBcUIsQ0FBQztBQUVuRixZQUFNLEtBQUssTUFBTSxHQUFHO0FBQ3BCLFlBQU0sS0FBSyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsRUFBRTtBQUNwQyxVQUFJLENBQUMsR0FBRyxTQUFTO0FBQ2YsWUFBSSxVQUFVLGVBQWUsT0FBTyxHQUFHLGNBQWMsRUFBRSxDQUFDO0FBQ3hELGVBQU8sS0FBSyxLQUFLLEtBQUssRUFBRSxPQUFPLHVDQUF1QyxDQUFDO0FBQUEsTUFDekU7QUFFQSxZQUFNLE9BQU8sTUFBTSxXQUFXLElBQUksUUFBUSxpQkFBaUIsSUFBSSxRQUFRLGFBQWE7QUFDcEYsVUFBSSxDQUFDLEtBQUssR0FBSSxRQUFPLEtBQUssS0FBSyxLQUFLLFFBQVEsRUFBRSxPQUFPLEtBQUssU0FBUyxNQUFNLEtBQUssS0FBSyxDQUFDO0FBRXBGLFVBQUk7QUFDSixVQUFJO0FBQ0YsY0FBTSxNQUFNLFNBQVMsR0FBRztBQUFBLE1BQzFCLFNBQVMsR0FBUTtBQUNmLFlBQUksR0FBRyxZQUFZLGlCQUFrQixRQUFPLEtBQUssS0FBSyxLQUFLLEVBQUUsT0FBTyx5QkFBeUIsQ0FBQztBQUM5RixlQUFPLEtBQUssS0FBSyxLQUFLLEVBQUUsT0FBTyx1QkFBdUIsQ0FBQztBQUFBLE1BQ3pEO0FBRUEsVUFBSTtBQUNKLFVBQUk7QUFBRSxrQkFBVSxNQUFNLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQztBQUFBLE1BQUcsUUFDdEM7QUFBRSxlQUFPLEtBQUssS0FBSyxLQUFLLEVBQUUsT0FBTyxvQkFBb0IsQ0FBQztBQUFBLE1BQUc7QUFFL0QsVUFBSTtBQUNGLGNBQU0sRUFBRSxRQUFRLEtBQUssSUFBSSxNQUFNLFFBQVEsU0FBUyxNQUFNO0FBQ3RELGVBQU8sS0FBSyxLQUFLLFFBQVEsSUFBSTtBQUFBLE1BQy9CLFNBQVMsS0FBSztBQUNaLGdCQUFRLE1BQU0sSUFBSSxJQUFJLG9CQUFvQixHQUFHO0FBQzdDLGVBQU8sS0FBSyxLQUFLLEtBQUssRUFBRSxPQUFPLGVBQWUsUUFBUSxJQUFJLFVBQVUsaUJBQWlCLENBQUM7QUFBQSxNQUN4RjtBQUFBLElBQ0Y7QUFFQSxVQUFNLGlCQUFpQixPQUFPLE1BQVcsV0FBMEI7QUFDakUsWUFBTSxTQUFTLFFBQVEsSUFBSSxrQkFBa0IsUUFBUSxJQUFJO0FBQ3pELFVBQUksQ0FBQyxPQUFRLFFBQU8sRUFBRSxRQUFRLEtBQUssTUFBTSxFQUFFLE9BQU8sbUNBQW1DLEVBQUU7QUFDdkYsWUFBTSxXQUFXLE1BQU0sTUFBTSxpREFBaUQ7QUFBQSxRQUM1RSxRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsVUFDUCxlQUFlLFVBQVUsTUFBTTtBQUFBLFVBQy9CLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQixVQUFVO0FBQUEsVUFDMUIsV0FBVztBQUFBLFFBQ2I7QUFBQSxRQUNBLE1BQU0sS0FBSyxVQUFVLElBQUk7QUFBQSxNQUMzQixDQUFDO0FBQ0QsWUFBTSxPQUFZLE1BQU0sU0FBUyxLQUFLO0FBQ3RDLGFBQU8sRUFBRSxRQUFRLFNBQVMsS0FBSyxNQUFNLFNBQVMsUUFBUSxNQUFNLEtBQUs7QUFBQSxJQUNuRTtBQUVBLFdBQU8sWUFBWTtBQUFBLE1BQUk7QUFBQSxNQUFnQixDQUFDLEtBQUssUUFDM0MsT0FBTyxLQUFLLEtBQUssUUFBUSxPQUFPLFNBQVMsV0FBVztBQUNsRCxjQUFNLFdBQVcsTUFBTSxRQUFRLFNBQVMsUUFBUSxJQUFJLFFBQVEsV0FBVztBQUN2RSxZQUFJLENBQUMsWUFBWSxTQUFTLFdBQVcsRUFBRyxRQUFPLEVBQUUsUUFBUSxLQUFLLE1BQU0sRUFBRSxPQUFPLHlCQUF5QixFQUFFO0FBQ3hHLFlBQUksU0FBUyxTQUFTLEdBQUksUUFBTyxFQUFFLFFBQVEsS0FBSyxNQUFNLEVBQUUsT0FBTyxvQkFBb0IsRUFBRTtBQUNyRixtQkFBVyxLQUFLLFVBQVU7QUFDeEIsY0FBSSxDQUFDLEtBQUssT0FBTyxFQUFFLFNBQVMsWUFBWSxPQUFPLEVBQUUsWUFBWTtBQUMzRCxtQkFBTyxFQUFFLFFBQVEsS0FBSyxNQUFNLEVBQUUsT0FBTyw4Q0FBOEMsRUFBRTtBQUN2RixjQUFJLEVBQUUsUUFBUSxTQUFTLEtBQU8sUUFBTyxFQUFFLFFBQVEsS0FBSyxNQUFNLEVBQUUsT0FBTywyQkFBMkIsRUFBRTtBQUFBLFFBQ2xHO0FBQ0EsY0FBTSxXQUFXLFNBQVMsQ0FBQyxHQUFHLFNBQVMsV0FDbkMsQ0FBQyxFQUFFLE1BQU0sVUFBVSxTQUFTLEdBQUcsd0JBQXdCO0FBQUE7QUFBQSxFQUFPLFNBQVMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxHQUFHLEdBQUcsU0FBUyxNQUFNLENBQUMsQ0FBQyxJQUMzRyxDQUFDLEVBQUUsTUFBTSxVQUFVLFNBQVMseUJBQXlCLEdBQUcsR0FBRyxRQUFRO0FBQ3ZFLGNBQU0sRUFBRSxRQUFRLEtBQUssSUFBSSxNQUFNO0FBQUEsVUFDN0IsRUFBRSxPQUFPLDBDQUEwQyxVQUFVLFdBQVcsRUFBRSxTQUFTLEtBQUssRUFBRTtBQUFBLFVBQzFGO0FBQUEsUUFDRjtBQUNBLFlBQUksV0FBVyxJQUFLLFFBQU8sRUFBRSxRQUFRLE1BQU0sRUFBRSxPQUFPLE1BQU0sT0FBTyxXQUFXLDRCQUE0QixFQUFFO0FBQzFHLGNBQU0sU0FBUyxNQUFNLFVBQVUsQ0FBQyxHQUFHO0FBQ25DLGVBQU87QUFBQSxVQUNMLFFBQVE7QUFBQSxVQUNSLE1BQU07QUFBQSxZQUNKLFVBQVUsUUFBUSxXQUFXO0FBQUEsWUFDN0IsbUJBQW1CLFFBQVEscUJBQXFCO0FBQUEsWUFDaEQsT0FBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUVBLFdBQU8sWUFBWTtBQUFBLE1BQUk7QUFBQSxNQUFpQixDQUFDLEtBQUssUUFDNUMsT0FBTyxLQUFLLEtBQUssU0FBUyxPQUFPLFNBQVMsV0FBVztBQUNuRCxjQUFNLFNBQVMsT0FBTyxTQUFTLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxJQUFJO0FBQzdFLFlBQUksQ0FBQyxPQUFRLFFBQU8sRUFBRSxRQUFRLEtBQUssTUFBTSxFQUFFLE9BQU8scUJBQXFCLEVBQUU7QUFDekUsWUFBSSxPQUFPLFNBQVMsSUFBTSxRQUFPLEVBQUUsUUFBUSxLQUFLLE1BQU0sRUFBRSxPQUFPLHFCQUFxQixFQUFFO0FBQ3RGLGNBQU0sRUFBRSxRQUFRLEtBQUssSUFBSSxNQUFNO0FBQUEsVUFDN0I7QUFBQSxZQUNFLE9BQU87QUFBQSxZQUNQLFVBQVUsQ0FBQyxFQUFFLE1BQU0sUUFBUSxTQUFTLE9BQU8sQ0FBQztBQUFBLFlBQzVDLFlBQVksQ0FBQyxPQUFPO0FBQUEsVUFDdEI7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUNBLFlBQUksV0FBVyxJQUFLLFFBQU8sRUFBRSxRQUFRLE1BQU0sRUFBRSxPQUFPLE1BQU0sT0FBTyxXQUFXLGtDQUFrQyxFQUFFO0FBQ2hILGNBQU0sVUFBVSxNQUFNLFVBQVUsQ0FBQyxHQUFHO0FBQ3BDLGNBQU0sV0FBVyxTQUFTLFNBQVMsQ0FBQyxHQUFHLFdBQVcsT0FBTztBQUN6RCxlQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsVUFDUixNQUFNLEVBQUUsT0FBTyxVQUFVLFVBQVUsU0FBUyxXQUFXLElBQUksT0FBTyw4QkFBOEI7QUFBQSxRQUNsRztBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFFQSxXQUFPLFlBQVk7QUFBQSxNQUFJO0FBQUEsTUFBeUIsQ0FBQyxLQUFLLFFBQ3BELE9BQU8sS0FBSyxLQUFLLE9BQU8sT0FBTyxTQUFTLFdBQVc7QUFDakQsY0FBTSxXQUFXLFNBQVM7QUFDMUIsWUFBSSxDQUFDLFlBQVksT0FBTyxhQUFhO0FBQ25DLGlCQUFPLEVBQUUsUUFBUSxLQUFLLE1BQU0sRUFBRSxPQUFPLDhCQUE4QixFQUFFO0FBQ3ZFLFlBQUksY0FBYztBQUNsQixZQUFJO0FBQUUsd0JBQWMsS0FBSyxVQUFVLFFBQVEsRUFBRSxNQUFNLEdBQUcsR0FBSTtBQUFBLFFBQUcsUUFDdkQ7QUFBRSxpQkFBTyxFQUFFLFFBQVEsS0FBSyxNQUFNLEVBQUUsT0FBTyxxQ0FBcUMsRUFBRTtBQUFBLFFBQUc7QUFDdkYsY0FBTSxFQUFFLFFBQVEsS0FBSyxJQUFJLE1BQU07QUFBQSxVQUM3QjtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsVUFBVTtBQUFBLGNBQ1IsRUFBRSxNQUFNLFVBQVUsU0FBUyx1QkFBdUI7QUFBQSxjQUNsRCxFQUFFLE1BQU0sUUFBUSxTQUFTO0FBQUEsRUFBMEQsV0FBVyxHQUFHO0FBQUEsWUFDbkc7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFDQSxZQUFJLFdBQVcsSUFBSyxRQUFPLEVBQUUsUUFBUSxNQUFNLEVBQUUsT0FBTyxNQUFNLE9BQU8sV0FBVyw0QkFBNEIsRUFBRTtBQUMxRyxjQUFNLFVBQVUsTUFBTSxVQUFVLENBQUMsR0FBRyxTQUFTLFdBQVc7QUFDeEQsZUFBTyxFQUFFLFFBQVEsS0FBSyxNQUFNLEVBQUUsS0FBSyxTQUFTLE9BQU8seUNBQXlDLEVBQUU7QUFBQSxNQUNoRyxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYSxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBSzlDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxhQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssT0FBTyxRQUFRLEdBQUcsR0FBRztBQUN4QyxRQUFJLFFBQVEsSUFBSSxDQUFDLE1BQU0sVUFBYSxPQUFPLE1BQU0sVUFBVTtBQUN6RCxjQUFRLElBQUksQ0FBQyxJQUFJO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsU0FBUztBQUFBO0FBQUEsUUFFUCxzQkFBc0I7QUFBQSxRQUN0QiwwQkFBMEI7QUFBQSxRQUMxQixtQkFBbUI7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQUEsSUFDN0IsU0FBUztBQUFBLE1BQ1AsT0FBTyxFQUFFLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU8sRUFBRTtBQUFBLElBQ2pEO0FBQUEsRUFDQTtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
