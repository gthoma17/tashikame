create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  story_id text not null,
  hypothesis text not null,
  metric text not null,
  locked_threshold numeric not null,
  status text not null default 'draft'
    constraint experiments_status_check check (status in ('draft', 'running', 'concluded')),
  result text
    constraint experiments_result_check check (result in ('validated', 'invalidated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function prevent_threshold_change()
returns trigger language plpgsql as $$
begin
  if old.status != 'draft' and new.locked_threshold != old.locked_threshold then
    raise exception 'locked_threshold is immutable once experiment is no longer in draft';
  end if;
  return new;
end;
$$;

create trigger experiments_threshold_immutable
  before update on experiments
  for each row execute function prevent_threshold_change();

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger experiments_updated_at
  before update on experiments
  for each row execute function update_updated_at();
