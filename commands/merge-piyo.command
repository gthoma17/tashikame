#!/bin/bash
cd "$(dirname "$0")/.."
PR_NUMBER=$(gh pr list --head dev-piyo --state open --json number --jq '.[0].number')
if [ -z "$PR_NUMBER" ]; then
  echo "❌ No open PR found."
  read -n 1
  exit 1
fi

DECISION=$(gh pr view "$PR_NUMBER" --json reviewDecision --jq '.reviewDecision')
if [ "$DECISION" != "APPROVED" ]; then
  echo "❌ PR #$PR_NUMBER review is not APPROVED (current: ${DECISION:-none})."
  echo "   After the PM passes code review, approve with approve-piyo.command and try again."
  read -n 1
  exit 1
fi

gh pr merge "$PR_NUMBER" --squash --delete-branch
echo ""
echo "⏳ Syncing local main... (merge goes to acceptance=main — production is promoted after Accept)"
git fetch origin

PR_STATE=$(gh pr view "$PR_NUMBER" --json state --jq '.state')
if [ "$PR_STATE" = "MERGED" ]; then
  git push origin --force origin/main:refs/heads/dev-piyo
fi

git reset --hard origin/main
echo ""
echo "✅ Merge complete (PR #$PR_NUMBER) → deployed to acceptance. Production auto-publishes after Accept (GitHub Actions, within ~5 min)."
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
