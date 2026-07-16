-- Add experiment_type and method columns for the LLM-drafted experiment fields.
-- Nullable — existing rows have no draft; new rows are populated from the
-- suggest-experiment endpoint (editable by the user before insert).
alter table experiments
  add column if not exists experiment_type text,
  add column if not exists method text;
