const {
  corsHeaders,
  getClientIp,
  verifyClerkUser,
  rateLimit,
} = require("./_shared/security");
const { createClient } = require('@supabase/supabase-js');

/**
 * HONEYPOT FUNCTION
 * This endpoint is intentionally named to attract penetration testers and bots.
 * Anyone who calls this function with any payload is automatically blacklisted.
 */
exports.handler = async (event) => {
  const origin = event.headers?.origin || "";
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };
  const ip = getClientIp(event);

  console.error(`🚨 [HONEYPOT] Security violation detected! IP ${ip} attempted to access /admin-debug`);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Log the threat
    await supabase.from('security_logs').insert({
      ip_address: ip,
      event_type: 'HONEYPOT_TRIGGERED',
      risk_score: 100,
      summary: 'Attempted access to hidden admin debug route',
      metadata: {
        headers: event.headers,
        body: event.body,
        path: event.path
      }
    });

    // Explicitly blacklist for 7 days
    await supabase.from('security_blacklist').upsert({
      ip_address: ip,
      reason: 'Honeypot violation: Attempted access to restricted system debugging tools.',
      threat_level: 'CRITICAL',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return {
    statusCode: 403,
    headers,
    body: JSON.stringify({ 
      error: "Security Protocol 0x88: Access Denied. Your IP has been flagged and reported to cyber-security authorities.",
      incident_id: crypto.randomUUID()
    })
  };
};
