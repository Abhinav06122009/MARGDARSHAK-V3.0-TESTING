const {
  corsHeaders,
  getClientIp,
} = require("./_shared/security");
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const origin = event.headers?.origin || "";
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };
  const ip = getClientIp(event);

  console.error(`🚨 [HONEYPOT] IP ${ip} attempted to access /config`);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    await supabase.from('security_logs').insert({
      ip_address: ip,
      event_type: 'CONFIG_PROBE',
      risk_score: 95,
      summary: 'Attempted to probe system configuration',
      metadata: { path: event.path }
    });
  }

  return { statusCode: 403, headers, body: JSON.stringify({ error: "Unauthorized access" }) };
};
