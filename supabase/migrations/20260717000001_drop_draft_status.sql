-- Skip the `draft` state entirely — new experiments go straight to `running`.
-- Hackathon-scale: no data preservation. Any lingering `draft` rows are dropped.

delete from experiments where status = 'draft';

alter table experiments alter column status set default 'running';

alter table experiments drop constraint experiments_status_check;
alter table experiments
  add constraint experiments_status_check check (status in ('running', 'concluded'));

-- The threshold-immutability guard used to allow edits while status = 'draft'.
-- With `draft` gone, the threshold is immutable from insert onward.
create or replace function prevent_threshold_change()
returns trigger language plpgsql as $$
begin
  if new.locked_threshold != old.locked_threshold then
    raise exception 'locked_threshold is immutable';
  end if;
  return new;
end;
$$;
