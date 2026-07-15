#!/bin/bash
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
git add -A documents/ CLAUDE.md
if git diff --staged --quiet; then
  echo "📄 No document changes to persist."
else
  git commit -m "docs: persist PM documents ($(date '+%Y-%m-%d %H:%M'))"
  if git push origin main; then
    echo "✅ Documents persisted to origin/main. They will survive the next reset."
  else
    echo "❌ Push failed — on conflict, run 'git pull --rebase origin main' and double-click again."
  fi
fi
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
