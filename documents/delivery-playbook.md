# Delivery Playbook — Tashikame

The playbook for delivering stories with Claude in the PM session.

---

## Delivery Cycle

After an IPM or after the previous Accept is complete, the cycle starts when PM says **"start dev"**.

### Step 1 — Story Assignment

Claude pulls the next story from the Tracker Boot backlog and writes **only the number, title, and a track directive** into the `## Current Story` section of `documents/tracks/dev-hoge.md` or `documents/tracks/dev-piyo.md`. Don't copy-paste the details, AC, Gherkin, or TDD — **the source of truth is the tracker, and the Dev reads the details and AC with `tb_get_story` when starting the story.** Keeping a copy in the track file becomes a source of drift against the tracker.

```markdown
### #[number] — [title]

**Track directive**: [a one-line scope this track will own — so files don't overlap with the other Dev]
```

Double-click `commands/ready-hoge.command` or `commands/ready-piyo.command`. Claude Code launches, automatically resets the branch to the latest main, and sends the `dev-hoge start` trigger.

The Dev track automatically:
- Reads the track file and confirms the story
- Marks the story as **Started** in Tracker Boot
- Begins the TDD cycle (Red → Green → Refactor → Push)
- Marks the story as **Finished** in Tracker Boot before pushing

---

### Step 2 — Preview Check

When the Dev track sends a push completion notification, PM pastes the message into the PM session.

If the notification includes **`Edge Function: required`**, Claude checks first:
- If `commands/deploy-functions.command` exists → instruct PM to run it
- If not → generate the script on the spot based on the tech stack (collect the list of functions to deploy, then create)

PM runs it, pastes the result, then continues.

Claude presents the preview URL and check points. **The URL must be a clickable markdown link** (`[Open preview](https://...)`) — never thrown out as raw text. PM clicks the link to check.

> **If a screen change isn't showing, suspect a stale deploy first.** A PaaS whose preview trigger lives in an external dashboard (Netlify) can't guarantee deploy completion in code. Before digging into the CSS or code, re-trigger the preview with an empty commit (`git commit --allow-empty`) or a redeploy to confirm you're on the latest bundle first.

- **If there are issues** → PM describes the feedback. Claude **comments on the current story with `tb_create_comment`** (not the track file). PM types **"read the comments on #[number] and apply them"** in the Dev session. → The home of feedback is the Tracker Boot comment. The act of writing the comment is itself the feedback signal, so a missing one surfaces immediately (no separate emit to remember).
- **If all looks good** → Claude **instructs PM to type "PR it" in the Dev session**. Creating a PR is the Dev's (author's) act, not a PM double-click stand-in.

> Preview feedback stays in the **Tracker Boot comment** as above (#22). Only code-review findings go to the PR review in Step 4 — the two have different homes.

---

### Step 3 — Create PR (bot identity)

When the PM says **"PR it"** in the Dev session, the Dev runs `bash commands/pr.sh <track>` to open a PR **under the bot account**. With the bot as the PR author, the PM can approve with their own account (the precondition for the Step 5 merge gate), and the AABT structure ("AI writes, human approves") stays honest in the history. If it's refused for lack of a token, the Dev notifies the PM (no un-botted PR is silently opened). Paste the PR result (number, URL) into the PM session.

---

### Step 4 — Code Review

Claude reads the PR diff and performs the code review. **This is where refactoring is actually verified** — the `Refactor` line in the push report is only weak self-reporting; you have to look at the diff itself to catch the structural quality. While reviewing, look at both:
- **Duplication, complexity, naming**: are there opportunities to tidy that show up in the diff.
- **Structural triggers**: a component past ~300 lines, a host that only ever grows — the structural smells from coding-standards. If the `Refactor` report says `none` but the diff shows these, that report is a green-stop signal.

Claude only decides the verdict (pass/changes-needed). **The act of leaving it is done by the human (PM) with their own account** — because the PR author is the bot, the PM's approve/request-changes is valid.

- **Changes needed** → Claude writes the body of the findings into `.review-body.md`, and the PM **double-clicks `decline-hoge.command`** — the command shows the body and submits `request-changes` only after a "submit as-is? (y/n)" confirmation (the human makes the submit decision = HITL). Dev trigger to receive it: **"read the review on PR #[number] and apply it"** → the Dev reads it via `gh pr view <N> --json reviews` and applies it.
- **Approved** → the PM **double-clicks `approve-hoge.command`** to approve (a pass has no body — a review-free double-click; the Step 5 merge gate requires this approval). **approve produces no screen output, so there's nothing to paste** — never ask to "paste the approve result". Move straight to Step 5 merge; the artifact to paste is that merge result.

> **The home of code-review findings = the PR review** (different from the Tracker Boot comment, which is the home of preview feedback). Reason: the merge approve gate (`reviewDecision == APPROVED`) hangs on the PR review, so the code-review verdict must live there as a PR review for the gate to work. A Tracker Boot comment can't flip the gate. **Preview feedback = Tracker Boot comment / code-review findings = PR review** — the two channels split.

---

### Step 5 — Merge

PM double-clicks `merge-hoge.command` or `merge-piyo.command` and pastes the result into the PM session.

- **Approve gate** → the merge command refuses the merge unless `reviewDecision` is `APPROVED` (it passes only after the PM approved with their own account in Step 4). A missing review is caught immediately at the command level — this gate works only because the author is the bot.
- **Conflict** → Claude (PM session) reads both branches, compares the intent of each change, and resolves directly.
- **Success** → The merge goes to main (= acceptance) — **production does not change.** Mark the story as **Delivered** in Tracker Boot and present check points on the **acceptance URL** (prod mirror), not the preview. Proceed to Step 6.

---

### Step 6 — Accept (on acceptance) — the end of the cycle

Claude presents the **acceptance URL** (prod mirror) and check points. PM opens it directly — the merge is live on acceptance, and production is still the previous build.

> ⚠️ Check on the **acceptance URL**, not a branch preview URL (the host-specific dev-xxx domain) or the production URL.

If all looks good, PM says **"Accept"**. Claude immediately:

1. Updates the story to **Accepted** in Tracker Boot
2. Updates the track file:
   - Adds `- #[number] — [title]` to `## Completed Stories`
   - Clears the entire `## Current Story` section

**The cycle ends here.** Publishing to production is automatic — `promote.yml` (GitHub Actions) polls the tracker, detects this Accepted state, and fast-forwards the `production` branch up to the **accepted leading run tip** (within ~5 min; use the GitHub `Run workflow` button to publish immediately). **Neither PM nor Claude runs promote by hand** — the source of truth is the tracker's Accepted state, and external polling reflects it onto production. It never depends on the PM session's memory, so no step can ever be dropped.

- **Serial gate built in**: an unaccepted story stops the run, so even when the two tracks merge and Accept asynchronously, unverified code can't leak to production. It doesn't block merges (parallelism preserved) and only gates production's advance.
- Production is `force:false` (FF-only), so it never goes backward.

Done. PM says **"start dev"** to begin the next story cycle.

---

## Exception — Merge Conflict

Happens when Dev A and Dev B both touched the same file.

**Resolution**: Claude (PM session) reads both branches, compares the intent of each track's changes, and resolves directly. Never delegate to a Dev track.

**Prevention**: It is the PM's responsibility to separate Dev A and Dev B file scopes when writing stories during IPM.

---

## PM Session Management

| Situation | Action |
|-----------|--------|
| Starting a new iteration | Switch to a new PM session |
| Response noticeably slowing down | Switch to a new PM session immediately |

To restore context in a new session, type **"PM start"** → loads track files and this document.

---

## PM Session Git Principles

The PM session bash sandbox has no SSH key. Follow these rules strictly:

- **File edits**: Use Read / Write / Edit tools only. Never run `git commit` in bash (causes HEAD.lock issues).
- **git push**: PM runs this directly from their terminal.
- **git diff (code review)**: Use local worktree refs without `git fetch`. The worktree lives at **`~/Documents/Claude/Worktrees/[project-folder-name]-hoge`** (or `piyo`) — run `git diff origin/main...dev-hoge`. (The old `/tmp` path was retired because it's wiped on macOS restart — this is the same permanent path the ready command uses.)
- **Track files**: Managed via symlink. No git push needed.
