-- HAQ.NEWS starter schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 500),
  summary text not null default '' check (char_length(summary) <= 3000),
  category text not null default 'World',
  region text not null default 'Global',
  source_name text not null,
  source_url text not null unique,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verification_status text not null default 'unverified' check (verification_status in ('developing','unverified','under_review','assessment_published')),
  tags text[] not null default '{}',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists stories_published_at_idx on public.stories (published_at desc nulls last);
create index if not exists stories_category_idx on public.stories (category);
create index if not exists stories_status_idx on public.stories (verification_status);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feed_url text not null unique,
  source_type text not null default 'rss' check (source_type in ('rss','atom','official','api','manual')),
  terms_url text,
  permitted_for_ingestion boolean not null default false,
  active boolean not null default false,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade,
  claim_text text not null,
  status text not null default 'unverified' check (status in ('unverified','researching','under_review','published_assessment','unresolved')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  url text not null,
  title text,
  source_type text not null default 'unknown',
  relationship text not null default 'inconclusive' check (relationship in ('supports','contradicts','contextualizes','inconclusive')),
  excerpt text,
  retrieved_at timestamptz,
  inspected_at timestamptz,
  inspected_by uuid,
  provenance_notes text,
  limitations text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  version integer not null,
  verdict text not null check (verdict in ('supported','false','misleading','partly_supported','missing_context','unresolved')),
  reasoning text not null,
  methodology_version text not null default 'v1',
  status text not null default 'draft' check (status in ('draft','submitted','approved','published','rejected')),
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (claim_id, version)
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- MVP security: public visitors can read non-demo stories. Only server-side service-role code can write.
alter table public.stories enable row level security;
alter table public.sources enable row level security;
alter table public.claims enable row level security;
alter table public.evidence_items enable row level security;
alter table public.assessments enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "Public can read live news metadata" on public.stories;
create policy "Public can read live news metadata" on public.stories for select using (is_demo = false);
-- No anonymous write policies are created. Service-role key must remain server-only.
