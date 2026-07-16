# Tashikame — Environment Setup

*Last updated: 2026-07-15*

> The **single source of truth for this project's environment-setup progress and infrastructure values.** On the `start setup` trigger, Claude reads this file and briefs "where we are and what's next." (Mirror of D&F's `product-overview.md` — status lives on the deliverable document.)
>
> ⚠️ **Onboarding ≠ Phase 2.** Installing the Claude desktop app, accounts, tools, and the skill is **once per person·machine** (onboarding) — not recorded here. This document only covers the resources created **fresh for each project** (TB project, repo, site, bot invite).

---

## Setup progress

On `start setup`, Claude reads the table below to brief the current position, and updates it as each step finishes. **One step at a time** — don't move on until the previous is ✅.

| Step | Status | Value / note |
|------|--------|--------------|
| 1. Tracker Boot project | ✅ | ID: 100000282 |
| 2. GitHub repo | ✅ | gthoma17/tashikame |
| 3. Bot access | ✅ | strike-trio-devbot invited + auto-accepted |
| 4. Deploy hosting | ✅ | Netlify — tashi-kame |
| 5. Local wiring | ✅ | Hoge / Piyo — all command files + promote.yml created |
| 6. Verify (first ready) | ✅ | Dev session opened successfully |

Status marks: ⬜ not done · 🔄 in progress · ✅ done

---

## Team gate (bot path)

- [x] **Are you on the Bekind Labs team? → Yes**
  - Using internal shared bot `strike-trio-devbot`. Token lives in global `~/.strike-trio/.env`.

---

## Collected infrastructure values

*(Claude fills these in as each step is confirmed.)*

- **Tracker Boot Project ID**: `100000282`
- **GitHub repo**: `gthoma17/tashikame`
- **Deploy hosting**: Netlify — `tashi-kame`
- **Production URL**: `https://tashi-kame.netlify.app`
- **Acceptance URL**: `https://main--tashi-kame.netlify.app`
- **Preview URL pattern**: `https://dev-{name}--tashi-kame.netlify.app`

---

## Per-step notes

**Step 4 — Netlify branch deploys**: After linking the repo, the default "Deploy only the production branch" setting blocks the acceptance mirror (`main--`) and dev previews (`dev-*--`). In **Site configuration → Build & deploy → Branches and deploy contexts**, set Branch deploys to "All branches" (or explicitly include `main` and `dev-hoge`, `dev-piyo`). Without this, merges to main don't auto-deploy. Caught on first merge of #200029020 — acceptance URL returned 404.

---

*This file is actively updated only during setup. Afterward it remains as the reference for infrastructure values.*
