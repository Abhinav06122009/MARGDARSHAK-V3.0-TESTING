
/**
 * ID Translation Protocol
 * Deterministically maps Clerk User IDs (strings) to valid Postgres UUIDs.
 * This resolves the 400 Bad Request errors when querying Supabase UUID columns.
 */

/**
 * Translates a Clerk ID string to a valid UUID format.
 * Uses a deterministic SHA-256 hash to ensure the same Clerk ID always produces the same UUID.
 */
const idCache = new Map<string, string>();

export const translateClerkIdToUUID = async (clerkId: string): Promise<string> => {
  if (!clerkId) return '';
  const cleanId = clerkId.trim();
  
  if (idCache.has(cleanId)) return idCache.get(cleanId)!;
  
  // If it's already a valid UUID, return it as-is
  if (cleanId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return cleanId;
  }

  try {
    // ZENITH SYNC: Must match 99999_DATABASE_INTEGRITY_REPAIR.sql exactly
    const salt = import.meta.env.VITE_ID_SALT || 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
    const combined = cleanId + salt.trim();
    
    console.log('[ID-Translator] Translating Clerk string to UUID:', { input: cleanId });
    
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    
    // Check if crypto.subtle is available (requires HTTPS or localhost)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const uuid = [
        hash.slice(0, 8),
        hash.slice(8, 12),
        '4' + hash.slice(13, 16),
        '8' + hash.slice(17, 20),
        hash.slice(20, 32)
      ].join('-');
      
      console.log('[ID-Translator] SHA-256 Translation Success:', uuid);
      idCache.set(cleanId, uuid);
      return uuid;
    } else {
      throw new Error('Crypto Subtle unavailable');
    }
  } catch (err) {
    console.warn('[ID-Translator] Primary crypto engine failed, deploying fallback:', err);
    
    // Secondary Deterministic Fallback (Bitwise) - Same as used in SQL fallback if possible
    let h1 = 0;
    for (let i = 0; i < cleanId.length; i++) {
      h1 = ((h1 << 5) - h1) + cleanId.charCodeAt(i);
      h1 |= 0;
    }
    
    const hash = Math.abs(h1).toString(16).padStart(8, '0');
    const fallbackUuid = `${hash}-0000-4000-8000-${cleanId.replace(/[^a-f0-9]/gi, '').padEnd(12, '0').slice(0, 12)}`;
    
    console.log('[ID-Translator] Fallback Translation:', fallbackUuid);
    idCache.set(cleanId, fallbackUuid);
    return fallbackUuid;
  }
};

/**
 * Synchronous version for simple UI cases where async is not possible.
 */
export const translateClerkIdToUUIDSync = (clerkId: string): string => {
  if (!clerkId) return '';
  if (clerkId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return clerkId;
  
  let hash = 0;
  for (let i = 0; i < clerkId.length; i++) {
    hash = ((hash << 5) - hash) + clerkId.charCodeAt(i);
    hash = hash & hash;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const tail = clerkId.replace(/[^a-f0-9]/gi, '').substring(0, 12).padEnd(12, '0');
  
  return `${hex}-9999-4444-8888-${tail}`;
};
