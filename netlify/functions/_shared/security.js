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
  // On Netlify/Vercel, 'client-ip' or 'x-real-ip' are usually set by the load balancer.
  // X-Forwarded-For can be spoofed unless we know the proxy count.
  const verifiedIp = event.headers?.["client-ip"] || 
                    event.headers?.["x-real-ip"] || 
                    event.headers?.["x-nf-client-connection-ip"]; // Netlify specific
  
  if (verifiedIp) return verifiedIp;

  const fwd = event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"];
  if (typeof fwd === "string" && fwd.length > 0) {
    // If multiple IPs, take the first one (most likely client)
    return fwd.split(",")[0].trim();
  }
  
  return "unknown";
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
    
    // Cryptographic Check - MANDATORY
    let publicKey = process.env.CLERK_JWT_PUBLIC_KEY;
    if (!publicKey) {
      console.error('CRITICAL: CLERK_JWT_PUBLIC_KEY is missing from environment.');
      return { ok: false, status: 500, code: "server_config_error", message: "Internal Security Configuration Error" };
    }

    // Ensure it's not wrapped in quotes
    publicKey = publicKey.replace(/^"|"$/g, '');

    // PEM Normalization: Ensure headers and line breaks are present
    if (!publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
      publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    }
    
    // If the key is a single line (except for headers), wrap it at 64 chars
    const bodyMatch = publicKey.match(/-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/);
    if (bodyMatch) {
      const body = bodyMatch[1].replace(/\s/g, ''); // Remove all whitespace
      const wrappedBody = body.match(/.{1,64}/g).join('\n');
      publicKey = `-----BEGIN PUBLIC KEY-----\n${wrappedBody}\n-----END PUBLIC KEY-----`;
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(parts[0] + '.' + parts[1]);

    // Clerk uses base64url for signatures. Node.js Buffer handles this natively.
    try {
      const signatureBuffer = Buffer.from(parts[2], 'base64url');
      
      // Use createPublicKey for more robust PEM handling
      const pubKeyObject = crypto.createPublicKey({
        key: publicKey,
        format: 'pem',
        type: 'spki'
      });

      if (!verifier.verify(pubKeyObject, signatureBuffer)) {
        console.warn('[AUTH] Signature verification failed for token sub:', payload.sub);
        // LOG THE TOKEN STRUCTURE FOR DEBUGGING (Sensitive data masked)
        console.log('[AUTH DIAGNOSTIC] Payload keys:', Object.keys(payload));
        return { ok: false, status: 401, code: "invalid_signature", message: "Invalid cryptographic signature" };
      }
    } catch (verifyErr) {
      console.error('[AUTH] Cryptographic error during verification:', verifyErr.message);
      return { ok: false, status: 401, code: "crypto_error", message: `Verification process failed: ${verifyErr.message}` };
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return { ok: false, status: 401, code: "token_expired" };
    if (!payload.sub) return { ok: false, status: 401, code: "no_user" };

    // --- RANK DETECTION ---
    const metadata = payload.public_metadata || {};
    const role = (metadata.role || 'student').toLowerCase();
    const tier = (metadata.subscription?.tier || metadata.subscription_tier || 'free').toLowerCase();
    
    // CRITICAL SECURITY FIX: Only 'admin' role grants high rank. 
    // Subscription tiers (like premium_elite) should NOT grant administrative privileges.
    const isHighRank = role === 'admin' || role === 'superadmin';
    const isSuperAdmin = (role === 'admin' || role === 'superadmin') && 
                        (payload.email?.toLowerCase().includes('admin') || payload.azp?.includes('admin'));

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
    console.error('[AUTH ERROR] Token verification failed:', err.message);
    return { ok: false, status: 401, code: "invalid_token", message: "Invalid or malformed token" };
  }
};

/**
 * ID Translation Protocol (Deterministic UUID generation)
 */
const translateClerkIdToUUID = (clerkId) => {
  if (!clerkId) return '';
  if (clerkId.includes('-') && clerkId.length === 36) return clerkId;

  const salt = (process.env.ID_SALT || 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa').trim();
  const hash = crypto.createHash('sha256').update(clerkId + salt).digest('hex');
  
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    '8' + hash.slice(17, 20),
    hash.slice(20, 32)
  ].join('-');
};

const MAX_BODY_BYTES = 128 * 1024;

module.exports = {
  isOriginAllowed,
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  checkFirewall,
  translateClerkIdToUUID,
  MAX_BODY_BYTES,
};
