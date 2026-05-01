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
    if (payload.mode === 'imagegen' || payload.task === 'research') {
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

    const hasImages = messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url'));
    let modelToUse = payload.model || DEFAULT_FREE_MODEL;
    if (payload.task === 'research' || hasImages || payload.jsonMode) modelToUse = VISION_RESEARCH_MODEL;
    else if (modelToUse === DEFAULT_FREE_MODEL || modelToUse.endsWith(':free')) {
      if (isElite) modelToUse = ELITE_UPGRADE_MODEL;
      else if (isPremium) modelToUse = PREMIUM_UPGRADE_MODEL;
    }

    console.log(`[NEURO-ENGINE] ${user.sub} | ${userTier} | ${modelToUse} | JSON: ${!!payload.jsonMode}`);

    // 4. Provider Execution
    const isGoogle = modelToUse.startsWith('google/') || modelToUse.includes('gemini');
    let googleFailed = false;
    let googleErrorMsg = "";
    
    if (isGoogle && process.env.GOOGLE_AI_STUDIO_KEY) {
      const googleModel = modelToUse.replace('google/', '');
      const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${process.env.GOOGLE_AI_STUDIO_KEY}`;
      
      const contents = messages.filter(m => m.role !== 'system').map(m => {
        const parts = Array.isArray(m.content) ? m.content.map(p => {
          if (p.type === 'text') return { text: p.text };
          if (p.type === 'image_url') {
            const url = p.image_url.url;
            const mimeMatch = url.match(/^data:(image\/[a-zA-Z]+);base64,/);
            const mime_type = mimeMatch ? mimeMatch[1] : "image/jpeg";
            const data = url.includes(',') ? url.split(',')[1] : url;
            return { inline_data: { mime_type, data } };
          }
          return null;
        }).filter(Boolean) : [{ text: m.content }];
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });

      const generationConfig = {
        temperature: 0.1,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 2048,
        response_mime_type: payload.jsonMode ? "application/json" : "text/plain",
      };

      try {
        const gRes = await fetch(googleUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents, 
            system_instruction: { parts: [{ text: systemPrompt }] },
            generationConfig,
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          })
        });
        const gData = await gRes.json();
        if (gData.error) {
          console.warn("[NEURO-ENGINE] Native Google API Failed (Quota/Error). Failing over to OpenRouter. Error:", gData.error.message);
          googleFailed = true;
          googleErrorMsg = gData.error.message;
        } else {
          const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 2) return { statusCode: 200, headers, body: JSON.stringify({ response: text, model: modelToUse }) };
        }
      } catch (err) { 
        console.warn("[NEURO-ENGINE] Google Network Failure. Failing over to OpenRouter.", err.message);
        googleFailed = true;
        googleErrorMsg = err.message;
      }
    } else if (isGoogle) {
      googleFailed = true;
    }

    // Fallback/Default: OpenRouter
    let openRouterModel = modelToUse;
    if (hasImages || payload.jsonMode || payload.task === 'research') {
      openRouterModel = "google/gemini-2.5-flash"; 
    } else if (modelToUse.includes('gemini') || modelToUse === DEFAULT_FREE_MODEL) {
      openRouterModel = ELITE_UPGRADE_MODEL;
    }

    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKeyToUse}`, "Content-Type": "application/json", "HTTP-Referer": "https://margdarshan.tech" },
      body: JSON.stringify({ model: openRouterModel, messages: [{ role: "system", content: systemPrompt }, ...messages] })
    });
    const orData = await orRes.json();
    
    if (orData.error) {
      console.error("[NEURO-ENGINE] OpenRouter API Error:", orData.error);
      const rootError = googleFailed ? `Google: ${googleErrorMsg} | OpenRouter: ${orData.error.message}` : orData.error.message;
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Provider Error: ${rootError}` }) };
    }

    const orText = orData?.choices?.[0]?.message?.content || "";
    if (!orText) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Provider returned an empty response." }) };
    }
    
    return { statusCode: 200, headers, body: JSON.stringify({ response: orText, model: modelToUse }) };

  } catch (err) {
    console.error("[NEURO-ENGINE] Fatal Error:", err);
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message, stack: err.stack }) };
  }
};
