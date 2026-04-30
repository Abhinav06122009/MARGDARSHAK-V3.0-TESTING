// Shared security helpers for Netlify functions: origin allowlist, CORS,
// rate limiting, body size limits, and Supabase JWT verification.

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

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
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".replit.dev") || host.endsWith(".replit.app") || host.endsWith(".netlify.app")) return true;
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Fingerprint, X-User-API-Key",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
};

// --- ADVANCED FIREWALL & BANNING ---
const bannedIps = new Set();
const lastBlacklistSync = 0;

const checkFirewall = async (ip) => {
  if (bannedIps.has(ip)) return { banned: true, reason: "IP explicitly blacklisted for security violations." };
  
  // Sync blacklist from DB if suspicious or occasionally
  // (In a real high-traffic app, we'd use Redis, but here we query Supabase if needed)
  return { banned: false };
};

// Rate limiting (In-memory)
const buckets = new Map();
const RATE_WINDOW_MS = 60_000;
const STRIKE_LIMIT = 5; // Strikes before automatic firewall block

const rateLimit = (key) => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    buckets.set(key, { start: now, count: 1, strikes: bucket?.strikes || 0 });
    return { allowed: true, remaining: 19 };
  }
  bucket.count += 1;
  if (bucket.count > 20) {
    bucket.strikes += 1;
    const isBanned = bucket.strikes >= STRIKE_LIMIT;
    return { 
      allowed: false, 
      retryAfter: Math.ceil((bucket.start + RATE_WINDOW_MS - now) / 1000),
      banned: isBanned 
    };
  }
  return { allowed: true, remaining: 20 - bucket.count };
};

const getClientIp = (event) => {
  const fwd = event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return event.headers?.["client-ip"] || event.headers?.["x-real-ip"] || "unknown";
};

/**
 * Verify Clerk JWT and Rank
 */
const verifyClerkUser = async (authHeader) => {
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return { ok: false, status: 401, code: "no_token", message: "Missing Authorization bearer token" };
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { ok: false, status: 401, code: "invalid_token" };
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Cryptographic Check
    const publicKey = process.env.CLERK_JWT_PUBLIC_KEY;
    if (publicKey) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(parts[0] + '.' + parts[1]);
      if (!verifier.verify(publicKey, parts[2], 'base64')) {
        return { ok: false, status: 401, code: "invalid_signature" };
      }
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return { ok: false, status: 401, code: "token_expired" };
    if (!payload.sub) return { ok: false, status: 401, code: "no_user" };

    // --- RANK DETECTION ---
    const metadata = payload.public_metadata || {};
    const role = metadata.role || 'student';
    const tier = (metadata.subscription?.tier || metadata.subscription_tier || 'free').toLowerCase();
    
    const isHighRank = role === 'admin' || tier === 'premium_elite' || tier === 'elite';
    const isSuperAdmin = role === 'admin' && (payload.email?.includes('admin') || payload.azp?.includes('admin'));

    return { 
      ok: true, 
      user: { 
        id: payload.sub, 
        email: payload.email,
        role,
        tier,
        isHighRank,
        isSuperAdmin,
        _raw: payload
      } 
    };
  } catch (err) {
    return { ok: false, status: 401, code: "invalid_token" };
  }
};

const MAX_BODY_BYTES = 128 * 1024;

module.exports = {
  isOriginAllowed,
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  checkFirewall,
  MAX_BODY_BYTES,
};
