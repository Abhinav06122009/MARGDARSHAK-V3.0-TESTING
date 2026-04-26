const {
  corsHeaders,
  isOriginAllowed,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
} = require("./_shared/security");

const MODEL = "sourceful/riverflow-v2-pro";

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!isOriginAllowed(origin)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  const ip = getClientIp(event);
  const rl = rateLimit(`image:${ip}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...headers, "Retry-After": String(rl.retryAfter || 60) },
      body: JSON.stringify({ error: "Too many requests. Please slow down." }),
    };
  }

  const auth = await verifyClerkUser(event.headers?.authorization || event.headers?.Authorization);
  if (!auth.ok) {
    return { statusCode: auth.status, headers, body: JSON.stringify({ error: auth.message, code: auth.code }) };
  }
  const user = auth.user;

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server is missing OPENAI_API_KEY or VITE_OPENAI_API_KEY" }) };
  }

  if (event.body && event.body.length > MAX_BODY_BYTES) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: "Request body too large" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "prompt is required" }) };
  }
  if (prompt.length > 4000) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "prompt is too long" }) };
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": origin || "https://margdarshak-ai.netlify.app",
        "X-Title": "MARGDARSHAK AI Tutor",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image"],
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        headers,
        body: JSON.stringify({ error: data?.error?.message || "OpenRouter image request failed" }),
      };
    }
    const message = data?.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url ?? null;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        image: imageUrl,
        response: message?.content ?? "",
        model: MODEL,
      }),
    };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err instanceof Error ? err.message : "Upstream error" }) };
  }
};
