#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TS_GAME_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd -- "${TS_GAME_DIR}/.." && pwd)"
TASKS_FILE="${REPO_ROOT}/.ralph/ralph-tasks.md"
MODEL="${RALPH_MODEL:-zai-coding-plan/glm-5.1}"
AGENT="${RALPH_AGENT:-opencode}"
MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-200}"
RALPH_BIN="${RALPH_BIN:-ralph}"
AUTO_PUSH="${RALPH_AUTO_PUSH:-1}"

usage() {
  cat <<USAGE
Run the FireRed browser-port Ralph loop with OpenCode.

Usage:
  ts-game/scripts/run-ralph-game-loop.sh [--dry-run] [--max-iterations N] [--model MODEL]

Environment overrides:
  RALPH_BIN             Ralph executable name/path. Default: ralph
  RALPH_AGENT           Ralph agent adapter. Default: opencode
  RALPH_MODEL           OpenCode model. Default: zai-coding-plan/glm-5.1
  RALPH_MAX_ITERATIONS  Max Ralph loop iterations. Default: 200
  RALPH_AUTO_PUSH       Push the current branch when Ralph exits if HEAD changed. Default: 1
Expected prerequisites:
  npm install -g @th0rgal/ralph-wiggum
  opencode configured with access to the Z.ai Coding Plan / GLM 5.1 model

By default this script pushes the current branch to GitHub once after Ralph exits, if Ralph created commits.
USAGE
}

DRY_RUN=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --max-iterations)
      MAX_ITERATIONS="${2:?Missing value for --max-iterations}"
      shift 2
      ;;
    --model)
      MODEL="${2:?Missing value for --model}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! -f "${TASKS_FILE}" ]]; then
  echo "Task file not found: ${TASKS_FILE}" >&2
  exit 1
fi

if [[ "${DRY_RUN}" != "1" ]] && ! command -v "${RALPH_BIN}" >/dev/null 2>&1; then
  cat >&2 <<ERR
Could not find '${RALPH_BIN}'.

Install Ralph first, for example:
  npm install -g @th0rgal/ralph-wiggum

Or set RALPH_BIN to the executable path.
ERR
  exit 1
fi

if [[ "${DRY_RUN}" != "1" ]] && ! command -v opencode >/dev/null 2>&1; then
  cat >&2 <<ERR
Could not find 'opencode'.

Install/configure OpenCode first and make sure it can use:
  ${MODEL}
ERR
  exit 1
fi

PROMPT="$(cat <<'PROMPT'
You are continuing the TypeScript browser port of Pokémon FireRed in this repository.

Read .ralph/ralph-tasks.md first. Pick the first unchecked task that can be completed safely, or a cohesive small group of adjacent tasks when they naturally belong together. Implement it end-to-end.

Hard rules:
- Keep browser-port work under ts-game/ except repo-root documentation updates.
- Always compare behavior and data against the original decomp C/ASM/data in this repository before implementing.
- Prefer exporter/data-driven adapters over hand-authored placeholders.
- Add/update tests for non-trivial logic.
- Run relevant checks before marking tasks complete.
- Update .ralph/ralph-tasks.md by checking off completed items and adding a short dated progress note.
- Keep the project runnable.
- Do not commit or push manually; this wrapper uploads new commits to GitHub after Ralph exits. The gh CLI is present if you need GitHub context.
- Do not commit generated bundles or binary artifacts.
- Do not stop after only tiny edits if a larger coherent task group is available.

Default checks:
cd ts-game && npm run test -- --run && npm run build
cd .. && git diff --check

If you add or change exported map data, also run relevant:
cd ts-game && npm run export:map -- <MapName>

When blocked, write the blocker and exact file paths into the Ralph progress notes, then continue with the next independent task.
PROMPT
)"

cd "${REPO_ROOT}"

current_branch() {
  git branch --show-current
}

push_current_branch() {
  local branch
  branch="$(current_branch)"
  if [[ -z "${branch}" ]]; then
    echo "Auto-push skipped: detached HEAD." >&2
    return 0
  fi

  git push -u origin "${branch}"
}

CMD=(
  "${RALPH_BIN}"
  "${PROMPT}"
  --agent "${AGENT}"
  --model "${MODEL}"
  --tasks
  --max-iterations "${MAX_ITERATIONS}"
)

echo "Repository: ${REPO_ROOT}"
echo "Task file:  ${TASKS_FILE}"
echo "Agent:      ${AGENT}"
echo "Model:      ${MODEL}"
echo "Max loops:  ${MAX_ITERATIONS}"
echo "Auto-push:  ${AUTO_PUSH}"
printf 'Command:'
printf ' %q' "${CMD[@]}"
printf '\n'

if [[ "${DRY_RUN}" == "1" ]]; then
  exit 0
fi

START_HEAD="$(git rev-parse HEAD)"

"${CMD[@]}"
RALPH_EXIT_CODE="$?"

if [[ "${AUTO_PUSH}" == "1" ]]; then
  END_HEAD="$(git rev-parse HEAD)"
  if [[ "${END_HEAD}" != "${START_HEAD}" ]]; then
    echo "Detected new commits from Ralph; pushing current branch to GitHub..."
    push_current_branch || true
  else
    echo "No new commits detected; nothing to push."
  fi
fi

exit "${RALPH_EXIT_CODE}"
