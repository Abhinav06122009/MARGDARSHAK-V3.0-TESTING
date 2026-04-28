// Shared security helpers for Netlify functions: origin allowlist, CORS,
// rate limiting, body size limits, and Supabase JWT verification.

const DEFAULT_ALLOWED_ORIGINS = [
  "https://margdarshak-ai.netlify.app",
  "https://margdarshan.tech",
  "https://www.margdarshan.tech",
];

const parseAllowedOrigins = () => {
  const fromEnv = process.env.ALLOWED_ORIGINS || "";
  const list = fromEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : DEFAULT_ALLOWED_ORIGINS;
};

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  const allowed = parseAllowedOrigins();
  if (allowed.includes("*")) return true;
  if (allowed.includes(origin)) return true;
  // Allow Replit preview/dev domains and localhost during development.
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
    if (url.hostname.endsWith(".replit.dev")) return true;
    if (url.hostname.endsWith(".replit.app")) return true;
    if (url.hostname.endsWith(".netlify.app")) return true;
  } catch {
    /* ignore */
  }
  return false;
};

const corsHeaders = (origin) => {
  const allowed = isOriginAllowed(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
};

// In-memory token bucket per IP. Per-instance only (Netlify functions are
// short-lived) but still blunts bursty abuse from a single source.
const buckets = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30; // requests per window per IP per endpoint

const rateLimit = (key) => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((bucket.start + RATE_WINDOW_MS - now) / 1000) };
  }
  return { allowed: true, remaining: RATE_LIMIT - bucket.count };
};

const getClientIp = (event) => {
  const fwd = event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return event.headers?.["client-ip"] || event.headers?.["x-real-ip"] || "unknown";
};

// Returns { ok: true, user } on success, otherwise
// { ok: false, status, code, message } so callers can return precise errors.
const verifyClerkUser = async (authHeader) => {
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return { ok: false, status: 401, code: "no_token", message: "Missing Authorization bearer token" };
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, code: "no_token", message: "Empty bearer token" };
  }

  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supaKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supaUrl || !supaKey) {
    // This is a server-side misconfiguration, not a client problem.
    console.error("[security] Supabase env vars missing", {
      hasUrl: !!supaUrl,
      hasKey: !!supaKey,
    });
    return {
      ok: false,
      status: 500,
      code: "server_misconfigured",
      message:
        "Server is missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variables. Set them in your Netlify site settings (Site configuration → Environment variables).",
    };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("[security] Invalid token format (parts !== 3)");
      return { ok: false, status: 401, code: "invalid_token", message: "Invalid token format: expected 3 parts" };
    }
    
    let payload;
    try {
      const decoded = Buffer.from(parts[1], 'base64').toString();
      payload = JSON.parse(decoded);
    } catch (e) {
      console.error("[security] Failed to parse JWT payload:", e.message);
      return { ok: false, status: 401, code: "invalid_token", message: "Failed to parse token payload: " + e.message };
    }
    
    if (!payload || !payload.sub) {
      console.error("[security] Token missing 'sub' claim:", payload);
      return { ok: false, status: 401, code: "no_user", message: "Token is missing the required 'sub' (user ID) claim" };
    }

    console.log("[security] Verified user from token:", payload.sub);

    return { 
      ok: true, 
      user: { 
        id: payload.sub, 
        email: payload.email || payload.sub + "@clerk.user",
        metadata: payload.public_metadata || payload.metadata || {},
        unsafe_metadata: payload.unsafe_metadata || {},
        // Include the raw payload for deep extraction
        _raw: payload
      } 
    };
  } catch (err) {
    console.error("[security] Unexpected error during token verification:", err);
    return {
      ok: false,
      status: 401,
      code: "invalid_token",
      message: "Security verification failed: " + (err instanceof Error ? err.message : String(err))
    };
  }
};

const MAX_BODY_BYTES = 64 * 1024; // 64 KB

module.exports = {
  isOriginAllowed,
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
};
