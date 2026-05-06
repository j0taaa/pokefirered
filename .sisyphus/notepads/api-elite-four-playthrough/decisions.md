
## 2026-05-06T00:37:03.403170+00:00 Task 2 harness contract
- Kept the harness as a checked-in reusable Node `.mjs` script under `ts-game/scripts/` with CLI options for base URL/port, trace path, checkpoint directory, interval, max steps, smoke mode, and semantic guard mode.
- The harness rejects raw-control strings in all public option strings instead of silently filtering them, so future API leaks fail fast before playthrough routing consumes invalid actions.

## 2026-05-06 Task 3 route policy and recovery
- Chose Bulbasaur as the default starter policy because it is the most robust semantic-route choice for early Brock/Misty progression; fallback order is Squirtle then first enabled starter option if the initial flow differs.
- Kept route detection declarative in JSON with detector signatures and marker lists, while the executable detector remains in the harness. This keeps Task 4 routing policy inspectable without allowing arbitrary code in notepad config.
- Rollback uses the latest legitimate exported checkpoint save blob through `POST /sessions/:id/load`; no save mutation, direct runtime mutation, or debug progression bypass is allowed.
## Task 4 decisions
- Kept fixes minimal and API/runtime-scoped: save-load rollback contract, current-tile warp transition helper, and regression coverage in `textApiServer.test.ts`.
- Did not fabricate Hall-of-Fame evidence or bypass progression after connection navigation remained blocked.

