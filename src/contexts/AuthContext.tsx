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
  isVerified: boolean;
  setVerified: (verified: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue>({ 
  session: null, 
  loading: true, 
  user: null, 
  clerkUser: null, 
  isBlocked: false, 
  blockedReason: null,
  isVerified: false,
  setVerified: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

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
          return await clerkSession.getToken();
        } catch (e) {
          return await clerkSession.getToken();
        }
      });
    }
    if (userLoaded && clerkUser) {
      setClerkUser(clerkUser);
    }
  }, [clerkSession, sessionLoaded, clerkUser, userLoaded]);

  // Background Sync Profile
  useEffect(() => {
    const syncProfile = async () => {
      if (!clerkUser?.id) return;
        try {
          const translatedId = await translateClerkIdToUUID(clerkUser.id);
          console.log('⚡ [AUTH] Identity Translation Success:', translatedId);
          
          const metadata = (clerkUser.publicMetadata || {}) as any;
          const role = (metadata.role || metadata.public?.role || []) as string[];
          const subscription = (metadata.subscription || metadata.public?.subscription || {}) as any;
          
          let tier = (subscription.tier || 'free').toLowerCase();
          
          const isPowerUser = role.some(r => 
            ['ceo', 'admin', 'superadmin', 'owner', 'manager', 'moderator'].includes(r.toLowerCase())
          );

          if (isPowerUser) {
            tier = 'premium_elite';
          }
          
          // Canonicalize user_type for Supabase RLS
          let canonicalRole = 'student';
          if (role.some(r => ['superadmin', 'owner'].includes(r.toLowerCase()))) canonicalRole = 'superadmin';
          else if (role.some(r => ['admin', 'ceo', 'manager'].includes(r.toLowerCase()))) canonicalRole = 'admin';
          else if (role.some(r => r.toLowerCase() === 'bdo')) canonicalRole = 'bdo';
          else if (role.some(r => r.toLowerCase().includes('premium'))) canonicalRole = 'premium';

          const profileData = {
            id: translatedId,
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName || clerkUser.username || 'Scholar',
            avatar_url: clerkUser.imageUrl,
            user_type: canonicalRole, // Use canonical role for RLS consistency
            subscription_tier: tier,
            subscription_status: subscription.status || 'active',
            updated_at: new Date().toISOString()
          };

          // Update local state first for UI responsiveness
          setUser({
            ...clerkUser,
            id: translatedId,
            clerk_id: clerkUser.id,
            profile: { ...profileData, subscription_tier: tier, role }
          });

          setLoading(false);

          // Perform Database Sync
          console.log('[AuthContext] Syncing profile for', clerkUser.id, '->', translatedId);
          const { error: syncError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

          if (syncError) {
            console.error('[AuthContext] Sync Error:', syncError.message);
            // Recovery: If there's an ID mismatch or syntax error, attempt email match
            const isUuidError = syncError.message.toLowerCase().includes('uuid') || syncError.message.toLowerCase().includes('syntax');
            const isConflict = syncError.message.toLowerCase().includes('unique') || syncError.message.toLowerCase().includes('conflict');
            
            if (isUuidError || isConflict) {
              console.log('[AuthContext] Identity mismatch detected. Attempting recovery by email match...');
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ id: translatedId, clerk_id: clerkUser.id, user_type: canonicalRole })
                .eq('email', profileData.email);
              
              if (!updateError) {
                console.log('[AuthContext] Recovery success. Identity harmonized.');
              } else {
                console.error('[AuthContext] Recovery failed:', updateError.message);
              }
            }
          } else {
            console.log('[AuthContext] Sync success for', translatedId);
          }
          } catch (e) {
            console.error('[AuthContext] Profile sync exception:', e);
          }

          // Security check
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_blocked, blocked_reason')
              .eq('id', translatedId)
              .maybeSingle();

            if (profile?.is_blocked) {
              setIsBlocked(true);
              setBlockedReason(profile.blocked_reason);
            }
          } catch (e) {}
          
        } catch (err) {
          console.error('Unexpected sync error:', err);
        } finally {
          setLoading(false);
        }
    };

    if (sessionLoaded && userLoaded && clerkUser?.id) {
      syncProfile();
    }
  }, [sessionLoaded, userLoaded, clerkUser?.id]);

  const value = useMemo(() => ({
    session: clerkSession || null,
    user,
    clerkUser: clerkUser || null,
    loading,
    isBlocked,
    blockedReason,
    isVerified,
    setVerified: setIsVerified
  }), [clerkSession, user, clerkUser, loading, isBlocked, blockedReason, isVerified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
