import { useMemo, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { logSecurityEvent } from '@/lib/security/securityService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage user identity matrix operations
 * Extracts logic from UserManagement.tsx for a cleaner, modular architecture.
 */
export const useUserManagement = () => {
  const { users, loading, refresh } = useAdmin();
  const [query, setQuery] = useState('');

  // Search/Filter logic
  const filteredUsers = useMemo(() => {
    if (!query) return users;
    const lowered = query.toLowerCase();
    return users.filter((user) => 
      `${user.full_name} ${user.email}`.toLowerCase().includes(lowered)
    );
  }, [query, users]);

  /**
   * Toggles a user's access (block/unblock)
   */
  const handleAction = async (action: 'block' | 'unblock' | 'set_tier', userId: string, extra?: any) => {
    try {
      if (action === 'set_tier') {
        const tier = extra?.tier;
        if (!tier) return;

        const { error: tierError } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: tier,
            subscription_status: 'active'
          })
          .eq('id', userId);

        if (tierError) throw tierError;

        // Try to sync with Clerk via admin function if possible
        try {
          const { authedFetch } = await import('@/lib/ai/authedFetch');
          await authedFetch('/.netlify/functions/admin-manage-user', {
            method: 'POST',
            body: JSON.stringify({
              targetUserId: userId,
              action: 'update_subscription',
              data: { tier, status: 'active' }
            })
          });
        } catch (syncErr) {
          console.warn("⚠️ Admin backend sync failed, but Supabase was updated:", syncErr);
        }

        toast.success(`Subscription tier updated to ${tier.toUpperCase()}`);
        refresh();
        return;
      }

      const isBlocked = action === 'block';
      
      // 1. Update the profile status in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_blocked: isBlocked })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Synchronize with blocked_users collection in Supabase
      if (isBlocked) {
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        const { error: blockError } = await supabase.from('blocked_users').insert({
          user_id: userId,
          blocked_by: adminUser?.id,
          reason: 'Manual administrative block via Identity Matrix',
          created_at: new Date().toISOString()
        });
        
        if (blockError) {
          console.warn("⚠️ Sync to blocked_users failed, but profile was updated:", blockError);
        }
      } else {
        const { error: unblockError } = await supabase
          .from('blocked_users')
          .delete()
          .eq('user_id', userId);
        
        if (unblockError) {
          console.warn("⚠️ Removal from blocked_users failed, but profile was updated:", unblockError);
        }
      }

      // 3. Log the security event
      try {
        await logSecurityEvent({
          eventType: action === 'block' ? 'admin_block_user' : 'admin_unblock_user',
          userId,
          details: { 
            action,
            target_user_id: userId,
            timestamp: new Date().toISOString()
          },
        });
      } catch (logErr) {
        console.error("🔒 Security logging failed (Check Supabase SQL):", logErr);
      }
      
      toast.success(`Identity ${isBlocked ? 'restricted' : 'restored'} successfully`);
      refresh();
    } catch (error: any) {
      console.error(`Error during user ${action}:`, error);
      toast.error(`Operation failed: ${error.message}`);
    }
  };

  return {
    query,
    setQuery,
    filteredUsers,
    loading,
    handleAction,
    refresh
  };
};
