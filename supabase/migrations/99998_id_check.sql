-- 99998_id_check.sql
SELECT 
    'user_3CwM4tADcqKhELg4ZX9r2xIRC4L' as input_id,
    public.translate_clerk_id_to_uuid('user_3CwM4tADcqKhELg4ZX9r2xIRC4L') as generated_uuid;

SELECT id, clerk_id, email FROM public.profiles WHERE id = '6099b2d8-12af-426f-853a-159cb6494b56';
SELECT id, clerk_id, email FROM public.profiles WHERE email ILIKE '%ceo%';
