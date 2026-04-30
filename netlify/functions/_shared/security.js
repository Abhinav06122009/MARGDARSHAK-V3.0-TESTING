// Shared security helpers for Netlify functions: origin allowlist, CORS,
// rate limiting, body size limits, and Supabase JWT verification.

const crypto = require('crypto');

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Fingerprint",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
};

// Rate limiting (In-memory, instance-specific fallback)
const buckets = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20; // Tightened limit

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

/**
 * Verify Clerk JWT
 * @param {string} authHeader 
 * @returns {Promise<{ok: boolean, user?: object, status?: number, code?: string, message?: string}>}
 */
const verifyClerkUser = async (authHeader) => {
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return { ok: false, status: 401, code: "no_token", message: "Missing Authorization bearer token" };
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, code: "no_token", message: "Empty bearer token" };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { ok: false, status: 401, code: "invalid_token", message: "Invalid token format" };
    }
    
    // 1. Parse Header & Payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // 2. CRYPTOGRAPHIC VERIFICATION (If Public Key is provided)
    const publicKey = process.env.CLERK_JWT_PUBLIC_KEY;
    if (publicKey) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(parts[0] + '.' + parts[1]);
      const isValid = verifier.verify(publicKey, parts[2], 'base64');
      
      if (!isValid) {
        console.error("[security] JWT Signature verification failed!");
        return { ok: false, status: 401, code: "invalid_signature", message: "JWT Signature verification failed" };
      }
    } else {
      console.warn("[security] CLERK_JWT_PUBLIC_KEY not set. Falling back to insecure decoding. PLEASE SET PUBLIC KEY FOR UNHACKABLE STATUS.");
    }
    
    // 3. Expiration Check
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { ok: false, status: 401, code: "token_expired", message: "Token has expired" };
    }
    
    // 4. Issued At Check (Prevent future tokens)
    if (payload.iat && payload.iat > now + 60) { // 60s clock skew
      return { ok: false, status: 401, code: "token_future", message: "Token issued in the future" };
    }

    if (!payload.sub) {
      return { ok: false, status: 401, code: "no_user", message: "Token is missing user identity" };
    }

    return { 
      ok: true, 
      user: { 
        id: payload.sub, 
        email: payload.email || payload.sub + "@clerk.user",
        metadata: payload.public_metadata || payload.metadata || {},
        _raw: payload
      } 
    };
  } catch (err) {
    console.error("[security] Unexpected error during token verification:", err.message);
    return {
      ok: false,
      status: 401,
      code: "invalid_token",
      message: "Security verification failed"
    };
  }
};

const MAX_BODY_BYTES = 128 * 1024; // 128 KB (Increased for AI chat context)

module.exports = {
  isOriginAllowed,
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
};
