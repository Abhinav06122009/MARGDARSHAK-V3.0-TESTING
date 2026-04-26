// Netlify function: log-security-event.js
// Receives security events from the frontend, appends the real server-side
// IP address (from Netlify's X-Forwarded-For header), verifies the JWT,
// and writes a row to the security_events table using the service role key.
//
// The service role key is NEVER sent to the browser — it lives only in
// Netlify Environment Variables and is used exclusively here.

const {
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
} = require("./_shared/security");

// Allowed event types – anything else is rejected to prevent log spam.
const ALLOWED_EVENTS = new Set([
  "signin_success",
  "signin_failed",
  "signup_success",
  "signup_failed",
  "signout",
  "password_reset_requested",
  "password_updated",
  "magic_link_requested",
  "magic_link_failed",
  "google_signin_attempt",
  "google_signin_failed",
  "github_signin_attempt",
  "github_signin_failed",
  "biometric_signin_attempt",
  "biometric_signin_success",
  "biometric_signin_failed",
  "mfa_otp_sent_attempt",
  "mfa_otp_verify_attempt",
  "mfa_otp_verify_failed",
  "mfa_otp_verify_success",
  "login_anomaly_detected",
  "behavioral_anomaly_detected",
  "suspicious_activity",
]);

// Compute a simple risk score from the event type and anomalies list.
const computeRiskScore = (eventType, anomalies = []) => {
  let score = 0;
  if (eventType.includes("failed")) score += 30;
  if (eventType.includes("anomaly")) score += 40;
  if (eventType === "suspicious_activity") score += 60;
  if (Array.isArray(anomalies)) score += anomalies.length * 10;
  return Math.min(score, 100);
};

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || null;
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Rate limiting – keyed by IP so a single bad actor can't flood the log
  const ip = getClientIp(event);
  const rl = rateLimit(`log-security-event:${ip}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...headers, "Retry-After": String(rl.retryAfter || 60) },
      body: JSON.stringify({ error: "Too many requests. Please slow down." }),
    };
  }

  // Parse body
  let body;
  try {
    const raw = event.body || "{}";
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return { statusCode: 413, headers, body: JSON.stringify({ error: "Request body too large" }) };
    }
    body = JSON.parse(raw);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { event: eventType, deviceFingerprint, data } = body;

  // Validate event type
  if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid or missing event type" }) };
  }

  // Verify JWT — failed-login events may not have a valid token, so we treat
  // them as anonymous and still log (with user_id = null).
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  let verifiedUser = null;
  if (authHeader) {
    const result = await verifyClerkUser(authHeader);
    if (result.ok) {
      verifiedUser = result.user; // { id, email }
    }
  }

  // Supabase service-role key — only available server-side
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[log-security-event] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    // Silently succeed on the client — don't expose config errors to the browser
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  // Look up the user's display name from profiles if we have a user_id
  let fullName = data?.full_name || null;
  const userEmail = verifiedUser?.email || data?.email || null;

  if (verifiedUser?.id && !fullName) {
    try {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${verifiedUser.id}&select=full_name`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );
      if (profileRes.ok) {
        const profiles = await profileRes.json();
        fullName = profiles?.[0]?.full_name || null;
      }
    } catch (e) {
      console.warn("[log-security-event] Could not fetch profile name:", e.message);
    }
  }

  // Build the row to insert
  const anomalies = Array.isArray(data?.anomalies) ? data.anomalies : [];
  const riskScore = computeRiskScore(eventType, anomalies);

  const row = {
    user_id: verifiedUser?.id || null,
    email: userEmail,
    full_name: fullName,
    event_type: eventType,
    ip_address: ip === "unknown" ? null : ip,
    user_agent: (event.headers?.["user-agent"] || "").substring(0, 512),
    device_fingerprint: deviceFingerprint
      ? JSON.parse(JSON.stringify(deviceFingerprint)) // sanitize cycles
      : null,
    risk_score: riskScore,
    anomalies: anomalies.length > 0 ? anomalies : null,
    metadata: {
      referer: event.headers?.referer || null,
      origin,
      country: event.headers?.["x-country"] || event.headers?.["cf-ipcountry"] || null,
      extra: data && typeof data === "object" ? { ...data } : null,
    },
  };

  // Insert via REST with service role key (bypasses RLS)
  try {
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/security_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("[log-security-event] Insert failed:", insertRes.status, errText);
      // Still return 200 to client — logging failure is non-fatal
    } else {
      console.log(`[log-security-event] Logged '${eventType}' for ${userEmail || "anonymous"} from ${ip}`);
    }
  } catch (e) {
    console.error("[log-security-event] Network error during insert:", e.message);
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
