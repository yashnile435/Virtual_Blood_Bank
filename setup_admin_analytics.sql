-- Ensure admins table exists
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow admins to see themselves
DROP POLICY IF EXISTS "Admins can view own data" ON public.admins;
CREATE POLICY "Admins can view own data" ON public.admins
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow authenticated users to insert themselves into admins table (needed for initial setup via client script)
-- In a real production app, this should be stricter or done via Edge Function / Service Role
DROP POLICY IF EXISTS "Users can insert themselves into admins" ON public.admins;
CREATE POLICY "Users can insert themselves into admins" ON public.admins
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Allow admins to view all blood_requests for analytics
DROP POLICY IF EXISTS "Admins can view all requests" ON public.blood_requests;
CREATE POLICY "Admins can view all requests" ON public.blood_requests
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Allow admins to view all blood_banks for analytics
DROP POLICY IF EXISTS "Admins can view all blood banks" ON public.blood_banks;
CREATE POLICY "Admins can view all blood banks" ON public.blood_banks
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Allow admins to view all blood_inventory for analytics
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.blood_inventory;
CREATE POLICY "Admins can view all inventory" ON public.blood_inventory
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
