# API-Only Elite Four Completion Playthrough

## TL;DR
> **Summary**: Run an autonomous, API-only Pokémon FireRed playthrough through Elite Four, Champion, and Hall of Fame using only semantic REST actions; fix any API/runtime blockers discovered, then verify and push changes to GitHub.
> **Deliverables**:
> - Immediate GitHub upload of the current repository state before the playthrough begins.
> - API-only playthrough harness/log that drives `POST /sessions`, `GET /state`, and `POST /actions` until Hall-of-Fame completion.
> - Checkpoint save blobs and trace evidence for each badge, Victory Road, Elite Four, Champion, and final completion.
> - Blocker-fix loop with tests/build after every fix and resume from last legitimate checkpoint.
> - Final GitHub upload after game completion if any files changed.
> **Effort**: XL
> **Parallel**: YES - 5 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Final Verification

## Context
### Original Request
The user wants the agent to beat the game through Elite Four using the text REST API only, fixing any API/game errors that prevent completion, and also upload all current work to GitHub now plus upload again after the game if changes were made.

### Interview Summary
- No further user decisions are required.
- Default strategy: API-only autonomous playthrough, not browser play, direct state mutation, or manual gameplay.
- Completion target: API-observable Champion/Hall-of-Fame/finished-game state, with final snapshot/trace evidence.
- GitHub requirement: push current branch immediately before playthrough; push again after completion if there are any new commits/changes.

### Metis Review (gaps addressed)
- Added exact API contracts and expected commands.
- Defined completion as API-observable Hall-of-Fame/Champion-completion evidence.
- Prohibited cheats: no memory edits, save mutation, teleportation, party/inventory edits, stat edits, game balance changes, or direct runtime mutation.
- Added route milestones, stuck detection thresholds, checkpoint policy, blocker-fix loop, and evidence requirements.
- Added GitHub upload tasks at start and finish with safe git rules.

## Work Objectives
### Core Objective
Beat Pokémon FireRed from a legitimate API session through Elite Four, Champion, and Hall of Fame using only semantic REST API actions, fixing any legitimate blocker that prevents API completion.

### Deliverables
- GitHub push before playthrough begins.
- `ts-game/scripts/api-elite-four-playthrough.mjs` or equivalent checked-in runner if reusable; otherwise `.sisyphus/evidence/api-elite-four-playthrough-runner.mjs` if executor chooses evidence-only scripting.
- `.sisyphus/evidence/api-elite-four-milestones.jsonl` with milestone records.
- `.sisyphus/evidence/api-elite-four-final-snapshot.json` with final API response.
- `.sisyphus/evidence/api-elite-four-final-save.json` with final save blob metadata or save payload if safe to store.
- `.sisyphus/evidence/api-elite-four-playthrough-report.md` with route summary, blocker fixes, verification results, and final GitHub upload status.
- Regression tests for every blocker fix.
- Final GitHub push after completion if there are any changes.

### Definition of Done (verifiable conditions with commands)
From `ts-game/` unless otherwise noted:
- `npm run test -- --run test/textApi*.test.ts test/api*.test.ts` exits `0`.
- `npm run test -- --run` exits `0` after any code fix and at final state.
- `npm run build` exits `0` after any code fix and at final state.
- `npm run api:build` exits `0`.
- The playthrough runner exits `0` and writes final evidence proving Hall-of-Fame or equivalent finished-game state.
- `git status --short` is clean or contains only explicitly documented ignored/generated files after final push.
- Remote GitHub branch contains a pre-playthrough upload commit/push and, if changes were made after beating the game, a final post-playthrough push.

### Must Have
- All gameplay decisions must go through REST semantic action endpoint: `POST /sessions/:id/actions`.
- The runner may read `GET /sessions/:id/state?debug=true` for routing diagnostics, but public action choice must use semantic option IDs.
- Save checkpoints must be created at each badge, before Elite Four, before Champion, and after Hall of Fame.
- Every blocker fix must be followed by focused tests, full build, and resume from last legitimate checkpoint.
- Git pushes must use non-destructive git commands: no force push unless explicitly requested by user.

### Must NOT Have
- No direct state mutation, save editing, memory editing, debug warps, teleporting, starter/team stat edits, inventory injection, encounter manipulation, weakened trainers, or balance changes.
- No browser UI/manual play as primary route.
- No user intervention during playthrough.
- No postgame/Pokédex completion expansion unless required to reach Hall of Fame.
- No network exposure/auth changes; API remains localhost-only.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after for blocker fixes; final full regression mandatory.
- QA policy: Every task writes evidence under `.sisyphus/evidence/`.
- Evidence: `.sisyphus/evidence/api-elite-four-*.{md,json,jsonl,txt}`.

## Execution Strategy
### Parallel Execution Waves
Wave 1: Task 1 (initial GitHub upload), Task 2 (API playthrough harness design/validation)
Wave 2: Task 3 (route policy and checkpointing)
Wave 3: Task 4 (full API playthrough execution + blocker loop)
Wave 4: Task 5 (final verification and docs/evidence)
Wave 5: Task 6 (post-game GitHub upload)

### Dependency Matrix
- Task 1: blocks Tasks 4-6 because user requested current upload before the playthrough.
- Task 2: blocks Tasks 3-5.
- Task 3: blocked by Task 2; blocks Task 4.
- Task 4: blocked by Tasks 1-3; blocks Tasks 5-6.
- Task 5: blocked by Task 4; blocks Task 6 and Final Verification.
- Task 6: blocked by Task 5; blocks Final Verification.

### Agent Dispatch Summary
- Wave 1 → 2 tasks → `unspecified-high`, `deep`
- Wave 2 → 1 task → `deep`
- Wave 3 → 1 task → `deep`
- Wave 4 → 1 task → `unspecified-high`
- Wave 5 → 1 task → `unspecified-high` with `git-master` skill

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Upload current repository state to GitHub before playthrough

  **What to do**: Use `git-master` workflow. Inspect `git status`, staged/unstaged changes, recent commit style, and upstream branch. Commit any relevant current text-API/playthrough plan state that is not yet committed, excluding generated bundles, `test-results/`, `.playwright-mcp/`, credentials, and unrelated dirty files unless clearly part of this work. Push current branch to GitHub using regular push; if no upstream exists, use `git push -u origin HEAD`. Record remote branch and commit hash in `.sisyphus/evidence/api-elite-four-preplay-github-upload.txt`.
  **Must NOT do**: Do not force push. Do not push secrets/generated bundles. Do not rewrite history. Do not include unrelated old workspace noise.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: safe git publication with workspace hygiene.
  - Skills: [`git-master`] - Required for git operations.
  - Omitted: [`playwright`] - No browser automation needed.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Tasks 4-6 | Blocked By: none

  **References**:
  - Plan: `.sisyphus/plans/text-api-accessible-game.md` - completed text API implementation.
  - Evidence: `.sisyphus/evidence/text-api-task-14-full-verify.txt` - current verification baseline.
  - Docs: `README.md`, `ts-game/README.md` - API docs to be uploaded.

  **Acceptance Criteria**:
  - [ ] `git status --short` inspected before staging.
  - [ ] Relevant current changes committed or documented as intentionally uncommitted.
  - [ ] `git push` or `git push -u origin HEAD` succeeds.
  - [ ] Evidence file contains remote URL/branch, pushed commit hash, and excluded file patterns.

  **QA Scenarios**:
  ```
  Scenario: Current work is uploaded
    Tool: Bash
    Steps: Run git status/log/remote checks, push to GitHub, then verify `git status` and `git log -1`.
    Expected: Remote branch contains latest intended commit; no generated artifacts or secrets staged.
    Evidence: .sisyphus/evidence/api-elite-four-preplay-github-upload.txt

  Scenario: Safe git hygiene
    Tool: Bash
    Steps: Inspect staged file list before commit/push.
    Expected: No `dist/`, `test-results/`, `.playwright-mcp/`, credentials, or unrelated files included.
    Evidence: .sisyphus/evidence/api-elite-four-preplay-git-hygiene.txt
  ```

  **Commit**: YES | Message: `Prepare API Elite Four playthrough plan` if plan/evidence changes need committing | Files: `.sisyphus/plans/api-elite-four-playthrough.md`, evidence if committed by convention

- [x] 2. Build API-only playthrough harness contract and baseline smoke

  **What to do**: Create or choose a runner location. Preferred checked-in path: `ts-game/scripts/api-elite-four-playthrough.mjs` if reusable; otherwise evidence-only script under `.sisyphus/evidence/`. The runner must start or connect to localhost API, create a session, read snapshots, choose semantic action IDs from `options`, apply actions with version, export save checkpoints, write JSONL trace, and exit nonzero on stuck/error. Validate it can complete a short smoke: create session → read state → take one enabled semantic action → save → delete session.
  **Must NOT do**: Do not call game internals directly. Do not use browser controls. Do not mutate saves. Do not invent action IDs absent from snapshots.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: automation harness defines rules for the full playthrough.
  - Skills: `[]`.
  - Omitted: [`playwright`] - API-only.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Tasks 3-5 | Blocked By: none

  **References**:
  - API docs: `ts-game/README.md:43` onward - endpoint usage.
  - Server: `ts-game/src/api/textApiServer.ts` - HTTP behavior and status codes.
  - Tests: `ts-game/test/textApiServer.test.ts`, `ts-game/test/textApiActions.test.ts`, `ts-game/test/textApiSaveReplay.test.ts`.
  - Evidence: `.sisyphus/evidence/text-api-task-14-full-verify.txt`.

  **Acceptance Criteria**:
  - [ ] Runner records every request action as `{step, mode, version, actionId, label, summary}`.
  - [ ] Runner rejects raw-control options using the existing raw-control corpus.
  - [ ] Runner writes checkpoint save blobs and trace JSONL.
  - [ ] Smoke run exits `0` and evidence includes all HTTP statuses.

  **QA Scenarios**:
  ```
  Scenario: API harness smoke
    Tool: Bash
    Steps: From ts-game/, run API server and playthrough harness in smoke mode.
    Expected: Create/read/action/save/delete flow exits 0 with valid JSON evidence.
    Evidence: .sisyphus/evidence/api-elite-four-harness-smoke.txt

  Scenario: No direct-control leakage
    Tool: Bash
    Steps: Run harness semantic validator against first 100 observed options.
    Expected: No option label/description/action contains raw controls such as A/B/START/UP/button/key.
    Evidence: .sisyphus/evidence/api-elite-four-semantic-guard.txt
  ```

  **Commit**: YES | Message: `Add API Elite Four playthrough harness` | Files: runner path, tests/evidence if committed

- [x] 3. Define deterministic FireRed route policy, milestones, and stuck recovery

  **What to do**: Encode a route policy used by the harness. Required milestones: starter choice, Boulder Badge, Cascade Badge, Thunder Badge, Rainbow Badge, Soul Badge, Marsh Badge, Volcano Badge, Earth Badge, Route 22 rival, Victory Road entry/exit, Elite Four Lorelei/Bruno/Agatha/Lance, Champion, Hall of Fame. Use semantic options and optional debug metadata for navigation diagnostics. Set starter/team policy: choose the most robust available starter option from initial flow; catching/grinding/shopping/items are allowed through API; no direct edits. Define stuck detection: 50 identical snapshot summaries+options, 200 actions without milestone progress, any API 5xx, 10 repeated failed actions, save/load failure, or battle blackout loop without recovery.
  **Must NOT do**: Do not require perfect speedrun routing. Do not use external manual steps. Do not expand to Pokédex/postgame.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: route planning and failure policy must be robust.
  - Skills: `[]`.
  - Omitted: [`git-master`] - No git work.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Task 4 | Blocked By: Task 2

  **References**:
  - Existing traces: `ts-game/test/fixtures/apiTraces/mainRoute.trace.json`, `obstacleCases.trace.json`, `encounterInterrupt.trace.json`.
  - Coverage: `ts-game/src/api/coverageMatrix.ts`.
  - Navigation tests: `ts-game/test/textApiNavigation.test.ts`.
  - Battle/menu tests: `ts-game/test/textApiBattle.test.ts`, `ts-game/test/textApiMenus.test.ts`.

  **Acceptance Criteria**:
  - [ ] Route policy file or embedded config lists every required milestone and completion detector.
  - [ ] Stuck detector and rollback behavior are implemented and tested in harness smoke/unit tests.
  - [ ] Checkpoints are written at every badge, before Elite Four, before Champion, and final completion.
  - [ ] Evidence documents allowed and forbidden automation strategies.

  **QA Scenarios**:
  ```
  Scenario: Milestone config validates
    Tool: Bash
    Steps: Run route-policy validation command or harness `--validate-route`.
    Expected: All required milestones have detector, checkpoint label, and next-goal policy.
    Evidence: .sisyphus/evidence/api-elite-four-route-policy.txt

  Scenario: Stuck detection works
    Tool: Bash
    Steps: Run harness test mode with mocked repeated snapshot/options.
    Expected: Harness exits with classified stuck error and latest checkpoint path.
    Evidence: .sisyphus/evidence/api-elite-four-stuck-detection.txt
  ```

  **Commit**: YES | Message: `Add API playthrough route policy` | Files: runner/config/tests/evidence if committed

- [ ] 4. Execute API-only full playthrough and fix blockers until Hall of Fame

  **What to do**: Run the harness against the localhost API from a fresh session. Progress through route milestones using only semantic API actions. Export save/checkpoint and append milestone evidence. If a blocker occurs, classify it, save evidence, fix the minimal API/runtime/game bug, add regression test, run focused tests + build + relevant full tests, resume from last legitimate checkpoint, and continue. Repeat until final API-observable Hall-of-Fame/Champion-completion state is reached.
  **Must NOT do**: Do not bypass progression. Do not direct-edit save/party/items/levels. Do not weaken battles. Do not accept manual intervention. Do not mark complete on Champion battle start; require post-victory completion evidence.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: long-running autonomous execution and blocker repair.
  - Skills: `[]`.
  - Omitted: [`playwright`] - API-only unless debugging browser independence later.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Tasks 5-6 | Blocked By: Tasks 1-3

  **References**:
  - API start: `ts-game/README.md` - `npm run api:start -- --port 3000`.
  - Evidence baseline: `.sisyphus/evidence/text-api-task-14-full-verify.txt`.
  - Save/replay tests: `ts-game/test/textApiSaveReplay.test.ts`.
  - Battle/menu/navigation tests for blocker regression patterns.

  **Acceptance Criteria**:
  - [ ] Milestone JSONL includes all 8 badges, Victory Road, Elite Four members, Champion defeat, and Hall-of-Fame/final state.
  - [ ] Final snapshot or trace contains machine-detectable completion marker: `Hall of Fame`, `Champion`, `League Champion`, credits/postgame save, or equivalent FireRed finished-game state.
  - [ ] Every blocker fix has a failing-before/passing-after regression test or documented non-code operational cause.
  - [ ] Final save blob exports successfully after completion.
  - [ ] No evidence of forbidden state mutation appears in trace or code diff.

  **QA Scenarios**:
  ```
  Scenario: Full API-only playthrough
    Tool: Bash
    Steps: From ts-game/, start API server and run playthrough harness full mode from a fresh session.
    Expected: Harness exits 0 only after Hall-of-Fame/finished-game API-observable state.
    Evidence: .sisyphus/evidence/api-elite-four-playthrough-report.md

  Scenario: Blocker fix loop
    Tool: Bash
    Steps: For any blocker, run focused failing test, apply minimal fix, run focused test, API tests, build, then resume checkpoint.
    Expected: Blocker is fixed without cheats and progression continues from legitimate checkpoint.
    Evidence: .sisyphus/evidence/api-elite-four-blockers.md
  ```

  **Commit**: YES | Message: `Complete API-only Elite Four playthrough` or blocker-specific messages | Files: runner/tests/fixes/evidence

- [ ] 5. Final verification, evidence consolidation, and plan closure

  **What to do**: After Hall-of-Fame completion, run focused API tests, full Vitest, build, API build, and API smoke. Consolidate evidence into `.sisyphus/evidence/api-elite-four-playthrough-report.md` with route summary, final snapshot path, final save path, test results, blocker list, and a statement that no direct state mutation/teleportation was used. Update docs only if new runner or usage instructions are committed.
  **Must NOT do**: Do not skip full tests because the playthrough succeeded. Do not include generated `dist/`, `test-results/`, `.playwright-mcp/`, or credentials in commits.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: broad verification and evidence hygiene.
  - Skills: `[]`.
  - Omitted: [`git-master`] - Git push is Task 6.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: Task 6 and Final Verification | Blocked By: Task 4

  **References**:
  - Prior final verification: `.sisyphus/evidence/text-api-task-14-full-verify.txt`.
  - Docs: `README.md`, `ts-game/README.md`.
  - Scripts: `ts-game/package.json`.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run test/textApi*.test.ts test/api*.test.ts` exits `0`.
  - [ ] `npm run test -- --run` exits `0`.
  - [ ] `npm run build` exits `0`.
  - [ ] `npm run api:build` exits `0`.
  - [ ] Final report links milestone log, final snapshot, final save, blocker fixes, and test output.
  - [ ] Artifact hygiene evidence proves generated artifacts were not staged.

  **QA Scenarios**:
  ```
  Scenario: Final regression suite
    Tool: Bash
    Steps: From ts-game/, run focused API tests, full Vitest, build, and API build.
    Expected: All commands exit 0.
    Evidence: .sisyphus/evidence/api-elite-four-final-verification.txt

  Scenario: Final evidence integrity
    Tool: Bash
    Steps: Validate final report references existing files and final snapshot contains completion marker.
    Expected: Evidence is complete and machine-checkable.
    Evidence: .sisyphus/evidence/api-elite-four-evidence-audit.txt
  ```

  **Commit**: YES | Message: `Verify API Elite Four completion` | Files: evidence/docs/tests/fixes if any

- [ ] 6. Upload post-playthrough changes to GitHub if anything changed

  **What to do**: Use `git-master` workflow after Task 5. Inspect `git status --short`. If there are no changes and latest commits are already pushed, record that no second push was needed. If there are changes, commit them atomically, excluding generated artifacts/secrets, then push current branch to GitHub. Record pushed commit hash, remote branch, and clean/dirty status in `.sisyphus/evidence/api-elite-four-postgame-github-upload.txt`.
  **Must NOT do**: Do not force push. Do not push generated bundles/test-results/.playwright-mcp. Do not leave blocker fixes unpushed.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: final safe publication.
  - Skills: [`git-master`] - Required for git operations.
  - Omitted: [`playwright`] - No browser automation needed.

  **Parallelization**: Can Parallel: NO | Wave 5 | Blocks: Final Verification | Blocked By: Task 5

  **References**:
  - Evidence from Task 1: `.sisyphus/evidence/api-elite-four-preplay-github-upload.txt`.
  - Final report: `.sisyphus/evidence/api-elite-four-playthrough-report.md`.

  **Acceptance Criteria**:
  - [ ] If changes exist, commits are created and pushed to GitHub.
  - [ ] If no changes exist, evidence says no postgame upload was necessary and includes `git status --short`/remote check.
  - [ ] Final `git status --short` has no relevant uncommitted source/test/doc/evidence changes.
  - [ ] Evidence includes latest local and remote commit hashes.

  **QA Scenarios**:
  ```
  Scenario: Postgame upload if changed
    Tool: Bash
    Steps: Inspect git status, commit relevant changes, push, verify remote contains latest commit.
    Expected: GitHub branch is up to date with local completion commits.
    Evidence: .sisyphus/evidence/api-elite-four-postgame-github-upload.txt

  Scenario: No-change postgame verification
    Tool: Bash
    Steps: If no changes, compare local HEAD to upstream and record status.
    Expected: Evidence proves no push was needed or branch already up to date.
    Evidence: .sisyphus/evidence/api-elite-four-postgame-github-upload.txt
  ```

  **Commit**: YES/NO | Message: `Publish API Elite Four completion evidence` if changes exist | Files: final evidence/docs/tests/fixes

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit Task 1 before the playthrough push if plan/evidence changes exist.
- Commit harness/route policy separately from blocker fixes.
- Commit blocker fixes atomically with their regression tests.
- Commit final evidence/docs separately.
- Push before playthrough and push again after completion if changes exist.

## Success Criteria
- GitHub contains current repository state before playthrough begins.
- The game is beaten through Elite Four/Champion/Hall-of-Fame using only REST API semantic actions.
- Final evidence proves completion with API-observable final snapshot/trace/save.
- Any encountered blocker is fixed with tests and no forbidden gameplay shortcuts.
- Final tests/build/API smoke pass.
- GitHub contains post-playthrough changes if any were made.
