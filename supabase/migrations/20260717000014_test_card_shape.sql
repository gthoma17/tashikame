-- Align the experiments table with the Strategyzer Test Card format:
--   Header: test_name, assigned_to, deadline, duration
--   Step 1 (Hypothesis, "We believe that…") — already exists as `hypothesis`; add `critical` rating
--   Step 2 (Test, "To verify that, we will…") — rename `method` → `test`; add `test_cost`, `data_reliability`
--   Step 3 (Metric, "And measure…") — already exists as `metric`; add `time_required`
--   Step 4 (Criteria, "We are right if…") — add `criteria`; `locked_threshold` stays as the numeric companion
--
-- `experiment_type` was a stopgap that pre-dated adopting the Test Card and does not appear on it.
-- Hackathon-scale: drop it rather than migrate.

alter table experiments drop column if exists experiment_type;

alter table experiments rename column method to test;

alter table experiments
  add column if not exists test_name text,
  add column if not exists assigned_to text,
  add column if not exists deadline date,
  add column if not exists duration text,
  add column if not exists criteria text,
  add column if not exists critical smallint,
  add column if not exists test_cost smallint,
  add column if not exists data_reliability smallint,
  add column if not exists time_required smallint;

alter table experiments
  add constraint experiments_critical_range check (critical is null or critical between 1 and 3),
  add constraint experiments_test_cost_range check (test_cost is null or test_cost between 1 and 3),
  add constraint experiments_data_reliability_range check (data_reliability is null or data_reliability between 1 and 3),
  add constraint experiments_time_required_range check (time_required is null or time_required between 1 and 3);
