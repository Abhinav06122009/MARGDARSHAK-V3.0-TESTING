import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const getEnv = (primary: string, fallback: string) => Deno.env.get(primary) ?? Deno.env.get(fallback);

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv('SUPABASE_URL', 'FUNCTION_SUPABASE_URL');
    const anonKey = getEnv('SUPABASE_ANON_KEY', 'FUNCTION_SUPABASE_ANON_KEY');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', 'FUNCTION_SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment configuration' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const jwtRole = String(user.app_metadata?.user_type ?? user.role ?? '').toLowerCase();
    let isAdmin = jwtRole === 'admin';

    if (!isAdmin) {
      const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: profile } = await serviceClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle();

      const profileRole = String(profile?.user_type ?? '').toLowerCase();
      isAdmin = profileRole === 'admin';
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Admin environment diagnostics',
        supabaseUrl: supabaseUrl ? 'URL is set' : 'URL is NOT set',
        serviceRoleKey: serviceRoleKey ? 'Key is set' : 'Key is NOT set',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An internal error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
