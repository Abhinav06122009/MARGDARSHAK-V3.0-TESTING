-- CLEANUP STALE TRIGGERS (Prevents "ip_address" missing column errors from old versions)
DROP TRIGGER IF EXISTS tr_forensic_log_profiles ON public.profiles;
DROP TRIGGER IF EXISTS trigger_auto_ban ON public.security_logs;

-- FIX: Ensure security_logs has the required columns for forensic logging
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Remove any existing profile with this email to avoid unique constraint violations
DELETE FROM public.profiles WHERE email = 'abhinavjha393@gmail.com' AND id != 'user_3CyueymOUFein248UifL5xSPBOU';

-- Update the profile to admin
INSERT INTO public.profiles (id, email, full_name, user_type, subscription_tier)
VALUES ('user_3CyueymOUFein248UifL5xSPBOU', 'abhinavjha393@gmail.com', 'Admin', 'admin', 'premium_elite')
ON CONFLICT (id) DO UPDATE 
SET user_type = 'admin', subscription_tier = 'premium_elite';

-- Verify the admin role function is working correctly
-- This is just a sanity check
SELECT user_type FROM public.profiles WHERE id = 'user_3CyueymOUFein248UifL5xSPBOU';

-- SEED GLOBAL SETTINGS
INSERT INTO public.security_settings (id, rate_limit, ai_sensitivity)
VALUES ('global', 120, 50)
ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL METRICS
INSERT INTO public.daily_metrics (date, threats_count, logins_count)
VALUES (CURRENT_DATE, 0, 0)
ON CONFLICT (date) DO NOTHING;
