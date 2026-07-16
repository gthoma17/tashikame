-- Per-experiment overrides for the write-back label vocabulary.
-- Null = use the default (killed / kept / inconclusive).

alter table experiments
  add column if not exists verdict_label_kill text,
  add column if not exists verdict_label_keep text,
  add column if not exists verdict_label_inconclusive text;
