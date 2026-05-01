const {
  corsHeaders,
  isOriginAllowed,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
} = require("./_shared/security");
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_FREE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const ELITE_UPGRADE_MODEL = "nvidia/nemotron-4-340b-instruct";
const PREMIUM_UPGRADE_MODEL = "nvidia/nemotron-3-super-120b-a12b";
const VISION_RESEARCH_MODEL = "google/gemini-2.0-flash-001";

const FORMATTING_SYSTEM_PROMPT = `CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Under no circumstances should you output math delimiters like \\(, \\), \\[, \\], or $$, nor should you use backslash commands like \\frac, \\theta, \\sqrt, \\times, or \\cdot. For all mathematics, physics, equations, and scientific notation, you MUST use plain text, standard Markdown, and Unicode characters. Your output must be 100% human-readable on platforms that do not have any math rendering capabilities. Prioritize extreme clarity in plain text.`;

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  if (!isOriginAllowed(origin)) return { statusCode: 403, headers, body: JSON.stringify({ error: "Origin not allowed" }) };

  const ip = getClientIp(event);
  const rl = rateLimit(`chat:${ip}`);
  if (!rl.allowed) return { statusCode: 429, headers: { ...headers, "Retry-After": String(rl.retryAfter || 60) }, body: JSON.stringify({ error: "Too many requests" }) };

  const auth = await verifyClerkUser(event.headers?.authorization || event.headers?.Authorization);
  if (!auth.ok) return { statusCode: 401, headers, body: JSON.stringify({ error: auth.message }) };
  const user = auth.user;

  // --- TIER CHECK ---
  let userTier = 'free';
  try {
    const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supaUrl, supaKey);
    const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
    userTier = (user.metadata?.subscription?.tier || user.metadata?.subscription_tier || profile?.subscription_tier || 'free').toLowerCase();
    const MASTER_IDS = ['user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 'user_3CylWpMJnNbVpgJcpk9eSIf73gS'];
    if (MASTER_IDS.includes(user.id)) userTier = 'premium_elite';
  } catch (e) {}

  const userApiKey = event.headers?.["x-user-api-key"] || event.headers?.["X-User-API-Key"];
  const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite', 'elite'];
  const isElite = ELITE_TIERS.includes(userTier);
  const isPremium = userTier === 'premium' || isElite;

  let apiKeyToUse = userApiKey;
  if (isElite) apiKeyToUse = userApiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!isElite && !userApiKey) return { statusCode: 403, headers, body: JSON.stringify({ error: "API Key Required", code: "KEY_REQUIRED" }) };
  if (!apiKeyToUse) return { statusCode: 500, headers, body: JSON.stringify({ error: "No API key" }) };

  const payload = JSON.parse(event.body || "{}");
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (messages.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: "No messages" }) };

  let systemPrompt = FORMATTING_SYSTEM_PROMPT;
  if (payload.jsonMode) {
    systemPrompt += "\n\nCRITICAL: Respond with VALID JSON ONLY. No markdown fences (```), no preamble, no explanation. Just the raw JSON string.";
  }

  const hasImages = messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url'));
  let modelToUse = payload.model || DEFAULT_FREE_MODEL;
  if (payload.task === 'research' || hasImages) modelToUse = VISION_RESEARCH_MODEL;
  else if (modelToUse === DEFAULT_FREE_MODEL || modelToUse.endsWith(':free')) {
    if (isElite) modelToUse = ELITE_UPGRADE_MODEL;
    else if (isPremium) modelToUse = PREMIUM_UPGRADE_MODEL;
  }

  console.log(`[NEURO-ENGINE] ${user.id} | ${userTier} | ${modelToUse} | JSON: ${!!payload.jsonMode}`);

  try {
    const isGoogle = modelToUse.startsWith('google/') || modelToUse.includes('gemini');
    if (isGoogle && process.env.GOOGLE_AI_STUDIO_KEY) {
      const googleModel = modelToUse.replace('google/', '');
      const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${process.env.GOOGLE_AI_STUDIO_KEY}`;
      
      const contents = messages.filter(m => m.role !== 'system').map(m => {
        const parts = Array.isArray(m.content) ? m.content.map(p => {
          if (p.type === 'text') return { text: p.text };
          if (p.type === 'image_url') return { inline_data: { mime_type: "image/jpeg", data: p.image_url.url.split(',')[1] || p.image_url.url } };
          return null;
        }).filter(Boolean) : [{ text: m.content }];
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });

      const res = await fetch(googleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents, 
          system_instruction: { parts: [{ text: systemPrompt }] },
          generationConfig: payload.jsonMode ? { response_mime_type: "application/json" } : {}
        })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { statusCode: 200, headers, body: JSON.stringify({ response: text, model: modelToUse }) };
    } else {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKeyToUse}`, "Content-Type": "application/json", "HTTP-Referer": "https://margdarshan.tech" },
        body: JSON.stringify({ model: modelToUse, messages: [{ role: "system", content: systemPrompt }, ...messages] })
      });
      const data = await res.json();
      let text = data?.choices?.[0]?.message?.content || "";
      return { statusCode: 200, headers, body: JSON.stringify({ response: text, model: modelToUse }) };
    }
  } catch (err) { return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) }; }
};
