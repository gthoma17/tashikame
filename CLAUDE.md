# Tashikame

## Project
A companion to Tracker Boot for the measure-and-learn half of the build-measure-learn loop: it suggests lean experiments to validate the hypotheses behind user stories, tracks each experiment's results, and enacts the consequences.

**Stack**: TanStack + Supabase + Netlify
**Tracker Boot**: (confirmed during setup)
**GitHub**: (confirmed during setup)
**Deploy**: (confirmed during setup) — (confirmed during setup)

## Me
Greg — PM
**Company / Team**: Bekind Labs

## Dev Team

(confirmed during setup)

## ⚠️ Session Start Triggers — Always Run First

When any of the keywords below are received, use the Read tool to read the listed files **before anything else**. Do not start any work until the files have been read.

| Keyword | Files to Read |
|---------|--------------|
| `PM start` | `documents/aabt-workflow.md` + `documents/product/product-overview.md` + `documents/environment-setup.md` (its presence means environment setup is done) (+ after environment setup: `documents/tracks/` track files + `documents/delivery-playbook.md` + `documents/iteration-plan.md`) |
| `dev-* start` (added after setup) | — |
| `start setup` | Read `documents/environment-setup.md` (create it if missing), brief the progress, then continue Strike Trio skill Phase 2 **one step at a time**. (Infrastructure is tracked in this checklist, NOT as Tracker Boot Chores.) |
| `/story` or `write story` | **Re-read all of §4** in `documents/aabt-workflow.md`, then apply the self-check checklist to write and register the story. Always go through this trigger before writing a story or putting it in the tracker (don't rely on memory). |
| `create a persona` / `persona workshop` | Run the persona builder skill. Check `documents/product/product-overview.md` and the `documents/product/personas/` folder, then start the workshop. |

> **`dev-* start` is NOT a keyword a human types.** It's a **Dev-session-internal trigger** that `ready-*.command` injects automatically when launching a Dev session. The Dev rows are added to this table during environment setup (Phase 2), once Dev names exist.

> **On `PM start`, judge whether environment setup is done by `documents/environment-setup.md`.** If the file exists, setup is (essentially) done — read its progress and brief in delivery mode, and if a step is still ⬜ (e.g. 6. Verify), guide that one first. **Do NOT misjudge "before setup" when the file is present.** Only when the file is entirely absent are you before setup (D&F stage), so proceed with D&F using `aabt-workflow.md` + `product-overview.md`.

> **When registering a story in the tracker, always go through `/story` — no exceptions.** A missing As / I want / so that is almost always the result of skipping this procedure.

> **D&F briefing on PM start**: After reading product-overview.md, check each D&F section for content, update the progress table, and deliver a briefing in this format:
> ```
> 📋 D&F Status
> ✅ Vision — "..."
> ✅ Personas — [name list + one-line Needs & Wants summary per persona]
> ⬜ Problem Priority — starting here.
> ```
> When all stages are complete (= before setup): "D&F complete. Now say «start setup» and I'll set up the development environment (repo, tracker, commands)."
>
> **Persona stage**: If the Personas row shows ⬜ in the D&F status, prompt: "You can proceed with the persona builder skill."

> **Briefing on `start setup`**: Read the progress table in `documents/environment-setup.md`, brief it in the format below, and continue **from the next ⬜ step**, one at a time. As each step finishes, update the table to ✅ and record the confirmed infra value. (Mirror of the D&F briefing.)
> ```
> 🔧 Setup status
> ✅ 1. Tracker Boot project — 100000412
> ✅ 2. GitHub repo — owner/repo
> ⬜ 3. Bot access — starting here.
> ```
> **Onboarding ≠ Phase 2**: installing the app, accounts, tools, and the skill (onboarding) is once per person·machine and is NOT handled here. This stage creates **this project's** resources (TB project, repo, site, bot invite, track/command files). If accounts/tools aren't ready, tell them: "Go through the onboarding prompt (`docs/strike-trio-onboarding-prompt.md`) first."

## Delivery, Deployment & Dev Track Rules

> (activated after environment setup)
>
> The delivery cycle, PM session response formats (preview / accept checks), Dev track report gates, track file rules, and deployment rules are filled in during Phase 2, once Dev names and infrastructure values exist. See `documents/delivery-playbook.md` for the delivery flow.

## Preferences
- Default language: English
- Responses: concise, confident, no unnecessary preamble
- Format: prose-first, bullets only when truly necessary
- UI language: English only
- Address Greg by name.
