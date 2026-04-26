import { supabase } from '@/integrations/supabase/client';

export interface SecurityEventInput {
  eventType: string;
  userId?: string | null;
  details?: Record<string, unknown> | null;
}

export interface ThreatAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  summary: string;
  aiSummary?: string | null;
}

export interface SecurityEventResult {
  logged: boolean;
  threat: ThreatAssessment;
  deviceId: string | null;
  ipAddress: string | null;
  moderation?: {
    score: number;
    severity: 'low' | 'medium' | 'high';
    violations: string[];
  } | null;
}

interface SecurityLoggerResponse {
  result?: SecurityEventResult & {
    moderation?: {
      score: number;
      severity: 'low' | 'medium' | 'high';
      violations: string[];
    } | null;
  };
  error?: string;
}

const isUnavailableSecurityLogger = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const err = error as { name?: string; status?: number; context?: { status?: number } };
  // Supabase can surface HTTP status either on the top-level error or nested context.
  return err.name === 'FunctionsFetchError' || err.status === 404 || err.context?.status === 404;
};

const invokeSecurityLogger = async (body: Record<string, unknown>): Promise<SecurityLoggerResponse | null> => {
  const { data, error: invokeError } = await supabase.functions.invoke('security-logger', { body });
  
  if (invokeError) {
    if (!isUnavailableSecurityLogger(invokeError)) {
      let errorBody = 'No error body';
      try {
        // Try to extract JSON error from Supabase's FunctionsHttpError context
        const context = (invokeError as any).context;
        if (context instanceof Response) {
          errorBody = await context.clone().text();
        }
      } catch (e) {
        errorBody = 'Failed to parse error body';
      }

      console.error('[DIAGNOSTIC] security-logger invocation failed', {
        message: invokeError.message,
        name: invokeError.name,
        status: (invokeError as any).status || (invokeError as any).context?.status,
        errorBody,
        errorDump: JSON.stringify(invokeError, Object.getOwnPropertyNames(invokeError))
      });
    }
    throw new Error(invokeError.message || 'Security logger communication failed');
  }

  if (data?.error) {
    console.error('security-logger returned business error', data.error);
    throw new Error(data.error);
  }

  return data;
};

export const logSecurityEvent = async ({ eventType, userId, details }: SecurityEventInput): Promise<SecurityEventResult | null> => {
  try {
    const response = await invokeSecurityLogger({
      action: 'log_event',
      eventType,
      userId,
      details: details ?? null,
    });
    return response?.result ?? null;
  } catch (error: any) {
    console.error('Failed to log security event:', error);
    throw error;
  }
};

export const logUserActivity = async (userId: string, activityType: string, metadata?: Record<string, unknown>) => {
  await invokeSecurityLogger({
    action: 'log_user_activity',
    userId,
    activityType,
    metadata: metadata ?? null,
  });
};

export const logIpActivity = async (eventType: string, metadata?: Record<string, unknown>) => {
  await invokeSecurityLogger({
    action: 'log_ip_activity',
    eventType,
    metadata: metadata ?? null,
  });
};

export const runSecurityScan = async () => {
  const response = await invokeSecurityLogger({
    action: 'run_security_scan',
    eventType: 'security_scan',
    details: {
      source: 'frontend',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    },
  });
  return response?.result ?? null;
};

export const evaluatePolicyViolation = async (userId: string, content: string) => {
  const response = await invokeSecurityLogger({
    action: 'moderate_content',
    userId,
    content,
  });
  return response?.result?.moderation ?? null;
};
