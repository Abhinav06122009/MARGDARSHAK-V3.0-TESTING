// This file is used to interact with Supabase and Clerk
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { translateClerkIdToUUID } from '@/lib/id-translator';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clerk integration
let getClerkToken: () => Promise<string | null> = async () => null;
let clerkUser: any = null;
let cachedToken: string | null = null;
let lastTokenFetch = 0;

export const setClerkTokenProvider = (provider: () => Promise<string | null>) => {
  getClerkToken = provider;
};

export const setClerkUser = (user: any) => {
  clerkUser = user;
};

// Validate environment variables
if (!SUPABASE_URL) {
  console.error('CRITICAL: VITE_SUPABASE_URL is missing');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error('CRITICAL: Supabase Key (PUBLISHABLE/ANON) is missing');
}

// Safe storage wrapper
const memoryStore: Record<string, string> = {};
const customStorageAdapter = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  },
};

// Create the supabase client with enhanced configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    fetch: async (url, options: any = {}) => {
      // Internal Token Caching: Prevents redundant Clerk network calls
      const now = Date.now();
      const needsRefresh = !cachedToken || (now - lastTokenFetch > 10000);
      
      if (needsRefresh) {
        const token = await getClerkToken();
        if (token) {
          cachedToken = token;
          lastTokenFetch = now;
        }
      }
      
      const token = cachedToken;
      const headers = new Headers(options.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return fetch(url, { ...options, headers });
    },
  },
  auth: {
    persistSession: false, // Clerk handles session persistence
  }
});

// Enhanced Monkey-patch using Proxy to preserve all original methods (including prototype methods)
const originalAuth = supabase.auth;
const authHandler: ProxyHandler<any> = {
  get: (target, prop, receiver) => {
    // Override specific methods
    if (prop === 'getUser') {
      return async () => {
        try {
          const user = await supabaseHelpers.getCurrentUser();
          return { data: { user }, error: null };
        } catch (err) {
          console.error('[Supabase-MonkeyPatch] getUser error:', err);
          return { data: { user: null }, error: err };
        }
      };
    }
    
    if (prop === 'getSession') {
      return async () => {
        try {
          const user = await supabaseHelpers.getCurrentUser();
          const token = await getClerkToken();
          const session = user ? { 
            user, 
            access_token: token || '',
            refresh_token: '',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer'
          } : null;
          return { data: { session }, error: null };
        } catch (err) {
          return { data: { session: null }, error: err };
        }
      };
    }

    if (prop === 'signOut') {
      return async () => {
        // Sign out is handled by Clerk, but we provide a no-op for compatibility
        return { error: null };
      };
    }

    if (prop === 'updateUser') {
      return async (attributes: any) => {
        if (!clerkUser) return { data: { user: null }, error: new Error('Not authenticated') };
        try {
          const updateParams: any = {};
          if (attributes.data?.full_name) {
            const parts = attributes.data.full_name.split(' ');
            updateParams.firstName = parts[0];
            updateParams.lastName = parts.slice(1).join(' ');
          }
          if (attributes.password) {
            updateParams.password = attributes.password;
          }
          if (Object.keys(updateParams).length > 0) {
            await (clerkUser as any).update(updateParams);
          }
          const user = await supabaseHelpers.getCurrentUser();
          return { data: { user }, error: null };
        } catch (error: any) {
          console.error('Error updating user via Clerk:', error);
          return { data: { user: null }, error };
        }
      };
    }

    // Fallback to original auth object for all other methods (onAuthStateChange, signIn, etc.)
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }
};

(supabase as any).auth = new Proxy(originalAuth, authHandler);

// Caching for getCurrentUser to prevent redundant calculations
let cachedUser: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 2000; // 2 seconds

// Helper functions for common operations
export const supabaseHelpers = {
  getCurrentUser: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedUser && (now - lastCacheTime < CACHE_TTL)) {
      return cachedUser;
    }

    try {
      if (!clerkUser) return null;
      
      const email = clerkUser.primaryEmailAddress?.emailAddress || 
                    clerkUser.emailAddresses?.[0]?.emailAddress || '';
      
      const fullName = clerkUser.fullName || 
                       (clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.firstName || clerkUser.lastName || clerkUser.username || '');

      const metadata = clerkUser.publicMetadata || {};
      const unsafeMetadata = clerkUser.unsafeMetadata || {};
      
      console.log('🛡️ [Clerk Metadata Full Scan]:', JSON.stringify({
        public: metadata,
        unsafe: unsafeMetadata,
        clerkId: clerkUser?.id
      }, null, 2));
      
      const subscription = (metadata.subscription as any) || (unsafeMetadata.subscription as any) || {};
      const role = metadata.role || (unsafeMetadata as any).role || (metadata as any).user_type || (unsafeMetadata as any).user_type || 'student';
      
      // Support multiple metadata formats (flat or nested)
      const rawTier = (subscription.tier || 
                   (metadata as any).subscription_tier || 
                   (unsafeMetadata as any).subscription_tier || 
                   (metadata as any).tier || 
                   (unsafeMetadata as any).tier || 
                   'free');
      let tier = (Array.isArray(rawTier) ? String(rawTier[0]) : String(rawTier)).toLowerCase();
      
      // MASTER OVERRIDES: Hardcoded bypass for power users
      const MASTER_IDS = [
        'user_3CwM4tADcqKhELg4ZX9r2xIRC4L', // Admin
        'user_3CylWpMJnNbVpgJcpk9eSIf73gS'  // Premium User
      ];
      
      if (MASTER_IDS.includes(clerkUser.id)) {
        console.log(`👑 [Super Override] Master access granted for ${clerkUser.id}`);
        tier = 'premium_elite';
      }

      const translatedId = await translateClerkIdToUUID(clerkUser.id);

      const userData = {
        id: translatedId,
        clerk_id: clerkUser.id,
        email: email,
        role: role,
        subscription: {
          tier: tier,
          status: subscription.status || (metadata as any).subscription_status || 'inactive'
        },
        user_metadata: {
          full_name: fullName,
          avatar_url: clerkUser.imageUrl,
          ...metadata,
          subscription_tier: tier // Ensure it's flat for easier access
        },
        profile: {
          id: translatedId,
          clerk_id: clerkUser.id,
          full_name: fullName,
          user_type: role,
          role: role,
          subscription_tier: tier,
          subscription_status: subscription.status || 'inactive'
        }
      } as any;
      
      cachedUser = userData;
      lastCacheTime = Date.now();
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  getUserProfile: async (userId?: string) => {
    try {
      let id: string | null = null;
      
      if (userId) {
        // If a raw userId is provided, translate it
        id = await translateClerkIdToUUID(userId);
      } else {
        // Fallback to current user (which is already translated)
        id = (await supabaseHelpers.getCurrentUser())?.id || null;
      }
      
      if (!id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile from Supabase:', error);
      return null;
    }
  },

  isAuthenticated: async () => {
    const user = await supabaseHelpers.getCurrentUser();
    return !!user;
  }
};

// Export commonly used types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Profile = Tables<'profiles'>;
export type Course = Tables<'courses'>;
export type Attendance = Tables<'attendance'>;
export type Note = Tables<'notes'>;
export type Task = Tables<'tasks'>;
export type Grade = Tables<'grades'>;
export type Enrollment = Tables<'enrollments'>;
export type StudySession = Tables<'study_sessions'>;
export type UserTimetable = Tables<'user_timetables'>;
