# Tashikame — Decision Log (Iteration Plan)

> ⚠️ **This document does not track state.** The next story, progress, points, and ownership all live in **Tracker Boot, the source of truth**. Writing state here duplicates the tracker and drifts at every Accept — the trap a document named "iteration plan" most often falls into.
>
> **What this document holds is the "why."** The rationale and context behind decisions that the tracker doesn't keep. It's here so a new session can quickly restore "why this order / what was decided or rejected." "How far along are we" is always read from the tracker (the track file's completed list can be stale too).

**Format**: Stack "key decision" blocks in reverse chronological order. Each block = what it started from → what was probed → what was decided/rejected → rationale → **Next candidates**.

> **The latest entry is the handoff.** Leave a **"Next candidates"** pointer at the end of each block (1–3 candidate story IDs + a one-line reason each). On `PM start`, a new PM session pins the next story by looking only at **this latest entry's "Next candidates" + the current iteration** — it doesn't dump the backlog with `tb_search_stories`. Leave the pointer empty and a new session wanders in a huge backlog (if this slot is empty, distillation doesn't work).

---

## Key Decision ([date]) — [title]

*(The block below is a format example. Replace it with a real decision.)*

- **Context**: [the event or problem that prompted this decision]
- **Decision**: [what was decided]
- **Rejected**: [what was considered but ruled out + why]
- **Rationale**: [why — context that won't live in the tracker story]
- **Next candidates**: [1–3 candidate story IDs that come next after this decision + a one-line reason each — the handoff pointer a new session uses to confirm status in the tracker]
