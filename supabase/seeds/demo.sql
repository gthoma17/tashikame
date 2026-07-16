-- Demo experiments seeded against live Pantry Pilot label IDs (project 100000277).
-- One-shot: apply manually with `supabase db execute --file supabase/seeds/demo.sql`
-- (do NOT wire into a deploy hook). Idempotent via fixed UUIDs + ON CONFLICT DO NOTHING.
-- Verdict is derived from measured_value vs locked_threshold at read time
-- (see src/lib/experiments.ts::computeVerdict) — no `result` column needed.

insert into experiments (id, story_id, hypothesis, locked_threshold, measured_value, status, label_id)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'demo-inventory',
    'Inventory reminders raise 見切り品 usage',
    50, 22, 'concluded', '100002159'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'demo-recipe',
    'Recipe suggestions from pantry increase weeknight cooking',
    30, 61, 'concluded', '100002160'
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'demo-expiry',
    'Expiry alerts reduce food waste',
    25, 25, 'concluded', '100002161'
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    'demo-running',
    'Meal-plan nudges lift Sunday prep',
    40, null, 'running', '100002159'
  )
on conflict (id) do nothing;
