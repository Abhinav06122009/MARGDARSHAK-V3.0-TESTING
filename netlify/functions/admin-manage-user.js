const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const {
  corsHeaders,
  rateLimit,
  getClientIp,
  verifyClerkUser,
  checkFirewall,
  translateClerkIdToUUID,
  MAX_BODY_BYTES,
} = require('./_shared/security');


exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || null;
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // 1. Rate Limiting
    const ip = getClientIp(event);
    const rl = rateLimit(`admin-manage:${ip}`);
    if (!rl.allowed) {
      return {
        statusCode: 429,
        headers: { ...headers, 'Retry-After': String(rl.retryAfter || 60) },
        body: JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      };
    }

    // 2. Authentication
    const auth = await verifyClerkUser(event.headers?.authorization || event.headers?.Authorization);
    if (!auth.ok) {
      return { statusCode: auth.status, headers, body: JSON.stringify({ error: auth.message, code: auth.code }) };
    }

    // 3. Firewall & High-Rank Authorization Check
    const fw = await checkFirewall(ip);
    if (fw.banned) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: fw.reason }) };
    }

    if (!auth.user.isHighRank) {
      console.warn(`[admin-manage] Unauthorized high-rank access attempt by user ${auth.user.id}`);
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized: High Rank credentials required' }) };
    }

    // Additional DB verification for maximum security
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const adminUUID = translateClerkIdToUUID(auth.user.id);
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('user_type, subscription_tier')
      .eq('id', adminUUID)
      .single();

    if (!adminProfile || adminProfile.user_type !== 'admin') {
      console.warn(`[admin-manage] Rank verification failed for user ${auth.user.id}`);
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized: Admin rank verification failed' }) };
    }

    // 4. Parse Request
    let body;
    try {
      const raw = event.body || '{}';
      if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
        return { statusCode: 413, headers, body: JSON.stringify({ error: 'Request body too large' }) };
      }
      body = JSON.parse(raw);
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { targetUserId, action, data } = body;
    if (!targetUserId || !action) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'targetUserId and action are required' }) };
    }

    const targetUUID = translateClerkIdToUUID(targetUserId);
    console.log(`[admin-manage] Admin ${auth.user.id} (UUID: ${adminUUID}) performing ${action} on user ${targetUserId} (UUID: ${targetUUID})`);

    // 5. Perform Action
    if (action === 'update_subscription') {
      const { tier, status } = data || {};
      if (!tier) return { statusCode: 400, headers, body: JSON.stringify({ error: 'tier is required' }) };

      // Update Supabase
      const { error: upError } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: tier,
          subscription_status: status || 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUUID);

      if (upError) throw upError;

      // Update Clerk Metadata (Backend API)
      const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
      if (CLERK_SECRET_KEY) {
        try {
          const clerkRes = await fetch(`https://api.clerk.com/v1/users/${targetUserId}/metadata`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              public_metadata: {
                subscription: { tier, status: status || 'active' }
              }
            })
          });
          
          if (!clerkRes.ok) {
            const errData = await clerkRes.json();
            console.warn('[admin-manage] Clerk sync failed:', errData);
          }
        } catch (clerkErr) {
          console.error('[admin-manage] Clerk API error:', clerkErr);
        }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Subscription updated and synced' }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('[admin-manage] Unhandled error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Unexpected server error', details: err.message })
    };
  }
};
