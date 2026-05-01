const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// --- SHARED SECURITY LOGIC (INLINED FOR RELIABILITY) ---
const MAX_BODY_BYTES = 20 * 1024 * 1024; // 20MB for Vision

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-API-Key",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin",
});

const verifyClerkUser = async (authHeader) => {
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) return { ok: false, message: "Missing token" };
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { ok: false, message: "Invalid format" };
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return { ok: true, user: { id: payload.sub, metadata: payload.public_metadata || {}, _raw: payload } };
  } catch (e) { return { ok: false, message: e.message }; }
};

// --- CONFIGURATION ---
const DEFAULT_FREE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const ELITE_UPGRADE_MODEL = "nvidia/nemotron-4-340b-instruct";
const PREMIUM_UPGRADE_MODEL = "nvidia/nemotron-3-super-120b-a12b";
const VISION_RESEARCH_MODEL = "google/gemini-2.0-flash-001";

const FORMATTING_SYSTEM_PROMPT = `CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Under no circumstances should you output math delimiters like \\(, \\), \\[, \\], or $$, nor should you use backslash commands like \\frac, \\theta, \\sqrt, \\times, or \\cdot. For all mathematics, physics, equations, and scientific notation, you MUST use plain text, standard Markdown, and Unicode characters. Your output must be 100% human-readable on platforms that do not have any math rendering capabilities. Prioritize extreme clarity in plain text.`;

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method not allowed" };

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
    
    userTier = (
      user.metadata?.subscription?.tier || 
      user.metadata?.subscription_tier || 
      profile?.subscription_tier || 
      'free'
    ).toLowerCase();

    const MASTER_IDS = ['user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 'user_3CylWpMJnNbVpgJcpk9eSIf73gS'];
    if (MASTER_IDS.includes(user.id)) userTier = 'premium_elite';
  } catch (e) { console.error("[AI-CHAT] Tier check error:", e.message); }

  const userApiKey = event.headers?.["x-user-api-key"] || event.headers?.["X-User-API-Key"];
  const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite', 'elite'];
  const isElite = ELITE_TIERS.includes(userTier);
  const isPremium = userTier === 'premium' || isElite;

  let apiKeyToUse = userApiKey;
  if (isElite) apiKeyToUse = userApiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!isElite && !userApiKey) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "API Key Required for Premium members.", code: "KEY_REQUIRED" }) };
  }

  if (!apiKeyToUse) return { statusCode: 500, headers, body: JSON.stringify({ error: "No API key configured." }) };

  const payload = JSON.parse(event.body || "{}");
  const incoming = Array.isArray(payload.messages) ? payload.messages : [];
  if (incoming.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: "No messages provided" }) };

  let messages = [...incoming];
  const systemPrompt = messages.find(m => m.role === 'system');
  if (systemPrompt) systemPrompt.content = `${FORMATTING_SYSTEM_PROMPT}\n\n${systemPrompt.content}`;
  else messages = [{ role: "system", content: FORMATTING_SYSTEM_PROMPT }, ...messages];

  const hasImages = messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url'));
  const isResearch = payload.task === 'research';

  let modelToUse = payload.model || DEFAULT_FREE_MODEL;
  if (isResearch || hasImages) modelToUse = VISION_RESEARCH_MODEL;
  else if (modelToUse === DEFAULT_FREE_MODEL || modelToUse.endsWith(':free')) {
    if (isElite) modelToUse = ELITE_UPGRADE_MODEL;
    else if (isPremium) modelToUse = PREMIUM_UPGRADE_MODEL;
  }

  console.log(`[AI-CHAT] ${user.id} | ${userTier} | ${modelToUse}`);

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
          system_instruction: { parts: [{ text: messages.find(m => m.role === 'system')?.content || "" }] }
        })
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ response: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", model: modelToUse }) };
    } else {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKeyToUse}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://margdarshan.tech",
          "X-Title": "MARGDARSHAK AI",
        },
        body: JSON.stringify({ model: modelToUse, messages })
      });
      const data = await res.json();
      if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: data?.error?.message || "OpenRouter Error" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ response: data?.choices?.[0]?.message?.content || "", model: modelToUse }) };
    }
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};
