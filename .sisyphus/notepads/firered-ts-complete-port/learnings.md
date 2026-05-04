## Task 11 Learnings

### Existing Codebase Patterns
- `menu.ts` already contains full state machines for party, pokedex, options, save, retire, and summary panels - no need to duplicate
- `saveData.ts` already has complete save/load with localStorage, schema versioning, and validation
- `pokemonStorage.ts` already has party/pokedex state management (create, clone, heal, add)
- `pokemonCenterTemplate.ts` already has nurse dialogue and healing logic
- `decompNamingScreen.ts` has full naming screen state machine with keyboard layout
- `decompPokemonStorageSystem.ts` has PC storage constants and low-level operations
- `decompPokedexUi.ts` has pokedex UI logic (top menu, ordered list, categories, area markers)

### UI Pattern
- UI view files follow `create*View()` / `update*View()` pattern
- View bindings are interfaces with HTMLElement fields
- Views use `classList.toggle('hidden', ...)` for show/hide
- Views use `innerHTML = ''` for clearing lists then rebuild

### DialogueState
- `DialogueState` requires `speakerId: string | null` field
- `FieldMessageBoxState` requires `type`, `font`, `canABSpeedUpPrint`, `useAlternateDownArrow` fields
- Use `createFieldMessageBoxState()` factory to create proper instances in tests

### Test Pattern
- Use `createScriptRuntimeState()` for runtime state in tests
- Use `createDialogue()` helper with `createFieldMessageBoxState()` for menu tests
- `CenterRuntimeState` from `pokemonCenterTemplate.ts` only requires `vars` and `party`

### Build Gotchas
- Unused imports cause TS6133 errors in build (but not in test)
- `KBROW_COUNT` is a local const in decompNamingScreen.ts, not exported - define locally
- `BUTTON_COUNT` is exported from decompNamingScreen.ts
- Test files need `speakerId: null` in DialogueState objects
## Task 12 Save Persistence Audit - 2026-05-03
- Save persistence now writes checksum-protected envelopes while preserving legacy raw v6 snapshot loading through saveMigration.ts.
- Durable runtime additions persisted from ScriptRuntimeState: roamer data/location/RNG, dynamic warp destination, Fame Checker/Hall-of-Fame-style records, and persistent field audio map-music ids.
- Transient script/battle/dialogue sessions, object locks, palette fades, pending script warps, camera/effect tasks, and animation-only door task state remain runtime-only.
- localStorage quota and unavailable-storage failures return ok:false without incrementing runtime.saveCounter.

## Task 13 Battle Oracle Fixtures - 2026-05-03
-  now emits deterministic native fixture metadata objects with uid=0(root) gid=0(root) groups=0(root), sorted , and .
- Host-comparable native traces remain limited to the seven existing native harness fixture numbers; broader battle categories are now explicit native oracle metadata entries so hardening cannot pass from TS fixture tags alone.
- Safari coverage is represented by native metadata for bait, rock, run/flee, and capture edge categories, with matching TS parity corpus fixture IDs.

## Task 13 Battle Oracle Fixtures - correction
- tools/battletrace/battletrace.mjs --list now emits deterministic native fixture metadata objects with id, sorted categories, and hostComparable.
- Host-comparable native traces remain limited to the seven existing native harness fixture numbers; broader battle categories are explicit native oracle metadata entries so hardening cannot pass from TS fixture tags alone.
- Safari coverage is represented by native metadata for bait, rock, run/flee, and capture edge categories, with matching TS parity corpus fixture IDs.

## Task 14 Battle Runtime Hardening - 2026-05-03
- Battle hardening now has an explicit zero-missing runtime inventory across move effects, battle script commands, AI commands, capture paths, reward paths, and post-battle handoffs in `test/parity/battleParityHardening.test.ts`.
- Trainer reward parity is guarded by `post-battle-reward-level-up`: `BattleScript_LevelUp`, 33 EXP, level 16, and pending CHARMANDER -> CHARMELEON evolution handoff.
- Status/order parity is guarded by `wild-status-exchange` and `priority-quick-attack`: status move ordering remains player/opponent, and Quick Attack priority wins over higher foe speed without changing deterministic trace order.

## Task 15 Render Parity Fixtures - 2026-05-03

### Control Code Behavior
- ESCAPE control code (0x0c) skips its argument byte and prints the *following* byte as a glyph, not the argument itself
- PAUSE control code (0x08) enters PAUSE state via RENDER_REPEAT first, then RENDER_UPDATE on subsequent calls (not RENDER_UPDATE initially)
- When delayCounter reaches 0 in PAUSE state, one more RENDER_UPDATE call transitions to HANDLE_CHAR state

### PP State Logic
- `getBattlePpToMaxPpState(currentPp, maxPp)` thresholds:
  - maxPp <= 2: returns 3 if currentPp > 1, else 2 - currentPp (so 0 PP → state 2, 1 PP → state 1)
  - maxPp > 7: returns 3 if currentPp > 0, else 2
  - Otherwise: returns 3 if currentPp > maxPp/4, 1 if currentPp <= maxPp/4, 0 if currentPp === 0

### Pixel Layout
- 4bpp to 8bpp blit: low nibble = left pixel, high nibble = right pixel (reversed from initial assumption)
- `packed4bppRasterToRgbaBytes` returns RGBA byte arrays (uint8), not index arrays
- Window 8bpp bitmap width = 8 * windowWidth (in pixels)

### Map Popup State Machine
- After window creation (state 1), next call increments data[2] and stays at state 1 (doesn't transition to state 2 immediately)
- State transitions: 0→1 (create window), 1→1 (scroll in progress), then 2→3→4→5→6 (display phases)

### Build Gotchas
- Unused imports cause TS6133 errors in `npm run build` (tsc --noEmit) but not in test runs
- Must remove unused imports from test files before build passes
- `TC_TIME_HOURS`, `TC_TIME_COLON`, `TC_TIME_MINUTES` are exported from trainerCardScreenLayout.ts but were accidentally removed from test imports

## Task 16 Audio Event Parity - 2026-05-03
- Deterministic audio parity now lives on runtime.fieldAudio.events with monotonic seq ids; tests assert event order before any Web Audio playback.
- Script audio commands already funnel through decompFieldSound.ts, so adding event emission there covers playse/playbgm/fanfare/fade script paths without duplicating decompFieldDialogue.ts handling.
- WebAudioEventAdapter consumes the same event stream by seq and accepts an injectable sink, keeping CI tests independent of real browser audio devices.
- Browser QA can inspect window.__pokemonFireRedAudioEvents and use window.__pokemonFireRedAudioDebug.emitMenuBeep() to verify the browser runtime logger without requiring a real audio device.

## Task 17 Link/Wireless Parity - 2026-05-03
- Browser multiplayer-adjacent work now has a deterministic `InMemoryLinkHub` adapter under `src/game/browserLink.ts`; tests exercise two-client handshakes without external networking.
- Durable multiplayer-adjacent records stay on existing persisted fields (`runtime.vars` and `runtime.newGame`); transient link sessions remain `BrowserLinkRuntime.sessions` only.
- Acceptance glob `test/*trainer*tower*.test.*` is lowercase-sensitive in bash, so Trainer Tower coverage needs a lowercase `trainer-tower.test.ts` filename.
- Playwright Task 17 browser QA follows the existing audio-debug pattern with `window.__pokemonFireRedLinkDebug`, returning plain serializable session snapshots from fresh in-memory clients so e2e tests stay deterministic and server-free beyond Vite.

## Task 19 Convergence Gate - 2026-05-03
- Final convergence gating now lives in `ts-game/scripts/convergence-report.mjs` with a typed declaration file and `test/convergence-coverage.test.ts`; the lowercase `*coverage*` filename is required so the mandated shell glob includes the gate.
- The report regenerates decomp-backed totals live and closes remaining direct inventory deltas only through existing task evidence/spec files, including Task 18 route specs for browser-visible route coverage.
- Final report totals: required=5655, direct=3544, evidenceCovered=2111, missing=0, untracked=0, unresolved=0.

## Task 19 Vitest/Playwright Boundary Fix - 2026-05-03
- Vitest collects `*.spec.ts` by default unless configured otherwise, so Playwright-only route specs under `ts-game/e2e/` must be excluded in `vite.config.ts`.
- The narrow safe exclude is `e2e/**/*.spec.ts`: full `npm run test -- --run` now runs 517 Vitest files without collecting Playwright suites, while `npx playwright test e2e/mainRoute.spec.ts e2e/postgameLinkRoute.spec.ts --reporter=line` still runs the route specs.
- `test/convergence-coverage.test.ts` no longer needs `@ts-ignore` or `any`; importing types from `scripts/convergence-report.d.mts` keeps `npm run build` green.

## Task 20 Documentation Lock - 2026-05-03
- Documentation locked to final parity state: README.md (root), ts-game/README.md, ts-game/roadmap/ROADMAP.md.
- Removed all "WIP", "early prototype", "in progress", and "planned" language for completed systems.
- Added exact verification commands to all docs: npm ci, npm run test -- --run, npm run build, Playwright route specs, conversion/coverage/inventory tests.
- Contributor guardrails added: preserve bugs/quirks, hardware-only adaptations, no enhancements, test-driven parity, regression policy.
- Final parity status: 5,655 required items, zero missing/untracked/unresolved.
- Evidence files written: task-20-doc-commands.txt, task-20-roadmap-lock.txt.

## Task 20 Documentation Correction - 2026-05-03
- Atlas manual review identified documentation overclaims that needed correction:
  1. "byte-identical behavioral parity" → "observable/game-visible behavioral parity" (ROADMAP.md line 23)
  2. "WebRTC/networking" → "deterministic in-memory/local multi-client transport" (all docs)
- Rationale: The port achieves game-visible behavioral parity, not byte-identical memory/layout parity. The link/multiplayer system uses InMemoryLinkHub (deterministic local multi-client transport), not actual WebRTC.
- Correction approach: Changed wording to accurately describe observable/game-visible parity while maintaining the claim of 1:1 behavioral equivalence from a player perspective.
- Policy established: Future transport implementations (including potential WebRTC) must preserve game-visible state transitions to maintain parity contract.

## Final Verification Blocker Fix - 2026-05-04
- Parity contract fixture/test wording is locked to observable/game-visible behavioral parity; stale byte-identical wording was removed from the test name while preserving the assertion.
- Link hardware boundary wording remains deterministic in-memory/local multi-client transport, matching InMemoryLinkHub and avoiding WebRTC/networking claims.
- Task 18 browser route QA evidence now lives at .sisyphus/evidence/task-18-main-route.zip and .sisyphus/evidence/task-18-postgame-link.zip with command, timestamp, spec names, and 13/13 pass summary.

- 2026-05-04: Removed the last WebRTC coverage inventory needle; two-client handshake coverage now keys on InMemoryLinkHub/local multi-client transport wording.
