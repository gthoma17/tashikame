# Tashikame — Decision Log (Iteration Plan)

> ⚠️ **This document does not track state.** The next story, progress, points, and ownership all live in **Tracker Boot, the source of truth**. Writing state here duplicates the tracker and drifts at every Accept — the trap a document named "iteration plan" most often falls into.
>
> **What this document holds is the "why."** The rationale and context behind decisions that the tracker doesn't keep. It's here so a new session can quickly restore "why this order / what was decided or rejected." "How far along are we" is always read from the tracker (the track file's completed list can be stale too).

**Format**: Stack "key decision" blocks in reverse chronological order. Each block = what it started from → what was probed → what was decided/rejected → rationale → **Next candidates**.

> **The latest entry is the handoff.** Leave a **"Next candidates"** pointer at the end of each block (1–3 candidate story IDs + a one-line reason each). On `PM start`, a new PM session pins the next story by looking only at **this latest entry's "Next candidates" + the current iteration** — it doesn't dump the backlog with `tb_search_stories`. Leave the pointer empty and a new session wanders in a huge backlog (if this slot is empty, distillation doesn't work).

---

## Key Decision (2026-07-15) — IPM complete, backlog set, ready to start dev

- **Context**: D&F complete + environment setup done. IPM ran on 9 stories (1 Chore + 8 Features, 13 points). Stories registered in Tracker Boot, estimated, labeled, and moved to the backlog in priority order.
- **Decision**: Start with Chore #200029020 on a single track (hoge), then fork: hoge owns the create side (#200029021–#200029025), piyo owns the conclude side (#200029026–#200029028). Piyo works against a seeded fixture until hoge's `experiments` row lands.
- **Rejected**: Interleaving create/conclude stories in the backlog — rejected because piyo can't meaningfully start until the Chore and hoge's schema exist. Sequential within-track ordering is cleaner.
- **Rationale**: The two-track split mirrors the UI split (screens 1–2 = create, screen 3 = conclude) with near-zero file overlap. The Bedrock connector pattern is established in #200029023 (hoge) before #200029024 picks it up — no risk of two Devs building divergent LLM integrations. The threshold override behavior (#200029025) is a logged override (not a hard refusal) — input mistakes can happen. #200029028 (write verdict label, 3pts) is the only e2e story and the seeded critical path; it spills into the next iteration at TB's default velocity of 10.
- **Next candidates**: #200029020 (Chore — Project scaffold + data spine) is the immediate next story for hoge. Once Accepted, assign #200029021 to hoge and #200029026 to piyo simultaneously.
