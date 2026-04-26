import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data } = await supabase.rpc('get_current_user_role');
      if (data) role = data;
    } catch (error) {
      console.warn('Admin role RPC unavailable', error);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Failed to fetch admin profile:", profileError);
    }

    setProfile(profileData || null);
    
    // Check both the RPC role and the Profile role just in case one overrides the other with a generic "user" role
    const isRpcAdmin = role ? ADMIN_ROLES.has(role.toLowerCase()) : false;
    const isProfileAdmin = profileData?.user_type ? ADMIN_ROLES.has(profileData.user_type.toLowerCase()) : false;
    
    // Strict RBAC: Only allow specific roles
    setIsAdmin(isRpcAdmin || isProfileAdmin);
    
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
    refresh: () => resolveAdmin(session),
  }), [session, profile, isAdmin, loading]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
