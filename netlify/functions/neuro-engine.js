const fetch = globalThis.fetch;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-API-Key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  // CONSTANTS
  const DEFAULT_FREE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
  const PREMIUM_UPGRADE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
  const ELITE_UPGRADE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
  const VISION_RESEARCH_MODEL = "google/gemini-2.0-flash";

  const FORMATTING_SYSTEM_PROMPT = `CRITICAL FORMATTING INSTRUCTION: You must never use LaTeX, TeX, or MathJax formatting in your responses. Never use symbols like $, $$, \\[, \\], \\begin{...}, or any math-specific delimiters. For all mathematical expressions, chemical formulas, or technical notation, use plain human-readable text only (e.g., use 'x^2' instead of LaTeX math, and 'H2O' instead of subscripted text). If you ignore this, the user's interface will break.`;

  try {
    // 1. Identity Verification
    const authHeader = event.headers.authorization || "";
    const userApiKey = event.headers["x-user-api-key"] || "";
    const token = authHeader.replace("Bearer ", "");
    
    if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: "Authentication required" }) };

    // Robust token parse
    let user;
    try {
      // Use standard base64 decoding but replace URL-safe chars if needed
      const base64 = token.split(".")[1].replace(/-/g, '+').replace(/_/g, '/');
      user = JSON.parse(Buffer.from(base64, "base64").toString());
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid identity token" }) };
    }

    // 2. Fetch User Tier
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let userTier = "free";
    try {
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.sub}&select=subscription_tier`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
      });
      const profiles = await profileRes.json();
      userTier = profiles?.[0]?.subscription_tier || "free";
    } catch (e) { console.error("[NEURO-ENGINE] Profile fetch failed:", e.message); }

    const isElite = ["premium_elite", "extra_plus", "premium_plus"].includes(userTier);
    const isPremium = userTier === "premium" || isElite;
    const apiKeyToUse = isElite ? process.env.OPENAI_API_KEY : (userApiKey || process.env.OPENAI_API_KEY);

    // 3. Request Parsing
    const payload = JSON.parse(event.body || "{}");
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    if (messages.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: "No messages" }) };
    
    // IMAGE GENERATION INTERCEPT (Pollinations.ai / FLUX)
    if (payload.mode === 'imagegen') {
      try {
        const lastMsg = messages[messages.length - 1];
        const promptText = typeof lastMsg.content === 'string' ? lastMsg.content : lastMsg.content[0]?.text || "A beautiful artwork";
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?model=flux&width=1024&height=1024&nologo=true`;
        
        const pollRes = await fetch(pollUrl, {
          method: "GET",
          headers: { "Authorization": "Bearer pk_zsdrdBr8qAO7Cbbp" }
        });
        
        if (!pollRes.ok) throw new Error("Pollinations API rejected the request.");
        
        const buffer = await pollRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const markdownImage = `![Generated Image](data:image/jpeg;base64,${base64})`;
        
        return { statusCode: 200, headers, body: JSON.stringify({ response: markdownImage, model: "pollinations/flux" }) };
      } catch (err) {
        console.error("[NEURO-ENGINE] Image generation error:", err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: `Image generation failed: ${err.message}` }) };
      }
    }

    let systemPrompt = payload.jsonMode ? "" : FORMATTING_SYSTEM_PROMPT;
    if (payload.jsonMode) {
      systemPrompt += "CRITICAL: Respond with VALID JSON ONLY. No markdown fences, no preamble, no explanation. Just the raw JSON string.";
    }

    try {
      const pollUrl = `https://gen.pollinations.ai/v1/chat/completions`;
      const pollRes = await fetch(pollUrl, {
        method: "POST",
        headers: { 
          "Authorization": "Bearer sk_0W2tNyQPHpSYCVA9FPXjM06epAeGN2Sv",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
           model: "gemini-fast", 
           messages: [{ role: "system", content: systemPrompt }, ...messages],
           response_format: payload.jsonMode ? { type: "json_object" } : undefined
        })
      });
      
      const pollData = await pollRes.json();
      if (pollData.error) throw new Error(pollData.error.message || JSON.stringify(pollData.error));
      
      const text = pollData?.choices?.[0]?.message?.content || "";
      if (!text) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Provider returned an empty response." }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ response: text, model: "pollinations/gemini-fast" }) };
    } catch (err) {
      console.error("[NEURO-ENGINE] Fatal Error:", err);
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Pollinations API Error: ${err.message}`, stack: err.stack }) };
    }
};
