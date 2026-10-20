-- CallFlow schema for Supabase (PostgreSQL)
-- Run in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  prospect_name text not null default '',
  company_name text not null default '',
  prospect_role text not null default '',
  call_type text not null default 'First call',
  status text not null default 'active' check (status in ('active','completed')),
  current_stage integer not null default 1 check (current_stage between 1 and 8),
  outcome text,
  next_step text not null default '',
  next_step_at timestamptz,
  prospect_words text not null default '',
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.call_stage_results (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  stage_number integer not null check (stage_number between 1 and 8),
  stage_name text not null,
  event text not null,
  prospect_words text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists calls_created_at_idx on public.calls(created_at desc);
create index if not exists calls_status_idx on public.calls(status);
create index if not exists call_stage_results_call_id_idx on public.call_stage_results(call_id, stage_number);

-- This starter uses the Supabase service-role key on the backend only.
-- Do not expose that key in Vite/frontend variables. For this server-mediated prototype,
-- keep direct client access disabled and use the Express API for database operations.
alter table public.calls enable row level security;
alter table public.call_stage_results enable row level security;
-- No anon/authenticated policies are created intentionally.
