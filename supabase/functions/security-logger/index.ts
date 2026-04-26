import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

interface ThreatAssessment {
  score: number;
  level: ThreatLevel;
  flags: string[];
  summary: string;
}

interface ModerationResult {
  score: number;
  severity: 'low' | 'medium' | 'high';
  violations: string[];
}

interface IpDetails {
  ip: string | null;
  city: string | null;
  country: string | null;
  isProxy: boolean;
}

const POLICY_KEYWORDS = ['spam', 'scam', 'hate', 'abuse', 'threat', 'violence', 'exploit'];
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

const normalizeEventType = (eventType: string) => eventType.replace(/_/g, ' ').toLowerCase();

const calculateThreatLevel = (score: number): ThreatLevel => {
  if (score >= 85) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
};

const moderateContent = (content: string): ModerationResult => {
  const normalized = content.toLowerCase();
  const violations = POLICY_KEYWORDS
    .filter((word) => normalized.includes(word))
    .map((word) => `Keyword detected: ${word}`);

  let score = violations.length * 20;
  if (content.length > 600) score += 10;
  if (content.trim().split(/\s+/).length < 3) score += 10;

  const severity: ModerationResult['severity'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return { score, severity, violations };
};

const extractIp = (req: Request): string | null => {
  const fromGateway = req.headers.get('cf-connecting-ip')?.trim() ?? req.headers.get('x-real-ip')?.trim();
  return fromGateway || null;
};

const sanitizeIp = (ip: string | null): string | null => {
  if (!ip) return null;
  if (IPV4_REGEX.test(ip)) return ip;
  if (IPV6_REGEX.test(ip) && ip.includes(':')) return ip;
  return null;
};

const detectProxy = (org?: string, isp?: string) => {
  const combined = `${org ?? ''} ${isp ?? ''}`.toLowerCase();
  return combined.includes('vpn') || combined.includes('proxy') || combined.includes('tor');
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, baggage, sentry-trace',
};

const fetchIpDetails = async (ip: string | null): Promise<IpDetails> => {
  if (!ip) return { ip: null, city: null, country: null, isProxy: false };

  const safeIp = sanitizeIp(ip);
  if (!safeIp) return { ip: null, city: null, country: null, isProxy: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`https://ipapi.co/${safeIp}/json/`, {
      headers: { 'User-Agent': 'security-logger' },
      signal: controller.signal,
    });
    if (!response.ok) return { ip: safeIp, city: null, country: null, isProxy: false };

    const payload = await response.json();
    return {
      ip: safeIp,
      city: payload.city ?? null,
      country: payload.country_name ?? null,
      isProxy: detectProxy(payload.org, payload.isp),
    };
  } catch (_) {
    return { ip: safeIp, city: null, country: null, isProxy: false };
  } finally {
    clearTimeout(timeout);
  }
};

const getEnv = (primary: string, fallback: string) => Deno.env.get(primary) ?? Deno.env.get(fallback);

const safeInsert = async (
  operationName: string,
  operation: Promise<{ error: { message: string; code?: string; details?: string } | null }>
) => {
  try {
    const { error } = await operation;
    if (error) {
      console.warn(`[SAFE INSERT] ${operationName} failed (expected if schema is minimal):`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[SAFE INSERT ERROR] ${operationName}:`, err.message);
    return false;
  }
};

const analyzeThreat = (params: {
  eventType: string;
  metadata: Record<string, unknown>;
  isProxy: boolean;
  moderation: ModerationResult | null;
}): ThreatAssessment => {
  const flags: string[] = [];
  let score = 0;

  if (params.eventType.includes('failed')) {
    score += 35;
    flags.push('Repeated failure signal detected');
  }
  if (params.eventType.includes('mfa')) {
    score += 10;
    flags.push('MFA challenge triggered');
  }
  if (params.eventType.includes('admin')) {
    score += 15;
    flags.push('Admin surface accessed');
  }
  if (params.isProxy) {
    score += 25;
    flags.push('Connection from VPN or proxy detected');
  }

  const deviceTrustScore = Number(params.metadata.deviceTrustScore);
  if (!Number.isNaN(deviceTrustScore) && deviceTrustScore < 50) {
    score += 20;
    flags.push('Low device trust score');
  }

  const behavioralRisk = Number(params.metadata.behavioralRisk);
  if (!Number.isNaN(behavioralRisk) && behavioralRisk > 70) {
    score += 30;
    flags.push('Behavioral anomaly detected');
  }

  if (params.moderation?.severity === 'high') {
    score += 40;
    flags.push('High-severity policy violation detected');
  }

  if (!flags.length) score = Math.max(score, 10);

  const level = calculateThreatLevel(score);
  const summary = `${normalizeEventType(params.eventType)} with ${score >= 60 ? 'elevated' : 'moderate'} risk. ${
    flags.length ? flags.join('; ') : 'No notable anomalies detected.'
  }`;

  return { score, level, flags, summary };
};

const resolveAuthenticatedUser = async (
  req: Request,
  supabaseUrl: string,
  anonKey: string | null
) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || !anonKey) return null;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getUser();
  if (error) return null;
  return data.user;
};

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv('SUPABASE_URL', 'FUNCTION_SUPABASE_URL');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', 'FUNCTION_SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = getEnv('SUPABASE_ANON_KEY', 'FUNCTION_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment configuration' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const payload = await req.json().catch(() => ({}));
    const action = typeof payload.action === 'string' ? payload.action : 'log_event';

    if (action === 'heartbeat') {
      return new Response(JSON.stringify({ status: 'alive', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const eventType = typeof payload.eventType === 'string' && payload.eventType ? payload.eventType : 'security_event';
    const details =
      payload.details && typeof payload.details === 'object' && !Array.isArray(payload.details)
        ? payload.details
        : {};

    const authenticatedUser = await resolveAuthenticatedUser(req, supabaseUrl, anonKey);
    const authenticatedUserId = authenticatedUser?.id ?? null;
    const requestIp = extractIp(req);
    const ipDetails = await fetchIpDetails(requestIp);
    const userAgent = req.headers.get('user-agent');
    const deviceId = req.headers.get('x-device-id');

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // --- ADMINISTRATIVE ACTIONS (BAN/UNBAN) ---
    const ADMIN_ROLES = ['admin', 'superadmin', 'super_admin', 'owner'];
    
    if (authenticatedUser && (eventType === 'admin_block_user' || eventType === 'admin_unblock_user')) {
      const userType = (authenticatedUser.app_metadata?.user_type || authenticatedUser.user_metadata?.user_type || '').toLowerCase();
      let isCallerAdmin = ADMIN_ROLES.includes(userType);

      if (!isCallerAdmin) {
        try {
          const { data: profile, error: profileError } = await supabase.from('profiles').select('user_type').eq('id', authenticatedUserId).maybeSingle();
          if (profileError) throw profileError;
          const profileRole = (profile?.user_type || '').toLowerCase();
          isCallerAdmin = ADMIN_ROLES.includes(profileRole);
        } catch (err: any) {
          console.error('[EDGE ERROR] Profiles query failed:', err);
          // Fallback: don't crash, just proceed as non-admin
        }
      }

      if (!isCallerAdmin) {
        console.error(`Forbidden: User ${authenticatedUserId} attempted administrative action ${eventType} without admin privileges.`);
        return new Response(JSON.stringify({ error: 'Forbidden: Admin privileges required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const targetUserId = payload.userId || details.userId;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'Target userId required for banning' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      console.log(`Performing ${eventType} for target user: ${targetUserId} by admin: ${authenticatedUserId}`);

      try {
        if (eventType === 'admin_block_user') {
          const { error: banError } = await supabase.auth.admin.updateUserById(targetUserId, {
            ban_duration: '87600h', // 10 years
          });
          if (banError) throw banError;
          console.log(`Successfully banned user ${targetUserId}`);
        } else {
          const { error: unbanError } = await supabase.auth.admin.updateUserById(targetUserId, {
            ban_duration: 'none',
          });
          if (unbanError) throw unbanError;
          console.log(`Successfully unbanned user ${targetUserId}`);
        }
      } catch (adminError: any) {
        console.error(`Supabase Admin Auth error during ${eventType}:`, adminError);
        return new Response(JSON.stringify({ error: `Auth Admin Error: ${adminError?.message || 'Unknown error'}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    if (action === 'log_user_activity') {
      await safeInsert(
        'user_activity_logs',
        supabase.from('user_activity_logs').insert({
          user_id: authenticatedUserId, // Clerk string ID
          activity_type: typeof payload.activityType === 'string' ? payload.activityType : eventType,
          ip_address: ipDetails.ip,
          device_id: deviceId,
          metadata:
            payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
              ? payload.metadata
              : {},
        })
      );
      return new Response(JSON.stringify({ result: { logged: true } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'log_ip_activity') {
      await safeInsert(
        'ip_logs',
        supabase.from('ip_logs').insert({
          ip_address: ipDetails.ip,
          city: ipDetails.city,
          country: ipDetails.country,
          is_proxy: ipDetails.isProxy,
          event_type: eventType,
          metadata:
            payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
              ? payload.metadata
              : {},
        })
      );
      return new Response(JSON.stringify({ result: { logged: true } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const content =
      action === 'moderate_content'
        ? String(payload.content ?? '')
        : typeof details.content === 'string'
          ? details.content
          : typeof details.message === 'string'
            ? details.message
            : '';

    const moderation = content ? moderateContent(content) : null;
    const threat = analyzeThreat({
      eventType,
      metadata: {
        ...details,
        userAgent,
      },
      isProxy: ipDetails.isProxy,
      moderation,
    });

    // Primary detailed log
    const primaryInserted = await safeInsert(
      'security_logs (primary)',
      supabase.from('security_logs').insert({
        user_id: authenticatedUserId, // Clerk string ID
        event_type: eventType,
        ip_address: ipDetails.ip,
        location: ipDetails.country,
        device_id: deviceId,
        metadata: { ...details, userAgent, moderation },
        risk_score: threat.score,
        risk_level: threat.level,
        flags: threat.flags,
        summary: threat.summary,
      })
    );

    // Minimal fallback if primary fails
    if (!primaryInserted) {
      await safeInsert(
        'security_logs (minimal fallback)',
        supabase.from('security_logs').insert({
          event_type: eventType,
          metadata: {
            authenticated_user_id: authenticatedUserId,
            threat_details: threat,
            ip_context: ipDetails,
            device_id: deviceId,
            ...details
          }
        })
      );
    }

    if (['high', 'critical'].includes(threat.level)) {
      await safeInsert(
        'security_threats',
        supabase.from('security_threats').insert({
          user_id: authenticatedUserId, // Clerk string ID
          event_type: eventType,
          ip_address: ipDetails.ip,
          threat_level: threat.level,
          threat_score: threat.score,
          flags: threat.flags,
          summary: threat.summary,
          metadata: { ...details, moderation },
        })
      );
    }

    if (authenticatedUserId) {
      await safeInsert(
        'user_activity_logs (general)',
        supabase.from('user_activity_logs').insert({
          user_id: authenticatedUserId,
          activity_type: eventType,
          ip_address: ipDetails.ip,
          device_id: deviceId,
          metadata: details,
        })
      );
    }

    if (moderation?.severity === 'high' && authenticatedUserId) {
      await safeInsert(
        'admin_reports',
        supabase.from('admin_reports').insert({
          user_id: authenticatedUserId, // Clerk string ID
          category: 'policy_violation',
          severity: moderation.severity,
          details: {
            content,
            violations: moderation.violations,
          },
        })
      );
    }

    return new Response(
      JSON.stringify({
        result: {
          logged: true,
          threat: {
            score: threat.score,
            level: threat.level,
            flags: threat.flags,
            summary: threat.summary,
            aiSummary: null,
          },
          moderation,
          deviceId,
          ipAddress: ipDetails.ip,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Unexpected error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
