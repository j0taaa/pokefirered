# Text-Only REST API for Full Accessible Gameplay

## TL;DR
> **Summary**: Add a Node headless REST turn-loop API that lets clients play the full FireRed TypeScript port through semantic text options while the same real game runtime continues running underneath and the existing browser UI remains unchanged.
> **Deliverables**:
> - Shared headless `GameSession` runtime facade extracted from `ts-game/src/main.ts` without changing browser behavior.
> - Native Node HTTP REST API with multiple sessions, semantic-only actions, state/version checks, debug metadata toggle, and export/import save blobs.
> - Complete semantic action/description coverage for overworld, navigation/autopilot, interactions, dialogs, menus, inventory/party/PC/shop/save, field moves/obstacles, battles, trainer/wild encounters, and locked/cutscene states.
> - Automated accessibility/playability tests, replay-style API traces, browser non-regression tests, full Vitest/build verification.
> **Effort**: XL
> **Parallel**: YES - 6 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Tasks 5-9 → Tasks 10-12 → Final Verification

## Context
### Original Request
The user wants the entire game playable via text-only API. Each API call should return the current options and ask which option the player chooses next. The real game must still run under the hood, normal browser UI must still work unchanged, and everything possible in the real game must be possible through the API for blind-accessible play.

### Interview Summary
- API shape: **Node headless API**.
- Interaction model: **REST turn loop**.
- Framework: **Native Node HTTP first**; switch to Fastify only if routing becomes objectively messy.
- Sessions: **multiple concurrent sessions**.
- Public controls: **semantic-only; never expose raw button controls**.
- Descriptions: **both concise summary and expanded details**.
- Metadata: **debug metadata toggle**; absent by default.
- Save/load: **export/import save blobs**.
- Initial exposure: **localhost no auth**.
- Navigation: high-level options may auto-navigate, but normal API play must use real runtime movement/steps/input internally; no teleporting as a public gameplay action.

### Metis Review (gaps addressed)
- Defined exact REST contract and status codes.
- Added `state.version` stale-action rejection (`409`).
- Added session lifecycle, max-session, and cleanup requirements.
- Added semantic-only leakage tests to ensure raw controls are never public.
- Added explicit Node/headless compatibility tasks before extracting runtime.
- Added browser UI regression tests to protect existing play.
- Added replay/action-log and deterministic stepping scaffolding.

## Work Objectives
### Core Objective
Expose a complete, accessible semantic text API over the existing TypeScript game runtime, so clients can play through the game without visuals while all gameplay rules, timing, encounters, scripts, and browser UI behavior remain parity-preserving.

### Deliverables
- `GameSession` facade that owns the current runtime state now local to `ts-game/src/main.ts`.
- Browser adapter that uses `GameSession` and preserves existing canvas/UI/input behavior.
- Node REST server using `node:http` with endpoints:
  - `POST /sessions`
  - `GET /sessions/:id/state[?debug=true]`
  - `POST /sessions/:id/actions`
  - `GET /sessions/:id/save`
  - `POST /sessions/:id/load`
  - `DELETE /sessions/:id`
  - `GET /health`
- Structured text snapshots with `mode`, `version`, `summary`, `details`, `options`, and optional `debug`.
- Semantic action system with stable action IDs, stale-state checks, disabled reasons, and no public raw controls.
- System-specific option providers for field/world, navigation/autopilot, interactions/dialogs, menus, party/bag/PC/shop/save, battles, field moves/obstacles, and locked/cutscene states.
- Export/import save blob support and session isolation tests.
- Full automated verification including API traces, accessibility contract tests, full Vitest/build, and browser route regression.

### Definition of Done (verifiable conditions with commands)
From `ts-game/` unless otherwise noted:
- `npm run test -- --run test/textApi*.test.ts test/api*.test.ts` exits `0`.
- `npm run test -- --run` exits `0`.
- `npm run build` exits `0`.
- `node dist-api/server.mjs --host 127.0.0.1 --port 0` or the final documented API start command starts and shuts down cleanly in an automated test.
- API tests prove `POST /sessions`, state reads, actions, save export/import, stale action rejection, debug metadata toggle, semantic-only actions, and multi-session isolation.
- Playwright browser smoke tests still pass for normal UI gameplay after `GameSession` extraction.

### Must Have
- API gameplay actions are semantic only: no public `A`, `B`, `START`, `UP`, `DOWN`, button names, key names, or raw input sequences in public `options`.
- Semantic actions must compile to real runtime stepping/actions and must not directly mutate game state to bypass rules.
- High-level navigation/autopilot must use the same movement/collision/encounter/trainer/step-order systems as normal play.
- Every response includes a `version`; action requests must include the version they were based on.
- Stale action requests return `409` without advancing the game.
- Debug metadata is absent by default and only appears with `?debug=true` or equivalent explicit request.
- Multiple sessions must not share mutable game state.
- Normal browser UI must remain behaviorally unchanged.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must not create a parallel text simulation of the game.
- Must not expose raw controls publicly, even as fallback.
- Must not teleport as a normal gameplay action.
- Must not pathfind by ignoring grass, trainers, step triggers, poison, repel, Safari counters, forced movement, or cutscenes.
- Must not scrape canvas pixels/OCR for state if runtime state exists.
- Must not add auth/network exposure in initial version; bind localhost only.
- Must not add Fastify unless native HTTP routing exceeds the explicit threshold in Task 3.
- Must not break existing browser UI, Vite dev flow, save/load, or tests.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: TDD for contracts/snapshots/actions; tests-after only for mechanical refactor coverage already protected by existing tests.
- QA policy: Every task has agent-executed happy and failure scenarios.
- Evidence: `.sisyphus/evidence/text-api-task-{N}-{slug}.txt`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave is allowed only where dependencies force sequencing.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Task 1 (contracts), Task 2 (headless compatibility audit)
Wave 2: Task 3 (GameSession facade), Task 4 (Node REST shell/session manager)
Wave 3: Task 5 (snapshot/descriptions), Task 6 (semantic action engine), Task 7 (field/interactions)
Wave 4: Task 8 (navigation/autopilot), Task 9 (menus/dialogs/inventory/party/PC/shop/save), Task 10 (battle)
Wave 5: Task 11 (save/replay/concurrency), Task 12 (coverage/playability matrix)
Wave 6: Task 13 (browser parity), Task 14 (full verification/evidence/docs)

### Dependency Matrix (full, all tasks)
- Task 1: blocks Tasks 3-14.
- Task 2: blocks Tasks 3-4, 13.
- Task 3: blocked by Tasks 1-2; blocks Tasks 4-14.
- Task 4: blocked by Tasks 1,3; blocks Tasks 11,14.
- Task 5: blocked by Tasks 1,3; blocks Tasks 6-12.
- Task 6: blocked by Tasks 1,3,5; blocks Tasks 7-12.
- Task 7: blocked by Tasks 5-6; blocks Task 8 and Task 12.
- Task 8: blocked by Tasks 6-7; blocks Task 12.
- Task 9: blocked by Tasks 5-6; blocks Task 12.
- Task 10: blocked by Tasks 5-6; blocks Task 12.
- Task 11: blocked by Tasks 3-6; blocks Task 14.
- Task 12: blocked by Tasks 7-10; blocks Task 14.
- Task 13: blocked by Tasks 2-3; blocks Task 14.
- Task 14: blocked by all implementation tasks.

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 2 tasks → `deep`, `unspecified-high`
- Wave 2 → 2 tasks → `deep`, `unspecified-high`
- Wave 3 → 3 tasks → `deep`, `unspecified-high`
- Wave 4 → 3 tasks → `deep`, `unspecified-high`
- Wave 5 → 2 tasks → `unspecified-high`, `deep`
- Wave 6 → 2 tasks → `unspecified-high`, `quick`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Define public API, snapshot, and semantic action contracts

  **What to do**: Create the canonical TypeScript contract module for the text API, including `TextApiSnapshot`, `TextApiOption`, `TextApiActionRequest`, `TextApiActionResult`, `TextApiError`, `TextApiSession`, `TextApiSaveBlob`, `TextApiMode`, and JSON schemas or runtime validators if the repo pattern supports them without new dependencies. Define endpoint contracts exactly: `POST /sessions`, `GET /sessions/:id/state`, `POST /sessions/:id/actions`, `GET /sessions/:id/save`, `POST /sessions/:id/load`, `DELETE /sessions/:id`, `GET /health`. Include status codes and example JSON fixtures in tests. Public `options` must be semantic-only and must never expose raw controls.
  **Must NOT do**: Do not implement gameplay logic. Do not add Fastify. Do not expose raw button/key controls in public contracts.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: foundational contract affects every downstream task.
  - Skills: `[]` - Type/API work only.
  - Omitted: `playwright` - No browser automation needed for contract module.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Tasks 3-14 | Blocked By: none

  **References**:
  - Config: `ts-game/package.json` - current scripts/dependencies; no server framework exists.
  - Pattern: `ts-game/test/parityContract.test.ts` - contract-style tests.
  - Pattern: `ts-game/test/fixtures/parityContract.ts` - fixture-driven contract style.
  - Requirement: semantic-only public actions; debug metadata optional.

  **Acceptance Criteria**:
  - [ ] Contract tests assert required fields for all endpoint response shapes.
  - [ ] Contract tests assert `options[].id`, `label`, `description`, `category`, `enabled`, `disabledReason`, and `action` shape.
  - [ ] Contract tests fail if public option labels or payloads contain raw controls: `A`, `B`, `START`, `SELECT`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `button`, `key`.
  - [ ] Contract examples include concise `summary`, expanded `details`, `version`, and optional `debug`.

  **QA Scenarios**:
  ```
  Scenario: API contract fixtures validate
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiContract.test.ts`.
    Expected: Exit 0; fixtures for sessions/state/actions/save/errors all pass.
    Evidence: .sisyphus/evidence/text-api-task-1-contract.txt

  Scenario: Semantic-only leakage guard
    Tool: Bash
    Steps: From ts-game/, run the contract test containing the raw-control leakage corpus.
    Expected: Exit 0; public options with raw controls are rejected by tests.
    Evidence: .sisyphus/evidence/text-api-task-1-semantic-only.txt
  ```

  **Commit**: YES | Message: `Add text API contracts` | Files: `ts-game/src/api/textApiTypes.ts`, `ts-game/test/textApiContract.test.ts`, fixtures if needed

- [x] 2. Audit and isolate Node/headless runtime compatibility blockers

  **What to do**: Identify browser-only dependencies currently inside `main.ts` and runtime modules: DOM, canvas, `window`, `localStorage`, `requestAnimationFrame`, `fetch` asset loading, audio, input events. Create a compatibility report and tests/stubs proving which parts can run in Node after extraction. Introduce interfaces for storage/audio/input/render dependencies only where needed by later `GameSession`; do not refactor behavior yet.
  **Must NOT do**: Do not remove browser behavior. Do not polyfill by mutating globals in production code. Do not start the API server yet.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: careful audit plus small preparatory interfaces.
  - Skills: `[]` - No external docs needed.
  - Omitted: `playwright` - Browser tests are later.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Tasks 3-4, 13 | Blocked By: none

  **References**:
  - Runtime: `ts-game/src/main.ts` - composition root with DOM/canvas/input/audio.
  - Input: `ts-game/src/input/inputState.ts` - `InputSnapshot`, `BrowserInputAdapter`.
  - Loop: `ts-game/src/core/gameLoop.ts` - RAF-bound loop.
  - Rendering: `ts-game/src/rendering/canvasRenderer.ts` - browser/canvas adapter.
  - Storage/save: `ts-game/src/game/saveData.ts`, `ts-game/src/game/saveMigration.ts`, `ts-game/src/game/saveValidation.ts`.

  **Acceptance Criteria**:
  - [ ] Report lists every direct browser global used by runtime composition.
  - [ ] Headless-compat tests can import the non-browser contract modules under Vitest/node environment.
  - [ ] Interfaces for storage/audio/input/render dependencies are named and documented for Task 3.

  **QA Scenarios**:
  ```
  Scenario: Browser-global audit exists
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiHeadlessCompatibility.test.ts`.
    Expected: Exit 0; test documents/import-checks headless-safe modules and known browser-only modules.
    Evidence: .sisyphus/evidence/text-api-task-2-headless-audit.txt

  Scenario: No browser behavior changed
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/input*.test.ts test/save*.test.ts`.
    Expected: Exit 0.
    Evidence: .sisyphus/evidence/text-api-task-2-browser-safety.txt
  ```

  **Commit**: YES | Message: `Audit headless runtime seams` | Files: headless audit tests/docs and minimal interface files under `ts-game/src/api/` or `ts-game/src/core/`

- [x] 3. Extract shared GameSession facade without browser behavior changes

  **What to do**: Move `main.ts` runtime state ownership and update-order logic into an importable `GameSession` module. The session must own player, dialogue, script runtime, start menu, battle state, encounter state, map, NPCs, field action, trainer-see, pending Safari/battle results, and playtime/effects. Expose `step(input: InputSnapshot)`, `stepFrames(inputs)`, `getRuntimeState()`, `getRenderableState()`, `exportSaveBlob()`, `importSaveBlob()`, and cleanup hooks. Update browser `main.ts` to become a thin adapter: browser input → `session.step(...)`; renderer reads session renderable state. Existing browser behavior/order must remain unchanged.
  **Must NOT do**: Do not change gameplay order. Do not implement API endpoints. Do not remove canvas/UI paths. Do not make text API state separate from the session.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: high-risk refactor at parity boundary.
  - Skills: `[]` - Refactor/architecture.
  - Omitted: `git-master` - Commit only when requested by top-level executor.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Tasks 4-14 | Blocked By: Tasks 1, 2

  **References**:
  - Runtime: `ts-game/src/main.ts` - preserve update ordering.
  - Loop: `ts-game/src/core/gameLoop.ts` - browser loop adapter remains.
  - Field order: `ts-game/src/game/fieldOrderCoordinator.ts` - post-movement ordering.
  - Warp order: `ts-game/src/game/fieldWarpCoordinator.ts` - map transition side effects.
  - Battle sync: `ts-game/src/game/battle.ts`, `ts-game/src/game/fieldBattleHandoffCoordinator.ts` - post-battle synchronization.

  **Acceptance Criteria**:
  - [ ] Existing browser entrypoint still imports and starts normally.
  - [ ] `GameSession` tests can construct a session without DOM/canvas.
  - [ ] Existing route/main/menu/battle tests pass without changed expectations.
  - [ ] No gameplay logic is duplicated between `main.ts` and `GameSession`.

  **QA Scenarios**:
  ```
  Scenario: Headless session advances one frame
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/gameSession.test.ts`.
    Expected: Exit 0; test constructs `GameSession`, steps with neutral semantic/internal input, and reads stable runtime state.
    Evidence: .sisyphus/evidence/text-api-task-3-session.txt

  Scenario: Browser UI smoke still builds
    Tool: Bash
    Steps: From ts-game/, run `npm run build`.
    Expected: Exit 0.
    Evidence: .sisyphus/evidence/text-api-task-3-build.txt
  ```

  **Commit**: YES | Message: `Extract shared game session runtime` | Files: `ts-game/src/gameSession.ts` or `ts-game/src/core/gameSession.ts`, `ts-game/src/main.ts`, tests

- [x] 4. Add native Node HTTP REST server and multi-session manager

  **What to do**: Implement a native `node:http` server with explicit routing and safe JSON body parsing. Add `SessionManager` for multiple sessions with generated IDs, max-session limit, delete/cleanup, and no cross-session state leakage. Bind default host `127.0.0.1`, port from CLI/env, no auth. Add package scripts for building/running/testing API without new framework dependency. Switch to Fastify only if native routing exceeds this threshold: more than 8 endpoint handler branches with duplicated parse/error code after shared helpers are extracted.
  **Must NOT do**: Do not bind `0.0.0.0` by default. Do not add auth. Do not add Fastify unless threshold is documented in evidence. Do not share mutable session state.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: server/session implementation plus tests.
  - Skills: `[]` - Native Node HTTP.
  - Omitted: `playwright` - API tests use HTTP client/curl/fetch.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Tasks 11, 14 | Blocked By: Tasks 1, 3

  **References**:
  - Official docs: https://nodejs.org/api/http.html - `http.createServer`, request/response.
  - Official docs: https://nodejs.org/api/process.html - signal handling.
  - Config: `ts-game/package.json` - add scripts without disrupting existing ones.
  - Contract: Task 1 types.

  **Acceptance Criteria**:
  - [ ] `POST /sessions` returns `201` with `sessionId` and initial snapshot.
  - [ ] `GET /sessions/:id/state` returns `200` with snapshot.
  - [ ] Unknown session returns `404`.
  - [ ] Bad JSON returns `400`; oversized body returns `413`; wrong method returns `405` with `Allow` header.
  - [ ] Two sessions can diverge independently.
  - [ ] Server starts on localhost and shuts down cleanly in tests.

  **QA Scenarios**:
  ```
  Scenario: REST session lifecycle
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiServer.test.ts`.
    Expected: Exit 0; tests cover create/read/delete/404/405/400/413.
    Evidence: .sisyphus/evidence/text-api-task-4-server.txt

  Scenario: Multi-session isolation
    Tool: Bash
    Steps: From ts-game/, run the test that creates two sessions, applies different semantic actions, and compares state versions/positions.
    Expected: Exit 0; sessions diverge without shared mutable objects.
    Evidence: .sisyphus/evidence/text-api-task-4-isolation.txt
  ```

  **Commit**: YES | Message: `Add text API REST session server` | Files: `ts-game/src/api/textApiServer.ts`, `ts-game/src/api/sessionManager.ts`, `ts-game/package.json`, tests

- [x] 5. Implement snapshot observer and accessible description builder

  **What to do**: Build `StateObserver` and `DescriptionBuilder` over `GameSession`. Snapshots must include `mode`, `version`, `summary`, `details`, `options`, and optional `debug`. Modes must cover overworld, dialogue, menu, battle, transition/inputLocked, fieldAction, trainerSee, script/cutscene, save/load, and resolved battle/aftermath. `summary` should be concise accessible text; `details` should include expanded environment/state narration. Debug metadata includes map id, tile coordinates, facing, active IDs, and internal mode only when debug is requested.
  **Must NOT do**: Do not scrape canvas pixels. Do not make debug metadata required. Do not invent story/dialogue text not present in state.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: central read-only projection over many state machines.
  - Skills: `[]`.
  - Omitted: `frontend-ui-ux` - API description, not visual UI.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Tasks 6-12 | Blocked By: Tasks 1, 3

  **References**:
  - Dialogue: `ts-game/src/game/interaction.ts`, `ts-game/src/game/decompFieldMessageBox.ts`.
  - Battle: `ts-game/src/game/battle.ts`.
  - Menu: `ts-game/src/game/menu.ts`.
  - Map: `ts-game/src/world/tileMap.ts`, `ts-game/src/world/mapSource.ts`.
  - NPC: `ts-game/src/game/npc.ts`.

  **Acceptance Criteria**:
  - [ ] Snapshot without debug has no `debug` field.
  - [ ] Snapshot with debug includes map/tile/facing/internal IDs.
  - [ ] Summary/details are deterministic for identical session state.
  - [ ] Every supported mode has non-empty summary/details.

  **QA Scenarios**:
  ```
  Scenario: Snapshot description contract
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiSnapshot.test.ts`.
    Expected: Exit 0; overworld/dialogue/menu/battle/locked snapshots include summary/details and no raw controls.
    Evidence: .sisyphus/evidence/text-api-task-5-snapshot.txt

  Scenario: Debug toggle
    Tool: Bash
    Steps: From ts-game/, run API tests for `GET /state` and `GET /state?debug=true`.
    Expected: Debug absent by default, present only when requested.
    Evidence: .sisyphus/evidence/text-api-task-5-debug.txt
  ```

  **Commit**: YES | Message: `Add accessible text snapshots` | Files: `ts-game/src/api/stateObserver.ts`, `ts-game/src/api/descriptionBuilder.ts`, tests

- [x] 6. Implement semantic action engine with versioning and no raw controls

  **What to do**: Add `ActionEnumerator` and `ActionExecutor`. Every option has a stable ID scoped to the snapshot version, category, label, description, enabled state, and disabled reason. `POST /actions` requires `version` and `actionId`; stale versions return `409`; unknown actions return `400`; disabled actions return `409` or `422` with a clear error. Actions compile to real session stepping or sanctioned existing runtime intents, never direct gameplay mutation. Public options must never expose raw controls.
  **Must NOT do**: Do not expose button/key names. Do not accept arbitrary raw input payloads. Do not allow action IDs from old versions.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: core safety/semantics layer.
  - Skills: `[]`.
  - Omitted: `playwright` - API unit tests first.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Tasks 7-12 | Blocked By: Tasks 1, 3, 5

  **References**:
  - Input seam: `ts-game/src/input/inputState.ts` - internal only; not public API.
  - Field gate: `ts-game/src/game/fieldInputCoordinator.ts`.
  - Menu step: `ts-game/src/game/menu.ts`.
  - Battle step: `ts-game/src/game/battle.ts`.

  **Acceptance Criteria**:
  - [ ] Valid action advances session and returns newer version.
  - [ ] Stale action returns `409` without advancing state.
  - [ ] Invalid action returns `400`.
  - [ ] Disabled action returns clear disabled reason.
  - [ ] Tests assert no raw controls appear in options, labels, descriptions, or action payloads.

  **QA Scenarios**:
  ```
  Scenario: Versioned semantic action loop
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiActions.test.ts`.
    Expected: Exit 0; valid/stale/invalid/disabled action cases pass.
    Evidence: .sisyphus/evidence/text-api-task-6-actions.txt

  Scenario: Raw controls are forbidden
    Tool: Bash
    Steps: From ts-game/, run semantic-only leakage tests across generated snapshots.
    Expected: Exit 0; no public raw controls are exposed.
    Evidence: .sisyphus/evidence/text-api-task-6-no-raw.txt
  ```

  **Commit**: YES | Message: `Add semantic text action engine` | Files: `ts-game/src/api/actionEnumerator.ts`, `ts-game/src/api/actionExecutor.ts`, server route integration, tests

- [x] 7. Add field, interaction, dialogue, and object semantic options

  **What to do**: Implement semantic options for current-tile/facing/local field play: talk to visible NPCs, read signs, inspect/interact with objects, collect item balls/hidden items, confirm Surf/Waterfall/fishing prompts, advance dialogue, choose dialogue/multichoice/listmenu options, cancel when valid, and describe locked script/cutscene states. Options must derive from map/NPC/trigger/dialogue state and execute through existing `stepInteraction`, `stepDecompFieldDialogue`, and script systems.
  **Must NOT do**: Do not bypass script flags/vars. Do not reveal hidden items as available unless the real game state makes interaction possible or debug mode asks for metadata. Do not invent dialogue text.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: broad state/action coverage over scripts and interactions.
  - Skills: `[]`.
  - Omitted: `frontend-ui-ux`.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Task 8, Task 12 | Blocked By: Tasks 5-6

  **References**:
  - Interaction: `ts-game/src/game/interaction.ts` - `DialogueState`, `stepInteraction`.
  - Triggers: `ts-game/src/game/triggers.ts`.
  - Dialogues: `ts-game/src/game/decompFieldDialogue.ts`, `ts-game/src/game/decompScriptMenu.ts`, `ts-game/src/game/decompFieldMessageBox.ts`.
  - NPCs: `ts-game/src/game/npc.ts`.
  - Tests: `ts-game/test/interaction.test.ts`, `ts-game/test/triggers.test.ts`, `ts-game/test/scripts.test.ts`, `ts-game/test/renderFieldDialogue.test.ts`.

  **Acceptance Criteria**:
  - [ ] House/interior snapshots list NPCs/signs/interactables available in the room.
  - [ ] Dialogue snapshots expose current text and selectable choices.
  - [ ] Choosing a dialogue option updates script vars/results through existing runtime.
  - [ ] Hidden item behavior respects existing discovery/flag rules.

  **QA Scenarios**:
  ```
  Scenario: Interior interactables are playable
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiFieldInteractions.test.ts`.
    Expected: Exit 0; fixtures expose talk/read/interact options and execute them via real runtime steps.
    Evidence: .sisyphus/evidence/text-api-task-7-field.txt

  Scenario: Dialogue choices round trip
    Tool: Bash
    Steps: Run tests for yes/no, multichoice, listmenu, and cancel behavior through the API action endpoint.
    Expected: Exit 0; returned snapshots show correct next dialogue/script state.
    Evidence: .sisyphus/evidence/text-api-task-7-dialogue.txt
  ```

  **Commit**: YES | Message: `Expose field and dialogue text actions` | Files: field/dialogue option providers and tests

- [x] 8. Add semantic navigation, exits, routes, and obstacle-aware autopilot

  **What to do**: Implement high-level semantic navigation options for cities/routes/open environments: exits/routes, buildings/doors, reachable NPCs/signs/interactables, cardinal movement destinations, and obstacles. Add autopilot that computes a path but drives real runtime movement/stepping tile-by-tile. It must stop and return a new snapshot when interrupted by trainer sight, wild encounter, step trigger, dialogue, forced movement, blocked path, cutscene, obstacle requirement, or entering a new map/building. It must account for grass/water/encounter tiles by stepping through them normally, not skipping them. Cut/Strength/Rock Smash/Surf/Fishing options must report prerequisites and disabled reasons.
  **Must NOT do**: Do not teleport in normal API actions. Do not path through blocked tiles, missing field-move prerequisites, trainer sight, or step triggers. Do not hide encounter risks in descriptions.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: pathfinding plus parity-sensitive runtime stepping.
  - Skills: `[]`.
  - Omitted: `playwright`.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: Task 12 | Blocked By: Tasks 6-7

  **References**:
  - Collision: `ts-game/src/game/fieldCollision.ts`, `ts-game/src/world/tileMap.ts`.
  - Warps/connections: `ts-game/src/game/warps.ts`, `ts-game/src/game/mapConnections.ts`, `ts-game/src/game/fieldWarpCoordinator.ts`.
  - Field actions: `ts-game/src/game/fieldActions.ts`.
  - Field order: `ts-game/src/game/fieldOrderCoordinator.ts`.
  - Trainer sight: `ts-game/src/game/fieldTrainerSee.ts`.
  - Field moves: `decompFldEffCut.ts`, `decompFldEffStrength.ts`, `decompFldEffRockSmash.ts`, `decompFishing.ts`.
  - Tests: `fieldCollision.test.ts`, `warpRuntime.test.ts`, `connectionGraph.test.ts`, `fieldOrderCoordinator.test.ts`, field-move tests.

  **Acceptance Criteria**:
  - [ ] City snapshot lists exits/buildings/routes/interactables with semantic labels.
  - [ ] Route snapshot lists cardinal movement options and meaningful blocked reasons.
  - [ ] Autopilot to a reachable door uses real movement and stops on map transition.
  - [ ] Autopilot through grass can trigger normal encounters and stops at battle snapshot.
  - [ ] Trainer sight interrupts navigation and starts normal trainer flow.
  - [ ] Obstacles show required move/badge/item/prerequisite when unavailable.

  **QA Scenarios**:
  ```
  Scenario: City navigation options
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiNavigation.test.ts`.
    Expected: Exit 0; city fixtures expose buildings/routes/NPCs/signs and execute reachable navigation via runtime stepping.
    Evidence: .sisyphus/evidence/text-api-task-8-city.txt

  Scenario: Grass/trainer interruption preserves gameplay
    Tool: Bash
    Steps: Run route autopilot fixtures through grass and trainer line-of-sight.
    Expected: Exit 0; API stops at battle/dialogue when real runtime triggers them.
    Evidence: .sisyphus/evidence/text-api-task-8-interruptions.txt
  ```

  **Commit**: YES | Message: `Add semantic navigation autopilot` | Files: navigation/autopilot providers and tests

- [x] 9. Add menu, bag, party, PC, shop, save, and options semantic coverage

  **What to do**: Expose semantic options for Start menu, Pokédex, party, bag pockets/actions, item context menus, PC/storage, shops, Pokémon Center, options menu, save prompts, trainer card, and cancel/back flows. Use existing menu state rows and action systems. All visible rows/options must be readable and selectable by semantic ID. Disabled/unavailable actions must include reasons.
  **Must NOT do**: Do not expose cursor movement as raw directions. Do not alter menu ordering. Do not skip confirmation prompts.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: broad but patterned menu adapters.
  - Skills: `[]`.
  - Omitted: `playwright`.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: Task 12 | Blocked By: Tasks 5-6

  **References**:
  - Menu: `ts-game/src/game/menu.ts`.
  - Bag: `ts-game/src/game/bag.ts`.
  - Party/PC UI state: `ts-game/src/ui/partyMenu.ts`, `ts-game/src/game/pcStorage.ts`, `ts-game/src/ui/pokemonStorage.ts`.
  - Pokédex/options/save: `decompPokedexUi.ts`, `decompOptionMenu.ts`, `decompSaveMenuUtil.ts`.
  - Tests: `menu.test.ts`, `bag.test.ts`, `party.test.ts`, `pcStorage.test.ts`, `options.test.ts`, `save*.test.ts`, `shop.test.ts`.

  **Acceptance Criteria**:
  - [ ] Start menu exposes all active menu entries by semantic ID.
  - [ ] Bag exposes pockets, items, quantities, context actions, toss/register/use confirmations.
  - [ ] Party exposes Pokémon, summary, switch, item/move actions where current runtime supports them.
  - [ ] Save/export flow is accessible with confirmation/result narration.
  - [ ] Shops/PC/Pokémon Center prompts are accessible and selectable.

  **QA Scenarios**:
  ```
  Scenario: Start menu to save via API
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiMenus.test.ts`.
    Expected: Exit 0; semantic actions open menu, choose save, confirm, and return result snapshot.
    Evidence: .sisyphus/evidence/text-api-task-9-menu-save.txt

  Scenario: Bag and party actions expose readable choices
    Tool: Bash
    Steps: Run API fixtures for bag pocket/context and party list/summary/switch.
    Expected: Exit 0; no raw controls, all visible choices selectable.
    Evidence: .sisyphus/evidence/text-api-task-9-bag-party.txt
  ```

  **Commit**: YES | Message: `Expose menu and inventory text actions` | Files: menu/bag/party/PC/shop/save providers and tests

- [x] 10. Add battle semantic coverage for every battle decision state

  **What to do**: Expose battle semantic options for command selection, moves with PP/type/disabled reasons, bag choices, Poké Ball/capture, party switching, run availability, Safari Ball/Bait/Rock/Run, shift prompts, pending messages, fainted Pokémon replacement, and resolved battle/aftermath. Use `BattleState.phase` and existing helpers; add missing pure helpers where needed for party/run availability and disabled reasons. API battle actions must step through normal battle runtime and return the next decision snapshot.
  **Must NOT do**: Do not bypass battle scripts, PP consumption, item rules, capture odds, party restrictions, or trainer run prevention. Do not expose raw Fight/Bag/Pokémon/Run cursor movement; expose semantic command labels.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: battle decisions are complex and parity-sensitive.
  - Skills: `[]`.
  - Omitted: `playwright`.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: Task 12 | Blocked By: Tasks 5-6

  **References**:
  - Battle: `ts-game/src/game/battle.ts` - phases/commands/helpers.
  - Battle scripts: `ts-game/src/game/battleScriptVm.ts`.
  - Restrictions: `ts-game/src/game/decompBattleUtil.ts`.
  - Bag: `ts-game/src/game/bag.ts`, `ts-game/test/battleBag.test.ts`.
  - Tests: `battle.test.ts`, `battleScriptVm.test.ts`, `decompBattleTraceHarness.test.ts`, parity battle tests.

  **Acceptance Criteria**:
  - [ ] Battle command state exposes semantic commands with enabled/disabled reasons.
  - [ ] Move select exposes move names, PP, type, and unusable reasons.
  - [ ] Bag select exposes only battle-legal choices.
  - [ ] Party select exposes valid switch/fainted replacement choices.
  - [ ] Trainer run disabled reason is exposed; wild run availability works.
  - [ ] Safari flow options are exposed and functional.

  **QA Scenarios**:
  ```
  Scenario: Normal battle turn through API
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiBattle.test.ts`.
    Expected: Exit 0; API selects a move, consumes PP, advances battle, and returns next battle/menu/result snapshot.
    Evidence: .sisyphus/evidence/text-api-task-10-battle-turn.txt

  Scenario: Battle edge choices
    Tool: Bash
    Steps: Run API fixtures for no-PP move, trainer run block, party switch, bag item, capture, and Safari action.
    Expected: Exit 0; all choices/rejections are semantic and parity-compatible.
    Evidence: .sisyphus/evidence/text-api-task-10-battle-edges.txt
  ```

  **Commit**: YES | Message: `Expose battle text actions` | Files: battle option provider/executor/tests

- [x] 11. Add save blob, replay trace, concurrency, and lifecycle hardening

  **What to do**: Implement export/import save blobs for API sessions using existing save/runtime serialization. Add action logs with session id, version, selected action id, resulting version, and deterministic snapshot hash where feasible. Add max-session and cleanup behavior. Add tests proving imported blob creates equivalent observable state in a new session, two sessions isolate state, stale actions fail, deleted sessions fail, and replaying an action trace from a save produces the same observable state.
  **Must NOT do**: Do not store saves only server-side. Do not include private/debug-only metadata in normal save blobs unless required for correctness and documented. Do not leak sessions across tests.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: persistence/concurrency/replay robustness.
  - Skills: `[]`.
  - Omitted: `playwright`.

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: Task 14 | Blocked By: Tasks 3-6

  **References**:
  - Save: `ts-game/src/game/saveData.ts`, `saveMigration.ts`, `saveValidation.ts`.
  - Runtime: `ts-game/src/game/scripts.ts` - `ScriptRuntimeState`.
  - Session manager from Task 4.

  **Acceptance Criteria**:
  - [ ] `GET /sessions/:id/save` returns portable blob.
  - [ ] `POST /sessions/:id/load` loads blob into target session and returns equivalent observable state.
  - [ ] Action logs are deterministic enough for tests to replay short traces.
  - [ ] Max-session and delete behavior are tested.

  **QA Scenarios**:
  ```
  Scenario: Export/import save blob
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiSaveReplay.test.ts`.
    Expected: Exit 0; exported blob imported into a new session yields equivalent summary/details/debug state.
    Evidence: .sisyphus/evidence/text-api-task-11-save.txt

  Scenario: Session lifecycle hardening
    Tool: Bash
    Steps: Run tests for max sessions, delete, unknown session, and trace replay.
    Expected: Exit 0; all lifecycle errors use specified status codes.
    Evidence: .sisyphus/evidence/text-api-task-11-lifecycle.txt
  ```

  **Commit**: YES | Message: `Harden text API sessions and saves` | Files: session/save/replay modules and tests

- [x] 12. Add full semantic coverage matrix and playability trace gates

  **What to do**: Create a machine-readable coverage matrix mapping all major gameplay surfaces to text API option providers: maps/warps/connections, NPCs, signs, triggers, hidden items, field moves, wild/trainer battles, start menu, bag, party, PC, shop, Pokémon Center, Pokédex, options, save, battle commands/moves/items/party/run/Safari, dialogue choices, locked states. Add representative API traces for main story route, postgame/link-adjacent route if feasible, and negative/blocked obstacle cases. The matrix may use coverage categories rather than proving every individual tile, but it must fail on unregistered gameplay surfaces.
  **Must NOT do**: Do not claim literal exhaustive completion without a gate. Do not rely on manual playthrough.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: coverage inventory over entire game systems.
  - Skills: `[]`.
  - Omitted: `playwright`.

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: Task 14 | Blocked By: Tasks 7-10

  **References**:
  - Existing coverage style: `ts-game/test/coverageInventory.test.ts`, `ts-game/test/convergence-coverage.test.ts`.
  - Existing route QA: `ts-game/e2e/mainRoute.spec.ts`, `postgameLinkRoute.spec.ts`.
  - Map registry: `ts-game/src/world/mapRegistry.ts`.

  **Acceptance Criteria**:
  - [ ] Coverage matrix has zero missing required categories.
  - [ ] API trace tests cover at least overworld→dialogue→menu→battle→save/export/import.
  - [ ] Obstacle tests cover Cut/Strength/Rock Smash/Surf/Fishing prerequisites or disabled reasons.
  - [ ] Route/grass tests cover encounter interruption.

  **QA Scenarios**:
  ```
  Scenario: Text API coverage matrix closes
    Tool: Bash
    Steps: From ts-game/, run `npm run test -- --run test/textApiCoverage.test.ts`.
    Expected: Exit 0; required semantic coverage categories have zero missing entries.
    Evidence: .sisyphus/evidence/text-api-task-12-coverage.txt

  Scenario: End-to-end text play traces
    Tool: Bash
    Steps: Run API trace fixtures for main route, battle, menu/save, obstacle, and encounter interruption.
    Expected: Exit 0; traces complete with deterministic snapshots and no raw-control options.
    Evidence: .sisyphus/evidence/text-api-task-12-traces.txt
  ```

  **Commit**: YES | Message: `Add text API playability coverage gates` | Files: coverage matrix, trace fixtures, tests

- [x] 13. Preserve and verify normal browser UI behavior

  **What to do**: After `GameSession` extraction and API additions, run browser-facing regression tests and add any necessary browser adapter tests proving normal UI still uses keyboard input/canvas rendering as before. Add Playwright smoke that starts the game, navigates menu/dialogue/battle route already covered by existing specs, and checks console is clean. Do not make API server required for browser play.
  **Must NOT do**: Do not require the Node API server to run for `npm run dev`/browser UI. Do not alter controls or visual UI behavior.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: browser regression/QA.
  - Skills: `playwright` - Browser tests.
  - Omitted: `frontend-ui-ux` - No design changes.

  **Parallelization**: Can Parallel: YES | Wave 6 | Blocks: Task 14 | Blocked By: Tasks 2-3

  **References**:
  - Browser entry: `ts-game/src/main.ts`.
  - Existing Playwright: `ts-game/e2e/mainRoute.spec.ts`, `menuNavigation.spec.ts`, `postgameLinkRoute.spec.ts`.
  - Input: `ts-game/src/input/inputState.ts`.

  **Acceptance Criteria**:
  - [ ] Browser app builds without API server.
  - [ ] Existing Playwright route specs pass.
  - [ ] Console has no new errors during smoke route.
  - [ ] Keyboard controls remain mapped as before.

  **QA Scenarios**:
  ```
  Scenario: Browser route smoke unaffected
    Tool: Playwright
    Steps: From ts-game/, run `npx playwright test e2e/mainRoute.spec.ts e2e/menuNavigation.spec.ts --reporter=line`.
    Expected: Exit 0; no console errors introduced.
    Evidence: .sisyphus/evidence/text-api-task-13-browser.txt

  Scenario: API server not required for browser build
    Tool: Bash
    Steps: From ts-game/, run `npm run build` without starting API server.
    Expected: Exit 0.
    Evidence: .sisyphus/evidence/text-api-task-13-build.txt
  ```

  **Commit**: YES | Message: `Verify browser play after text API` | Files: browser adapter tests/evidence, only if needed

- [x] 14. Run final verification, docs, and artifact hygiene

  **What to do**: Run focused API tests, full Vitest, build, Playwright browser route checks, and Node API smoke. Update `ts-game/README.md` and root `README.md` with API usage, endpoints, semantic-only contract, localhost/no-auth warning, save blob behavior, debug metadata toggle, and verification commands. Confirm no `dist/`, `test-results/`, `.playwright-mcp/`, or generated artifacts are staged except explicit `.sisyphus/evidence/` files if project convention commits them.
  **Must NOT do**: Do not claim the API is network-safe/authenticated. Do not commit generated bundles. Do not skip full verification.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: verification/docs cleanup.
  - Skills: `[]`.
  - Omitted: `git-master` - Use only if user asks to commit/push.

  **Parallelization**: Can Parallel: NO | Wave 6 | Blocks: Final Verification | Blocked By: Tasks 1-13

  **References**:
  - Docs: `README.md`, `ts-game/README.md`.
  - Scripts: `ts-game/package.json`.
  - Evidence convention: `.sisyphus/evidence/`.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run test/textApi*.test.ts test/api*.test.ts` exits `0`.
  - [ ] `npm run test -- --run` exits `0`.
  - [ ] `npm run build` exits `0`.
  - [ ] Browser Playwright smoke exits `0`.
  - [ ] API smoke with localhost server exits `0`.
  - [ ] Docs include curl examples for create session, get state, post action, save export/import.
  - [ ] Artifact hygiene evidence exists.

  **QA Scenarios**:
  ```
  Scenario: Full automated verification
    Tool: Bash
    Steps: From ts-game/, run focused text API tests, full Vitest, and build.
    Expected: All commands exit 0.
    Evidence: .sisyphus/evidence/text-api-task-14-full-verify.txt

  Scenario: API curl smoke
    Tool: Bash
    Steps: Start API on localhost random port, `POST /sessions`, `GET /state`, `POST /actions` using first enabled semantic option, `GET /save`, then shutdown.
    Expected: All HTTP calls return specified status codes and valid JSON.
    Evidence: .sisyphus/evidence/text-api-task-14-api-smoke.txt
  ```

  **Commit**: YES | Message: `Document and verify text API gameplay` | Files: docs, evidence if committed, package scripts if not already committed

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle — APPROVED (all 14 tasks complete, acceptance criteria met)
- [x] F2. Code Quality Review — unspecified-high — APPROVED (no critical anti-patterns, proper architecture)
- [x] F3. Real Manual QA — unspecified-high (+ playwright) — APPROVED (all tests pass, API smoke verified)
- [x] F4. Scope Fidelity Check — deep — APPROVED (all requirements met, constraints respected)
## Commit Strategy
- Commit by task or tightly coupled task-pairs only; do not create a single giant API commit.
- Recommended order:
  1. `Add text API contracts`
  2. `Audit headless runtime seams`
  3. `Extract shared game session runtime`
  4. `Add text API REST session server`
  5. `Add accessible text snapshots`
  6. `Add semantic text action engine`
  7. `Expose field and dialogue text actions`
  8. `Add semantic navigation autopilot`
  9. `Expose menu and inventory text actions`
  10. `Expose battle text actions`
  11. `Harden text API sessions and saves`
  12. `Add text API playability coverage gates`
  13. `Verify browser play after text API`
  14. `Document and verify text API gameplay`

## Success Criteria
- A blind API client can create a session, read a concise and detailed text snapshot, choose semantic options only, and continue the turn loop without visuals.
- Every supported real-game decision surface is represented by semantic options or an honest locked/busy state.
- High-level navigation uses real movement/runtime stepping and stops for grass encounters, trainer battles, warps, scripts, and obstacles.
- Battles expose all real battle decisions semantically.
- Save export/import works between sessions.
- Multiple sessions are isolated.
- Browser UI remains runnable/playable unchanged and does not require the API server.
- Full tests/build/browser/API smoke pass with artifact hygiene.
