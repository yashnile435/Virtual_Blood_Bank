-- 1. Ensure blood_requests table exists with correct schema
create table if not exists public.blood_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  blood_bank_id uuid references public.blood_banks(id) not null,
  blood_group text not null,
  patient_name text not null,
  hospital_name text,
  hospital_address text,
  required_within_30_days boolean default false,
  status text default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.blood_requests enable row level security;

-- 3. Policies for blood_requests

-- DROP existing policies to ensure clean slate (optional, but good for idempotency if running multiple times)
drop policy if exists "Users can insert requests" on public.blood_requests;
drop policy if exists "Users can view own requests" on public.blood_requests;
drop policy if exists "Blood banks can view assigned requests" on public.blood_requests;
drop policy if exists "Blood banks can update assigned requests" on public.blood_requests;

-- INSERT: only authenticated USER
create policy "Users can insert requests"
  on public.blood_requests for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- SELECT: USER can see only their own requests
create policy "Users can view own requests"
  on public.blood_requests for select
  to authenticated
  using ( auth.uid() = user_id );

-- SELECT: BLOOD_BANK can see only their bank requests
create policy "Blood banks can view assigned requests"
  on public.blood_requests for select
  to authenticated
  using ( auth.uid() = blood_bank_id );

-- UPDATE: only BLOOD_BANK can update status where blood_bank_id = auth.uid()
create policy "Blood banks can update assigned requests"
  on public.blood_requests for update
  to authenticated
  using ( auth.uid() = blood_bank_id );

-- 4. Policies for blood_inventory

-- Ensure BLOOD_BANK can update their own inventory
-- (Dropping previous overlapping policies if any to avoid conflicts or just ensure this one exists)
drop policy if exists "Blood banks can update their own inventory" on public.blood_inventory;

create policy "Blood banks can update their own inventory"
  on public.blood_inventory for update
  to authenticated
  using ( auth.uid() = blood_bank_id );

-- 5. Realtime
-- Enable realtime for blood_requests so dashboards update instantly
alter publication supabase_realtime add table public.blood_requests;
