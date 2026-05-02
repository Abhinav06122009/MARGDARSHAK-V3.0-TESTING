
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
  
  // If it's already a UUID (contains hyphens and is 36 chars), return as is
  if (clerkId.includes('-') && clerkId.length === 36) {
    return clerkId;
  }

  try {
    // 1. Encode as UTF-8 (Matching backend 00009 logic: no salt)
    const msgBuffer = new TextEncoder().encode(clerkId);
    
    // 2. Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // 3. Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 4. Format as UUID (8-4-4-4-12)
    // Matches public.translate_clerk_id_to_uuid() in 00009_id_translation_stabilization.sql
    const uuid = [
      hex.slice(0, 8),
      hex.slice(8, 12),
      '4' + hex.slice(13, 16), // Version 4
      '8' + hex.slice(17, 20), // Variant 10xx
      hex.slice(20, 32)
    ].join('-');
    
    return uuid;
  } catch (err) {
    console.error('[ID-Translator] Error translating ID:', err);
    // Fallback: A very basic deterministic mapping if crypto fails
    let hash = 0;
    for (let i = 0; i < clerkId.length; i++) {
      hash = ((hash << 5) - hash) + clerkId.charCodeAt(i);
      hash = hash & hash;
    }
    const fallbackHex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${fallbackHex}-0000-4000-8000-${fallbackHex.split('').reverse().join('').padStart(12, '0')}`;
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
