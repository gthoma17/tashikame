#!/bin/bash
TRACK="$1"
if [ -z "$TRACK" ]; then echo "usage: pr.sh <track>"; exit 1; fi
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
git worktree prune 2>/dev/null

[ -f .env ] && set -a && . ./.env && set +a
[ -z "$DEVBOT_TOKEN" ] && [ -f "$HOME/.strike-trio/.env" ] && set -a && . "$HOME/.strike-trio/.env" && set +a
BOT_TOKEN="${DEVBOT_TOKEN}"
if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Bot token (DEVBOT_TOKEN) not found in the project .env or global ~/.strike-trio/.env. Not opening an un-botted PR —"
  echo "   if author == approver, the merge approve gate dies. Notify the PM."
  exit 1
fi

TITLE=$(node "$REPO_DIR/commands/pr-title.mjs" "$(git -C "$REPO_DIR" log -1 --format=%s "dev-$TRACK")")

GH_TOKEN="$BOT_TOKEN" gh pr create --base main --head "dev-$TRACK" --title "$TITLE" --body ""
