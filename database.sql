-- Create blood_banks table
create table public.blood_banks (
  id uuid references auth.users not null primary key,
  name text not null,
  email text not null,
  city text not null,
  address text,
  phone text not null,
  role text default 'BLOOD_BANK'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.blood_banks enable row level security;

-- Policies for blood_banks
create policy "Public blood banks are viewable by everyone"
  on public.blood_banks for select
  using ( true );

create policy "Users can update own blood bank profile"
  on public.blood_banks for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.blood_banks for insert
  with check ( auth.uid() = id );

-- Create blood_inventory table
create table public.blood_inventory (
  id uuid default gen_random_uuid() primary key,
  blood_bank_id uuid references public.blood_banks(id) not null,
  blood_group text not null,
  quantity integer default 0 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint quantity_non_negative check (quantity >= 0)
);

-- Enable RLS for inventory
alter table public.blood_inventory enable row level security;

-- Policies for blood_inventory
create policy "Inventory viewable by everyone"
  on public.blood_inventory for select
  using ( true );

create policy "Blood banks can manage their own inventory"
  on public.blood_inventory for all
  using ( auth.uid() = blood_bank_id );
