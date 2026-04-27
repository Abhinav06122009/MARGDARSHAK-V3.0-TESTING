import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  activeThreats: number;
  reportsOpen: number;
  blockedUsers: number;
}

export interface AdminThreat {
  id: string;
  created_at: string;
  event_type: string;
  threat_level: string;
  threat_score: number;
  summary?: string | null;
  ip_address?: string | null;
}

export interface AdminUser {
  id: string;
  full_name?: string | null;
  email?: string | null;
  user_type?: string | null;
  risk_level?: string | null;
  is_blocked?: boolean | null;
}

export interface AdminReport {
  id: string;
  created_at: string;
  category: string;
  severity?: string | null;
  status?: string | null;
  user_id?: string | null;
}

export interface SupportTicket {
  id: string;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  message?: string | null;
  status?: string | null;
}

export interface ModerationQueueItem {
  id: string;
  created_at: string;
  title: string;
  summary: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  status: string;
}

export interface AnalyticsData {
  name: string;
  threats: number;
  logins: number;
}

export interface SecuritySettings {
  rate_limit: number;
  ai_sensitivity: number;
}


export const useAdmin = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [threats, setThreats] = useState<AdminThreat[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        usersRes, 
        threatsRes, 
        reportsRes, 
        blockedRes, 
        ticketsRes,
        settingsRes,
        moderationRes,
        analyticsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('security_logs').select('*'),
        supabase.from('admin_reports').select('*'),
        supabase.from('blocked_users').select('*'),
        supabase.from('contact_messages').select('*'),
        supabase.from('security_settings').select('*').eq('id', 'global').single(),
        supabase.from('moderation_queue').select('*'),
        supabase.from('daily_metrics').select('*')
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      
      if (threatsRes.data) {
        setThreats(threatsRes.data
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        );
      }

      if (reportsRes.data) {
        setReports(reportsRes.data
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        );
      }

      if (ticketsRes.data) {
        setTickets(ticketsRes.data
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 20)
        );
      }

      if (settingsRes.data) setSettings(settingsRes.data as any);

      if (moderationRes.data) {
        setModerationQueue(moderationRes.data
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
        );
      }

      if (analyticsRes.data && analyticsRes.data.length > 0) {
        const formattedAnalytics = analyticsRes.data
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 7)
          .map((item: any) => {
            const date = new Date(item.date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
              name: days[date.getDay()],
              threats: item.threats_count || 0,
              logins: item.logins_count || 0
            };
          }).reverse();
        setAnalyticsData(formattedAnalytics);
      } else {
        setAnalyticsData([
          { name: 'Mon', threats: 0, logins: 0 },
          { name: 'Tue', threats: 0, logins: 0 },
          { name: 'Wed', threats: 0, logins: 0 },
          { name: 'Thu', threats: 0, logins: 0 },
          { name: 'Fri', threats: 0, logins: 0 },
          { name: 'Sat', threats: 0, logins: 0 },
          { name: 'Sun', threats: 0, logins: 0 }
        ]);
      }

      setStats({
        totalUsers: usersRes.data?.length || 0,
        activeThreats: threatsRes.data?.length || 0,
        reportsOpen: reportsRes.data?.filter((r: any) => r.status !== 'resolved').length || 0,
        blockedUsers: blockedRes.data?.length || 0,
      });

    } catch (error) {
      console.error('[ADMIN DATA] Fetch from Supabase failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return {
    stats,
    threats,
    users,
    reports,
    tickets,
    moderationQueue,
    analyticsData,
    settings,
    loading,
    refresh: fetchAdminData,
  };
};
