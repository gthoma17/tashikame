alter table experiments enable row level security;

create policy experiments_anon_all on experiments
  for all to anon
  using (true) with check (true);

create policy experiments_authenticated_all on experiments
  for all to authenticated
  using (true) with check (true);
