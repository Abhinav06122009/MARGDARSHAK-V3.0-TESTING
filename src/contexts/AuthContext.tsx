import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase, setClerkTokenProvider, setClerkUser } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';
import { toast } from 'sonner';

interface AuthContextValue {
  session: any | null;
  loading: boolean;
  user: any | null;
  clerkUser: any | null;
  isBlocked: boolean;
  blockedReason: string | null;
}

export const AuthContext = createContext<AuthContextValue>({ session: null, loading: true, user: null, clerkUser: null, isBlocked: false, blockedReason: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  // Sync Clerk Session with Supabase Client
  useEffect(() => {
    if (sessionLoaded && clerkSession) {
      setClerkTokenProvider(async () => {
        try {
          const token = await clerkSession.getToken({ template: 'supabase' });
          if (token) {
            console.log('[AUTH] Supabase handshake active (Template: supabase)');
            return token;
          }
          console.warn('[AUTH] Missing "supabase" JWT template in Clerk. Falling back to default session token.');
          return await clerkSession.getToken();
        } catch (e) {
          console.error('[AUTH] Failed to fetch Supabase token, falling back:', e);
          return await clerkSession.getToken();
        }
      });
    }
    if (userLoaded && clerkUser) {
      setClerkUser(clerkUser);
    }
  }, [clerkSession, sessionLoaded, clerkUser, userLoaded]);

  // Initial loading state resolution - FAST BOOT
  useEffect(() => {
    if (sessionLoaded && userLoaded) {
      // If no user, we are definitely not loading anymore
      if (!clerkUser) {
        setLoading(false);
      } else {
        // If we have a user, check cache for block status to show immediately
        const cachedBlock = localStorage.getItem(`blocked_${clerkUser.id}`);
        if (cachedBlock) {
          const { blocked, reason } = JSON.parse(cachedBlock);
          setIsBlocked(blocked);
          setBlockedReason(reason);
        }
        // LOADING REMAINS TRUE until syncProfile augments the user
      }
    }
  }, [sessionLoaded, userLoaded, clerkUser]);

  // Background Sync Profile
  useEffect(() => {
    const syncProfile = async () => {
      if (!clerkUser) return;
        try {
          // Check if already synced in this session to avoid redundant network calls
          const sessionSyncKey = `synced_${clerkUser.id}`;
          if (sessionStorage.getItem(sessionSyncKey)) {
            console.log('⚡ Background Sync: Profile already synced for this session.');
            
            // Still resolve identity for the local state
            const translatedId = await translateClerkIdToUUID(clerkUser.id);
            const metadata = clerkUser.publicMetadata || {};
            const subscription = (metadata.subscription as any) || {};
            let tier = (subscription.tier || 'free').toLowerCase();
            const roleArray = Array.isArray(metadata.role) ? metadata.role : [metadata.role || 'student'];
            const role = roleArray.map(r => String(r).trim().toLowerCase()).join(', ');
            if (role.includes('ceo') || role.includes('admin')) tier = 'premium_elite';

            setUser({
              ...clerkUser,
              id: translatedId,
              clerk_id: clerkUser.id,
              profile: { id: translatedId, clerk_id: clerkUser.id, subscription_tier: tier, role: role, user_type: role }
            });
            setLoading(false);
            return;
          }

          console.log('⚡ Background Sync: Syncing profile for', clerkUser.id);
          
          const translatedId = await translateClerkIdToUUID(clerkUser.id);
          console.log('[AUTH] Identity Resolved:', { clerkId: clerkUser.id, uuid: translatedId });
          
          const metadata = clerkUser.publicMetadata || {};
          const subscription = (metadata.subscription as any) || {};
          
          // STRICT METADATA RESOLUTION (Clerk-Only as requested)
          let tier = (subscription.tier || 'free').toLowerCase();
          const roleArray = Array.isArray(metadata.role) ? metadata.role : [metadata.role || 'student'];
          const role = roleArray.map(r => String(r).trim().toLowerCase()).join(', ');

          // SuperAdmin/CEO Overrides (Safety Net)
          const lowerRoles = role.toLowerCase();
          if (lowerRoles.includes('ceo') || lowerRoles.includes('admin') || lowerRoles.includes('superadmin') || lowerRoles.includes('owner')) {
            tier = 'premium_elite';
          }

          // Set the augmented user state immediately for the app to use
          setUser({
            ...clerkUser,
            id: translatedId,
            clerk_id: clerkUser.id,
            profile: {
              id: translatedId,
              clerk_id: clerkUser.id,
              subscription_tier: tier,
              role: role,
              user_type: role
            }
          });

          // Resolve loading state ONLY after identity is augmented
          setLoading(false);

          const profileData: any = {
            id: translatedId,
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName || clerkUser.username || 'Scholar',
            avatar_url: clerkUser.imageUrl,
            user_type: role,
            updated_at: new Date().toISOString()
          };

          const token = clerkSession ? await clerkSession.getToken() : null;
          
          // Schema-Safe Sync: Use primary 'id' for conflict resolution
          console.log('[AuthContext] Attempting Profile Sync:', profileData);
          
          const { error: syncError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });
            
          if (syncError) {
            console.error('[AuthContext] CRITICAL SYNC ERROR:', syncError);
            if (syncError.message.includes('invalid input syntax for type uuid')) {
              console.warn('[AuthContext] Trigger Identity Mismatch detected. System is running in Restricted Identity Mode.');
              // We don't throw here so the app still loads with the translated ID in memory
            }
          } else {
            console.log('[AuthContext] Profile synced successfully via Supabase');
            sessionStorage.setItem(`synced_${clerkUser.id}`, 'true');
          }

          // Check if blocked in Supabase - Keep this fast
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_blocked, blocked_reason')
            .eq('id', translatedId)
            .maybeSingle();

          if (profile?.is_blocked) {
            setIsBlocked(true);
            const reason = profile.blocked_reason || 'Access restricted for security reasons.';
            setBlockedReason(reason);
            localStorage.setItem(`blocked_${clerkUser.id}`, JSON.stringify({ blocked: true, reason }));
          } else {
            setIsBlocked(false);
            localStorage.removeItem(`blocked_${clerkUser.id}`);
          }
          
        } catch (err) {
          console.error('Unexpected sync error:', err);
        } finally {
          setLoading(false);
        }
    };

    if (sessionLoaded && userLoaded && clerkUser) {
      syncProfile();
    }
  }, [sessionLoaded, userLoaded, clerkUser, clerkSession]);

  const value = useMemo(() => ({
    session: clerkSession || null,
    user,
    clerkUser: clerkUser || null,
    loading,
    isBlocked,
    blockedReason
  }), [clerkSession, user, clerkUser, loading, isBlocked, blockedReason]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
