-- Create users table (for patients/general users)
create table public.users (
  id uuid references auth.users not null primary key,
  name text not null,
  email text not null,
  city text not null,
  phone text not null,
  role text default 'USER'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Create blood_requests table
create table public.blood_requests (
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

-- Enable RLS
alter table public.blood_requests enable row level security;

-- Policies for blood_requests
create policy "Users can view their own requests"
  on public.blood_requests for select
  using ( auth.uid() = user_id );

create policy "Users can create requests"
  on public.blood_requests for insert
  with check ( auth.uid() = user_id );

create policy "Blood banks can view requests assigned to them"
  on public.blood_requests for select
  using ( auth.uid() = blood_bank_id );

-- Allow users to update inventory (decrement quantity) - simplified for demo
-- In production, this should be a stored procedure or edge function to prevent abuse
create policy "Authenticated users can update inventory"
  on public.blood_inventory for update
  to authenticated
  using ( true );
