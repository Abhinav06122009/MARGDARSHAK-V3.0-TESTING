const {
  corsHeaders,
  isOriginAllowed,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
} = require("./_shared/security");

const DEFAULT_FREE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const ELITE_UPGRADE_MODEL = "anthropic/claude-3.5-sonnet";
const PREMIUM_UPGRADE_MODEL = "google/gemini-2.0-flash-001";

const FORMATTING_SYSTEM_PROMPT = `CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Under no circumstances should you output math delimiters like \\(, \\), \\[, \\], or $$, nor should you use backslash commands like \\frac, \\theta, \\sqrt, \\times, or \\cdot.

For all mathematics, physics, equations, and scientific notation, you MUST use plain text, standard Markdown, and Unicode characters.

Variables & Greek Letters: Use standard text or Unicode (e.g., x, y, θ, π, Δ, Σ).

Fractions: Use a forward slash and parentheses for clear grouping (e.g., (m * v^2) / r instead of \\frac{mv^2}{r}).

Exponents & Roots: Use the caret symbol ^ or Unicode superscripts (e.g., v^2 or v²), and use the Unicode square root symbol √ (e.g., √(r * g)).

Multiplication: Use * or simply place variables next to each other (e.g., m * g or mg).

Your output must be 100% human-readable on platforms that do not have any math rendering capabilities. Prioritize extreme clarity in plain text.`;

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
  const rl = rateLimit(`chat:${ip}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...headers, "Retry-After": String(rl.retryAfter || 60) },
      body: JSON.stringify({ error: "Too many requests. Please slow down." }),
    };
  }

  const auth = await verifyClerkUser(event.headers?.authorization || event.headers?.Authorization);
  if (!auth.ok) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: auth.message, code: auth.code }) };
  }
  const user = auth.user;

  // --- FETCH USER PROFILE FOR TIER CHECK ---
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(supaUrl, supaKey);

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  // --- ROBUST TIER DETECTION (EXACT MATCH ONLY) ---
  const metadata = user.metadata || {};
  const jwtPayload = user._raw || {};
  
  const subscription = metadata.subscription || jwtPayload.subscription || {};
  let userTier = (
    subscription.tier || 
    metadata.subscription_tier || 
    metadata.tier || 
    profile?.subscription_tier || 
    'free'
  ).toLowerCase();

  // MASTER OVERRIDES
  const MASTER_IDS = [
    'user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 
    'user_3CylWpMJnNbVpgJcpk9eSIf73gS'
  ];
  if (MASTER_IDS.includes(user.id)) {
    userTier = 'premium_elite';
  }

  const userApiKey = event.headers?.["x-user-api-key"] || event.headers?.["X-User-API-Key"];

  // Logic: Elite can use inbuilt key. Premium MUST use their own.
  const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite', 'elite'];
  const isElite = ELITE_TIERS.includes(userTier);

  let apiKeyToUse = userApiKey;
  
  if (!isElite) {
    if (!userApiKey) {
      return { 
        statusCode: 403, 
        headers, 
        body: JSON.stringify({ 
          error: "API Key Required: Your current plan (Premium) requires you to provide your own OpenRouter API key. Inbuilt keys are reserved for Elite members only.",
          code: "KEY_REQUIRED" 
        }) 
      };
    }
    apiKeyToUse = userApiKey;
  } else {
    apiKeyToUse = userApiKey || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  }

  if (!apiKeyToUse) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "No API key available for this request." }) };
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

  const incoming = Array.isArray(payload.messages) ? payload.messages : null;
  if (!incoming || incoming.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "messages[] is required" }) };
  }

  let messages = [...incoming];
  if (messages[0]?.role === "system") {
    if (typeof messages[0].content === "string") {
      messages[0].content = `${FORMATTING_SYSTEM_PROMPT}\n\n${messages[0].content}`;
    }
  } else {
    messages = [{ role: "system", content: FORMATTING_SYSTEM_PROMPT }, ...messages];
  }

  const isPremium = userTier === 'premium' || isElite;
  
  let modelToUse = payload.model || DEFAULT_FREE_MODEL;
  if (modelToUse === DEFAULT_FREE_MODEL || modelToUse.endsWith(':free')) {
    if (isElite) modelToUse = ELITE_UPGRADE_MODEL;
    else if (isPremium) modelToUse = PREMIUM_UPGRADE_MODEL;
  }

  console.log(`[AI-CHAT] User: ${user.id} | Tier: ${userTier} | Model: ${modelToUse}`);

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKeyToUse}`,
        "Content-Type": "application/json",
        "HTTP-Referer": origin || "https://margdarshak-ai.netlify.app",
        "X-Title": "MARGDARSHAK AI Tutor",
      },
      body: JSON.stringify({ 
        model: modelToUse, 
        messages 
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      const isInvalidKey = upstream.status === 401 || data?.error?.code === 'invalid_api_key';
      return {
        statusCode: upstream.status,
        headers,
        body: JSON.stringify({ 
          error: isInvalidKey ? "🔑 Invalid API Key" : (data?.error?.message || "OpenRouter request failed"),
          code: isInvalidKey ? "INVALID_KEY" : "UPSTREAM_ERROR"
        }),
      };
    }
    const choice = data?.choices?.[0]?.message;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: choice?.content ?? "",
        model: modelToUse,
      }),
    };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Upstream error" }) };
  }
};
