-- 1. Create the admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (so admins can access the dashboard)
-- Allow admins to see their own entry
DROP POLICY IF EXISTS "Admins can view own data" ON public.admins;
CREATE POLICY "Admins can view own data" ON public.admins
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow admins to see all analytics data
DROP POLICY IF EXISTS "Admins can view all blood banks" ON public.blood_banks;
CREATE POLICY "Admins can view all blood banks" ON public.blood_banks
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all requests" ON public.blood_requests;
CREATE POLICY "Admins can view all requests" ON public.blood_requests
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all inventory" ON public.blood_inventory;
CREATE POLICY "Admins can view all inventory" ON public.blood_inventory
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- 4. INSERT ADMIN USER
-- IMPORTANT: First, create the user 'master@vbbs.com' in the Supabase "Authentication" tab manually if not exists.
-- THEN, run this query to give them ADMIN role:

INSERT INTO public.admins (id, email, role)
SELECT id, email, 'ADMIN'
FROM auth.users
WHERE email = 'master@vbbs.com'  -- Change this to your admin email
ON CONFLICT (id) DO NOTHING;

-- Verification
SELECT * FROM public.admins;
