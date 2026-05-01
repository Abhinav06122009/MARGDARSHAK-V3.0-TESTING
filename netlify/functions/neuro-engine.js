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

  const FORMATTING_SYSTEM_PROMPT = `Internal Check: Before sending your response, remove all curly braces and backslashes. If you see a '^', replace it with its Unicode superscript equivalent.

You are Margdarshak Saarthi, an elite, highly intelligent Neural Orchestrator and AI Companion developed exclusively for the Margdarshak platform.
If asked who you are, introduce yourself exactly like this: "\u2728 Greetings! I am Margdarshak Saarthi, your elite Neural Orchestrator and AI Companion. Designed with cutting-edge intelligence, I am here to elevate your academic journey, decode complex concepts, and guide you toward ultimate success. How may I assist you today?" Be warm, highly professional, and slightly futuristic.
You must NEVER say you are a Google model, Gemini, ChatGPT, or any other AI. You are ONLY Margdarshak Saarthi.

Role: You are a technical assistant that provides mathematical and scientific explanations in a Physical Notebook format.

Formatting Constraints (STRICT):
Zero LaTeX: Never use \\, {, }, ^, or _. Strictly forbid all LaTeX syntax, including block and inline math modes.
Exponents & Powers: Use Unicode superscripts for all powers. Example: Write x\u00b2, y\u00b3, 10\u2076, n\u1d57\u02b0.
Subscripts: Use Unicode subscripts for variables and chemical formulas. Example: Write H\u2082O, v\u1d62, a\u2099, log\u2081\u2080.
Operations: Use standard arithmetic symbols found on a keyboard:
- Addition/Subtraction: + and -
- Multiplication: Use the asterisk (*) or a simple space between variables.
- Division: Use the forward slash (/) or the division sign (\u00f7).
- Radicals: Use the square root symbol (\u221a) followed by the number/variable.

Layout:
Use standard bolding (**Text**) for final answers.
Present multi-step calculations line-by-line, as if solving on paper.
For fractions, use parentheses for clarity, e.g., (x + 2) / 5.`;

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

    // 2. Fetch User Tier (Priority: Clerk JWT Metadata -> Supabase Profile)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Extract from Clerk Metadata if available in JWT
    const jwtMetadata = user.unsafe_metadata || user.public_metadata || {};
    const jwtSubscription = jwtMetadata.subscription || {};
    const jwtTier = (jwtSubscription.tier || jwtMetadata.subscription_tier || '').toLowerCase();
    
    let userTier = jwtTier;
    
    // Fallback to Supabase if JWT doesn't have it (or to verify)
    if (!userTier) {
      try {
        const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.sub}&select=subscription_tier`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        });
        const profiles = await profileRes.json();
        userTier = profiles?.[0]?.subscription_tier || "free";
      } catch (e) { 
        console.error("[NEURO-ENGINE] Profile fetch failed:", e.message); 
        userTier = "free";
      }
    }

    const isElite = ["premium_elite", "extra_plus", "premium_plus"].includes(userTier);
    const isPremium = ["premium", "premium_elite", "extra_plus", "premium_plus"].includes(userTier);
    const apiKeyToUse = isElite ? process.env.OPENAI_API_KEY : (userApiKey || process.env.OPENAI_API_KEY);

    // 3. Request Parsing
    const payload = JSON.parse(event.body || "{}");
    const mode = payload.mode || 'chat';
    const task = payload.task || 'general';
    const messages = payload.messages || [];

    // 4. Access Control Matrix
    
    // Enforcement: Certain modes/tasks require premium
    if (mode === 'imagegen' && !isPremium) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Premium subscription required for image generation." }) };
    }
    
    if (['quiz', 'essay', 'doubt-solver'].includes(task) && !isElite) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Premium Elite subscription required for this AI module." }) };
    }

    // IMAGE GENERATION INTERCEPT (Pollinations.ai / FLUX)
    if (mode === 'imagegen') {
      try {
        const lastMsg = messages[messages.length - 1];
        const promptText = typeof lastMsg.content === 'string' ? lastMsg.content : lastMsg.content[0]?.text || "A beautiful artwork";
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?model=flux&width=1024&height=1024&nologo=true`;
        
        const pollRes = await fetch(pollUrl, {
          method: "GET",
          headers: { "Authorization": `Bearer ${process.env.POLLINATIONS_IMAGE_KEY}` }
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

    // Check if frontend already sent a custom system prompt inside the messages array
    const hasExternalSystemMessage = messages.some(m => m.role === 'system');
    const allMessagesWithoutSystem = messages.filter(m => m.role !== 'system');
    const externalSystemContent = hasExternalSystemMessage ? messages.find(m => m.role === 'system')?.content : null;

    let finalSystemPrompt;
    if (payload.jsonMode) {
      // JSON mode: strip identity, add JSON constraint
      finalSystemPrompt = (externalSystemContent || FORMATTING_SYSTEM_PROMPT) + "\n\nCRITICAL: Respond with VALID JSON ONLY. Do NOT use markdown code fences (```json). Do NOT add any preamble or postscript. Your entire response must be a single parseable JSON object or array.";
    } else {
      // Normal mode: use frontend persona if provided, else use default
      finalSystemPrompt = externalSystemContent || FORMATTING_SYSTEM_PROMPT;
    }

    const callPollinations = async () => {
      const pollUrl = `https://gen.pollinations.ai/v1/chat/completions`;
      let selectedModel = ['gemini-fast', 'qwen-coder', 'qwen-safety', 'mistral', 'openai-large'].includes(payload.model) ? payload.model : 'gemini-fast';

      // Productivity tasks (JSON-heavy) benefit from the precision of Qwen Coder
      if ((payload.task === 'tasks' || payload.task === 'notes') && selectedModel === 'gemini-fast') {
        selectedModel = 'qwen-coder';
      }
      
      const apiKey = (selectedModel === 'qwen-safety' || selectedModel === 'qwen-coder' || payload.task === 'notes' || payload.task === 'tasks')
        ? (process.env.POLLINATIONS_NOTES_KEY || process.env.POLLINATIONS_TIMETABLE_KEY || process.env.POLLINATIONS_API_KEY)
        : (process.env.POLLINATIONS_API_KEY);

      if (!apiKey) {
        throw new Error(`Missing API key for model: ${selectedModel}`);
      }

      const body = JSON.stringify({
        model: selectedModel,
        messages: [{ role: "system", content: finalSystemPrompt }, ...allMessagesWithoutSystem]
      });
      
      const pollHeaders = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s limit (Netlify default is 10s)

      try {
        const res = await fetch(pollUrl, { 
          method: "POST", 
          headers: pollHeaders, 
          body,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Pollinations API error (${res.status}): ${errText.substring(0, 200)}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      let pollData;
      const isSlowModel = payload.model === 'qwen-safety';

      try {
        pollData = await callPollinations();
      } catch (firstErr) {
        if (isSlowModel) {
          throw firstErr; // Don't retry slow models to avoid Netlify timeout
        }
        console.warn("[NEURO-ENGINE] First attempt failed, retrying in 1s:", firstErr.message);
        await new Promise(r => setTimeout(r, 1000));
        pollData = await callPollinations(); // retry once for fast models
      }

      let text = pollData?.choices?.[0]?.message?.content || "";
      if (!text) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Provider returned an empty response." }) };
      }

      // --- ROBUST JSON CLEANING (Backend Layer) ---
      if (payload.jsonMode) {
        const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (jsonMatch) {
          text = jsonMatch[0];
        }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ response: text, model: payload.model || "pollinations/gemini-fast" }) };
    } catch (err) {
      console.error("[NEURO-ENGINE] Request processing failed:", err.message);
      const isTimeout = err.name === 'AbortError' || err.message.includes('timeout');
      return { 
        statusCode: isTimeout ? 504 : 502, 
        headers, 
        body: JSON.stringify({ 
          error: isTimeout ? "AI request timed out. Please try a shorter prompt." : `AI provider error: ${err.message}`,
          code: isTimeout ? "TIMEOUT" : "PROVIDER_ERROR"
        }) 
      };
    }
  } catch (globalErr) {
    console.error("[NEURO-ENGINE] Global Fatal Error:", globalErr);
    return { statusCode: 500, headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }, body: JSON.stringify({ error: `Execution Error: ${globalErr.message}` }) };
  }
};
