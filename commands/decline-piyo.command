#!/bin/bash
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
BODY_FILE="$REPO_DIR/.review-body.md"
if [ ! -f "$BODY_FILE" ]; then echo "❌ .review-body.md not found. Write the review body first."; read -n 1; exit 1; fi
PR_NUMBERS=$(gh pr list --head dev-piyo --state open --json number --jq '.[].number')
COUNT=$(printf '%s' "$PR_NUMBERS" | grep -c .)
if [ "$COUNT" -ne 1 ]; then
  echo "❌ dev-piyo does not have exactly one open PR (count=$COUNT). Stopping instead of guessing — PM, please check."
  read -n 1; exit 1
fi
echo "── Review body to submit (PR #$PR_NUMBERS) ──"; cat "$BODY_FILE"; echo "────────────────────"
read -p "Submit as-is? (y/n) " CONFIRM
if [ "$CONFIRM" != "y" ]; then echo "Cancelled — nothing submitted."; read -n 1; exit 0; fi
gh pr review "$PR_NUMBERS" --request-changes --body-file "$BODY_FILE"
echo "✅ request-changes submitted (PR #$PR_NUMBERS)"
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
