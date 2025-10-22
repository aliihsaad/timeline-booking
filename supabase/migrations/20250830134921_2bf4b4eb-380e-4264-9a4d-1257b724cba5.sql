-- Enable RLS
alter table if exists public.businesses enable row level security;
alter table if exists public.appointments enable row level security;
alter table if exists public.time_slots enable row level security;

-- Create businesses table
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  address text,
  description text,
  business_hours jsonb,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

-- Create appointments table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_date date not null,
  appointment_time time not null,
  status text check (status in ('confirmed', 'completed', 'cancelled', 'no_show')) default 'confirmed',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_slots table
create table if not exists public.time_slots (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  slot_duration integer default 30,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security Policies
create policy "Users can view their own business" on public.businesses for select using (auth.uid() = user_id);
create policy "Users can insert their own business" on public.businesses for insert with check (auth.uid() = user_id);
create policy "Users can update their own business" on public.businesses for update using (auth.uid() = user_id);

create policy "Business owners can view their appointments" on public.appointments for select using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);
create policy "Anyone can create appointments" on public.appointments for insert with check (true);
create policy "Business owners can update their appointments" on public.appointments for update using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

create policy "Business owners can view their time slots" on public.time_slots for select using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);
create policy "Business owners can manage their time slots" on public.time_slots for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Indexes for performance
create index if not exists idx_businesses_user_id on public.businesses(user_id);
create index if not exists idx_appointments_business_id on public.appointments(business_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_time_slots_business_id on public.time_slots(business_id);