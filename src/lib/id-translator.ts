
/**
 * ID Translation Protocol
 * Deterministically maps Clerk User IDs (strings) to valid Postgres UUIDs.
 * This resolves the 400 Bad Request errors when querying Supabase UUID columns.
 */

/**
 * Translates a Clerk ID string to a valid UUID format.
 * Uses a deterministic SHA-256 hash to ensure the same Clerk ID always produces the same UUID.
 */
export const translateClerkIdToUUID = async (clerkId: string): Promise<string> => {
  if (!clerkId) return '';
  const cleanId = clerkId.trim();
  if (cleanId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return cleanId;

  try {
    // ZENITH SYNC: Must match 99999_final_rls_stabilization.sql exactly
    // Salt used in production: b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa
    const salt = import.meta.env.VITE_ID_SALT || 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
    const combined = cleanId + salt.trim();
    
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Construct UUID (8-4-4-4-12) with version 4 and variant 8 markers to match SQL
    return [
      hash.slice(0, 8),
      hash.slice(8, 12),
      '4' + hash.slice(13, 16),
      '8' + hash.slice(17, 20),
      hash.slice(20, 32)
    ].join('-');
  } catch (err) {
    console.error('[ID-Translator] Crypto error:', err);
    return clerkId; // Absolute fallback
  }
};

/**
 * Synchronous version for simple UI cases where async is not possible.
 * NOTE: Prefer the async version for database operations.
 */
export const translateClerkIdToUUIDSync = (clerkId: string): string => {
  if (!clerkId) return '';
  if (clerkId.includes('-') && clerkId.length === 36) return clerkId;
  
  let hash = 0;
  for (let i = 0; i < clerkId.length; i++) {
    hash = ((hash << 5) - hash) + clerkId.charCodeAt(i);
    hash = hash & hash;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const tail = clerkId.split('').reverse().join('').substring(0, 12).padEnd(12, '0');
  
  return `${hex}-5555-4444-8888-${tail}`;
};
