-- DoctorBondhu database. Run in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again after changes: it only adds what is missing and refreshes the rules.
--
-- Rule of thumb: anyone can READ the public clinic info; only the doctor (an email listed in
-- the admins table below) can CHANGE it or see patients' bookings and prescriptions.

-- ─── Tables ────────────────────────────────────────────────────────────────

-- Doctor info, fee, weekly schedule and contact numbers (a single row, id = 1)
create table if not exists clinic (
  id int primary key default 1 check (id = 1),
  data jsonb not null
);

-- Dates the doctor marked closed on the calendar
create table if not exists closed_days (
  date date primary key
);

-- Bookings. Patients can add one; only the doctor can list them (they hold names and phone numbers).
create table if not exists appointments (
  id text primary key,
  serial int not null check (serial between 1 and 50),
  date date not null,
  start timestamptz not null,
  end_time timestamptz not null,
  name text not null check (length(trim(name)) between 1 and 100),
  age int not null check (age between 1 and 119),
  phone text not null check (phone ~ '^01[3-9][0-9]{8}$'),   -- same rule as the booking form
  type text,
  created_at timestamptz not null default now(),
  unique (date, serial)               -- two patients can't book the same slot
);

-- Prescriptions written by the doctor for a booking
create table if not exists prescriptions (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  patient_name text not null,
  patient_age int not null,
  patient_phone text not null,
  medicines jsonb not null default '[]',
  tests jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prescriptions_appointment_idx on prescriptions (appointment_id);

-- Patients' phones that want the "doctor closed" notification
create table if not exists push_tokens (
  token text primary key,
  created_at timestamptz not null default now()
);

-- Who counts as the doctor. Add the login email(s) you create in Authentication → Users.
create table if not exists admins (
  email text primary key
);
insert into admins (email) values ('admin@gmail.com') on conflict do nothing;

-- ─── Who is the doctor? ────────────────────────────────────────────────────

-- True only for a logged-in user whose email is in the admins table.
-- (Being logged in alone is not enough, so a stranger who signs up can't see patients.)
create or replace function is_doctor()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ─── Security rules (row level security) ───────────────────────────────────

alter table clinic        enable row level security;
alter table closed_days   enable row level security;
alter table appointments  enable row level security;
alter table prescriptions enable row level security;
alter table push_tokens   enable row level security;
alter table admins        enable row level security;   -- no rules = nobody can read or change it from the app

-- Public info: everyone reads, doctor writes
drop policy if exists "clinic read"  on clinic;
drop policy if exists "clinic write" on clinic;
create policy "clinic read"  on clinic for select using (true);
create policy "clinic write" on clinic for all to authenticated using (is_doctor()) with check (is_doctor());

drop policy if exists "closed read"  on closed_days;
drop policy if exists "closed write" on closed_days;
create policy "closed read"  on closed_days for select using (true);
create policy "closed write" on closed_days for all to authenticated using (is_doctor()) with check (is_doctor());

-- Bookings: anyone can book today or later; only the doctor can read/change them
drop policy if exists "appt insert" on appointments;
drop policy if exists "appt doctor" on appointments;
create policy "appt insert" on appointments for insert with check (date >= current_date - 1);
create policy "appt doctor" on appointments for all to authenticated using (is_doctor()) with check (is_doctor());

-- Prescriptions: only the doctor (patients use my_prescriptions() below)
drop policy if exists "rx doctor" on prescriptions;
create policy "rx doctor" on prescriptions for all to authenticated using (is_doctor()) with check (is_doctor());

-- Push tokens: phones can register; only the server function reads them
drop policy if exists "token insert" on push_tokens;
create policy "token insert" on push_tokens for insert with check (token like 'ExponentPushToken[%]');

-- ─── Lookups patients are allowed to make ──────────────────────────────────

-- Which slots are already taken (no patient names leave the server)
create or replace function taken_slots(from_date date)
returns table (date date, serial int)
language sql stable security definer set search_path = public as $$
  select a.date, a.serial from appointments a where a.date >= from_date;
$$;

-- A patient's prescriptions, looked up by their own booking ids (kept on their phone)
create or replace function my_prescriptions(appointment_ids text[])
returns setof prescriptions
language sql stable security definer set search_path = public as $$
  select * from prescriptions where appointment_id = any(appointment_ids) order by created_at desc;
$$;

revoke execute on function is_doctor() from public;
grant execute on function is_doctor() to authenticated;
grant execute on function taken_slots(date) to anon, authenticated;
grant execute on function my_prescriptions(text[]) to anon, authenticated;

-- ─── Live updates ──────────────────────────────────────────────────────────

-- Open apps refresh instantly when the doctor changes info or closes a day
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'clinic') then
    alter publication supabase_realtime add table clinic;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'closed_days') then
    alter publication supabase_realtime add table closed_days;
  end if;
end $$;
