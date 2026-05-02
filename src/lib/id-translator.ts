
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
  if (clerkId.includes('-') && clerkId.length >= 32) return clerkId;

  try {
    // UUID v5 Implementation (Standard Deterministic UUID)
    // Namespace: 00000000-0000-0000-0000-000000000000 (uuid_nil)
    const namespace = new Uint8Array(16).fill(0);
    const name = new TextEncoder().encode(clerkId);
    const data = new Uint8Array(namespace.length + name.length);
    data.set(namespace);
    data.set(name, namespace.length);

    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Format hash to UUID v5
    // Set version (5) and variant (8, 9, a, or b)
    hashArray[6] = (hashArray[6] & 0x0f) | 0x50;
    hashArray[8] = (hashArray[8] & 0x3f) | 0x80;

    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
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
