-- 1. Add is_active column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Add is_active column to blood_banks table
ALTER TABLE public.blood_banks 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Update RLS Policies for Admin Management

-- USERS TABLE POLICIES --
-- Admin can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Admin can update all users
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Admin can delete all users
DROP POLICY IF EXISTS "Admins can delete all users" ON public.users;
CREATE POLICY "Admins can delete all users" ON public.users
    FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));


-- BLOOD BANKS TABLE POLICIES --
-- Admin can view all blood banks
DROP POLICY IF EXISTS "Admins can view all blood banks" ON public.blood_banks;
CREATE POLICY "Admins can view all blood banks" ON public.blood_banks
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Admin can update all blood banks
DROP POLICY IF EXISTS "Admins can update all blood banks" ON public.blood_banks;
CREATE POLICY "Admins can update all blood banks" ON public.blood_banks
    FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Admin can delete all blood banks
DROP POLICY IF EXISTS "Admins can delete all blood banks" ON public.blood_banks;
CREATE POLICY "Admins can delete all blood banks" ON public.blood_banks
    FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
