-- Threshold is locked on insert, but overrides are permitted with a loud,
-- permanent log entry. The trigger records old + new value + timestamp on
-- every change, then allows the change through.

create table if not exists experiment_threshold_overrides (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references experiments(id) on delete cascade,
  old_value numeric not null,
  new_value numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists experiment_threshold_overrides_experiment_id_idx
  on experiment_threshold_overrides (experiment_id);

alter table experiment_threshold_overrides enable row level security;

create policy experiment_threshold_overrides_anon_all on experiment_threshold_overrides
  for all to anon
  using (true) with check (true);

create policy experiment_threshold_overrides_authenticated_all on experiment_threshold_overrides
  for all to authenticated
  using (true) with check (true);

-- Replace the reject-on-change guard with a log-and-allow trigger.
create or replace function prevent_threshold_change()
returns trigger language plpgsql as $$
begin
  if new.locked_threshold != old.locked_threshold then
    insert into experiment_threshold_overrides (experiment_id, old_value, new_value)
    values (old.id, old.locked_threshold, new.locked_threshold);
  end if;
  return new;
end;
$$;
