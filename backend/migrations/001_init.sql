-- CampusCare — Initial Schema
-- Run this in your PostgreSQL database (e.g., Supabase SQL Editor).

-- 1. Create ENUM types
create type user_role as enum ('community_member', 'worker', 'facility_manager', 'admin');
create type ticket_status as enum ('pending', 'assigned', 'in_progress', 'resolved', 'denied');
create type ticket_priority as enum ('low', 'normal', 'high', 'critical');

-- 2. Users Table
create table public.users (
  user_id       uuid primary key default gen_random_uuid(),
  name          varchar(100) not null,
  email         varchar(150) not null unique,
  password      varchar(255) not null,
  phone_number  varchar(20),
  role          user_role not null,
  is_active     boolean default true,
  created_at    timestamptz not null default now()
);

-- 3. Locations Table
create table public.locations (
  location_id   uuid primary key default gen_random_uuid(),
  building_name varchar(100) not null,
  floor         varchar(20),
  room_number   varchar(50)
);

-- 4. Tickets Table
create table public.tickets (
  ticket_id           uuid primary key default gen_random_uuid(),
  reporter_id         uuid not null references public.users(user_id) on delete cascade,
  assigned_worker_id  uuid references public.users(user_id),
  location_id         uuid not null references public.locations(location_id),
  category            varchar(50) not null,
  description         text not null,
  image_url           varchar(500),
  status              ticket_status default 'pending',
  priority            ticket_priority default 'normal',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  closed_at           timestamptz
);

-- 5. Comments Table
create table public.comments (
  comment_id           uuid primary key default gen_random_uuid(),
  ticket_id            uuid not null references public.tickets(ticket_id) on delete cascade,
  author_id            uuid not null references public.users(user_id) on delete cascade,
  body                 text not null,
  completion_photo_url varchar(500),
  created_at           timestamptz not null default now()
);

-- 6. Indices for Performance
create index idx_tickets_reporter on public.tickets(reporter_id);
create index idx_tickets_worker on public.tickets(assigned_worker_id);
create index idx_tickets_status on public.tickets(status);
create index idx_comments_ticket on public.comments(ticket_id);
