#!/bin/bash
# Source: mitte-beat commands/_emit-pm-beat.sh (canonical). If the beat tool changes, fix the canonical first, then match here.
# Sync: the Strike Trio skill lays this file down verbatim — do not change a single character (drift guard).
# Shared helper — emit the one PM beat that has no other trace: `assign`, the
# ledger that a story was handed to a track. POSTs a kind:'pm' white cube to the
# SAME ingest path the reporter uses, from the `ready` command at hand-off time.
#
#   emit_pm_beat <action> <track> <env_file> [story]
#     action: assign  (white cube, kind:'pm') — the only retained action
#     track:  this lane's track id
#     story:  Tracker Boot story id — groups the delivery bundle (required)
emit_pm_beat() {
  local action="$1" track="$2" env_file="$3" story="$4"
  local kind state
  case "$action" in
    assign) kind="pm"; state="assign" ;;
    *) return 0 ;;
  esac

  if [ "$action" = "assign" ] && [ -z "$story" ]; then
    echo "mitte-beat: skipping storyless assign for ${track} — no current story to attribute" >&2
    return 0
  fi

  [ -f "$env_file" ] || return 0

  local url secret
  url=$(grep -E '^MITTE_BEAT_INGEST_URL=' "$env_file" | head -1 | cut -d= -f2-)
  secret=$(grep -E '^MITTE_BEAT_INGEST_SECRET=' "$env_file" | head -1 | cut -d= -f2-)
  [ -n "$url" ] && [ -n "$secret" ] || return 0

  local ts id
  ts=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
  id="${kind}:${track}:${state}:${ts}"

  local story_field=""
  [ -n "$story" ] && story_field=",\"story\":\"${story}\""

  local attempt http_code curl_rc
  for attempt in 1 2 3; do
    http_code=$(curl -s -m 5 -o /dev/null -w '%{http_code}' -X POST "$url" \
      -H 'content-type: application/json' \
      -H "x-ingest-secret: ${secret}" \
      -d "{\"rows\":[{\"id\":\"${id}\",\"track\":\"${track}\",\"kind\":\"${kind}\",\"state\":\"${state}\",\"ts\":\"${ts}\"${story_field}}]}")
    curl_rc=$?
    if [ "$curl_rc" -eq 0 ] && [ "${http_code:-0}" -ge 200 ] && [ "${http_code:-0}" -lt 300 ]; then
      return 0
    fi
    [ "$attempt" -lt 3 ] && sleep 1
  done

  echo "⚠️  mitte-beat: failed to emit the assign white cube — ${track} #${story:-?} (curl rc=${curl_rc}, http=${http_code:-none}, 3 attempts)." >&2
  echo "   The beat may not have been ingested, so the delivery bundle may not have opened. Check the network and re-fire manually." >&2
  echo "   (The command continues — emit is not a blocker.)" >&2
  return 0
}
