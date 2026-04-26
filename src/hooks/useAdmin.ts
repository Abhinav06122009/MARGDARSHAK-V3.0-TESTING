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

    const responses = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, user_type, risk_level, is_blocked'),
      supabase.from('security_threats').select('id, created_at, event_type, threat_level, threat_score, summary, ip_address').order('created_at', { ascending: false }).limit(5),
      supabase.from('admin_reports').select('id, created_at, category, severity, status, user_id').order('created_at', { ascending: false }).limit(5),
      supabase.from('blocked_users').select('id'),
      supabase.from('contact_messages').select('id, created_at, first_name, last_name, email, message, status').order('created_at', { ascending: false }).limit(20),
      supabase.from('security_settings').select('*').eq('id', 'global').maybeSingle(),
      supabase.from('moderation_queue').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('daily_metrics').select('*').order('date', { ascending: false }).limit(7)
    ]);

    const [
      usersResponse, 
      threatsResponse, 
      reportsResponse, 
      blockedResponse, 
      ticketsResponse,
      settingsResponse,
      moderationResponse,
      analyticsResponse
    ] = responses;

    // Log errors with context but don't stop execution
    responses.forEach((res, i) => {
      if (res.error) {
        const tableNames = ['profiles', 'security_threats', 'admin_reports', 'blocked_users', 'contact_messages', 'security_settings', 'moderation_queue', 'daily_metrics'];
        console.warn(`[ADMIN DATA] Fetch failed for ${tableNames[i]}:`, res.error.message);
      }
    });

    if (!usersResponse.error) setUsers(usersResponse.data || []);
    if (!threatsResponse.error) setThreats(threatsResponse.data || []);
    if (!reportsResponse.error) setReports(reportsResponse.data || []);
    if (!ticketsResponse.error) setTickets(ticketsResponse.data || []);
    
    if (!settingsResponse.error && settingsResponse.data) {
      setSettings(settingsResponse.data);
    }
    
    if (!moderationResponse.error && moderationResponse.data) {
      setModerationQueue(moderationResponse.data);
    }

    if (!analyticsResponse.error && analyticsResponse.data && analyticsResponse.data.length > 0) {
      const formattedAnalytics = analyticsResponse.data.map((item: any) => {
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
      totalUsers: usersResponse.data?.length || 0,
      activeThreats: threatsResponse.data?.length || 0,
      reportsOpen: reportsResponse.data?.filter(r => r.status !== 'resolved').length || 0,
      blockedUsers: blockedResponse.data?.length || 0,
    });

    setLoading(false);
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
