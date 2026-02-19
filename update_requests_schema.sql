-- 1. Update blood_requests table structure
-- Add new columns if they don't exist
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS booking_for TEXT DEFAULT 'SELF';

-- 2. Ensure RLS Policies are correct and cover the new requirements

-- Enable RLS (idempotent)
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can insert requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Blood banks can view assigned requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Blood banks can update assigned requests" ON public.blood_requests;

-- INSERT: Only authenticated USERs can insert requests 
-- Condition: auth.uid() must match the user_id in the row being inserted
CREATE POLICY "Users can insert requests"
  ON public.blood_requests FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() = user_id );

-- SELECT: 
-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.blood_requests FOR SELECT
  TO authenticated
  USING ( auth.uid() = user_id );

-- Blood Banks can view requests assigned to them
CREATE POLICY "Blood banks can view assigned requests"
  ON public.blood_requests FOR SELECT
  TO authenticated
  USING ( auth.uid() = blood_bank_id );

-- UPDATE: 
-- Only Blood Banks can update status (and potentially other fields if needed, but primarily status)
-- Condition: auth.uid() must match the blood_bank_id
CREATE POLICY "Blood banks can update assigned requests"
  ON public.blood_requests FOR UPDATE
  TO authenticated
  USING ( auth.uid() = blood_bank_id );

-- 3. Ensure blood_inventory policies allow updates by the owning blood bank
DROP POLICY IF EXISTS "Blood banks can update their own inventory" ON public.blood_inventory;

CREATE POLICY "Blood banks can update their own inventory"
  ON public.blood_inventory FOR UPDATE
  TO authenticated
  USING ( auth.uid() = blood_bank_id );

-- 4. Enable Realtime for immediate UI updates
-- (Safe to run multiple times, though usually done once)
-- DO NOT RUN 'alter publication...' blindly in scripts if it might fail on repeats without check, 
-- but in Supabase SQL editor it's usually fine or throws benign error.
-- We'll comment it out here or assume it's already done, but to be safe:
-- alter publication supabase_realtime add table public.blood_requests;
