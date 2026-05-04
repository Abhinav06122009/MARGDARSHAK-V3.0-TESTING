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
  subscription_tier?: string | null;
  subscription_status?: string | null;
  last_login_ip?: string | null;
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
  subject?: string | null;
  message?: string | null;
  status?: string | null;
  resolution_text?: string | null;
  type: 'contact' | 'ticket';
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
      // RESILIENT DATA INGESTION: Query each table individually to prevent monolithic failure
      const usersRes = await supabase.from('profiles').select('*');
      const threatsRes = await supabase.from('security_threats').select('*');
      const reportsRes = await supabase.from('admin_reports').select('*');
      const blockedRes = await supabase.from('blocked_users').select('*');
      const contactMessagesRes = await supabase.from('contact_messages').select('*');
      const supportTicketsRes = await supabase.from('support_tickets').select('*');
      const settingsRes = await supabase.from('security_settings').select('*').eq('id', 'global').maybeSingle();
      const moderationRes = await supabase.from('moderation_queue').select('*');
      const analyticsRes = await supabase.from('daily_metrics').select('*');

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
          .slice(0, 100)
        );
      }

      if (contactMessagesRes.data || supportTicketsRes.data) {
        const contactMsgs = (contactMessagesRes.data || []).map((m: any) => ({ 
          ...m, 
          type: 'contact',
          subject: m.subject || 'PUBLIC CONTACT INQUIRY'
        }));
        const supportTkts = (supportTicketsRes.data || []).map((m: any) => ({ 
          ...m, 
          type: 'ticket', 
          first_name: m.first_name || 'Ticket', 
          last_name: m.last_name || `#${m.id.slice(0,4)}`,
          subject: m.subject || 'INTERNAL SUPPORT TICKET'
        }));
        
        setTickets([...contactMsgs, ...supportTkts]
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 50)
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

    // --- REALTIME SUBSCRIPTIONS ---
    // Subscribe to new contact messages and support tickets
    const contactChannel = supabase
      .channel('admin-contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        console.log('🔔 [REALTIME] New contact message received');
        fetchAdminData();
      })
      .subscribe();

    const supportChannel = supabase
      .channel('admin-support')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        console.log('🔔 [REALTIME] New support ticket received');
        fetchAdminData();
      })
      .subscribe();

    // --- POLLING HEARTBEAT (Every 10 seconds) ---
    const pollingId = setInterval(() => {
      console.log('💓 [SYNC] High-Command Heartbeat pulse...');
      fetchAdminData();
    }, 10000);

    return () => {
      clearInterval(pollingId);
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(supportChannel);
    };
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
    createInvestigation: async (data: any) => {
      const { error } = await supabase.from('admin_reports').insert([data]);
      if (error) throw error;
      fetchAdminData();
    },
    updateInvestigation: async (id: string, data: any) => {
      const { error } = await supabase.from('admin_reports').update(data).eq('id', id);
      if (error) throw error;
      fetchAdminData();
    },
    deleteInvestigation: async (id: string) => {
      const { error } = await supabase.from('admin_reports').delete().eq('id', id);
      if (error) throw error;
      fetchAdminData();
    },
    resolveTicket: async (id: string, type: 'contact' | 'ticket', resolutionText: string) => {
      const table = type === 'contact' ? 'contact_messages' : 'support_tickets';
      
      // 1. Update Database Status & Resolution Text
      const { error } = await supabase.from(table).update({ 
        status: 'resolved',
        resolution_text: resolutionText 
      }).eq('id', id);
      
      if (error) throw error;

      // 2. Automated Email Dispatch Protocol (Placeholder for API integration)
      // To activate, add VITE_EMAIL_API_KEY to your .env
      console.log('🛰️ [AUTOMATED DISPATCH] Initiating direct mail via API...');
      
      fetchAdminData();
    },
    escalateTicket: async (id: string, type: 'contact' | 'ticket', resolutionText: string) => {
      const table = type === 'contact' ? 'contact_messages' : 'support_tickets';
      const { error } = await supabase.from(table).update({ 
        status: 'escalated',
        resolution_text: resolutionText
      }).eq('id', id);
      
      if (error) throw error;
      fetchAdminData();
    }
  };
};
