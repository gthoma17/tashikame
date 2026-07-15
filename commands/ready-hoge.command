#!/bin/bash
REPO_URL="https://github.com/gthoma17/tashikame"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE="$HOME/Documents/Claude/Worktrees/$(basename "$REPO_DIR")-hoge"

git -C "$REPO_DIR" worktree prune 2>/dev/null

if [ ! -d "$WORKTREE" ]; then
  mkdir -p "$(dirname "$WORKTREE")"
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" worktree add "$WORKTREE" -B dev-hoge origin/main 2>/dev/null || \
  git -C "$REPO_DIR" worktree add "$WORKTREE" dev-hoge 2>/dev/null
else
  git -C "$REPO_DIR" fetch origin
  git -C "$WORKTREE" reset --hard origin/main
  git -C "$WORKTREE" clean -fd 2>/dev/null
fi

mkdir -p "$WORKTREE/documents/tracks"
ln -sf "$REPO_DIR/documents/tracks/dev-hoge.md" "$WORKTREE/documents/tracks/dev-hoge.md"

STORY=$(awk '/^## Current Story/{f=1;next} f&&match($0,/#[0-9]+/){print substr($0,RSTART+1,RLENGTH-1);exit}' "$REPO_DIR/documents/tracks/dev-hoge.md")

node "$(dirname "$0")/ready-guard.mjs" "$REPO_DIR/.env" "$STORY"
if [ "$?" -eq 3 ]; then
  echo "⚠️ Finished story — aborting ready. Assign a new story, then run again." >&2
  exit 1
fi

BEAT_HELPER="$(dirname "$0")/_emit-pm-beat.sh"
[ -f "$BEAT_HELPER" ] && source "$BEAT_HELPER"

if [ -f "$REPO_DIR/.env" ]; then
  if grep -q '^MITTE_BEAT_TRACK=' "$REPO_DIR/.env"; then
    sed 's/^MITTE_BEAT_TRACK=.*/MITTE_BEAT_TRACK=hoge/' "$REPO_DIR/.env" > "$WORKTREE/.env"
  else
    { cat "$REPO_DIR/.env"; echo "MITTE_BEAT_TRACK=hoge"; } > "$WORKTREE/.env"
  fi
  if [ -n "$STORY" ]; then
    grep -v '^MITTE_BEAT_STORY=' "$WORKTREE/.env" > "$WORKTREE/.env.tmp" && mv "$WORKTREE/.env.tmp" "$WORKTREE/.env"
    echo "MITTE_BEAT_STORY=$STORY" >> "$WORKTREE/.env"
  fi
fi

command -v emit_pm_beat >/dev/null 2>&1 && emit_pm_beat assign hoge "$REPO_DIR/.env" "$STORY"

cd "$WORKTREE"
claude --dangerously-skip-permissions "dev-hoge start"
