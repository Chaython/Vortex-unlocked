#!/usr/bin/env bash
# Rebase patches/vortex-unlocked.patch onto upstream Vortex.
#
# The patch must always be ONE diff against ONE real upstream commit: that is
# what lets `git apply --3way` (used by CI) merge it onto newer upstream
# commits. This script is the only supported way to regenerate it.
#
#   bash scripts/rebase-patch.sh [<upstream-ref>]   start (default: upstream HEAD)
#   bash scripts/rebase-patch.sh --finish           write the patch + .upstream-base
#
# Start clones upstream into ./vortex-rebase, checks out the ref and applies
# the current patch with --3way. If it applies cleanly, the patch and
# .upstream-base are rewritten straight away. If not, resolve the conflict
# markers inside ./vortex-rebase, then run with --finish.
#
# Environment: UPSTREAM_URL (default Nexus-Mods/Vortex), WORKDIR (default vortex-rebase)
set -euo pipefail

cd "$(dirname "$0")/.."
UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/Nexus-Mods/Vortex.git}"
WORKDIR="${WORKDIR:-vortex-rebase}"
PATCH="patches/vortex-unlocked.patch"
BASE_FILE=".upstream-base"

die() { echo "error: $*" >&2; exit 1; }

finish() {
  [ -d "$WORKDIR/.git" ] || die "$WORKDIR does not exist - run scripts/rebase-patch.sh first."
  local root tmp idx
  root="$PWD"
  cd "$WORKDIR"

  local marked=""
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if grep -qE '^(<<<<<<<|>>>>>>>) ' "$f" 2>/dev/null; then marked="$marked"$'\n'"  $f"; fi
  done < <(git ls-files -u | cut -f2 | sort -u)
  [ -z "$marked" ] || die "conflict markers are still present in:$marked"

  git add -A
  tmp="$(mktemp)"
  git diff --cached --binary --full-index HEAD > "$tmp"
  [ -s "$tmp" ] || die "the diff against upstream is empty - nothing to write."
  grep -qE '^(<<<<<<<|>>>>>>>) ' "$tmp" && die "conflict markers found in the generated patch."

  # Round trip: the new patch must apply cleanly to pristine upstream.
  idx="$(mktemp)"
  GIT_INDEX_FILE="$idx" git read-tree HEAD
  GIT_INDEX_FILE="$idx" git apply --cached --check "$tmp" || die "generated patch does not apply to its own base."
  rm -f "$idx"

  cp "$tmp" "$root/$PATCH"
  git rev-parse HEAD > "$root/$BASE_FILE"
  rm -f "$tmp"
  echo "Wrote $PATCH ($(grep -c '^diff --git' "$root/$PATCH") files) and $BASE_FILE = $(cat "$root/$BASE_FILE")"
  echo "Commit both files together."
}

if [ "${1:-}" = "--finish" ]; then finish; exit 0; fi

REF="${1:-HEAD}"
[ -f "$PATCH" ] || die "$PATCH not found (run from the Vortex-unlocked repository)."
[ ! -e "$WORKDIR" ] || die "$WORKDIR already exists - delete it (or run with --finish)."

git clone --no-tags -q "$UPSTREAM_URL" "$WORKDIR"
(
  cd "$WORKDIR"
  git -c advice.detachedHead=false checkout -q --detach "$REF"
  echo "Upstream commit: $(git rev-parse HEAD)"
  set +e
  git apply --3way --whitespace=nowarn "../$PATCH"
  rc=$?
  set -e
  if [ "$rc" -eq 0 ] && [ -z "$(git ls-files -u)" ]; then exit 0; fi
  echo
  echo "Files with conflicts:"
  git ls-files -u | cut -f2 | sort -u | sed 's/^/  /'
  echo
  echo "Resolve the <<<<<<< / >>>>>>> markers in ./$WORKDIR, then run: scripts/rebase-patch.sh --finish"
  exit 2
) && finish
