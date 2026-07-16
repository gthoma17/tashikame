# Tashikame

## Project
A companion to Tracker Boot for the measure-and-learn half of the build-measure-learn loop: it suggests lean experiments to validate the hypotheses behind user stories, tracks each experiment's results, and enacts the consequences.

**Stack**: TanStack + Supabase + Netlify
**Tracker Boot**: 100000282
**GitHub**: https://github.com/gthoma17/tashikame
**Deploy**: Netlify — https://tashi-kame.netlify.app

## Me
Greg — PM
**Company / Team**: Bekind Labs

## Dev Team

| Display Name | System Name | Track File |
|--------------|-------------|------------|
| Hoge | `dev-hoge` | `documents/tracks/dev-hoge.md` |
| Piyo | `dev-piyo` | `documents/tracks/dev-piyo.md` |

## ⚠️ Session Start Triggers — Always Run First

When any of the keywords below are received, use the Read tool to read the listed files **before anything else**. Do not start any work until the files have been read.

| Keyword | Files to Read |
|---------|--------------|
| `PM start` | `documents/aabt-workflow.md` + `documents/product/product-overview.md` + `documents/environment-setup.md` (its presence means environment setup is done) (+ after environment setup: `documents/tracks/dev-hoge.md` + `documents/tracks/dev-piyo.md` + `documents/delivery-playbook.md` + `documents/iteration-plan.md`) |
| `dev-hoge start` | `documents/tracks/dev-hoge.md` + `documents/coding-standards.md` |
| `dev-piyo start` | `documents/tracks/dev-piyo.md` + `documents/coding-standards.md` |
| `start setup` | Read `documents/environment-setup.md` (create it if missing), brief the progress, then continue Strike Trio skill Phase 2 **one step at a time**. (Infrastructure is tracked in this checklist, NOT as Tracker Boot Chores.) |
| `/story` or `write story` | **Re-read all of §4** in `documents/aabt-workflow.md`, then apply the self-check checklist to write and register the story. Always go through this trigger before writing a story or putting it in the tracker (don't rely on memory). |
| `create a persona` / `persona workshop` | Run the persona builder skill. Check `documents/product/product-overview.md` and the `documents/product/personas/` folder, then start the workshop. |

> **`dev-* start` is NOT a keyword a human types.** It's a **Dev-session-internal trigger** that `ready-*.command` injects automatically when launching a Dev session. So when guiding the PM through story assignment, never say "type `dev-* start`" — the correct guidance is **double-click `ready-*.command`** (delivery step 1).

> **On `PM start`, judge whether environment setup is done by `documents/environment-setup.md`.** If the file exists, setup is (essentially) done — read its progress and brief in delivery mode, and if a step is still ⬜ (e.g. 6. Verify), guide that one first. **Do NOT misjudge "before setup" when the file is present.** Only when the file is entirely absent are you before setup (D&F stage), so proceed with D&F using `aabt-workflow.md` + `product-overview.md`. (track/delivery-playbook are symlink·gitignored and can be unstable in a session, so the primary signal for "done" is the committed `environment-setup.md`.)

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
> **When already in development (environment setup and delivery are running)**: After briefing the D&F status, **distill the current position and what's next — don't dump the backlog.** Order: ① Read the **latest decision entry** in `documents/iteration-plan.md` to grab the current theme + the "Next candidates" pointer at the end of the entry (candidate story IDs) → ② Use `tb_get_current_iteration` to check recent Accepted/progress → ③ Pin the candidate stories down precisely with `tb_get_story`. From that, announce "the next story is [track] #[number] — [title]" (or 2–3 candidates).
>
> ⚠️ **Don't dump the whole backlog with `tb_search_stories`** — that's what makes a new session wander in a huge backlog. The next candidates come from *the latest decision entry's "Next candidates" + the current iteration*. (For that to work, each decision-log entry leaves a **"Next candidates" pointer** at its end — the latest entry is the handoff.)
>
> ⚠️ **`iteration-plan.md` is a decision log — it does not hold state.** The next story, progress, points, and ownership are **always sourced from the tracker** (the track file's completed list can be stale too). Read iteration-plan only as the rationale for "why this order / what was decided," and pin "how far along we are" from the tracker.
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

> On Dev trigger: **before reading files**, run `git fetch origin && git reset --hard origin/main` to reset the branch to the latest main. Since `documents/tracks/` is excluded via `.gitignore`, symlinks are not affected.

> Dev tracks mark the current story as **Started** in Tracker Boot when a story begins.

## Delivery Cycle — Follow This Order Without Exception

| Step | Trigger | Claude Action |
|------|---------|---------------|
| 1. Story assignment | PM: **"개발 시작"** | Pull next story from Tracker Boot and write **only the number, title, and a track directive** to `dev-hoge.md` or `dev-piyo.md`'s `## Current Story` (don't copy-paste the details or AC — the source of truth is the tracker, the Dev reads it with `tb_get_story`) |
| 2. Preview check | Paste Dev push notification | Present preview URL + check points. If issues, **comment on the current story** (`tb_create_comment`) → tell Dev "read the comments on #[number] and apply them". If all good, instruct Dev with **"PR it"**. *(Even a screen-irrelevant Chore only skips the preview — it never skips the PR step)* |
| 3. PR | If preview looks good, Claude instructs PM to type **"PR it" in the Dev session** | Dev opens a bot-identity PR with `bash commands/pr.sh <track>`. Refused if the token is absent |
| 4. Code review | Paste PR notification | Read diff and review. **Approved** → instruct PM to double-click `approve-hoge.command`. **Changes needed** → write the body into `.review-body.md` and instruct PM to double-click `decline-hoge.command` (the command submits after a y/n confirmation) (Dev receives: "read the review on PR #[number] and apply it"). The home of code review = the PR review |
| 5. Merge | PM: double-click `merge-hoge.command` or `merge-piyo.command` and paste result | Merge gate: refused without an APPROVED review. Claude resolves conflicts if any. Merge goes to main (= acceptance) — **production does not change.** On success, mark Tracker Boot as **Delivered** + present the **acceptance URL** (prod mirror) with check points |
| 6. Accept | PM: **"Accept"** (after checking on acceptance) | Mark Tracker Boot as **Accepted** + add `- #[number] — [title]` to `## Completed Stories` (keep only the latest 5, delete older) + clear `## Current Story`. **The cycle ends here** — publishing to production is handled automatically by `promote.yml` (GitHub Actions) polling the tracker (within ~5 min, serial gate built in). **Neither PM nor Claude runs promote by hand** |

> Never prompt PR before preview is confirmed. Never replace `## Current Story` before "Accept". Order is strict.
> **There are only three things the PM pastes into the session — ① the Dev push notification (step 2) ② the PR notification (step 4) ③ the merge result (step 5).** Double-click commands like `approve` and `decline` produce no screen output, so there's nothing to paste. **Never ask the PM to "paste the approve result"** — approve is just a double-click; the artifact to paste is the merge result that follows in step 5.
> **Feedback splits into two channels — preview = Tracker Boot comment, code review = PR review.**
> - **Preview feedback**: written on the current story with `tb_create_comment` (not the track file). Hand to Dev: "read the comments on #[number] and apply them". A comment stays permanently attached to the story, and the act of writing it is itself the signal, so no separate emit is needed (you read the signal from the trace of the act).
> - **Code-review findings**: left as a **PR review** — a pass goes through `approve-hoge.command` (a review-free double-click), and changes-needed writes the body into `.review-body.md` and goes through `decline-hoge.command` (submits after a y/n confirmation). Hand to Dev: "read the review on PR #[number] and apply it" (`gh pr view <N> --json reviews`). Reason: the merge approve gate hangs on the PR review, so the code-review verdict must live there for the gate to work.
> **Story comments = a PM-feedback-only channel.** The Dev never posts comments (reads only). So when the Dev reads via `tb_get_story_comments`, everything there is PM feedback — no marker needed to tell them apart.
> **Marking a story as Started in Tracker Boot is the Dev track's responsibility. The PM session must never do this.** After story assignment, the PM session's only job is writing to the track file.
> **Signals are read from the trace of the act — the PM Claude session never emits any beat from memory.** pr, merge, accept, and feedback are all read from the trace of acts that happen anyway (tracker state transitions, PR webhooks, comments). Firing from memory goes unnoticed by the workflow when missed, but skipping a traced act stalls the work, so the miss surfaces at once. **The one exception is `assign`** — a story assignment has no external trace to read (the poll reads only accept/feedback, not the Started transition, and Tracker Boot does not push), so the **`ready` command emits it directly — the single retained emit.** This emit (when you've attached a tool to visualize or monitor team activity) opens the delivery bundle **at the start of dev** (without it the bundle opens only at the first PR, and all making before that scatters). "The PM Claude session never emits" and "the ready command emits assign" are different claims — the former forbids firing from memory; the latter has a command inscribe the one act that has no trace (and it warns loudly on stderr rather than failing silently).
> **On receiving "Accept", immediately complete both steps in order. Accept is not done until both are complete:**
> 1. Tracker Boot: mark the story → **Accepted**
> 2. Track file: add `- #[number] — [title]` to `## Completed Stories` (keep only the latest 5 — delete older; full history is in Tracker Boot) + clear `## Current Story` entirely

## PM Session Response Formats

### Preview Check (on Dev push notification)

Check the sender from the push notification and substitute the Dev's name accordingly.

```
🔍 Preview Check

Hoge: [Open preview](https://dev-hoge--tashi-kame.netlify.app)
Piyo: [Open preview](https://dev-piyo--tashi-kame.netlify.app)

Check points:
- [ ] [Based on Gherkin AC scenario 1]
- [ ] [Based on Gherkin AC scenario 2]

If everything looks good, type "PR it" in that Dev session.
If there are issues, let me know.
```

> Always present preview, acceptance, and production URLs as clickable markdown links. Never throw out raw text URLs.

### Accept Check (after merge success — on acceptance)

The merge is deployed to **acceptance**, and production is still the previous build. Before Accept, check on the **acceptance URL** (prod mirror), not the branch preview.

```
✅ Merge complete — deployed to acceptance

[Acceptance](https://main--tashi-kame.netlify.app)

Check points:
- [ ] [Based on Gherkin AC scenario 1]
- [ ] [Based on Gherkin AC scenario 2]

If everything looks good, say "Accept". (After Accept, production auto-publishes via GitHub Actions — within ~5 min.)
```

> Accept ends the cycle. Publishing to production is done automatically by `promote.yml` (GitHub Actions) polling the tracker — there's nothing for PM or Claude to double-click or run. Check the final production build directly at `https://tashi-kame.netlify.app` after ~5 min (or use GitHub's `Run workflow` button to publish immediately).

## Dev Track Report — Three Gates the PM Checks

The **source of truth for the push report format is each track file's `## Notification Protocol`** (not duplicated here — DRY). The Dev notifies in that format, and the PM checks **three gates** in the report:

- **Red confirmed** — did it quote the core of the actual failure output, not just "confirmed"? If empty, it signals green-only → ask the Dev to redo red-first.
- **Refactor** — what was tidied, or `none — reason`. If empty or `none` but a structural trigger is tripped (a component past ~300 lines, etc.), check it on the diff during code review.
- **e2e** — does it match the story's `e2e:` annotation? If it's new/regression but reported as "none", that's a missed signal.

## Track File Rules
- When PM updates a track file, never modify `## Notification Protocol` or `## Development Rules` sections
- `## Current Story` section must contain **exactly one story at all times. Only the number, title, and a track directive** — never copy-paste the details or AC (the source of truth is the tracker, the Dev reads it with `tb_get_story`).
- Both replacing and appending are **strictly forbidden until the "Accept" keyword is received.** Even if the next story is discussed, feedback is written, or another story is ready — do not add or write any new story to this section.
- `## Completed Stories` keeps **only the latest 5** (delete older — full history is in Tracker Boot). Each entry is `- #[number] — [title]` on **one line, no parenthetical asides** (the full story lives in the tracker). Keep `## Current Codebase State` concise — a core file tree + one-line descriptions.

## Deployment Rules (single site + deploy contexts)
- **One site.** Pin env in `netlify.toml`'s `[build.environment]` as the single source (only `VITE_` public keys — no per-site dashboard scoping, to prevent drift).
- **Netlify branch deploy settings** (Site configuration → Build & deploy → Branches and deploy contexts): Production branch = `production`. Branch deploys must include `main` and `dev-*` (set to "All branches" or add each explicitly) — without this, the acceptance mirror and dev previews never build.
- git push (main) → **acceptance mirror** (`https://main--tashi-kame.netlify.app` = the `main--{site}` branch deploy) auto-deploys. **Merge is not immediate production** — after Accept, `promote.yml` (GitHub Actions) polls the tracker and fast-forwards the `production` branch automatically (within ~5 min, `https://tashi-kame.netlify.app`). Requires repo secret `TRACKER_BOOT_API_KEY`; no bot token needed.
- If hosting is set to "Other", fill in this line with the actual deploy method yourself
- Never ask Greg to "push"

## Document Persistence Rule — persist PM docs the moment they're edited

> ⚠️ **Dev merge/ready runs `git reset --hard origin/main`, which wipes uncommitted changes entirely.** When the PM session edits a git-tracked document — `product-overview.md`, `CLAUDE.md`, `aabt-workflow.md`, `delivery-playbook.md`, etc. — it stays provisional until committed and is lost at the next merge.

- **Right after editing a PM document, double-click `push-docs.command`** to persist it to origin/main. (It's a command double-click, so it doesn't violate the "never ask to push" rule.)
- **Prompting the persist is Claude's duty — it does not rely on Greg's memory.** When Claude (PM session) edits a git-tracked document (product-overview, CLAUDE.md, aabt-workflow, delivery-playbook, etc.), it must, **within that same response**, tell the user to "double-click `push-docs.command` to persist." Since Claude is the one who made the edit, prompting in the same turn is the most reliable point. Never end a response that edited a document without the persist prompt.
- Do not trust an unpersisted document change — it can vanish at the next merge.
- `documents/tracks/*` is safe from this (`.gitignore` + symlink). The persistence target is everything else.

## Preferences
- Default language: English
- Responses: concise, confident, no unnecessary preamble
- Format: prose-first, bullets only when truly necessary
- UI language: English only
- Address Greg by name.
