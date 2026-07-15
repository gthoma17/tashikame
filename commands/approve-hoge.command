#!/bin/bash
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
PR_NUMBERS=$(gh pr list --head dev-hoge --state open --json number --jq '.[].number')
COUNT=$(printf '%s' "$PR_NUMBERS" | grep -c .)
if [ "$COUNT" -ne 1 ]; then
  echo "❌ dev-hoge does not have exactly one open PR (count=$COUNT). Stopping instead of guessing — PM, please check."
  read -n 1; exit 1
fi
gh pr review "$PR_NUMBERS" --approve
echo "✅ Approved (PR #$PR_NUMBERS) — merge with merge-hoge.command."
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
