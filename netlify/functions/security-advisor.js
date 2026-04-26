const {
  corsHeaders,
  isOriginAllowed,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
} = require("./_shared/security");

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

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

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  if (!isOriginAllowed(origin)) return { statusCode: 403, headers, body: JSON.stringify({ error: "Origin not allowed" }) };

  const ip = getClientIp(event);
  const rl = rateLimit(`sec:${ip}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...headers, "Retry-After": String(rl.retryAfter || 60) },
      body: JSON.stringify({ error: "Too many requests. Please slow down." }),
    };
  }

  const user = await verifyClerkUser(event.headers?.authorization || event.headers?.Authorization);
  if (!user.ok) return { statusCode: user.status, headers, body: JSON.stringify({ error: user.message, code: user.code }) };

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "Server is missing OPENAI_API_KEY or VITE_OPENAI_API_KEY" }) };

  if (event.body && event.body.length > MAX_BODY_BYTES) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: "Request body too large" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const snapshot = payload?.snapshot;
  if (!snapshot || typeof snapshot !== "object") {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "snapshot object is required" }) };
  }

  // Sanitize snapshot to a small JSON string
  let snapshotStr = "";
  try {
    snapshotStr = JSON.stringify(snapshot).slice(0, 6000);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "snapshot must be JSON-serialisable" }) };
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": origin || "https://margdarshak-ai.netlify.app",
        "X-Title": "MARGDARSHAK Security Advisor",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SECURITY_SYSTEM_PROMPT },
          { role: "user", content: `Audit this user/device snapshot and return JSON only:\n${snapshotStr}` },
        ],
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return { statusCode: upstream.status, headers, body: JSON.stringify({ error: data?.error?.message || "OpenRouter request failed" }) };
    }
    const content = data?.choices?.[0]?.message?.content || "";
    return { statusCode: 200, headers, body: JSON.stringify({ raw: content, model: MODEL }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err instanceof Error ? err.message : "Upstream error" }) };
  }
};
