import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  user_type?: string | null;
}

interface AdminContextValue {
  session: any | null;
  profile: AdminProfile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextValue>({
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refresh: async () => undefined,
});

const ADMIN_ROLES = new Set(['admin', 'superadmin', 'super_admin', 'owner']);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolveAdmin = async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    let role: string | null = null;

    try {
      // First attempt to get role via RPC
      const { data, error: rpcError } = await supabase.rpc('get_current_user_role');
      if (!rpcError && data) role = data;
    } catch (error) {
      console.warn('Admin role RPC unavailable', error);
    }

    // Fetch profile data.
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to fetch admin profile:", profileError);
    }

    setProfile(profileData || null);
    
    // Check both the RPC role and the Profile role
    // Support Clerk-based roles in metadata as a fallback
    const metadata = clerkUser?.publicMetadata || {};
    const unsafeMetadata = clerkUser?.unsafeMetadata || {};
    const clerkRole = (metadata.role as string) || (unsafeMetadata.role as string) || (metadata as any).user_type || (unsafeMetadata as any).user_type || '';
    
    const isRpcAdmin = role ? ADMIN_ROLES.has(role.toLowerCase()) : false;
    const isProfileAdmin = profileData?.user_type ? ADMIN_ROLES.has(profileData.user_type.toLowerCase()) : false;
    const isClerkAdmin = clerkRole ? ADMIN_ROLES.has(clerkRole.toLowerCase()) : false;
    
    // MASTER OVERRIDES
    const MASTER_IDS = [
      'user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 
      'user_3CylWpMJnNbVpgJcpk9eSIf73gS',
      'user_3CyueymOUFein248UifL5xSPBOU'
    ];
    
    const MASTER_EMAILS = ['abhinavjha393@gmail.com'];
    
    const isMaster = MASTER_IDS.includes(clerkUser?.id || '') || 
                     MASTER_EMAILS.includes(clerkUser?.primaryEmailAddress?.emailAddress || '');
    
    // REMOVED "NUCLEAR" DETECTION TO PREVENT ROLE LEAKAGE
    // Only allow explicit roles or master status

    setIsAdmin(isRpcAdmin || isProfileAdmin || isClerkAdmin || isMaster);
    setLoading(false);
  };

  useEffect(() => {
    if (sessionLoaded && userLoaded) {
      resolveAdmin(clerkUser?.id);
    }
  }, [sessionLoaded, userLoaded, clerkUser?.id]);

  const session = clerkSession ? (clerkSession as any) : null;

  const value = useMemo(() => ({
    session,
    profile,
    isAdmin,
    loading,
    refresh: () => resolveAdmin(clerkUser?.id),
  }), [session, profile, isAdmin, loading, clerkUser?.id]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
