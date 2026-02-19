-- 1. FIX: Add missing 'role' column to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';

-- 2. Verify and Insert Admin
-- This pulls the user with email 'master@vbbs.com' from auth.users 
-- and inserts them into public.admins if they aren't already there.

INSERT INTO public.admins (id, email, role)
SELECT id, email, 'ADMIN'
FROM auth.users
WHERE email = 'master@vbbs.com' -- Ensure this matches your created user
ON CONFLICT (id) DO NOTHING;

-- 3. Confirm Success
SELECT * FROM public.admins;
