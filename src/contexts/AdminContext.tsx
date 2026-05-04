import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';
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

const ADMIN_ROLES = new Set([
  // A+ CLASS
  'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'cso', 'owner', 'co-founder', 'cofounder',
  // A CLASS
  'aceo', 'acto', 'acfo', 'acoo', 'acmo', 'acio',
  // B CLASS
  'aeo', 'ato', 'afo', 'aoo', 'amo', 'aio', 'superadmin',
  // C CLASS
  'admin', 'moderator', 'staff', 'manager', 'hr', 'support_executive', 'supportexecutive'
]);

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
    
    // Translate ID for Supabase UUID lookup
    const translatedId = await translateClerkIdToUUID(userId);

    try {
      // First attempt to get role via RPC
      const { data, error: rpcError } = await supabase.rpc('get_current_user_role');
      if (!rpcError && data) role = data;
    } catch (error) {
      console.warn('Admin role RPC unavailable', error);
    }

    // Fetch profile data using both translated UUID and raw Clerk ID for maximum resilience
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type, clerk_id')
      .or(`id.eq.${translatedId},clerk_id.eq.${userId}`)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to fetch admin profile:", profileError);
    }

    setProfile(profileData || null);
    
    // Check both the RPC role and the Profile role
    // Support Clerk-based roles in metadata as a fallback
    const metadata = clerkUser?.publicMetadata || {};
    const rawClerkRole = metadata.role || (metadata as any).user_type || '';
    
    // Normalize Clerk roles to an array
    const clerkRoles = Array.isArray(rawClerkRole) 
      ? rawClerkRole 
      : (typeof rawClerkRole === 'string' ? rawClerkRole.split(',').map(r => r.trim()) : []);
    
    const isRpcAdmin = role ? ADMIN_ROLES.has(role.toLowerCase()) : false;
    
    // Support multiple roles in Profile as well (comma-separated)
    const profileRoles = profileData?.user_type?.split(',').map(r => r.trim()) || [];
    const isProfileAdmin = profileRoles.some(r => ADMIN_ROLES.has(r.toLowerCase()));
    const isClerkAdmin = clerkRoles.some(r => ADMIN_ROLES.has(r.toLowerCase()));
    
    const clerkRoleDisplay = Array.isArray(rawClerkRole) ? rawClerkRole.join(', ') : rawClerkRole;
    
    const MASTER_EMAILS = ['abhinavjha393@gmail.com'];
    const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';
    const isMaster = MASTER_EMAILS.includes(userEmail);
    
    const finalAdminStatus = isRpcAdmin || isProfileAdmin || isClerkAdmin || isMaster;

    console.group(`🛡️ [ADMIN AUDIT] ${userEmail}`);
    console.log(`STATUS: ${finalAdminStatus ? '✅ GRANTED' : '❌ DENIED'}`);
    console.log(`1. RPC Role [${role}]: ${isRpcAdmin}`);
    console.log(`2. Profile Role [${profileData?.user_type || 'none'}]: ${isProfileAdmin}`);
    console.log(`3. Clerk Metadata [${clerkRoleDisplay || 'none'}]: ${isClerkAdmin}`);
    console.log(`4. Master Override: ${isMaster}`);
    if (finalAdminStatus && !isMaster) {
      console.warn('⚠️ WARNING: Admin access granted via non-master role. Verify DB/Metadata integrity.');
    }
    console.groupEnd();

    setIsAdmin(finalAdminStatus);
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
