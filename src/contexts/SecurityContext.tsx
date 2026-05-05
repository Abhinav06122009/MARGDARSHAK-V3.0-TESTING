import React, { createContext, useEffect, useMemo, useState, useContext } from 'react';
import { SecurityReport, SecuritySentry } from '@/security/sentry';
import { logSecurityEvent } from '@/lib/security/securityService';
import { AuthContext } from '@/contexts/AuthContext';

export interface SecurityContextValue {
  report: SecurityReport | null;
  status: 'idle' | 'scanning' | 'ready';
  refreshScan: () => Promise<void>;
}

export const SecurityContext = createContext<SecurityContextValue>({
  report: null,
  status: 'idle',
  refreshScan: async () => undefined,
});

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useContext(AuthContext);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'ready'>('idle');

  const runScan = async () => {
    if (status === 'scanning') return;
    setStatus('scanning');
    const scanReport = await SecuritySentry.performSecurityScan();
    setReport(scanReport);
    setStatus('ready');
    
    // Only log to backend if authenticated to avoid 401 spam
    if (session) {
      try {
        await logSecurityEvent({
          eventType: 'security_scan',
          details: {
            riskLevel: scanReport.riskLevel,
            flags: scanReport.flags,
            score: scanReport.debug?.score,
          },
        });
      } catch (err) {
        console.warn('Security logging deferred:', err);
      }
    }
  };

  useEffect(() => {
    // Delay scan slightly to let other high-priority tasks finish
    const timer = setTimeout(() => {
      runScan();
    }, 1000);
    return () => clearTimeout(timer);
  }, [session]); // Re-run if session becomes available to log the scan

  const value = useMemo(() => ({
    report,
    status,
    refreshScan: runScan,
  }), [report, status]);

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};
