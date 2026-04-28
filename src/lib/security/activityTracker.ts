import { supabase } from "@/integrations/supabase/client";

/**
 * Global Activity Tracker
 * Logs all user actions with IP tracing to prevent abuse.
 */
export const trackActivity = async (
  activityType: string, 
  metadata: any = {}
) => {
  try {
    // 1. Get current IP (Cached for performance)
    let ip = (window as any)._userIP;
    if (!ip) {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip = data.ip;
      (window as any)._userIP = ip;
    }

    // 2. Get current User
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // 3. Log to user_activity_logs
    const { error } = await supabase.from('user_activity_logs').insert({
      activity_type: activityType,
      ip_address: ip,
      user_id: userId,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        screen: `${window.screen.width}x${window.screen.height}`,
      }
    });

    if (error) {
      // Fail silently to prevent interrupting user flow
      console.warn('Activity logging deferred:', error.message);
    }
  } catch (err) {
    // Silent catch
  }
};

/**
 * Hook for component-level action tracking
 */
export const useActionTracking = () => {
  return {
    trackAction: (actionName: string, data?: any) => trackActivity(actionName, data)
  };
};
