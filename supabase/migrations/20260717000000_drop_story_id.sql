-- Collapse the scope model to label_id only. UI-created rows that were scoped
-- to story_id have no label_id and can never write back — hackathon-scale, so
-- we drop them rather than backfill.
delete from experiments where label_id is null;

alter table experiments drop column story_id;
