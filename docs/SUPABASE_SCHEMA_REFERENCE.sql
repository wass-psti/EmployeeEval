-- Employee Evaluation v0.3.0 — reference schema only.
-- IT partner owns production migrations, Auth mapping, RLS, indexes, triggers, and retention policy.

create table if not exists public.employee_evaluation_employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null,
  name text not null,
  email text not null,
  job_title text,
  department text,
  supervisor_id uuid references public.employee_evaluation_employees(id),
  role text not null check (role in ('admin','supervisor','employee')),
  active boolean not null default true,
  revision integer not null default 1 check (revision > 0),
  schema_version integer not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employee_evaluation_employee_code_uq
  on public.employee_evaluation_employees (lower(employee_code));
create unique index if not exists employee_evaluation_employee_email_uq
  on public.employee_evaluation_employees (lower(email));

create table if not exists public.employee_evaluation_evaluations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_evaluation_employees(id),
  evaluator_id uuid references public.employee_evaluation_employees(id),
  period text not null,
  ratings jsonb not null default '{}'::jsonb,
  comments text,
  strengths text,
  improvements text,
  recommendation text,
  overall_score numeric(4,2) not null default 0,
  status text not null check (status in ('Draft','Submitted','Reviewed','Finalized','Returned')),
  review_comment text,
  revision integer not null default 1 check (revision > 0),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  finalized_at timestamptz,
  returned_at timestamptz,
  reviewed_by uuid references public.employee_evaluation_employees(id),
  finalized_by uuid references public.employee_evaluation_employees(id),
  returned_by uuid references public.employee_evaluation_employees(id),
  schema_version integer not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, period)
);

create table if not exists public.employee_evaluation_settings (
  id text primary key default 'global' check (id = 'global'),
  active_period text not null,
  evaluation_window text not null check (evaluation_window in ('Open','Grace Period','Closed')),
  window_open_date timestamptz,
  window_close_date timestamptz,
  grace_period_days integer not null default 3 check (grace_period_days >= 0),
  revision integer not null default 1 check (revision > 0),
  schema_version integer not null default 2,
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_evaluation_activity (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  actor_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  schema_version integer not null default 2,
  created_at timestamptz not null default now()
);

create index if not exists employee_evaluation_eval_employee_idx on public.employee_evaluation_evaluations(employee_id);
create index if not exists employee_evaluation_eval_evaluator_idx on public.employee_evaluation_evaluations(evaluator_id);
create index if not exists employee_evaluation_eval_status_idx on public.employee_evaluation_evaluations(status);
create index if not exists employee_evaluation_eval_period_idx on public.employee_evaluation_evaluations(period);
create index if not exists employee_evaluation_activity_entity_idx on public.employee_evaluation_activity(entity_type, entity_id);
create index if not exists employee_evaluation_activity_created_idx on public.employee_evaluation_activity(created_at desc);

-- NOTE:
-- evaluator_id / actor_id treatment must be aligned with the production Auth model.
-- The standalone local-system actor is development scaffolding and should not be migrated as a real user.
-- RLS policies must enforce supervisor/direct-report rules and finalized-only employee self-view.
