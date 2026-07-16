-- PM feedback: "assigned to" isn't part of how we think about experiments;
-- "duration" is redundant with "deadline". Keep only deadline on the header.
alter table experiments drop column if exists assigned_to;
alter table experiments drop column if exists duration;
