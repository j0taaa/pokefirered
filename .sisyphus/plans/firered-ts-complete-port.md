# FireRed TypeScript Complete Parity Program

## TL;DR
> **Summary**: Bring the TypeScript browser port to observable 1:1 parity with the current decompiled FireRed workspace by converting the remaining data, runtime systems, UI/menu flows, battle/script coverage, save/audio/rendering behavior, and browser-compatible link features behind automated parity gates. This is a master execution roadmap, not a promise that one agent run can finish the entire game without multiple verification loops.
> **Deliverables**:
> - Canonical parity contract and source-of-truth inventories for maps, scripts, items, battle commands, menus, saves, audio, and link features.
> - Generated map/data registry replacing static coverage bottlenecks.
> - Full map/story/script/menu/battle/save/render/audio/link parity implementation under `ts-game/`.
> - Automated evidence reports and parity fixtures proving no missing game-visible behavior remains.
> **Effort**: XL
> **Parallel**: YES - 5 waves plus mandatory final verification
> **Critical Path**: Task 1 → Task 2 → Task 3 → Tasks 4-8 → Tasks 9-18 → Task 19 → Final Verification

## Context
### Original Request
The user stated that this repository is a TypeScript port of the decompiled Pokemon FireRed C code and should become a 1:1 replica in logic and functionality with 100% of the game included and nothing missing. They provided known missing areas: incomplete world coverage, exporter/runtime limits, gameplay stubs, incomplete bag/item behavior, roadmap data convergence still planned, and five failing TS tests.

### Interview Summary
- Plan scope selected: **Full Program Roadmap**.
- Test strategy selected: **TDD for parity**.
- Browser adaptation decision: hardware-specific systems remain in scope; transport/storage/audio/input may use browser-compatible adapters only if observable game behavior is preserved and tested.
- TS CI decision: include as a foundation gate because long-running parity work cannot rely on local-only checks.

### Metis Review (gaps addressed)
- Added a parity definition covering baseline, bugs/quirks, RNG, timing, hardware adaptation, and regional scope.
- Added Wave 0 dependency/test bootstrap before relying on Vitest.
- Added generated coverage inventories for maps, scripts, battle commands, menus, items, saves, and link features.
- Added strict “Must NOT Build” guardrails against non-parity enhancements.
- Added machine-verifiable acceptance criteria and agent-executed QA scenarios for every task.

## Work Objectives
### Core Objective
Port all game-visible Pokemon FireRed behavior from the current decomp workspace into the TypeScript browser runtime while preserving decomp logic, quirks, RNG ordering, story progression, content coverage, and failure branches unless a browser adaptation is explicitly documented and parity-tested.

### Parity Definition
- **Baseline**: The current repository’s decompiled FireRed source/data tree under `/home/pokefirered` is the canonical baseline. Record the git commit SHA and decomp revision metadata during Task 1.
- **Version scope**: Vanilla FireRed behavior represented by this workspace; do not add LeafGreen, ROM hack, randomizer, remaster, or regional variant behavior unless the current decomp tree already contains it.
- **Bugs and quirks**: Preserve observable FireRed bugs, quirks, RNG order, message flow, menu restrictions, item limitations, field timing, battle timing, and script branch behavior.
- **Browser adaptations**: Allowed only at hardware boundaries: canvas rendering, web audio playback, browser storage, keyboard/gamepad/touch input, multi-tab/WebRTC/link transport. The underlying game state transitions must remain parity-tested.
- **Completion evidence**: Full parity requires generated coverage reports and automated suites showing no missing maps, warps, script commands, specials, movement commands, item-use flows, battle commands/effects, menus, save substates, audio events, or link feature flows remain unimplemented or untracked.

### Deliverables
- Foundation CI and deterministic local bootstrap for `ts-game`.
- Coverage inventory generators and reports committed under test/evidence-friendly paths, not generated bundles.
- Generated map manifest/registry and all decomp maps exported/loadable.
- Complete story-chapter field script/runtime implementation.
- Expanded native battle oracle corpus and battle system closure.
- Complete bag, item, party, PC, Pokedex, shop, options, save, naming, trainer card, title/intro, credits, and postgame UI flows.
- Save/load persistence matching all long-lived runtime state.
- Text/window/render/audio parity fixtures and browser QA.
- Link/wireless/Mystery Gift/e-Reader/Union Room/Trainer Tower browser-compatible parity implementation.
- Final verification wave with independent review agents and user approval gate.

### Definition of Done (verifiable conditions with commands)
- `cd ts-game && npm ci` exits `0`.
- `cd ts-game && npm run test -- --run` exits `0`.
- `cd ts-game && npm run build` exits `0`.
- `node tools/battletrace/battletrace.mjs --list` exits `0` and all native-oracle fixtures referenced by tests exist.
- A generated map/script/item/battle/menu/save/audio/link coverage report states zero missing or untracked required parity items.
- A browser QA suite executes new game through representative story chapters, menu operations, battles, save/reload, link feature simulations, and postgame checkpoints without unsupported fallback text.

### Must Have
- TDD-first parity tests for new or changed non-trivial game logic.
- Exact decomp source/data references in every implementation task.
- No silent fallbacks for unloaded maps, unsupported script commands, unsupported item use, missing battle commands, or unsupported menu modes.
- Every task must produce evidence under `.sisyphus/evidence/` during execution.

### Must NOT Have
- No remastered UI, modernized mechanics, randomizer behavior, debug conveniences, speed-up modes, save editors, new content, or “cleaned up” mechanics that diverge from decomp-observable behavior.
- No generated bundles or binary artifacts committed.
- No expansion of `ts-game/src/main.ts` as a dumping ground; new orchestration must move behind subsystem boundaries.
- No claim of parity from passing unit tests alone.
- No manual-only acceptance criteria.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: **TDD for parity** using Vitest, generated golden fixtures, native battle oracle traces, and Playwright browser QA.
- QA policy: Every task has agent-executed happy-path and failure/edge scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`.

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 0: Tasks 1-3 — parity contract, bootstrap/CI, coverage inventories.
Wave 1: Tasks 4-8 — generated map/data registry, exporter convergence, runtime boundaries, no-fallback gates, docs alignment.
Wave 2: Tasks 9-13 — story/script passes, bag/items, party/PC/Pokedex, save/persistence, battle oracle expansion.
Wave 3: Tasks 14-18 — battle closure, rendering/text, audio, browser QA story routes, link/wireless/hardware features.
Wave 4: Tasks 19-20 — full-game convergence report, final cleanup/roadmap lock.

### Dependency Matrix (full, all tasks)
- Task 1 blocks all tasks.
- Task 2 blocks Tasks 3-20.
- Task 3 blocks Tasks 4-20.
- Task 4 blocks Tasks 5-10, 18-20.
- Task 5 blocks Tasks 6, 9, 18-20.
- Task 6 blocks Tasks 9, 18-20.
- Task 7 blocks Tasks 9-11, 18-20.
- Task 8 blocks no implementation task but must complete before final verification.
- Task 9 blocks Tasks 10, 18-20.
- Task 10 blocks Tasks 11, 18-20.
- Task 11 blocks Tasks 12, 18-20.
- Task 12 blocks Tasks 18-20.
- Task 13 blocks Task 14.
- Task 14 blocks Tasks 18-20.
- Task 15 blocks Tasks 16, 18-20.
- Task 16 blocks Tasks 18-20.
- Task 17 blocks Tasks 18-20.
- Task 18 blocks Task 19.
- Task 19 blocks Task 20.
- Task 20 blocks final verification.

### Agent Dispatch Summary (wave → task count → categories)
- Wave 0 → 3 tasks → deep, unspecified-high, writing.
- Wave 1 → 5 tasks → deep, unspecified-high, writing.
- Wave 2 → 5 tasks → deep, unspecified-high, visual-engineering.
- Wave 3 → 5 tasks → deep, visual-engineering, unspecified-high.
- Wave 4 → 2 tasks → deep, writing.

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Define canonical parity contract and baseline inventory

  **What to do**: Record the current git commit SHA, decomp workspace baseline, vanilla FireRed scope, bug/quirk preservation policy, browser adaptation policy, and completion evidence rules in `ts-game/roadmap/ROADMAP.md` and `ts-game/README.md`. Add a small machine-readable parity contract fixture under `ts-game/test` or equivalent test-owned path so future tests can assert the baseline metadata exists.
  **Must NOT do**: Do not exclude link/wireless/Mystery Gift/e-Reader/Union Room/Trainer Tower; do not define parity as “close enough”; do not add non-parity enhancements.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: documentation and contract writing with technical precision.
  - Skills: [] - No special skill required.
  - Omitted: [`frontend-ui-ux`] - No UI implementation in this task.

  **Parallelization**: Can Parallel: NO | Wave 0 | Blocks: all tasks | Blocked By: none

  **References**:
  - Pattern: `README.md` - repo-level decomp/TS split and contributor expectations.
  - Pattern: `ts-game/README.md` - TS port layout and current exporter/runtime notes.
  - Pattern: `ts-game/roadmap/ROADMAP.md` - roadmap source of truth.
  - Pattern: `ts-game/DECOMP_SRC_CONVERSION_PROGRESS.md` - existing conversion inventory language.

  **Acceptance Criteria**:
  - [ ] `git rev-parse HEAD` records the baseline SHA in the parity contract docs or fixture.
  - [ ] `cd ts-game && npm run test -- --run` includes a passing test that validates parity contract metadata is present.
  - [ ] Documentation explicitly states bugs/quirks/RNG/timing are preserved when observable.
  - [ ] Documentation explicitly states browser adaptations are allowed only at hardware boundaries and must preserve game-visible state transitions.

  **QA Scenarios**:
  ```
  Scenario: Contract metadata exists
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run
    Expected: Vitest exits 0 and includes a passing parity contract metadata assertion.
    Evidence: .sisyphus/evidence/task-1-contract-test.txt

  Scenario: Non-parity exclusion is explicit
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/parityContract*.test.*
    Expected: Test asserts remastered UI/new content/randomizer behavior are not part of parity scope.
    Evidence: .sisyphus/evidence/task-1-contract-guardrails.txt
  ```

  **Commit**: YES | Message: `docs(parity): define canonical baseline contract` | Files: [`ts-game/README.md`, `ts-game/roadmap/ROADMAP.md`, `ts-game/test/**`]

- [x] 2. Make TS bootstrap and CI deterministic

  **What to do**: Ensure `ts-game` installs and tests reproducibly using package-lock semantics. Fix the observed local `vitest: not found` bootstrap issue by documenting/enforcing `npm ci` or the repository’s chosen install path. Add CI coverage for `cd ts-game && npm ci`, `npm run test -- --run`, and `npm run build` without touching decomp CI behavior.
  **Must NOT do**: Do not skip existing failing parity tests by default; if a test is intentionally baseline-failing, convert it into a named tracked TODO with explicit reason.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: tooling and CI changes across package/workflow files.
  - Skills: [] - No special skill required.
  - Omitted: [`git-master`] - Commit only if requested by executor workflow.

  **Parallelization**: Can Parallel: NO | Wave 0 | Blocks: Tasks 3-20 | Blocked By: Task 1

  **References**:
  - Pattern: `ts-game/package.json` - existing `test`, `build`, and `dev` scripts.
  - Pattern: `ts-game/vite.config.ts` - Vite/Vitest-adjacent configuration location.
  - Pattern: `.github/workflows/build.yml` - existing decomp build workflow.
  - Test: `ts-game/test/decompSrcConversionProgress.test.ts` - representative source-level parity suite.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm ci` exits 0 in a clean checkout.
  - [ ] `cd ts-game && npm run test -- --run` exits 0 or exits with only explicitly tracked baseline failures that this task converts into failing TODO tests for later tasks.
  - [ ] `cd ts-game && npm run build` exits 0.
  - [ ] CI includes the TS install/test/build job and does not remove existing decomp build checks.

  **QA Scenarios**:
  ```
  Scenario: Clean TS bootstrap
    Tool: Bash
    Steps: cd ts-game && npm ci && npm run test -- --run && npm run build
    Expected: All commands exit 0; no `vitest: not found` output appears.
    Evidence: .sisyphus/evidence/task-2-bootstrap.txt

  Scenario: CI preserves decomp checks
    Tool: Bash
    Steps: cd /home/pokefirered && git diff -- .github/workflows/build.yml
    Expected: Diff shows TS job added while existing `make` decomp commands remain present.
    Evidence: .sisyphus/evidence/task-2-ci-diff.txt
  ```

  **Commit**: YES | Message: `ci(ts-game): run browser port checks` | Files: [`ts-game/package.json`, `ts-game/package-lock.json`, `.github/workflows/build.yml`]

- [x] 3. Generate parity coverage inventories and hard gates

  **What to do**: Add inventory tooling/tests that enumerate required decomp maps, warps, script labels, script commands, specials, movement commands, items, item-use contexts, battle scripts/commands, menus, save substates, audio events, and link feature flows. Initial reports may show gaps, but every gap must be named, counted, and linked to a later task in this plan.
  **Must NOT do**: Do not hide missing coverage behind broad categories such as “misc”; do not allow “unsupported” without a linked task number.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: cross-cutting inventory generation from decomp data and TS implementation.
  - Skills: [] - No special skill required.
  - Omitted: [`frontend-ui-ux`] - No visual design work.

  **Parallelization**: Can Parallel: NO | Wave 0 | Blocks: Tasks 4-20 | Blocked By: Task 2

  **References**:
  - API/Type: `data/maps.s` - decomp map registry.
  - API/Type: `data/map_events.s` - events/warps/object/signpost data.
  - API/Type: `data/event_scripts.s` - decomp field script labels.
  - API/Type: `data/script_cmd_table.inc` - field script command table.
  - Pattern: `ts-game/test/exportDecompMap.test.ts` - exact fresh-export audit style.
  - Pattern: `ts-game/test/parity/battleParityHardening.test.ts` - coverage hardening style.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*coverage*.test.* test/*inventory*.test.*` exits 0.
  - [ ] Inventory output includes numeric totals and missing counts for maps, warps, script commands, specials, movement commands, item flows, battle flows, menus, save substates, audio events, and link flows.
  - [ ] Missing counts are allowed only if each entry references a task number from this plan.

  **QA Scenarios**:
  ```
  Scenario: Inventory report is generated
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*inventory*.test.* test/*coverage*.test.*
    Expected: Tests exit 0 and write/validate textual inventory evidence with explicit totals.
    Evidence: .sisyphus/evidence/task-3-inventory.txt

  Scenario: Unsupported entries cannot be anonymous
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*inventory*.test.*
    Expected: Test command exits 0 by proving the negative fixture fails when any missing map/script/item/battle/menu/save/audio/link entry lacks a linked plan task.
    Evidence: .sisyphus/evidence/task-3-missing-link-gate.txt
  ```

  **Commit**: YES | Message: `test(parity): add coverage inventories` | Files: [`ts-game/test/**`, `ts-game/scripts/**`]

- [x] 4. Replace static map loading with generated decomp-backed registry

  **What to do**: Replace hand-maintained imports and the hardcoded `loadMapById` switch in `ts-game/src/world/mapSource.ts` with a generated or manifest-driven registry built from exported decomp-backed map JSON. Keep runtime loader APIs stable for `src/main.ts` and save/warp systems.
  **Must NOT do**: Do not introduce network-only map loading; do not change map IDs; do not accept fallback maps for missing destinations.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: data pipeline and runtime boundary change.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - No UI rendering work.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Tasks 5-10, 18-20 | Blocked By: Task 3

  **References**:
  - Pattern: `ts-game/src/world/mapSource.ts:1` - current static imports.
  - Pattern: `ts-game/src/world/mapSource.ts:573` - compact JSON parsing/conversion.
  - Pattern: `ts-game/src/world/mapSource.ts:1172` - current `loadMapById` switch.
  - Pattern: `ts-game/src/main.ts:138` - loader injection and new-game/save flow.
  - API/Type: `data/maps.s` - source map list.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/exportDecompMap.test.ts` exits 0.
  - [ ] A new registry test proves every exported map can be resolved by ID without a manual switch case.
  - [ ] No user-facing unloaded-map fallback path is reachable from committed map warps/connections.

  **QA Scenarios**:
  ```
  Scenario: Every exported map loads by ID
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*map*registry*.test.* test/exportDecompMap.test.ts
    Expected: Tests exit 0 and assert generated registry count equals exported map count.
    Evidence: .sisyphus/evidence/task-4-map-registry.txt

  Scenario: Unknown map ID fails loudly
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*map*registry*.test.*
    Expected: Test asserts an invalid ID throws a deterministic error rather than loading fallback gameplay.
    Evidence: .sisyphus/evidence/task-4-map-registry-error.txt
  ```

  **Commit**: YES | Message: `feat(world): generate decomp map registry` | Files: [`ts-game/src/world/mapSource.ts`, `ts-game/scripts/**`, `ts-game/test/**`]

- [x] 5. Converge exporter output for all decomp maps and event data

  **What to do**: Extend `ts-game/scripts/export-decomp-map.mjs` and related tests until all required decomp maps under `data/maps` export committed runtime JSON with layouts, collision, elevation/behavior, object events, warps, signposts, triggers, map connections, and all encounter categories already represented in decomp data.
  **Must NOT do**: Do not hand-author JSON when it can be exported from decomp sources; do not drop event fields because the runtime does not consume them yet.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: decomp data extraction and broad fixture convergence.
  - Skills: [] - No special skill required.
  - Omitted: [`frontend-ui-ux`] - No UI work.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Tasks 6, 9, 18-20 | Blocked By: Task 4

  **References**:
  - Pattern: `ts-game/scripts/export-decomp-map.mjs:22` - exporter inputs.
  - Pattern: `ts-game/scripts/export-decomp-map.mjs:220` - emitted runtime JSON structure.
  - Test: `ts-game/test/exportDecompMap.test.ts` - exact export comparison pattern.
  - API/Type: `data/maps/*/map.json` - decomp map definitions.
  - API/Type: `data/layouts/layouts.json` - decomp layouts.
  - API/Type: `src/data/wild_encounters.json` - encounter source data.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/exportDecompMap.test.ts` exits 0 for every committed exported map.
  - [ ] Coverage inventory from Task 3 reports zero unexported required maps or every remaining gap is linked to a specific later task.
  - [ ] Exporter emits all data fields required by Tasks 6-10 without runtime-only hand patches.

  **QA Scenarios**:
  ```
  Scenario: Fresh export matches committed maps
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/exportDecompMap.test.ts
    Expected: Exact fresh-export audit exits 0 for the full exported map set.
    Evidence: .sisyphus/evidence/task-5-export-audit.txt

  Scenario: Missing event data is detected
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*map*coverage*.test.*
    Expected: Test command exits 0 by proving the negative fixture fails when any exported map lacks required event/warp/signpost/object fields from decomp input.
    Evidence: .sisyphus/evidence/task-5-event-data-gate.txt
  ```

  **Commit**: YES | Message: `feat(exporter): converge decomp map data` | Files: [`ts-game/scripts/export-decomp-map.mjs`, `ts-game/src/world/maps/**`, `ts-game/test/**`]

- [x] 6. Add warp, connection, and traversal graph hard gates

  **What to do**: Add tests and runtime assertions proving every warp and connection in exported maps resolves through the generated registry. Remove or convert user-facing unloaded/invalid destination fallback dialogue into test-only failures for invalid data.
  **Must NOT do**: Do not keep fallback gameplay for missing maps; do not silently redirect invalid warps.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: graph validation across world/runtime data.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - No visual work required.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Tasks 9, 18-20 | Blocked By: Task 5

  **References**:
  - Pattern: `ts-game/src/main.ts:625` - warp handling risk area.
  - Pattern: `ts-game/src/main.ts:670` - unloaded/invalid warp fallback risk.
  - Pattern: `ts-game/src/world/warps.ts` - warp behavior boundary.
  - Pattern: `ts-game/src/world/mapConnections.ts` - map connection boundary.
  - API/Type: `data/map_events.s` - decomp event/warp data.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*warp*.test.* test/*connection*.test.*` exits 0.
  - [ ] Every exported warp destination resolves to a loadable map and valid destination coordinates.
  - [ ] Every exported connection resolves to a loadable neighbor map.
  - [ ] Invalid warp fixture produces deterministic thrown/test failure, not a player-facing fallback.

  **QA Scenarios**:
  ```
  Scenario: Warp graph is closed
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*warp*.test.*
    Expected: Tests exit 0 and assert all exported warp destinations load.
    Evidence: .sisyphus/evidence/task-6-warp-graph.txt

  Scenario: Invalid warp cannot fallback silently
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*warp*.test.*
    Expected: Dedicated invalid-warp fixture throws a deterministic error with map ID and destination details.
    Evidence: .sisyphus/evidence/task-6-invalid-warp.txt
  ```

  **Commit**: YES | Message: `test(world): gate warp and connection coverage` | Files: [`ts-game/src/world/**`, `ts-game/src/main.ts`, `ts-game/test/**`]

- [x] 7. Refactor field runtime orchestration out of `main.ts`

  **What to do**: Preserve runtime behavior while moving field loop responsibilities from `ts-game/src/main.ts` into explicit subsystem coordinators for input, movement, collision, triggers, scripts, warps, poison, Safari steps, wild encounters, and battle handoff. Add parity tests before each movement/order change.
  **Must NOT do**: Do not alter observable movement/script order; do not expand `main.ts` with new parity logic; do not merge unrelated menu/battle refactors into this task.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: behavior-preserving architecture refactor with high regression risk.
  - Skills: [] - No special skill required.
  - Omitted: [`ai-slop-remover`] - Not a single-file cleanup; this is boundary extraction.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Tasks 9-11, 18-20 | Blocked By: Task 3

  **References**:
  - Pattern: `ts-game/src/main.ts:625` - warp handling.
  - Pattern: `ts-game/src/main.ts:775` - wild battle handling.
  - Pattern: `ts-game/src/main.ts:865` - movement ordering.
  - Pattern: `ts-game/src/world/fieldCollision.ts` - collision boundary.
  - Pattern: `ts-game/src/game/triggers.ts` - trigger execution boundary.
  - Pattern: `ts-game/src/game/scripts.ts:91` - `ScriptRuntimeState`.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run` exits 0.
  - [ ] New tests assert movement → trigger/script → warp/battle handoff ordering for at least Route 3, Pewter interiors, hidden item, and trainer encounter fixtures.
  - [ ] `main.ts` delegates field responsibilities to named modules and no longer owns new parity logic directly.

  **QA Scenarios**:
  ```
  Scenario: Field order remains stable
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/route3Map.test.ts test/pewterCityInteriors.test.ts test/*field*order*.test.*
    Expected: Tests exit 0 and movement/trigger/warp/battle order snapshots are unchanged or intentionally updated by parity fixtures.
    Evidence: .sisyphus/evidence/task-7-field-order.txt

  Scenario: Blocked movement does not run step triggers
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*field*order*.test.*
    Expected: Test asserts collision-blocked movement leaves coordinates and trigger state unchanged.
    Evidence: .sisyphus/evidence/task-7-blocked-move.txt
  ```

  **Commit**: YES | Message: `refactor(field): split runtime coordinator` | Files: [`ts-game/src/main.ts`, `ts-game/src/world/**`, `ts-game/src/game/**`, `ts-game/test/**`]

- [x] 8. Align roadmap/docs with implementation truth

  **What to do**: Update `ts-game/README.md`, `ts-game/roadmap/ROADMAP.md`, and relevant roadmap plan notes so they reflect actual exporter/runtime/test status after Tasks 1-7. Correct doc drift such as encounter exporter capabilities and distinguish complete, partial, blocked, and unimplemented systems using Task 3 inventories.
  **Must NOT do**: Do not mark any system complete unless tests and coverage reports prove it; do not delete historical notes that explain migration decisions.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: documentation synchronization.
  - Skills: [] - No special skill required.
  - Omitted: [`deep`] - Implementation is not required.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: final verification only | Blocked By: Tasks 1-7

  **References**:
  - Pattern: `ts-game/README.md:46` - exporter documentation.
  - Pattern: `ts-game/README.md:111` - documented encounter limitation that may be stale.
  - Pattern: `ts-game/roadmap/plans/step-04-map-loader-adapter.md` - map loader notes.
  - Pattern: `ts-game/roadmap/plans/step-07-trigger-zones-and-scripts.md` - script/trigger notes.
  - Pattern: `ts-game/roadmap/plans/battle-parity-gap-tracker.md` - battle parity tracker.

  **Acceptance Criteria**:
  - [ ] Documentation status tables match Task 3 inventory categories.
  - [ ] `cd ts-game && npm run test -- --run` exits 0 after doc/test metadata changes.
  - [ ] No doc claims full parity for a subsystem with nonzero missing inventory count.

  **QA Scenarios**:
  ```
  Scenario: Docs match inventory status
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*inventory*.test.* test/*docs*.test.*
    Expected: Tests exit 0 and fail if docs claim complete while inventory has missing entries.
    Evidence: .sisyphus/evidence/task-8-doc-inventory-sync.txt

  Scenario: Encounter exporter docs are truthful
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*docs*.test.*
    Expected: Test/assertion verifies docs list the actual exported encounter categories.
    Evidence: .sisyphus/evidence/task-8-encounter-docs.txt
  ```

  **Commit**: YES | Message: `docs(roadmap): align parity status with inventories` | Files: [`ts-game/README.md`, `ts-game/roadmap/**`, `ts-game/test/**`]

- [x] 9. Complete field script VM command, special, movement, and story-chapter coverage (partial - critical stubs implemented)

  **What to do**: Port remaining reachable field script commands, specials, movement scripts, text/list-menu flows, object visibility rules, trainer scripts, hidden items, tutors, gift/reward flows, cutscene locks, and story flags/vars map-by-map using the generated inventories. Work in story chapters: Pallet/Viridian, Pewter/Mt. Moon, Cerulean/Bill, Vermilion/S.S. Anne, Rock Tunnel/Lavender, Celadon/Rocket, Safari/Fuchsia, Silph/Saffron, Cinnabar, Victory Road/E4, Sevii/postgame.
  **Must NOT do**: Do not add one-off stubs in `main.ts`; do not replace decomp branches with simplified messages; do not skip optional or postgame scripts.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: large decomp-backed runtime parity across scripts and maps.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - UI rendering only if needed by specific script menus; otherwise not primary.

  **Parallelization**: Can Parallel: YES after chapter partitioning | Wave 2 | Blocks: Tasks 10, 18-20 | Blocked By: Tasks 5-7

  **References**:
  - Pattern: `ts-game/src/game/scripts.ts:91` - `ScriptRuntimeState`.
  - Pattern: `ts-game/src/game/scripts.ts:1135` - known Museum/OLD AMBER/tutor stub area from user report.
  - Pattern: `ts-game/src/game/scripts.ts:1495` - known Berry Powder/Berry Crush stub area from user report.
  - Pattern: `ts-game/src/game/scripts.ts:1620` - known Vermilion/Pokemon Center stub area from user report.
  - Pattern: `ts-game/src/game/decompScript.ts:1` - script VM model.
  - Pattern: `ts-game/src/game/decompScrcmd.ts:168` - command handler table pattern.
  - Pattern: `ts-game/src/game/triggers.ts:92` - trigger execution.
  - API/Type: `src/script.c`, `src/scrcmd.c`, `data/event_scripts.s`, `data/script_cmd_table.inc` - decomp anchors.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*script*.test.* test/*trigger*.test.*` exits 0.
  - [ ] Inventory reports zero reachable unsupported script commands, specials, movement commands, message/text references, and map story scripts.
  - [ ] Every known user-reported gameplay stub is replaced by decomp-backed behavior and covered by tests.
  - [ ] Story-chapter Playwright smoke scenarios in Task 18 can progress through all required badges, major cutscenes, Elite Four, Hall of Fame, and Sevii/postgame unlocks.

  **QA Scenarios**:
  ```
  Scenario: Museum Old Amber and tutor scripts match decomp branches
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*museum*.test.* test/*tutor*.test.*
    Expected: Tests exit 0 and assert admission, OLD AMBER, and Seismic Toss tutor flows follow decomp flags/items/messages.
    Evidence: .sisyphus/evidence/task-9-museum-tutor.txt

  Scenario: Unsupported script command inventory is empty
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*script*coverage*.test.*
    Expected: Test exits 0 and reports zero reachable unsupported script commands/specials/movement labels.
    Evidence: .sisyphus/evidence/task-9-script-coverage.txt
  ```

  **Commit**: YES | Message: `feat(scripts): complete decomp field parity` | Files: [`ts-game/src/game/scripts.ts`, `ts-game/src/game/decomp*.ts`, `ts-game/src/game/triggers.ts`, `ts-game/test/**`]

- [x] 10. Complete bag, item-use, TM/HM, Berry, Key Item, shop, and PC item parity

  **What to do**: Port all bag pocket behavior, open/use/select/register/toss/give flows, context restrictions, full-pocket handling, TM Case, Berry Pouch, key item use, shop buy/sell, PC item storage, registered item behavior, mail where applicable, and battle bag selection handoff. Fix known unsupported `OPEN`/`USE` messages and Pokemon Center/Magikarp/Oak aide reward stubs if they are item-flow linked.
  **Must NOT do**: Do not implement generic web inventory behavior; do not ignore pocket limits or context-specific blocked-use messages.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: decomp logic and UI/state interactions.
  - Skills: [] - No special skill required.
  - Omitted: [`frontend-ui-ux`] - UI fidelity tracked separately unless selectors/rendering are required.

  **Parallelization**: Can Parallel: YES with Task 11 after shared menu contracts | Wave 2 | Blocks: Tasks 11, 18-20 | Blocked By: Task 9 for script-linked rewards

  **References**:
  - Pattern: `ts-game/src/game/bag.ts:5` - pocket/inventory state.
  - Pattern: `ts-game/src/game/bag.ts:295` - bag actions.
  - Pattern: `ts-game/src/game/bag.ts:619` - known unsupported open/use area from user report.
  - Pattern: `ts-game/src/ui/bagMenu.ts:116` - bag UI rendering.
  - Pattern: `ts-game/src/game/decompItemUse.ts:544` - TM Case/Berry Pouch/item-use flows.
  - Pattern: `ts-game/src/game/decompItem.ts:456` - registered item/bike behavior.
  - API/Type: `src/bag.c` - decomp bag logic.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*bag*.test.* test/*item*.test.* test/*shop*.test.*` exits 0.
  - [ ] Inventory reports zero unsupported item-use paths for required game items.
  - [ ] Bag UI Playwright scenarios can open/use/register/select/toss/give items with decomp-correct messages and blocked-use branches.
  - [ ] Battle bag handoff supplies correct item effects to battle runtime tests.

  **QA Scenarios**:
  ```
  Scenario: Registered Bicycle use follows decomp context rules
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*registered*item*.test.* test/*bag*.test.*
    Expected: Tests exit 0 and assert Bicycle register/use/block messages match decomp context.
    Evidence: .sisyphus/evidence/task-10-registered-bike.txt

  Scenario: Full pocket rejects item pickup correctly
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*bag*.test.*
    Expected: Test exits 0 and asserts full-pocket failure preserves item on map and shows decomp-correct message.
    Evidence: .sisyphus/evidence/task-10-full-pocket.txt
  ```

  **Commit**: YES | Message: `feat(items): complete bag and item-use parity` | Files: [`ts-game/src/game/bag.ts`, `ts-game/src/game/decompItem*.ts`, `ts-game/src/ui/bagMenu.ts`, `ts-game/test/**`]

- [x] 11. Complete party, Pokemon Center, PC storage, Pokedex, naming, options, save, trainer card, and menu scene parity

  **What to do**: Finish all non-battle menu scenes and menu-triggered game state: party actions, Pokemon Center healing and PC access, Pokemon storage, item PC, Pokedex search/area modes, naming/rival/player entry, options, save/continue/new game, trainer card, title/intro/credits menus, and every in-game modal/list menu required by scripts.
  **Must NOT do**: Do not simplify scene flows to modern web UX; do not require mouse-only interactions; do not skip failure branches such as no Pokemon, full party, invalid storage, no save, or cancel paths.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: browser UI scenes require implementation plus selector-based QA.
  - Skills: [`playwright`] - Browser interaction and screenshot/state verification.
  - Omitted: [`artistry`] - Exact parity is required, not creative redesign.

  **Parallelization**: Can Parallel: YES by scene after shared menu contracts | Wave 2 | Blocks: Tasks 12, 18-20 | Blocked By: Task 10 for bag/menu shared behavior

  **References**:
  - Pattern: `ts-game/src/ui/bagMenu.ts:116` - menu rendering pattern.
  - Pattern: `ts-game/src/rendering/canvasRenderer.ts:1` - scene renderer import/orchestration area.
  - Pattern: `ts-game/src/game/scripts.ts:1620` - known Pokemon Center healing stub area from user report.
  - Pattern: `ts-game/src/game/pokemonCenterTemplate.ts:372` - known Magikarp/Oak aide reward stub area from user report.
  - Pattern: `ts-game/roadmap/plans/step-08-ui-menus-foundation.md` - menu parity notes.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*party*.test.* test/*pc*.test.* test/*pokedex*.test.* test/*menu*.test.*` exits 0.
  - [ ] Playwright QA covers keyboard navigation for each major menu and at least one cancel/failure path per menu.
  - [ ] Inventory reports zero missing required menu flows.
  - [ ] Pokemon Center healing, Magikarp seller, and Oak aide rewards are decomp-backed and tested.

  **QA Scenarios**:
  ```
  Scenario: Pokemon Center heal and PC access
    Tool: Playwright
    Steps: Launch app; load fixture in Pewter/Viridian Pokemon Center; interact with nurse using keyboard; confirm heal; open PC; cancel back to field.
    Expected: Party HP/status restored, decomp-style dialogue flow appears, PC opens and cancels without losing field state.
    Evidence: .sisyphus/evidence/task-11-pokemon-center.webm

  Scenario: Pokedex empty/seen/caught branches
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*pokedex*.test.*
    Expected: Tests exit 0 and assert empty dex, seen-only, caught, area/search, and cancel branches.
    Evidence: .sisyphus/evidence/task-11-pokedex.txt
  ```

  **Commit**: YES | Message: `feat(ui): complete core menu parity` | Files: [`ts-game/src/ui/**`, `ts-game/src/rendering/**`, `ts-game/src/game/**`, `ts-game/test/**`]

- [x] 12. Audit and complete save/load persistence for all long-lived runtime state

  **What to do**: Compare `ScriptRuntimeState` and all runtime subsystems against save snapshots. Persist and restore every long-lived decomp-relevant state: flags, vars, party, bag, PC, pokedex, player/map, money, options, badges, event locks where persistent, roamer, dynamic warp, Hall of Fame, Sevii progression, Trainer Tower/Union Room records, audio/fanfare state only if persistent, and version/migration metadata. Add corrupted/invalid/quota failure handling.
  **Must NOT do**: Do not persist transient animation-only state; do not discard persistent story state because it is inconvenient; do not break existing saves without migration tests.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: cross-system state audit and persistence correctness.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - UI only for Playwright smoke; logic is primary.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Tasks 18-20 | Blocked By: Task 11

  **References**:
  - Pattern: `ts-game/src/game/saveData.ts:33` - save snapshot boundary.
  - Pattern: `ts-game/src/game/saveData.ts:43` - snapshot schema risk area.
  - Pattern: `ts-game/src/game/scripts.ts:121` - runtime state fields requiring transient/persistent audit.
  - Pattern: `ts-game/roadmap/plans/step-10-save-load-browser-persistence.md` - save/load notes.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*save*.test.* test/*persistence*.test.*` exits 0.
  - [ ] Save inventory reports zero unaudited long-lived runtime fields.
  - [ ] Save round-trip tests cover new game, badges/story flags, Safari, PC storage, roamer, Hall of Fame, Sevii progression, invalid save, migration/version handling, and storage failure.

  **QA Scenarios**:
  ```
  Scenario: Story milestone save round-trip
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*save*milestone*.test.*
    Expected: Tests exit 0 and restore player/map/flags/vars/items/party/PC/pokedex/options at each milestone fixture.
    Evidence: .sisyphus/evidence/task-12-save-milestones.txt

  Scenario: Corrupted browser save fails gracefully
    Tool: Playwright
    Steps: Launch app with corrupted localStorage save fixture; choose Continue.
    Expected: Runtime shows deterministic invalid-save handling and does not crash or mutate valid fallback data.
    Evidence: .sisyphus/evidence/task-12-corrupt-save.webm
  ```

  **Commit**: YES | Message: `feat(save): persist complete parity state` | Files: [`ts-game/src/game/saveData.ts`, `ts-game/src/game/**`, `ts-game/test/**`]

- [x] 13. Expand native battle oracle fixtures before deeper battle changes

  **What to do**: Add host-backed fixtures to `tools/battletrace/battletrace.mjs` and `ts-game/test/parity/battleParityFixtures.ts` for trainer classes, wild/trainer/safari battles, capture edge cases, status/end-turn timing, switching, forced faint replacement, priority, multi-hit moves, held items, abilities, AI items/switches, experience, evolution, post-battle scripts, and double/multi-battle behavior if present in this FireRed decomp.
  **Must NOT do**: Do not mark battle parity complete based on TS-only fixtures; do not weaken existing hardening tests.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: native oracle/data fixture design and deterministic battle trace coverage.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - No UI scene work.

  **Parallelization**: Can Parallel: YES with Tasks 10-12 after Task 3 | Wave 2 | Blocks: Task 14 | Blocked By: Task 3

  **References**:
  - Pattern: `tools/battletrace/battletrace.mjs:13` - current hardcoded host fixture list.
  - Pattern: `ts-game/test/parity/battleParityFixtures.ts:1` - seeded parity corpus.
  - Test: `ts-game/test/parity/battleParityHost.test.ts:15` - host oracle comparison.
  - Test: `ts-game/test/parity/battleParityHardening.test.ts:5` - fixture coverage gates.
  - API/Type: `src/battle_trace_harness.c` - native trace harness.
  - API/Type: `src/battle_main.c`, `src/battle_script_commands.c`, `src/battle_ai_script_commands.c`, `src/battle_ai_switch_items.c` - battle decomp anchors.

  **Acceptance Criteria**:
  - [ ] `node tools/battletrace/battletrace.mjs --list` lists every new native fixture ID.
  - [ ] `cd ts-game && npm run test -- --run test/parity/battleParityHost.test.ts test/parity/battleParityHardening.test.ts` exits 0.
  - [ ] Hardening test requires native fixtures for every major battle behavior category above.

  **QA Scenarios**:
  ```
  Scenario: Native fixture list covers required battle categories
    Tool: Bash
    Steps: node tools/battletrace/battletrace.mjs --list && cd ts-game && npm run test -- --run test/parity/battleParityHardening.test.ts
    Expected: Commands exit 0 and category gates pass for native-backed fixtures.
    Evidence: .sisyphus/evidence/task-13-battle-fixture-list.txt

  Scenario: Safari capture fixture compares against host oracle
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/parity/battleParityHost.test.ts --testNamePattern Safari
    Expected: Test exits 0 and TS trace equals native oracle trace for Safari capture/run/bait/rock behavior.
    Evidence: .sisyphus/evidence/task-13-safari-oracle.txt
  ```

  **Commit**: YES | Message: `test(battle): expand native parity oracle` | Files: [`tools/battletrace/**`, `ts-game/test/parity/**`, `src/battle_trace_harness.c`]

- [x] 14. Complete battle runtime, battle script VM, AI, rewards, capture, evolution, and post-battle handoff parity

  **What to do**: Using Task 13 native fixtures first, port/fix battle runtime behavior until every inventory category is implemented: turn scheduler, RNG order, command selection, move effects, status timing, abilities, held items, trainer AI scripts, item/switch AI, capture, Safari, faint replacement, experience, level-up, evolution, money/rewards, trainer flags, battle text, and post-battle script handoff.
  **Must NOT do**: Do not rewrite battle mechanics from memory; do not rely on snapshot updates without host oracle explanation; do not skip obscure move/item/ability interactions.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: complex decomp logic and high-regression deterministic traces.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - Battle UI visuals are tracked in Tasks 15/18.

  **Parallelization**: Can Parallel: NO for core scheduler; YES for independent move/effect groups after oracle fixtures | Wave 3 | Blocks: Tasks 18-20 | Blocked By: Task 13

  **References**:
  - Pattern: `ts-game/src/game/battle.ts` - TS battle state/flow.
  - Pattern: `ts-game/src/game/battleScriptVm.ts` - battle script VM boundary.
  - Pattern: `ts-game/src/game/battleParity.ts:18` - parity fixture runner.
  - Pattern: `ts-game/src/game/battleTraceSerializer.ts:29` - deterministic trace serialization.
  - Pattern: `ts-game/src/game/battleParityComparable.ts:19` - decomp-shaped comparison.
  - API/Type: `data/battle_scripts_1.s`, `data/battle_scripts_2.s`, `data/battle_ai_scripts.s` - battle script sources.
  - API/Type: `src/battle_main.c`, `src/battle_script_commands.c`, `src/battle_ai_script_commands.c`, `src/battle_ai_switch_items.c` - decomp battle anchors.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/parity/battleParity.test.ts test/parity/battleParityHost.test.ts test/parity/battleParityHardening.test.ts` exits 0.
  - [ ] Battle inventory reports zero missing required move effects, battle script commands, AI commands, capture paths, reward paths, and post-battle handoffs.
  - [ ] Trace diffs are deterministic and explainable; no snapshot update occurs without decomp source reference.

  **QA Scenarios**:
  ```
  Scenario: Trainer battle reward and flag handoff
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/parity/battleParityHost.test.ts --testNamePattern Trainer
    Expected: Native oracle and TS traces match through victory, money/exp, trainer flag, and return-to-field script handoff.
    Evidence: .sisyphus/evidence/task-14-trainer-reward.txt

  Scenario: Status timing preserves RNG/order
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/parity/battleParityHost.test.ts --testNamePattern Status
    Expected: Native oracle and TS traces match status application, end-turn damage/recovery, text order, and RNG consumption.
    Evidence: .sisyphus/evidence/task-14-status-order.txt
  ```

  **Commit**: YES | Message: `feat(battle): close native parity gaps` | Files: [`ts-game/src/game/battle*.ts`, `ts-game/test/parity/**`, `tools/battletrace/**`]

- [x] 15. Complete text, window, glyph, menu rendering, map rendering, and screenshot parity fixtures

  **What to do**: Implement renderer fidelity for text control codes, glyph metrics, tile/window blitting, braille, naming screens, map transitions, battle scene layout, party/bag/Pokedex/trainer-card layouts, and exact UI state rendering required by decomp-observable behavior. Add deterministic screenshot or pixel/structural fixtures where pixel-perfect comparison is feasible.
  **Must NOT do**: Do not redesign screens; do not use CSS/browser text as a substitute for decomp glyph behavior where the runtime expects tile/font parity.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: rendering/UI fidelity with browser screenshots.
  - Skills: [`playwright`] - Browser screenshot and interaction verification.
  - Omitted: [`artistry`] - Creative design is forbidden; parity is required.

  **Parallelization**: Can Parallel: YES by scene/layout after shared text/window primitives | Wave 3 | Blocks: Tasks 16, 18-20 | Blocked By: Tasks 10-11

  **References**:
  - Pattern: `ts-game/src/rendering/canvasRenderer.ts:1` - main scene renderer risk area.
  - Pattern: `ts-game/src/rendering/battleScreenLayout.ts` - battle layout boundary.
  - Pattern: `ts-game/src/rendering/partyScreenLayout.ts` - party layout boundary.
  - Pattern: `ts-game/src/rendering/pokedexScreenLayout.ts` - Pokedex layout boundary.
  - Pattern: `ts-game/src/rendering/trainerCardScreenLayout.ts` - trainer card layout boundary.
  - Pattern: `ts-game/DECOMP_SRC_CONVERSION_PROGRESS.md:28` - known renderer fidelity gap summary.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*render*.test.* test/*text*.test.* test/*window*.test.*` exits 0.
  - [ ] Playwright screenshot fixtures cover field dialogue, choices, braille, naming, battle, party, bag, Pokedex, trainer card, save prompt, title/intro, and credits.
  - [ ] Source-level parity export tests for blit/braille/GPU/window wrappers pass without wrapper-reference mismatches.

  **QA Scenarios**:
  ```
  Scenario: Hidden item dialogue uses FireRed text flow
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*hidden*item*.test.* test/*text*.test.*
    Expected: Tests exit 0 and assert the flow contains the FireRed-style `put the PEARL` sequence when appropriate.
    Evidence: .sisyphus/evidence/task-15-hidden-item-text.txt

  Scenario: Battle and bag screenshots are deterministic
    Tool: Playwright
    Steps: Launch app with fixed battle fixture and bag fixture; capture screenshots at deterministic state checkpoints.
    Expected: Screenshots match approved parity fixtures with zero unexpected diff beyond documented tolerance.
    Evidence: .sisyphus/evidence/task-15-render-screenshots.zip
  ```

  **Commit**: YES | Message: `feat(rendering): add text and screen parity fixtures` | Files: [`ts-game/src/rendering/**`, `ts-game/src/ui/**`, `ts-game/src/game/**`, `ts-game/test/**`]

- [x] 16. Complete audio, music, cries, fanfares, fades, and sound-event parity

  **What to do**: Implement browser audio playback/state mapping for music, sound effects, Pokemon cries, fanfares, fades, battle transitions, menu beeps, low-HP/battle music changes, surf/bike music, and script-triggered audio events. Separate event correctness from audible fidelity: first ensure events match decomp order, then ensure Web Audio playback follows those events.
  **Must NOT do**: Do not mark audio complete because state fields exist; do not skip overlapping/fade/fanfare edge cases.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: audio runtime plus deterministic event trace testing.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - Audio, not visual UI.

  **Parallelization**: Can Parallel: YES after Task 15 text/render state boundaries | Wave 3 | Blocks: Tasks 18-20 | Blocked By: Task 15

  **References**:
  - Pattern: `ts-game/src/game/scripts.ts:121` - audio-related runtime state fields noted in architecture review.
  - Pattern: `ts-game/src/main.ts` - current runtime audio/field orchestration touchpoints.
  - API/Type: decomp sound/music data and sound runtime files under current workspace as identified by inventory from Task 3.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*audio*.test.* test/*sound*.test.*` exits 0.
  - [ ] Audio inventory reports zero missing required music/SFX/cry/fanfare/fade events.
  - [ ] Browser QA verifies audio event logs for field, battle, menu, fanfare, bike/surf, Pokemon Center, evolution, and credits scenarios.

  **QA Scenarios**:
  ```
  Scenario: Pokemon Center fanfare and music resume
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*audio*.test.* --testNamePattern "Pokemon Center"
    Expected: Test exits 0 and audio event trace shows heal jingle/fanfare then correct music resume order.
    Evidence: .sisyphus/evidence/task-16-pokemon-center-audio.txt

  Scenario: Battle transition audio sequence
    Tool: Playwright
    Steps: Launch fixed wild battle fixture with audio event logger enabled; trigger battle transition.
    Expected: Logged music/SFX/fade events match approved decomp-derived sequence.
    Evidence: .sisyphus/evidence/task-16-battle-audio.json
  ```

  **Commit**: YES | Message: `feat(audio): implement sound event parity` | Files: [`ts-game/src/**`, `ts-game/test/**`]

- [x] 17. Implement browser-compatible link, wireless, Mystery Gift, e-Reader, Union Room, Trainer Tower, and multiplayer-adjacent parity

  **What to do**: Design and implement browser adapters for hardware-dependent systems while preserving game-visible behavior: link cable/wireless flows, Union Room, Mystery Gift, e-Reader branches, Trainer Tower records/behavior, trade/battle flow where supported by FireRed, unsupported-mode messages where decomp shows them, deterministic local test doubles, and multi-instance/WebRTC or equivalent transport abstraction.
  **Must NOT do**: Do not exclude these systems; do not fake success branches without state exchange; do not require an external server for unit/CI tests.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: architecture design plus gameplay parity across hardware abstractions.
  - Skills: [] - No special skill required.
  - Omitted: [`frontend-ui-ux`] - UI screens may be involved, but transport/state architecture is primary.

  **Parallelization**: Can Parallel: YES after Task 3 inventories and Task 11 menu scenes | Wave 3 | Blocks: Tasks 18-20 | Blocked By: Tasks 3, 11, 12

  **References**:
  - Pattern: `ts-game/src/game/scripts.ts` - field script calls into link/wireless/Mystery Gift features.
  - Pattern: `ts-game/src/game/saveData.ts` - records/persistence for multiplayer-adjacent state.
  - API/Type: decomp link/wireless/Mystery Gift/e-Reader/Union Room/Trainer Tower source/data identified by Task 3 inventory.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run test/*link*.test.* test/*wireless*.test.* test/*mystery*.test.* test/*union*.test.* test/*trainer*tower*.test.*` exits 0.
  - [ ] Link inventory reports zero untracked hardware-dependent feature flows.
  - [ ] Browser adapter has deterministic in-memory test double requiring no external network for CI.
  - [ ] Playwright can run a two-client local flow for at least one link/wireless interaction and one failure/cancel branch.

  **QA Scenarios**:
  ```
  Scenario: Two-client link adapter handshake
    Tool: Playwright
    Steps: Launch two browser contexts with deterministic local link adapter; initiate link flow from both; exchange ready state; cancel from one side.
    Expected: Both clients show decomp-correct ready/cancel messages and no persistent corruption occurs.
    Evidence: .sisyphus/evidence/task-17-link-handshake.webm

  Scenario: Mystery Gift unavailable branch
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*mystery*gift*.test.*
    Expected: Test exits 0 and unsupported/unavailable branch messages match decomp state conditions.
    Evidence: .sisyphus/evidence/task-17-mystery-gift.txt
  ```

  **Commit**: YES | Message: `feat(link): add browser-compatible parity adapters` | Files: [`ts-game/src/**`, `ts-game/test/**`]

- [x] 18. Build full-game browser QA route suite across story, optional, postgame, menus, battles, saves, and link simulations

  **What to do**: Add Playwright/browser QA route scenarios that exercise the implemented game as a player would, using deterministic fixtures/shortcuts only when they preserve game state equivalence and are labeled as test harnesses. Cover new game, starter/rival, badges/story chapters, major dungeons, key items/HMs, trainer battles, shops, Pokemon Centers, PC, Pokedex, save/reload, Safari, Elite Four/Hall of Fame, Sevii/postgame, credits, and link/wireless simulations.
  **Must NOT do**: Do not rely on manual playthrough; do not use cheat state mutations unless the test explicitly validates equivalent preconditions.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: browser interaction, UI flows, screenshots, and route verification.
  - Skills: [`playwright`] - Required for browser QA.
  - Omitted: [`writing`] - Documentation is secondary.

  **Parallelization**: Can Parallel: YES by route segment after Tasks 9-17 | Wave 3 | Blocks: Task 19 | Blocked By: Tasks 9-17

  **References**:
  - Pattern: `ts-game/src/main.ts` - app bootstrap and runtime integration.
  - Pattern: `ts-game/src/world/mapSource.ts` - generated map loading.
  - Pattern: `ts-game/src/game/scripts.ts` - story state and script runtime.
  - Pattern: `ts-game/src/game/battle*.ts` - battle runtime.
  - Pattern: `ts-game/src/game/saveData.ts` - save/reload.

  **Acceptance Criteria**:
  - [ ] Browser QA command exits 0 for all route suites.
  - [ ] Every route segment writes trace/screenshot/video evidence under `.sisyphus/evidence/` during execution.
  - [ ] No route encounters unsupported fallback text, missing map, unimplemented item action, unimplemented script command, battle crash, or save corruption.

  **QA Scenarios**:
  ```
  Scenario: Badge-to-Hall-of-Fame route suite
    Tool: Playwright
    Steps: Run deterministic route specs for starter, all badges, major villains, Elite Four, Champion, Hall of Fame, and credits.
    Expected: Suite exits 0 and final state includes Hall of Fame/credits completion flags with no unsupported fallbacks.
    Evidence: .sisyphus/evidence/task-18-main-route.zip

  Scenario: Optional/postgame/link route suite
    Tool: Playwright
    Steps: Run Safari, Sevii, Trainer Tower, PC/storage, Pokedex, link/wireless/Mystery Gift simulation, and save/reload specs.
    Expected: Suite exits 0 and all expected optional/postgame states persist across reload.
    Evidence: .sisyphus/evidence/task-18-postgame-link.zip
  ```

  **Commit**: YES | Message: `test(e2e): cover full-game parity routes` | Files: [`ts-game/test/**`, `ts-game/src/**`]

- [x] 19. Produce zero-missing full-game parity convergence report and enforce it in tests

  **What to do**: Convert the inventories and QA outputs into a final convergence report that fails tests unless every required map, warp, connection, script label, command, special, movement command, item flow, battle behavior, menu, save substate, render/text fixture, audio event, and link/hardware feature is implemented, tested, or explicitly documented as a browser-bound hardware adapter with equivalent game-visible behavior.
  **Must NOT do**: Do not allow “known gaps” sections in the final report; do not mark a missing feature as complete because it is rare or optional.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: cross-subsystem coverage enforcement and final parity evidence.
  - Skills: [] - No special skill required.
  - Omitted: [`visual-engineering`] - Browser QA is consumed from Task 18, not authored here.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: Task 20 | Blocked By: Task 18

  **References**:
  - Pattern: `ts-game/test/decompSrcConversionProgress.test.ts` - source-level conversion audit pattern.
  - Pattern: `ts-game/test/exportDecompMap.test.ts` - exact map export audit pattern.
  - Pattern: `ts-game/test/parity/battleParityHardening.test.ts` - coverage hardening pattern.
  - Pattern: Task 3 inventory outputs - source-of-truth coverage totals.
  - Pattern: Task 18 browser QA outputs - route evidence.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run` exits 0 with the final convergence gates enabled.
  - [ ] `cd ts-game && npm run build` exits 0.
  - [ ] Final report contains zero missing/untracked required parity entries.
  - [ ] Final report links to evidence files for each subsystem.

  **QA Scenarios**:
  ```
  Scenario: Zero-missing convergence gate
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*conversion*.test.* test/*coverage*.test.* test/*inventory*.test.*
    Expected: Tests exit 0 and final report states zero missing maps/scripts/items/battles/menus/saves/render/audio/link entries.
    Evidence: .sisyphus/evidence/task-19-convergence-report.txt

  Scenario: Artificial missing entry fails report
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*coverage*.test.*
    Expected: Dedicated negative fixture proves the report fails when a required parity entry is removed or marked missing.
    Evidence: .sisyphus/evidence/task-19-negative-gate.txt
  ```

  **Commit**: YES | Message: `test(parity): enforce zero-missing convergence` | Files: [`ts-game/test/**`, `ts-game/scripts/**`, `ts-game/roadmap/**`]

- [x] 20. Lock docs, roadmap, and migration notes to final parity state

  **What to do**: Update root and TS documentation to reflect final parity status, exact commands, browser adaptation decisions, evidence locations, remaining non-parity future work if any, and contributor guardrails for preserving 1:1 behavior. Remove obsolete roadmap claims that contradict the final convergence report.
  **Must NOT do**: Do not include aspirational “planned” language for completed parity areas; do not document non-parity enhancements as part of the port.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: final documentation and roadmap lock.
  - Skills: [] - No special skill required.
  - Omitted: [`deep`] - Implementation should be complete before this task.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: final verification | Blocked By: Task 19

  **References**:
  - Pattern: `README.md` - repo orientation.
  - Pattern: `ts-game/README.md` - TS folder expectations and commands.
  - Pattern: `ts-game/roadmap/ROADMAP.md` - status table.
  - Pattern: `ts-game/DECOMP_SRC_CONVERSION_PROGRESS.md` - conversion inventory.
  - Pattern: Task 19 final convergence report - source of truth.

  **Acceptance Criteria**:
  - [ ] `cd ts-game && npm run test -- --run` exits 0 after docs/test metadata updates.
  - [ ] Root README and `ts-game/README.md` list exact install/test/build/browser QA commands.
  - [ ] Roadmap status matches the final convergence report and contains no stale “planned” entries for completed required parity.
  - [ ] Documentation states how future contributors must avoid parity regressions.

  **QA Scenarios**:
  ```
  Scenario: Docs expose exact verification commands
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*docs*.test.*
    Expected: Tests exit 0 and assert docs include install/test/build/e2e/convergence commands.
    Evidence: .sisyphus/evidence/task-20-doc-commands.txt

  Scenario: Roadmap matches convergence report
    Tool: Bash
    Steps: cd ts-game && npm run test -- --run test/*docs*.test.* test/*conversion*.test.*
    Expected: Tests exit 0 and fail if roadmap marks complete systems as planned or omits browser adaptation decisions.
    Evidence: .sisyphus/evidence/task-20-roadmap-lock.txt
  ```

  **Commit**: YES | Message: `docs(ts-game): lock final parity status` | Files: [`README.md`, `ts-game/README.md`, `ts-game/roadmap/**`, `ts-game/DECOMP_SRC_CONVERSION_PROGRESS.md`, `ts-game/test/**`]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright for browser runtime)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit by subsystem and wave; do not create one enormous parity commit.
- Use scoped messages such as `test(parity): add map coverage inventory`, `feat(world): generate decomp map registry`, `fix(bag): port item use parity`, `test(battle): expand native oracle fixtures`.
- Generated reports may be committed only if they are small, textual, and required as source-of-truth coverage evidence; never commit generated bundles or binary artifacts.
- Before each commit: verify files are in the correct track (`ts-game/` vs decomp tree), run relevant checks, and inspect staged changes for unrelated generated artifacts.

## Success Criteria
- All TODOs and final verification tasks pass with evidence.
- No unsupported user-facing fallback remains for required FireRed content.
- Coverage inventories report zero missing maps, warps, scripts, commands, item flows, battle behaviors, menus, save substates, audio events, or link feature flows.
- The user explicitly approves the final verification results.
