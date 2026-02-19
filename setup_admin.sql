-- Create admins table
create table if not exists public.admins (
  id uuid references auth.users not null primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admins enable row level security;

-- Policies for admins
-- Allow public read? No, maybe only admins.
-- For login check, we need to read it. 
-- But user isn't an admin YET when logging in.
-- So we need to allow the user to read their OWN row to check if they are an admin.

drop policy if exists "Admins can view their own record" on public.admins;
create policy "Admins can view their own record"
  on public.admins for select
  using ( auth.uid() = id );

-- Allow insertion?
-- We need to bootstrap. Let's allow authenticated users to insert THEMSELVES for now
-- (In a real app, you'd disable this after creating the first admin)
drop policy if exists "Users can claim admin" on public.admins;
create policy "Users can claim admin"
  on public.admins for insert
  with check ( auth.uid() = id );
