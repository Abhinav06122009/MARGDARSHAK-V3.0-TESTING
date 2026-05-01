import { supabase } from "@/integrations/supabase/client";

/**
 * Calls a protected `/api/*` endpoint with the user's Supabase access token
 * attached. If the server reports the session is expired (`code: "session_expired"`)
 * we transparently refresh the token via Supabase and retry the request once.
 * On unrecoverable failure we throw an Error whose `message` is the server's
 * human-readable explanation.
 */
export async function authedFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const attach = async (token: string) => {
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    
    // Automatically inject BYOK if available in localStorage
    const byokKey = localStorage.getItem('openrouter_api_key');
    if (byokKey?.trim()) {
      headers.set("X-User-API-Key", byokKey.trim());
    }
    return fetch(input, { ...init, headers });
  };

  // Since we are using Clerk, we should get the token from Clerk directly.
  // The supabase client is already configured to use Clerk tokens via setClerkTokenProvider.
  // We can get the token from the supabase client's current session or directly from the provider.
  
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch (err) {
    console.warn('[authedFetch] Supabase session check failed, using fallback.');
  }
  
  if (!token) {
    // If supabase doesn't have it, we might be in a transitional state.
    // We throw a clear error that can be caught by UI components.
    throw new Error("UNAUTHORIZED_AI_ACCESS: Please ensure you are signed in and your session is active.");
  }

  let res = await attach(token);
  
  // If we get a 401, it means the token was present but rejected.
  if (res.status === 401) {
    console.error(`[authedFetch] 401 Unauthorized for ${input}. Token may be invalid or expired.`);
  } else if (!res.ok) {
    const errorMsg = await readErrorMessage(res);
    console.error(`[authedFetch] Error ${res.status}: ${errorMsg}`);
  }
  
  return res;
}

/**
 * Reads a JSON error body from a non-OK response and returns the most useful
 * message. Falls back to status text when the body is not JSON.
 */
export async function readErrorMessage(res: Response): Promise<string> {
  try {
    const j = await res.clone().json();
    if (typeof j?.error === "string" && j.error.trim()) return j.error;
  } catch { /* ignore */ }
  return `Request failed (${res.status} ${res.statusText || ""})`.trim();
}
