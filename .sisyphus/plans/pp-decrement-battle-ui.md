# PP Decrement Battle UI Fix

## TL;DR
> **Summary**: Fix the TS browser port so move PP decrements exactly once on valid battle move use and the battle move UI displays the updated current PP when the move menu is rendered again.
> **Deliverables**:
> - TDD regression tests for PP state decrement, renderer PP text, and browser battle-flow visibility.
> - Minimal implementation fix in battle state propagation or renderer refresh path.
> - Verification evidence for focused tests, full Vitest, build, and Playwright if feasible.
> **Effort**: Short
> **Parallel**: NO
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Final Verification

## Context
### Original Request
User: "i think the PP system wasn't implement, or, at least, the UI doesn't show the current PP of each move decreasing. fix it"

### Interview Summary
- User selected **TDD first**.
- Scope is battle move PP decrement and visible battle move UI refresh.
- No broader battle rewrite, UI redesign, remaster behavior, or non-parity enhancement is in scope.

### Metis Review (gaps addressed)
- Defaulted visible timing to **when the Fight/move menu is rendered again on the next selectable player turn**, matching the normal FireRed interaction loop and avoiding non-parity live overlays during move text/animation.
- Defaulted canonical scenario to a deterministic first-move PP decrement, e.g. `TACKLE` from `35/35` to `34/35`, unless existing fixtures expose a better known move.
- Allowed a minimal test-only deterministic battle setup helper only if existing Vitest/Playwright fixtures cannot reliably enter battle and select a move.
- Added guardrails against double decrement, stale UI state, canvas assertion fragility, and battle-engine scope creep.

## Work Objectives
### Core Objective
Ensure a valid player move consumes exactly one PP and the battle move UI displays the current `ppRemaining` value rather than stale/original max PP state.

### Deliverables
- Failing-first Vitest coverage for PP decrement and zero-PP/second-use behavior.
- Failing-first renderer coverage proving `PP 35/35` becomes `PP 34/35` when selected move state changes.
- Focused browser-flow Playwright coverage if feasible using existing app/debug/test patterns.
- Minimal code change in existing battle state, script VM, selected-move refresh, or canvas renderer path.

### Definition of Done (verifiable conditions with commands)
From `ts-game/`:
- `npm run test -- --run test/battle.test.ts test/battleScriptVm.test.ts` exits `0` and includes the new PP decrement regression.
- `npm run test -- --run test/renderBattleLayout.test.ts test/battleScreenLayout.test.ts` exits `0` and proves rendered PP text uses current `ppRemaining`.
- `npx playwright test e2e/battlePp.spec.ts --reporter=line` exits `0` if the e2e spec is feasible and added.
- `npm run test -- --run` exits `0`.
- `npm run build` exits `0`.

### Must Have
- TDD sequence: tests fail before implementation for the observed bug when reproducible; if new state/render tests unexpectedly pass, record that as evidence that the remaining defect is browser-flow visibility/stale app state and continue with Task 3 reproduction before changing implementation.
- Exactly one PP consumed per valid player move use.
- Opening/selecting/canceling the move menu must not consume PP.
- Zero-PP behavior must remain blocked or fallback according to existing engine behavior.
- UI must show current PP (`ppRemaining`) in the move menu after battle control returns to move selection.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must not rewrite the battle engine, menu architecture, renderer architecture, or move script VM broadly.
- Must not add PP restoration, new move effects, DOM-only PP overlays, accessibility overlays, or remaster UI improvements.
- Must not change decomp-track source files except read-only reference use.
- Must not introduce generated bundles or binary artifacts.
- Must not rely on manual confirmation.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: TDD + Vitest, with Playwright e2e if feasible.
- QA policy: Every task has agent-executed scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = acceptable here because the fix is intentionally narrow and sequential TDD is required.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Task 1 (regression tests)
Wave 2: Task 2 (minimal implementation fix)
Wave 3: Task 3 (browser-flow visibility coverage)
Wave 4: Task 4 (verification/docs/evidence)

### Dependency Matrix (full, all tasks)
- Task 1: no blockers; blocks Tasks 2-4.
- Task 2: blocked by Task 1; blocks Tasks 3-4.
- Task 3: blocked by Task 2; blocks Task 4.
- Task 4: blocked by Tasks 1-3.

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 1 task → `quick`
- Wave 2 → 1 task → `quick`
- Wave 3 → 1 task → `quick` + Playwright skill if browser e2e is added
- Wave 4 → 1 task → `quick`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add PP decrement and renderer regressions

  **What to do**: Add TDD tests before implementation changes. Add or extend Vitest coverage so a deterministic player move starts at known PP, consumes exactly one PP on valid use, rejects/blocks a second use when PP reaches zero for a 1-PP test move, and does not consume PP on menu open/select/cancel. Add renderer/layout coverage proving battle move UI text draws current `ppRemaining` such as `PP 34/35`, not stale `PP 35/35`, after the selected move state changes. If these new tests unexpectedly pass before implementation changes, do not alter production code yet; record that result and let Task 3 reproduce the browser-flow visibility issue.
  **Must NOT do**: Do not change implementation in this task except minimal test-only fixture/helper setup. Do not weaken existing battle parity snapshots or skip tests.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: focused test addition in existing Vitest files.
  - Skills: `[]` - No special skill required unless browser automation is introduced later.
  - Omitted: `frontend-ui-ux` - No design work; this is parity/bug coverage.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Tasks 2, 3, 4 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `ts-game/test/battle.test.ts` - existing battle turn-flow, move selection, no-PP, Struggle, Grudge/Spite/Pursuit-style PP behavior tests.
  - Pattern: `ts-game/test/battleScriptVm.test.ts` - existing script-command move execution and `ppreduce` coverage.
  - Pattern: `ts-game/test/renderBattleLayout.test.ts` - existing battle renderer/layout assertion style.
  - Pattern: `ts-game/test/battleScreenLayout.test.ts` - existing PP palette/helper parity assertions.
  - API/Type: `ts-game/src/game/battle.ts` - `BattleMove` state uses `ppRemaining` and `pp`; move selection state is held in battle state.
  - API/Type: `ts-game/src/rendering/canvasRenderer.ts` - battle move menu draws `PP ${move.ppRemaining}/${move.pp}` from selected move.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Before implementation changes, at least one new PP visibility/state regression fails for the observed bug; OR the evidence explicitly states the new state/render tests already pass and the defect must be reproduced in browser flow in Task 3.
  - [ ] `npm run test -- --run test/battle.test.ts test/battleScriptVm.test.ts` produces a red/green result for the new regression, or a documented pre-existing pass.
  - [ ] `npm run test -- --run test/renderBattleLayout.test.ts test/battleScreenLayout.test.ts` produces a red/green result for stale rendered PP, or a documented pre-existing pass.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Failing state regression proves valid move consumes PP
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/battle.test.ts test/battleScriptVm.test.ts` immediately after adding tests and before implementation changes.
    Expected: Preferred result is command exits non-zero due to the new PP decrement regression, not due to unrelated failures. If command exits 0, evidence states that state-level PP decrement already works and Task 3 must reproduce the browser-flow issue before production changes.
    Evidence: .sisyphus/evidence/task-1-pp-state-red.txt

  Scenario: Failing render regression proves visible PP is stale
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/renderBattleLayout.test.ts test/battleScreenLayout.test.ts` immediately after adding tests and before implementation changes.
    Expected: Preferred result is command exits non-zero due to the new rendered PP text/current-PP regression, not due to unrelated failures. If command exits 0, evidence states that isolated renderer PP text already uses current state and Task 3 must reproduce the browser-flow issue before production changes.
    Evidence: .sisyphus/evidence/task-1-pp-render-red.txt
  ```

  **Commit**: YES | Message: `Add PP decrement regressions` | Files: `ts-game/test/battle.test.ts`, `ts-game/test/battleScriptVm.test.ts` if needed, `ts-game/test/renderBattleLayout.test.ts`, `ts-game/test/battleScreenLayout.test.ts` if needed, minimal test helper files if needed

- [x] 2. Fix PP state propagation and battle menu render refresh

  **What to do**: Make the smallest implementation change needed so the state decremented by move execution is the same state read by move selection rendering. First inspect whether the failing test points to duplicate move objects, stale `battle.moves`, stale `selectedMoveIndex`, missing active-move refresh after turn resolution, or renderer reading original metadata instead of current battle move state. Fix only that path. Preserve existing `ppreduce` semantics and ensure exactly one decrement per valid move use.
  **Must NOT do**: Do not add a second decrement path. Do not replace the renderer or battle loop. Do not mask stale state by hardcoding text or using DOM overlays.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: narrow bug fix with strong tests.
  - Skills: `[]` - No additional skill needed.
  - Omitted: `frontend-ui-ux` - Visual design is not changing.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Tasks 3, 4 | Blocked By: Task 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `ts-game/src/game/battle.ts` - move conversion/seeding, move selection limitation, selected move state, player turn selection, Struggle fallback.
  - Pattern: `ts-game/src/game/battleScriptVm.ts` - `runBattleScriptCommand(..., 'ppreduce')`, `executeBattleMoveVm()`, Spite/Encore PP logic.
  - Pattern: `ts-game/src/rendering/canvasRenderer.ts` - battle move menu `PP current/max` draw path.
  - Pattern: `ts-game/src/rendering/battleScreenLayout.ts` - `getBattlePpToMaxPpState()` and `getBattlePpLineColors()` parity helpers.
  - Test: new tests from Task 1 - red/green contract for this fix.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Task 1 state and render tests pass without weakening assertions.
  - [ ] A valid move decrements PP exactly once.
  - [ ] Menu open/select/cancel does not decrement PP.
  - [ ] Zero-PP and Struggle fallback behavior remains compatible with existing tests.
  - [ ] No unrelated snapshots are updated except if the new PP regression intentionally adds a snapshot with documented reason.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Green PP state and renderer tests
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/battle.test.ts test/battleScriptVm.test.ts test/renderBattleLayout.test.ts test/battleScreenLayout.test.ts`.
    Expected: Command exits 0; output shows the new PP decrement and rendered-current-PP tests pass.
    Evidence: .sisyphus/evidence/task-2-pp-green.txt

  Scenario: No double decrement on valid move
    Tool: Bash
    Steps: From ts-game/, run the focused test file containing the exactly-once PP assertion with Vitest, e.g. `npm run test -- --run test/battle.test.ts`.
    Expected: Command exits 0; assertion verifies one valid use changes `35/35` to `34/35`, not `33/35` or unchanged.
    Evidence: .sisyphus/evidence/task-2-no-double-decrement.txt
  ```

  **Commit**: YES | Message: `Fix battle PP display refresh` | Files: likely one or more of `ts-game/src/game/battle.ts`, `ts-game/src/game/battleScriptVm.ts`, `ts-game/src/rendering/canvasRenderer.ts`, `ts-game/src/rendering/battleScreenLayout.ts`

- [x] 3. Add browser-flow PP visibility verification

  **What to do**: Add a focused Playwright e2e if existing infrastructure can deterministically start or force a battle state. The test should enter a battle, open FIGHT, capture/verify the initial move PP display, use a move, wait until player control returns and FIGHT/move selection is available again, then verify the visible PP count decreased. Prefer existing debug/test hooks or deterministic route helpers over brittle long manual route traversal. If no reliable browser battle setup exists, document infeasibility in evidence and add an equivalent Vitest renderer integration that spies canvas text draw calls for the post-move state.
  **Must NOT do**: Do not add production-only debug UI. Do not assert by human screenshot review. Do not create a flaky long-route e2e that depends on random encounter timing.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: one focused e2e or documented fallback.
  - Skills: `playwright` - Browser interaction and canvas verification if e2e is added.
  - Omitted: `frontend-ui-ux` - No styling/design changes.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Task 4 | Blocked By: Task 2

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `ts-game/e2e/mainRoute.spec.ts` - existing Playwright route/control patterns.
  - Pattern: `ts-game/e2e/menuNavigation.spec.ts` - existing menu navigation/browser assertions.
  - Pattern: `ts-game/e2e/screenshotParity.spec.ts` - existing screenshot/canvas parity approach.
  - Config: `ts-game/playwright.config.ts` - Playwright project configuration.
  - Runtime: `ts-game/src/main.ts` - app entry and any available debug/test hooks for deterministic state.

  **Acceptance Criteria** (agent-executable only):
  - [ ] If feasible, `npx playwright test e2e/battlePp.spec.ts --reporter=line` exits `0` and asserts PP visibly decreases after move use.
  - [ ] If infeasible, evidence file explains the blocker and points to the deterministic Vitest renderer integration used instead.
  - [ ] Any new test-only hook is disabled or inert in normal production behavior and documented in test code.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Browser battle PP decreases visibly
    Tool: Playwright
    Steps: From ts-game/, run `npx playwright test e2e/battlePp.spec.ts --reporter=line`; test opens the app, enters/forces deterministic battle, opens FIGHT, records initial PP text/canvas region, uses a move, waits for next move selection, and asserts PP decreases by 1.
    Expected: Command exits 0 and reports the battle PP spec passed.
    Evidence: .sisyphus/evidence/task-3-battle-pp-e2e.txt

  Scenario: Fallback documented if browser setup is not reliable
    Tool: Bash
    Steps: If no deterministic Playwright battle setup exists, run the fallback renderer integration test and write a short blocker note explaining why Playwright was not added.
    Expected: Vitest fallback exits 0 and blocker note exists; no flaky e2e is committed.
    Evidence: .sisyphus/evidence/task-3-battle-pp-e2e-fallback.txt
  ```

  **Commit**: YES | Message: `Verify browser battle PP updates` | Files: `ts-game/e2e/battlePp.spec.ts` if feasible, or focused Vitest renderer integration/test helper files

- [x] 4. Run focused and full verification, then record evidence

  **What to do**: Run all focused commands and full relevant verification from `ts-game/`. Capture outputs to `.sisyphus/evidence/`. Confirm no generated bundles, Playwright traces, screenshots, or `test-results/` artifacts are staged unless explicitly intended as evidence under `.sisyphus/evidence/`.
  **Must NOT do**: Do not commit generated `dist/`, `test-results/`, `.playwright-mcp/`, or binary artifacts outside `.sisyphus/evidence/`.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: verification and cleanup only.
  - Skills: `[]` - No special skill required.
  - Omitted: `git-master` - Use only if user explicitly asks to commit/push after implementation.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: Final Verification | Blocked By: Tasks 1, 2, 3

  **References** (executor has NO interview context - be exhaustive):
  - Config: `ts-game/package.json` - `npm run test`, `npm run build` scripts.
  - Config: `ts-game/playwright.config.ts` - Playwright e2e command target.
  - Evidence convention: `.sisyphus/evidence/` - store command outputs for task verification.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm run test -- --run test/battle.test.ts test/battleScriptVm.test.ts` exits `0`.
  - [ ] `npm run test -- --run test/renderBattleLayout.test.ts test/battleScreenLayout.test.ts` exits `0`.
  - [ ] `npx playwright test e2e/battlePp.spec.ts --reporter=line` exits `0` if e2e was added, otherwise fallback evidence exists.
  - [ ] `npm run test -- --run` exits `0`.
  - [ ] `npm run build` exits `0`.
  - [ ] Git status shows only intended source/test/evidence files changed.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Full Vitest and build verification
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run` then `npm run build`.
    Expected: Both commands exit 0.
    Evidence: .sisyphus/evidence/task-4-full-verify.txt

  Scenario: Artifact hygiene check
    Tool: Bash
    Steps: From repo root, inspect git status after verification.
    Expected: No `dist/`, `ts-game/test-results/`, `.playwright-mcp/`, or unrelated generated artifacts are staged/committed.
    Evidence: .sisyphus/evidence/task-4-artifact-hygiene.txt
  ```

  **Commit**: YES | Message: `Verify PP decrement fix` | Files: `.sisyphus/evidence/task-*.txt` if evidence is committed by project convention; otherwise NO commit for evidence-only changes

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep
## Commit Strategy
- Commit 1: regression tests only (`Add PP decrement regressions`).
- Commit 2: minimal implementation fix (`Fix battle PP display refresh`).
- Commit 3: browser-flow/fallback verification (`Verify browser battle PP updates`).
- Commit 4: optional evidence-only commit if repository convention includes `.sisyphus/evidence/`; otherwise leave evidence local.

## Success Criteria
- User-observable battle move PP decreases after a move is used and move selection returns.
- PP state decrements exactly once per valid move use.
- Zero-PP and Struggle fallback behavior remains intact.
- State, renderer, and browser/fallback verification pass without manual inspection.
- No unrelated gameplay, UI, decomp-track, or generated artifact changes are introduced.
