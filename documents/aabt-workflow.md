# Strike Trio Workflow — Team Operations Playbook

*Bekind Labs Standard · Strike Trio*  
*Last updated: 2026-07-01*

---

## Strike Trio

A skill that lets a trio — one PM and two AI agents — work as a full Balanced Team. A concrete set of processes and tools for practicing AABT — leading AI to continuously deliver high-quality software.

---

## Purpose of This Document

The standard workflow for building products the Strike Trio way. Defines every phase from vision to deployment, and how the team operates. Reading this document at the start of a new project or session gives you the full picture.

---

## 1. Team Structure

### Roles

| Role | Filled by | Description |
|------|-----------|-------------|
| **PM** | Human | Decides product direction, writes stories, makes Accept decisions, relays between tracks |
| **Dev A** | AI agent (Claude) | Dedicated development of an independent scope |
| **Dev B** | AI agent (Claude) | Dedicated development of an independent scope |

There is no QA role in AABT. Quality is ensured by TDD (unit tests) and PM Accept. The absence of a QA lane is itself a methodological statement.

### Session Structure

Each role runs in a separate Claude session.

- **PM session**: All of Discovery & Framing, IPM, story management, preview checks, code review, merge approval
- **Dev A session**: `dev-[dev-a-name] start` trigger from `CLAUDE.md` → reads `documents/tracks/dev-[dev-a-name].md` and begins
- **Dev B session**: `dev-[dev-b-name] start` trigger from `CLAUDE.md` → reads `documents/tracks/dev-[dev-b-name].md` and begins

> **Rule**: Each Dev session is dedicated to development only. For architecture decisions or priority changes, ask the PM session.

---

## 2. Discovery & Framing

The phase that defines the product direction before development begins. Conducted in the PM session.

### Phase Order

```
Vision
  └─ Personas
      └─ Problem Exploration
          └─ Problem Priority
              └─ Value Propositions
                  └─ Feature Exploration
                      └─ Feature Priority
                          └─ Technical Feasibility Review
                              └─ Wireframes
                                  └─ Story Mapping
                                      └─ Tracker Boot Backlog
```

### Phase Descriptions

**Vision**  
Why the product exists. Must be expressible in one sentence.

**Personas**  
Real people who use or are affected by this product. Define a specific representative person. "Anyone" is not a persona.

> 💡 In a PM session, saying "create a persona" or "persona workshop" runs the persona builder skill. Results are saved to `documents/product/personas/[name]-draft.md` and can be merged into product-overview.md after review.

**Problem Exploration**  
Divergent exploration of the problems each persona faces. Understand the problems thoroughly before thinking about solutions.

**Problem Priority**  
Decide which problems this product will focus on. You can't solve everything.

**Value Propositions**  
Format: `With [product name], [persona] can [do what].`  
Write one per persona.

**Feature Exploration**  
Divergent exploration of the features needed to realize the value propositions.

**Feature Priority**  
Decide which features go into the MVP and which are deferred.

**Technical Feasibility Review**  
Confirm each feature can be built with the current tech stack and data sources. Identify blockers or alternatives early.

**Wireframes**  
Visualize screen flow and layout. For structural validation — not visual design.

**Story Mapping**  
Arrange user stories along a user journey (Activity) axis. This becomes the basis for deciding iteration scope.

**Tracker Boot Backlog**  
Register the user stories derived from the story map into Tracker Boot. Writing Gherkin acceptance criteria for each story is required.

### D&F Document Update Rules

When each stage is complete, Claude immediately does the following:

1. Records the results in the corresponding section of `documents/product/product-overview.md`.
2. Updates the **D&F Progress** table at the top of the same file — marks the stage ✅ and fills in the Key Decision column.

| Stage | What to record in Key Decision |
|-------|-------------------------------|
| Vision | Vision in one sentence |
| Personas | Persona name list + one-line Needs & Wants summary each |
| Problem Exploration | Number of problems explored |
| Problem Priority | The prioritized problem in one line |
| Value Propositions | VP per persona in one line |
| Feature Exploration | Number of features explored |
| Feature Priority | Number of MVP features |
| Technical Feasibility | Number of issues (or "No issues") |
| Wireframes | Complete |
| Story Mapping | Complete |
| Tracker Boot Backlog | Number of stories registered |

---

## 3. Tracker Boot & IPM

### Tracker Boot

A user story and Gherkin AC tracker built by Bekind Labs, carrying Pivotal Tracker's DNA and optimized for Strike Trio. → [trackerboot.com](https://trackerboot.com)

- **Story state flow**: Unstarted → Started → Finished → Delivered → Accepted
- **Chore state flow**: Unstarted → Started → Accepted

### Tobi

Tracker Boot's AI bot. Invaluable for story refinement before IPM, but available to answer anything anytime.

🎵 [Tobi Song](https://youtu.be/Vt9iQPDV_iQ?si=qOTtOfwyi4fNg_rB)

### Post-D&F → Pre-Development Flow

```
Story mapping complete
  └─ Register user stories in Tracker Boot
      └─ IPM — select iteration stories + assign to tracks
          └─ Track assignment — PM writes stories into each Dev track file
              └─ "start dev" → infrastructure setup Chores → development begins
```

---

## 4. User Story Writing Standards

### Story Format

**All three parts are required for a valid story. Missing any one of them makes it a task, not a story.**

```
As a [persona],
I want to [action],
so that [value].
```

What each part does:

- **As a [persona]** — Specifies who this story is for. "User" is not a persona. Use a specific role or name. Without this, there's no way to know whose problem you're solving.
- **I want to [action]** — What the persona wants to do, not how to implement it. "edit a reservation", not "add an edit button".
- **so that [value]** — Why this feature is needed. Without this, the feature request is disconnected from business value and impossible to prioritize.

**Bad examples (tasks)**
```
Add login button
Integrate OAuth so users can log in
```

**Good example (story)**
```
As a guest,
I want to log in with my email,
so that I can access my reservation history.
```

### INVEST Criteria

Good stories meet the following criteria:

- **I**ndependent — can be implemented independently of other stories
- **N**egotiable — the how is negotiable, the value is fixed
- **V**aluable — delivers clear value to the persona
- **E**stimable — developers can gauge the size
- **S**mall — can be completed within one iteration
- **T**estable — completion conditions are unambiguous

### Gherkin Acceptance Criteria

Write Gherkin scenarios as AC for each story. These are the criteria that determine a story is done.

```gherkin
Feature: [feature name]

  Scenario: [happy path]
    Given [precondition]
    When [user action — one only]
    Then [observable result]

  Scenario: [edge case]
    Given [precondition]
    When [user action]
    Then [expected result]
```

**Writing principles**: Given is system state, When is a single action, Then is an observable result. Write in terms of behavior and outcomes — not implementation details.

### Story Types

| Type | Description | Tracker Boot State Flow |
|------|-------------|------------------------|
| Feature | New functionality | Unstarted → Started → Finished → Delivered → Accepted |
| Bug | Bug fix | Unstarted → Started → Finished → Delivered → Accepted |
| Chore | Technical work (config, refactor, etc.) | Unstarted → Started → Accepted |

### Story Writing Procedure — `/story`

> **Run this procedure right before you write a story or register it in the tracker.** By the time D&F wraps up — or mid-development — the writing rules above have drifted out of context and are easy to forget. So every time you write a story, **re-read this section (all of §4)** and apply the checklist below. Don't rely on memory.

**1. Draft** — Write the three parts: As a / I want to / so that.

**2. Self-check checklist** — Verify on your own before registering. If anything fails, fix it first, then register.
- [ ] **As a [persona]** — Is it a specific persona? ("User" is not a persona)
- [ ] **I want to [action]** — Is it a user action, not an implementation detail?
- [ ] **so that [value]** — Is the business value stated?
- [ ] **INVEST** — Especially **S**mall (completable within one iteration) and **T**estable (expressible as Gherkin AC)?
- [ ] **Gherkin AC** — Did you write at least one scenario?
- [ ] **e2e judgment** — Cross-check this story against the **Critical Paths** list in `product-overview.md`. "Does this story newly connect or change the behavior of any critical path?" Record the result in the story's `e2e:` field and **propose it to the PM with rationale for confirmation.** (Detailed rules ↓)

**e2e judgment — delegation structure**: Stories are written by Claude, not the PM. So the e2e decision is Claude's too — but it is made **by cross-checking, not by reasoning** — the Critical Paths list is the reference point (without it, there's no basis for the call and it always drifts to "none"). Claude **proposes** one of three values from the cross-check and shows the rationale. The PM confirms or corrects it (HITL).

> **When it's ambiguous, the safeguard is "ask the PM" — not "lean toward e2e."** Over-prescribing (e2e whenever in doubt) brings back the "dead mandatory clause" we escaped. So Claude doesn't grow e2e on its own; when the call isn't clear, it gets PM confirmation.
- `e2e: new — [path]` — this story **connects a critical path end-to-end for the first time.** Dev writes the e2e for that path red-first.
- `e2e: regression — [path]` — it **touches the behavior of an existing critical path.** Confirm the existing e2e suite passes before pushing (don't write a new one).
- `e2e: none — [reason]` — it crosses no critical path (pure logic, isolated UI, etc.). Unit only.

**3. Register in tracker** — Use `tb_create_story` to register into **Pre-IPM**. Put the three parts verbatim in the Why (description) section. Only register stories that pass the self-check.

**4. Tobi review** — Tobi's role is *verification*, not *correction*. Since only self-checked stories arrive, Tobi rarely has to repeat the same notes (missing As / I want / so that, etc.).

#### Draft → Register → Review Flow (after story mapping)

Don't dump all the stories from story mapping onto Tobi at once. If the units are imprecise, you only inflate Tobi's review burden.

1. Write each derived story as a **draft** and run it through the self-check.
2. Register into **Pre-IPM** and get Tobi's review.
3. Bring Tobi's notes into the PM track for discussion → finalize the changes → hand back to Tobi.
4. Once Pre-IPM is done, **estimate** each story one by one in **IPM** and move it to the backlog.

---

## 5. Development Cycle — TDD Red-Green-Refactor

### Order Is Strict

```
1. Review Gherkin AC (PM writes, Dev understands)
2. Write the test → run npm test with no implementation → confirm it fails for the right reason (Red)
3. Minimum code to make the test pass (Green)
4. Clean up the code (Refactor)
5. Move to the next scenario
```

One story at a time. Never have multiple stories Started simultaneously.

### Red must fail for the right reason

Do not skip the Red in step 2. Writing the test and implementation together and only then running it (green-only) skips the proof that the test has teeth — "passing" becomes hollow. With no QA lane in AABT, quality stands on TDD + PM Accept, so an unproven test leaves one leg of quality unverified.

- Run the test **before** the implementation and confirm it fails.
- The failure must come from **the behavior the assertion checks** — a red caused only by an empty implementation ("not implemented yet") does not prove teeth.
- If it passes on the first run with no implementation, the test is suspect — fix the test, not the code.
- For an AI agent this red costs almost nothing (no typing or thinking cost). There is no excuse to skip it.

See "Why Red matters" in `documents/coding-standards.md` for the detailed criteria.

### Don't skip Refactor — the `Refactor` report gate

The leak that pairs with skipping Red (green-only) is **skipping Refactor (green-stop)**. An AI reads "tests pass = done" and stops at Green. Just as the Red check surfaces the red each cycle, Refactor should be surfaced every cycle so skipping it shows.

- **Carry a `Refactor` line in the push report.** What got tidied this cycle (rename, extract, dedupe, file split). If there was nothing to touch, `none — [reason]`. An empty line is an honest signal of green-stop → the PM requests a structural check.
- **But the report line is a weak device.** "Extracted X" is easy to write, and that line alone doesn't prove the structure is actually good (unlike the Red check, where quoting the failure message made fabrication costly). So the **real verification is the PM code review (delivery step 4), looking at the diff** — the report makes you conscious of it, the code review actually catches it. The two are a pair.
- **`none` is a legitimate answer.** The goal is not to force edits to already-clean code (guard against over-prescribing). But if it trips a structural trigger from coding-standards — a component past ~300 lines, etc. — then "none" doesn't hold.

See "Green is not the end of the cycle" in `documents/coding-standards.md` for the detailed criteria.

### Commit Message Convention

Use the following prefixes strictly — required for TDD cycle tracking and Mitte!Beat visualization.

```
test:     writing test code (Red)
feat:     implementing new feature (Green)
fix:      bug fix (Green)
refactor: code cleanup (Refactor)
chore:    config, build, infrastructure
```

**Commit format**: `[type]: [description] (#[story number])`  
Example: `feat: update calendar event on guest edit (#200023982)`

### Tests — unit and e2e differ in timing and condition

**Quality stands on three legs — unit TDD + code review + PM Accept.** E2E is the **thinnest layer** laid on top of those three (most stories verify their AC in unit tests). Pile up too many e2e and it flips into the slow, brittle "ice-cream-cone anti-pattern" — the ratio the testing trophy/pyramid recommends is many unit, few e2e. (Sources: Google "Just Say No to More End-to-End Tests", Martin Fowler's test pyramid, Kent C. Dodds' testing trophy, DHH.)

**Unit tests** (`{{UNIT_RUNNER}}`, e.g., Vitest/Jest/pytest): the TDD Red-Green-Refactor cycle. All must pass **before every commit** — unconditional, fast.

**E2E tests** (`{{E2E_TOOL}}`, e.g., Playwright/Cypress/Cucumber): verify a user journey works end-to-end for real (routing, real DB, browser, realtime — the integration points unit tests can't see). Because they're slow, they run **once right before push**, not on every commit, and **only on stories that touch a critical path**, not on all stories.

> **Whether to add a glue layer is a trade-off the tenant weighs — the methodology does not prescribe it.** Laying a Gherkin↔code glue layer (e.g. Cucumber) and running `{{E2E_TOOL}}` standalone each have a cost and a value. One side is **DRY** — the source of truth for AC is the Tracker Boot story, so glue duplicates the Gherkin into code too. The other is a **living executable spec** — scenarios wired straight to code, alive, and coherent with BDD being the methodology's standard language (Cucumber is Gherkin's native runner). On a project with few e2e, standalone-without-glue is often the lighter choice — but that's a **judgment call, not a rule**. The tool and the glue decision are both the tenant's; the skill only guarantees that choice through the `{{E2E_TOOL}}` placeholder, and never steers toward one tool.

- **Timing**: before push (right before sending to the remote). Not on commit — commits are frequent local checkpoints, a poor fit for slow e2e.
- **Condition**: follows the story's `e2e:` annotation. `new` → write the e2e for that path red-first, `regression` → confirm the existing suite passes, `none` → don't run it.
- **Unit**: one per **critical path**, not per story. Written only on the story that connects a new path; later stories that touch the same path are guarded against regression by the existing e2e.
- **Reference**: the Critical Paths list in `product-overview.md` (see §4 e2e judgment).
- **Post-deploy leg**: automated e2e runs **only up to push**. Post-deploy verification is handled not by automated e2e but by **PM Accept** (manual production-URL check after merge, delivery step 6). In other words, "automated e2e = before push / post-deploy = PM Accept" — different legs.
- **New e2e but no infrastructure yet**: don't cram e2e infrastructure setup into a feature story. Split the infrastructure (plus the first smoke) into a **separate Chore** to keep the feature story from bloating.

> **Mid-development feedback**: If a Dev discovers while working that "this was annotated `e2e: none` but it actually touches a critical path," **flag it to the PM.** The PM then (1) fixes the story's `e2e:` annotation, and (2) if this is a **newly discovered critical path**, also updates the Critical Paths list in `product-overview.md` and pins it with `push-docs.command`. Fixing only the story field without growing the master list means the same omission repeats on the next story.

---

## 6. Project Folder Structure Standard

```
[project-name]/
  CLAUDE.md                        ← session start triggers
  documents/
    aabt-workflow.md               ← this file
    delivery-playbook.md           ← delivery cycle
    coding-standards.md            ← coding standards
    glossary.md                    ← project term definitions
    iteration-plan.md              ← decision log
    product/
      product-overview.md          ← vision, personas, VPs, Critical Paths
    tracks/
      dev-[dev-a-name].md          ← Dev A instructions (PM writes, symlink)
      dev-[dev-b-name].md          ← Dev B instructions (PM writes, symlink)
  src/                             ← source code
  tests/
    unit/
    e2e/
  commands/
    ready-[dev-a-name].command     ← start a Dev session (per track)
    ready-[dev-b-name].command
    pr.sh                          ← bot-authored PR
    approve-[dev].command / decline-[dev].command  ← code-review gate
    merge-[dev].command            ← merge with approve gate
    push-docs.command              ← persist PM docs
  .github/workflows/
    promote.yml                    ← auto-publish to production after Accept
```

---

*This document is the operational standard for Bekind Labs' AABT methodology. Extend it as needed per project, but maintain the core principles: TDD, PM Accept, and track independence.*
