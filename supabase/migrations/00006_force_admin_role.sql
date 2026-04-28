-- ENSURE ADMIN ACCESS FOR THE PRIMARY USER
-- This migration forces the admin role for the specific user ID provided in the logs.

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
