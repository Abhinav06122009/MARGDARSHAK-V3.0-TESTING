const { createClient } = require('@supabase/supabase-js');
const {
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  MAX_BODY_BYTES,
} = require('./_shared/security');

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || null;
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getClientIp(event);
  const rl = rateLimit(`profile-sync:${ip}`);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...headers, 'Retry-After': String(rl.retryAfter || 60) },
      body: JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    };
  }

  const auth = await verifyClerkUser(event.headers?.authorization || event.headers?.Authorization);
  if (!auth.ok) {
    return { statusCode: auth.status, headers, body: JSON.stringify({ error: auth.message, code: auth.code }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[profile-sync] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  let body;
  try {
    const raw = event.body || '{}';
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
      return { statusCode: 413, headers, body: JSON.stringify({ error: 'Request body too large' }) };
    }
    body = JSON.parse(raw);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const metadata = body && typeof body === 'object' ? body : {};
  const subscription = metadata.subscription || {};
  const clerkMetadata = metadata.publicMetadata || {};
  const fullName = metadata.full_name || metadata.fullName || clerkMetadata.full_name || 'Scholar';

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const profileRow = {
    id: auth.user.id,
    email: auth.user.email || metadata.email || '',
    full_name: fullName,
    avatar_url: metadata.avatar_url || null,
    user_type: clerkMetadata.role || metadata.role || 'student',
    subscription_tier: subscription.tier || clerkMetadata.subscription_tier || 'free',
    subscription_status: subscription.status || 'inactive',
    subscription_period_end: subscription.period_end ? new Date(subscription.period_end).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(profileRow);
  if (error) {
    console.error('[profile-sync] Upsert failed:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, profile: profileRow }),
  };
};