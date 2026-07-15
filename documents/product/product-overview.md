# Tashikame — Product Overview

*Last updated: 2026-07-15*

---

## D&F Progress

Claude checks the content of each section below on PM session start and updates this table automatically.

| Stage | Status | Key Decision |
|-------|--------|-------------|
| Vision | ✅ | Turn assumptions buried in user stories into validated learning, so teams build what's proven to matter |
| Personas | ✅ | Hanako "Hannah" — early-career PM, theory-rich but practice-overwhelmed; needs a validation system + a commitment device to kill darlings |
| Problem Exploration | ✅ | 11 problems explored across 6 clusters (intending-vs-doing, what-to-test-first, darling-killing, surviving-the-week, disconnected-halves, measurability + data plumbing) |
| Problem Priority | ✅ | The commitment loop: suggest an experiment for the riskiest assumption behind a labeled feature (a set of stories) → track its result → enact the pre-committed consequence. Data plumbing + small-N measurability deferred |
| Value Propositions | ✅ | With Tashikame, Hannah can turn the riskiest assumption behind a feature (a labeled set of stories) into a lean experiment, and let a pre-set threshold make the kill/keep call for her |
| Feature Exploration | ✅ | 17 features explored across the 6 loop beats (surface → suggest → pre-commit → track → enact → keep-honest) |
| Feature Priority | ✅ | MVP = one full lap of the loop (5 features, TB read+write included); everything else deferred to Later |
| Technical Feasibility | ✅ | No hard blockers. Engine = LLM (Claude API via serverless); consequence = TB label/flag; TB + Claude API keys proxied server-side |
| Wireframes | ✅ | Complete — 3 screens (dashboard → new-experiment flow → experiment detail), sketched lo-fi inline |
| Story Mapping | ✅ | 1 foundation Chore + 8 MVP story drafts; 2-track split (dev-hoge create / dev-piyo conclude); 1 critical path seeded. TB registration pending Pre-IPM |
| Tracker Boot Backlog | ⬜ | |

---

## Vision

> Tashikame turns the assumptions buried inside user stories into validated learning, so teams build what's proven to matter rather than what merely seemed like a good idea.

---

## Personas

### Hanako "Hannah"

> "I'm shipping faster than I can figure out whether any of it actually worked."

**Customer type:** Early-career PM (first project or two), theory-rich but practice-overwhelmed, who struggles to kill darlings even against evidence

**Facts**
- Read *The Lean Startup* (リーン・スタートアップ) and *Inspired* cover to cover before starting; keeps *Continuous Discovery Habits* half-finished on her desk
- Keeps a personal Notion page titled "たぶん本当 (probably true)" — a running list of product assumptions she never quite turns into experiments
- Works roughly 50/50 across languages — English with the dev team (docs, stand-ups, PRs), Japanese with stakeholders and customers (interviews, sales meetings)
- Switched into product from an OL role — ~3 years in general affairs (総務) at a traditional 商社 before jumping to tech; product discovery is brand-new territory
- Runs 6 engineers in 3 pairs on the company's highest-visibility project — the scale of the team and the exposure is a big part of why she's underwater

**Behaviors**
- Adds rows to the "たぶん本当" assumptions page but almost never comes back to test them
- Screenshots slides from lean/discovery conference talks and saves them to a "someday" folder
- Asks her VP "is this the right call?" in 1:1s instead of designing a cheap test herself
- Defends a feature in stakeholder meetings using sunk effort ("we've put three sprints into this") rather than evidence
- Keeps a feature live long after the metrics are flat because killing it feels like admitting failure

**Needs & Goals**
- Wants to feel like a real PM, not an OL who got lucky with a job title
- Wishes she could tell which of her twelve stories are actually worth building before she builds them
- Needs a system that survives an interruption-shredded week
- Would like to turn her "たぶん本当" list into something that actually tests itself
- Needs to pre-commit to a kill/keep threshold before the experiment runs — so killing a doomed feature is a decision she already made, not one she has to summon courage for

★ **Key Assumptions** *(to validate through customer interviews)*
- A software tool can actually function as a commitment device — that pre-committing to a kill/keep threshold will make her honor it when the result comes back ugly
- Her product has enough users/signal to run lean experiments that yield real learning (not underpowered noise)

---

## Problem Exploration

Divergent exploration of the problems Hanako "Hannah" faces, grouped by where the build-measure-learn loop breaks for her.

**Intending vs. doing (the "たぶん本当" graveyard)**
- Captures assumptions but never converts them into tests — the list grows, the testing doesn't.
- Doesn't know how to turn a vague hunch into a runnable experiment (which type, what to measure, how long).

**Knowing what to test first**
- Twelve stories and no way to tell which underlying assumption is riskiest — so she tests nothing, or tests the wrong thing.
- No sense of "how much evidence is enough" — when is a thing actually learned?

**The darling problem (commitment-device wound)**
- Can't kill a feature even when the metrics are flat; it feels like personal failure.
- Nothing forces the kill/keep decision once results are in — the evidence just sits there.
- Sets no threshold in advance, so every result becomes a fresh act of courage.

**Surviving the week**
- Validation is the first thing to drop when she's interrupted — the system has to work in the gaps, not require a calm afternoon.

**Disconnected halves**
- Measure/learn lives in Miro/Notion, severed from the build (Tracker Boot) — the learning never loops back to the story it should inform.

**Measurability reality**
- Her product may lack the users/traffic for clean quantitative signal — she needs experiment types that work at small-N (fake-door, concierge, qualitative), not just A/B tests.

**Data plumbing tax**
- Getting the data into one place to make a call means hand-jamming between services — export from the product DB, pull a funnel from analytics, paste into a spreadsheet, eyeball it. This friction kills experiments before she can even reach a verdict.

---

## Problem Priority

**Focus — the commitment loop:** suggest a lean experiment for a story's riskiest assumption → track its result → enact the pre-committed kill/keep consequence.

**Operating unit — the label, not the story.** A hypothesis lives at the *feature* level, and a feature is a set of stories, which in Tracker Boot is exactly what a label groups. So an experiment is scoped to a **label** (e.g. `profile`), not a single story — matching how a PM reasons about bets.

This spine was chosen because it braids the three things that make Tashikame matter:
- **Differentiator** — the pre-committed kill/keep threshold and consequence enactment. No existing tool does this; it's also the riskiest assumption (can a tool actually function as a commitment device?), so proving it is the highest-value learning.
- **Entry point** — suggesting the experiment lowers Hannah's activation energy and gets her in the door; without it the commitment device has nothing to commit to.
- **Tracker Boot wedge** — anchoring measure/learn to a label (a feature) keeps Tashikame a *companion* to the build half, not a standalone toy.

**Explicitly deferred (later):** data-plumbing integrations and small-N/statistical measurability. Real problems, but integration-heavy and not the unique insight — too many hackathon hours for too little differentiation.

---

## Value Propositions

Format: `With Tashikame, [persona] can [do what].`

**Hanako "Hannah":** With Tashikame, Hannah can turn the riskiest assumption behind a feature (a labeled set of stories) into a lean experiment, and let a pre-set threshold make the kill/keep call for her.

---

## Feature Exploration

Divergent feature ideas to realize the VP, organized by the loop beats.

**1. Surface the assumption**
- Pick a Tracker Boot label (a feature = a set of stories) and surface the riskiest assumption behind that group
- Assumption risk ranking across labels — which feature's hypothesis is scariest × most load-bearing
- Import the "たぶん本当" list (paste / manual entry) as a starting backlog of assumptions

**2. Suggest the experiment**
- Given an assumption, recommend a lean experiment *type* (fake-door, concierge, Wizard-of-Oz, landing-page smoke test, interview, A/B)
- Auto-draft the experiment: hypothesis statement, method, what to measure, suggested duration/sample
- A small library of experiment templates (Ries-style) to pick from

**3. Pre-commit the threshold (differentiator)**
- Define kill/keep criteria *before* running — "if <metric> < X by <date>, we kill it"
- Lock the threshold so it can't be quietly edited after results come in (or log any change loudly)
- Capture the decision-maker + a "commitment statement" the PM signs off on

**4. Track the result**
- Manual result entry (enter the measured number) — hackathon-cheap, dodges the deferred plumbing
- Experiment status: proposed → running → concluded
- Countdown to the decision date

**5. Enact the consequence**
- Render the verdict against the pre-set threshold: kill / keep / inconclusive
- Write a verdict label (validated / killed / inconclusive) back onto every story carrying the experiment's scoping label
- A running log of past experiments + verdicts (institutional memory, anti-repeat)

**6. Keep her honest (commitment-device texture)**
- Nudges/reminders when a decision date passes
- A visible "you committed to this" reflection when she's tempted to override

---

## Feature Priority

MVP is a **thin vertical slice that walks the whole loop once**, end to end. Anything not needed to complete one lap is deferred.

**MVP — one full lap of the loop**
- Pick a Tracker Boot label (a feature = a set of stories) and capture the single riskiest assumption behind it *(beat 1)*
- Suggest an experiment type + auto-draft the hypothesis / method / metric *(beat 2)*
- Define **and lock** the kill/keep threshold before running — the differentiator, non-negotiable *(beat 3)*
- Manual result entry + status (proposed → running → concluded) *(beat 4)*
- Render the verdict (kill / keep / inconclusive) against the locked threshold, and write a verdict label back across the labeled group's stories *(beat 5)*

> Tracker Boot read + write stays **in** the MVP — it's the "companion, not a toy" thesis, and it's a well-defined GraphQL API (the same one the Strike Trio delivery tooling already uses), so integration cost is low.

**Later**
- Backlog-wide assumption risk ranking
- "たぶん本当" bulk import
- Full experiment-template library (MVP ships with 2–3 hardcoded types)
- Commitment statement + decision-maker capture
- Decision-date countdown + nudges
- "You committed to this" override reflection
- Institutional-memory log of past verdicts
- *(already deferred: data-plumbing integrations, small-N statistics)*

---

## Technical Feasibility

Stack: TanStack + Supabase + Netlify + Tracker Boot GraphQL API. No hard blockers.

| Feature | Feasible | Notes |
|---------|----------|-------|
| Pick label + capture assumption | ✅ | TB GraphQL read by label (returns the group's stories); persist assumption in Supabase. TB API key proxied server-side (Netlify fn or Supabase edge fn), never in client |
| Suggest experiment + auto-draft | ✅ | **LLM-powered** — serverless fn calls the Claude API to draft experiment type/method/metric from the assumption. Claude API key server-side |
| Define + lock threshold | ✅ | Supabase row + `locked` flag; immutability enforced in DB (RLS/trigger), not just UI |
| Manual result entry + status | ✅ | Plain CRUD in Supabase |
| Verdict + push to TB | ✅ | Verdict = pure client logic (metric vs locked threshold); consequence written back as a **verdict label** (validated / killed / inconclusive) applied to every story under the scoping label — visible, reversible, non-destructive |

**Key decisions**
- Operating unit: an experiment is scoped to a **Tracker Boot label** (a feature = a set of stories), not a single story.
- Suggestion engine: **LLM (Claude API)** via serverless function.
- Consequence write: apply a **verdict label** across all stories carrying the experiment's scoping label.
- Both the TB API key and the Claude API key live server-side (serverless/edge functions) — never in the browser bundle.

---

## Wireframes

Complete — sketched lo-fi (structural validation only). Three screens walk the whole loop:

1. **Experiments dashboard** — list of experiments with status chips (proposed / running / concluded) and verdicts (keep / killed); "＋ New experiment" entry point.
2. **New experiment flow** — 4 steps: pick a Tracker Boot label (a feature) → the riskiest assumption behind it (editable) → Claude-suggested experiment (type / method / metric, editable) → define & **lock** the kill/keep threshold ("if <metric> < X by <date> → kill").
3. **Experiment detail** — the locked commitment shown immutable at top → manual result entry → verdict panel (kill / keep / inconclusive) judged against the locked threshold → "write label to Tracker Boot" action.

**Key structural point:** the threshold locked in Screen 2 reappears unchanged on Screen 3, so the verdict is always judged against what was committed *before* the result was seen — the commitment device made literal.

---

## Story Mapping

**Backbone (Hannah's journey through the loop):** See experiments → Start → Design → Commit → Measure → Enact

MVP walking skeleton — 1 foundation Chore + 8 story drafts. Each carries As-a/I-want/so-that, at least one Gherkin scenario, and a proposed `e2e:` annotation (PM confirms). Registration into Tracker Boot Pre-IPM happens after `start setup` (needs the TB project + TB MCP in a local session).

**Parallelization (two tracks):**
- **Chore #0 lands first on a single track** — both tracks fork from it (prevents schema/scaffold collisions).
- **`dev-hoge` — the "create" side** (Dashboard + New-experiment flow, screens 1–2): stories #1–#5. Owns read serverless fns (`tb-read`, `claude-suggest`).
- **`dev-piyo` — the "conclude" side** (Experiment detail, screen 3): stories #6–#8. Owns the write serverless fn (`tb-write`) and the seeded e2e.
- Seam = the `experiments` row: hoge writes it, piyo reads/updates it. Different screens + functions → near-zero file overlap. piyo works against a seeded fixture until hoge's flow lands. Track directives per story get finalized at IPM; rationale goes in `iteration-plan.md`.

### Foundation

**#0 — Project scaffold + data spine (Chore)**
Establish the shared foundation both tracks depend on: TanStack app scaffold + routing, the Supabase `experiments` schema **including the immutability trigger for the locked threshold** (so neither feature story re-touches it), and the Tracker Boot GraphQL client. Chore state flow: Unstarted → Started → Accepted.
```gherkin
Scenario: App boots with the data spine in place
  Given the scaffold, schema, and TB client are set up
  When the app is run locally
  Then it starts, routes render, and a smoke test confirms a read against the experiments schema
```
`e2e: none` — infrastructure Chore; the first smoke lives here so feature stories don't carry scaffold setup.

### See experiments

**#1 — View the experiments dashboard**
As Hannah, I want to see all my experiments with their status and verdict in one place, so that I know at a glance what's running, what's concluded, and what still needs a decision.
```gherkin
Scenario: View existing experiments
  Given I have experiments in proposed, running, and concluded states
  When I open the dashboard
  Then I see each experiment with its name, status, and verdict if concluded
Scenario: No experiments yet
  Given I have no experiments
  When I open the dashboard
  Then I see an empty state prompting me to create my first experiment
```
`e2e: none` — isolated UI + simple render; units cover it.

### Start

**#2 — Scope an experiment to a label**
As Hannah, I want to pick a Tracker Boot label and see the stories grouped under it, so that I can scope an experiment to a whole feature rather than a single story.
```gherkin
Scenario: Select a label and view its stories
  Given my Tracker Boot project has stories tagged with labels
  When I choose the label "profile"
  Then I see the list of stories carrying that label
Scenario: Label with no stories
  Given a label has no stories
  When I choose that label
  Then I see a message that the feature has no stories to experiment on
```
`e2e: none` — a TB read; failure surfaces visibly (empty/error state). Revisit only if a regression proves the need.

**#3 — Surface the riskiest assumption**
As Hannah, I want Tashikame to surface (and let me edit) the riskiest assumption behind the labeled feature, so that I test the belief that actually matters instead of guessing.
```gherkin
Scenario: Claude proposes an assumption
  Given I have selected a label and its stories
  When I ask Tashikame to surface the riskiest assumption
  Then I see a proposed assumption statement I can accept or edit
Scenario: Edit the assumption
  Given a proposed assumption is shown
  When I edit the text and save
  Then the edited assumption is stored for this experiment
```
`e2e: none` — LLM call + form; unit-cover the boundary (mock the LLM). Value is content quality, not an integration spine.

### Design

**#4 — Suggest the experiment**
As Hannah, I want Tashikame to draft a suitable lean experiment (type, method, metric) for my assumption, so that I don't stall on how to test it and can start from a solid draft.
```gherkin
Scenario: Draft an experiment from the assumption
  Given I have a saved assumption
  When I request a suggested experiment
  Then I see a drafted experiment with a type, method, and metric
Scenario: Edit the suggestion
  Given a suggested experiment is shown
  When I change the metric and save
  Then my edits are stored for the experiment
```
`e2e: none` — LLM draft + editable form; unit-cover mapping/validation, mock the LLM.

### Commit

**#5 — Lock the kill/keep threshold**
As Hannah, I want to define and lock a kill/keep threshold before the experiment runs, so that the decision is committed in advance and I can't rationalize it away once results land.
```gherkin
Scenario: Lock a threshold
  Given I have a drafted experiment
  When I set "if click-through < 8% by Jul 29 then kill" and lock it
  Then the experiment moves to running and the threshold becomes immutable
Scenario: Attempt to edit a locked threshold
  Given a locked threshold
  When I try to change it
  Then the change is refused (or recorded as a loud, logged override)
```
`e2e: none` — immutability is enforced and verified at the unit + DB (RLS/trigger) layer, not across a transport boundary.

### Measure

**#6 — Enter the measured result**
As Hannah, I want to enter the measured result and mark the experiment concluded, so that the verdict can be computed against my locked threshold.
```gherkin
Scenario: Enter a result
  Given a running experiment with a locked threshold
  When I enter the measured metric value and save
  Then the experiment status becomes concluded
```
`e2e: none` — CRUD; units cover it.

**#7 — See the verdict**
As Hannah, I want to see the verdict (kill / keep / inconclusive) computed against my locked threshold, so that the decision is made by the rule I committed to, not my in-the-moment feelings.
```gherkin
Scenario: Result misses the threshold
  Given a locked threshold "click-through < 8% → kill" and a concluded result of 4.1%
  When I view the verdict
  Then the verdict shows "kill"
Scenario: Result clears the keep condition
  Given the same threshold and a concluded result of 12%
  When I view the verdict
  Then the verdict shows "keep"
```
`e2e: none` — pure client logic; the ideal unit-test target.

### Enact

**#8 — Write the verdict label back to Tracker Boot**
As Hannah, I want the verdict written back as a label onto every story in the feature, so that the consequence is enacted in Tracker Boot where my team actually works — not stranded in a separate tool.
```gherkin
Scenario: Write verdict label to the labeled stories
  Given a concluded experiment with verdict "kill" scoped to label "profile"
  When I choose to write the verdict back
  Then every story carrying "profile" receives a "killed" label in Tracker Boot
Scenario: Tracker Boot write fails
  Given the Tracker Boot API is unavailable
  When I write the verdict back
  Then I see an error and can retry without losing the verdict
```
`e2e: new — consequence write-back` — first time the loop connects end-to-end to the external GraphQL mutation across the network; the seeded critical path.

---

## Critical Paths

*(**The reference point for deciding when e2e fires** — `/story` self-check cross-checks each story against this list to decide whether e2e applies.)*

**Definition**: A Critical Path is not a "user journey" — it's the **end-to-end integration spine the product depends on**. It covers user journeys (URL → screen), but also the **data spine** (server integrations like webhook → ingest → DB that a user never directly walks, yet are catastrophic when broken).

**Slot criterion — integration-risk filter**: Only paths whose **core risk lives at an integration point (realtime, transport, webhook, deploy, browser, etc.) that units can't catch** make this list. Pure logic, isolated UI, and simple translate+render are **excluded even if they're user journeys** — units catch those.

> ⚠️ **Inflation boundary**: Once this list starts mirroring the feature list, you're back to "e2e on every story" (the very trap we escaped). Start **conservatively, with just a seed** (usually one), and grow it **only when a regression actually occurs and proves the need**. A backbone journey doesn't earn a slot automatically — it must pass the integration-risk filter.

Format: `**[path name]**: [one-line end-to-end flow] — [e2e spec file path or "none yet"]`

Examples:
- **cube arrival**: URL open → realtime event received → cube renders on screen — `e2e/cube-arrival.spec.js` *(realtime/transport integration risk — units can't catch it)*
- *(data spine example: event ingest — webhook → Edge Function → DB load. Not a user journey, but high integration risk makes it a slot candidate)*

**Seed (Tashikame) — one path only, to start:**
- **consequence write-back**: locked threshold + measured result → verdict computed → verdict label written to Tracker Boot across the labeled feature's stories — `e2e/consequence-writeback.spec.*` (none yet) *(external GraphQL mutation across the network — catastrophic and invisible to units when it silently fails; the one path where the whole loop's value is realized or lost)*

---

## Tracker Boot Backlog

*(Completion status and story count)*
