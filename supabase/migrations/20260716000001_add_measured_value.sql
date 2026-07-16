alter table experiments
  add column if not exists measured_value numeric;
