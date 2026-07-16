-- experiments are scoped to a Tracker Boot label: when the experiment
-- concludes, the verdict label is written back to every TB story
-- carrying that scope label.
alter table experiments
  add column if not exists label_id text;
