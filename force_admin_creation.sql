-- ENABLE pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. INSERT/UPDATE USER in auth.users (Bypassing email confirmation)
-- This creates a confirmed user 'superadmin@vbbs.com' with password 'Password@123'
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'superadmin@vbbs.com',
    crypt('Password@123', gen_salt('bf')),
    now(), -- Auto-confirm email
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (email) DO UPDATE SET 
    email_confirmed_at = now(),
    encrypted_password = crypt('Password@123', gen_salt('bf')),
    updated_at = now();

-- 2. ADD TO ADMINS TABLE
INSERT INTO public.admins (id, email, role)
SELECT id, email, 'ADMIN'
FROM auth.users
WHERE email = 'superadmin@vbbs.com'
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFY
SELECT * FROM public.admins WHERE email = 'superadmin@vbbs.com';
