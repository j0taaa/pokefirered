## Blocker 1: load rollback snapshot contract mismatch
- Type: API/harness save-load contract blocker
- Evidence: full harness stopped after rollback with `POST /sessions/:id/load rollback did not return a snapshot object.`
- Cause: the API load endpoint returns the snapshot directly, but the harness rollback path asserted `body.snapshot`.
- Fix: rollback now validates and returns `loadResponse.body` directly; server regression test asserts load returns a direct snapshot with no nested `snapshot`.

## Blocker 2: semantic door navigation did not warp
- Type: missing/broken semantic option execution
- Evidence: full harness rolled back after 200 actions without milestones; probing showed `Enter Pallet Town Players House 1f` left the player on `MAP_PALLET_TOWN_PLAYERS_HOUSE_2F`.
- Cause: API door autopilot could land on a warp tile without applying a warp transition; exported warp elevation could also be missed when runtime elevation was unknown/default `0`.
- Fix: semantic door navigation now applies a current-tile warp transition after autopilot; warp lookup treats caller elevation `0` as a default wildcard. Regression test enters the player house 1F through the API.

## Blocker 3: semantic indoor warp navigation did not exit maps
- Type: missing/broken semantic option execution
- Evidence: trace repeated `Exit to Pallet Town` from the player house 1F through step 200 without changing maps.
- Cause: current-tile warp transition was only applied for `door` navigation targets, not `warp` targets.
- Fix: semantic `warp` navigation now applies the same current-tile warp transition; regression test enters house 1F and exits back to Pallet Town through API actions.

## Blocker 4: semantic map connection navigation does not leave Pallet Town
- Type: missing/broken semantic option execution; unresolved in this unit
- Evidence: after fixing door and indoor warp actions, the harness repeatedly selected `Exit north to Route1` but remained at `MAP_PALLET_TOWN` / summary `PALLET TOWN, facing left at 6, 7` until actions-without-milestone rollback at step 203.
- Attempted fix: tried adding a final boundary step for `tile` navigation targets, but the regression still remained in Pallet Town, so the unproven change was reverted.
- Remaining work: fix connection semantic navigation/pathfinding so route connection actions either reach and cross the connection through runtime movement, or are disabled when not executable.

## Blocker 4 fix: semantic connection navigation reaches valid connection trigger
- Type: missing/broken semantic option execution
- Evidence before fix: `Exit north to Route1` repeated from Pallet Town without useful progress.
- Root cause: connection options were encoded as generic `tile` targets using the player axis coordinate (`x=6,y=0` after exiting the house), but Pallet’s valid north exit/trigger is around `x=12/13`; execution could path to a non-connection edge or no-op.
- Fix: connection options now use explicit `kind: connection` with direction metadata; executor searches for a reachable boundary tile that resolves the requested destination and applies the existing map connection transition hook.
- Regression: `textApiServer.test.ts` verifies the Pallet north semantic option reaches Oak’s pre-starter script trigger instead of remaining at the house exit.
- Verification: focused Text API tests 73/73, `npm run build`, and `npm run api:build` passed.

## Blocker 5 fix: script wait actions advanced too little per API action
- Type: semantic API progression granularity blocker
- Evidence: after Blocker 4, harness reached `PalletTown_EventScript_OakTriggerLeft` but spent ~200 actions on `Wait`/dialogue around the same Pallet script state before no-milestone rollback.
- Root cause: `wait` stepped exactly one frame, making locked script movement/text progress consume many API actions and trip harness no-milestone detection.
- Fix: `wait` now advances 30 frames per semantic action. Regression in `textApiActions.test.ts` verifies wait frame chunking.
- Verification: focused Text API tests 74/74, `npm run build`, and `npm run api:build` passed.

## Blocker 6 fix: completed script movement kept Text API in script mode
- Type: mode observation / stale internal movement task blocker
- Evidence: after Oak's pre-starter dialogue, the live debug snapshot stayed in `script` mode with no active dialogue/session/warp but `scriptMovementTaskCount: 1`; trace repeated `script:wait` at Oak's Lab tile `6,4` until rollback.
- Root cause: `stateObserver` treated any non-destroyed script movement task as input-locking, even when every movement script in the task had finished. The completed task was an internal allocation artifact, not a user-facing lock.
- Fix: `decompScriptMovement` now exposes `hasUnfinishedScriptMovement`; `stateObserver` uses it while preserving legitimate locks for dialogue sessions, event-object lock tasks, field camera, and fishing.
- Regression: `decompScriptMovement.test.ts` verifies completed-but-undisposed movement tasks no longer count as unfinished.
- Verification: focused movement/Text API tests 83/83, `npm run build`, and `npm run api:build` passed.

## Blocker 7 fix: semantic raw-control guard overmatched normal prose
- Type: harness/API semantic guard false positive
- Evidence: after Blocker 6, harness reached overworld at starter selection but failed on descriptions containing normal words/articles such as `A person...` and `start their interaction`.
- Root cause: the raw-control regex treated standalone `a` and `start` as control leaks regardless of context.
- Fix: raw `A/B/START/...` tokens now count only in input-context phrases like `Press A`, `START button`, or `key/button` wording; normal prose remains allowed.
- Regression: `textApiContract.test.ts` verifies `Press A` is rejected while `A person...` and `start their interaction` are allowed.
- Verification: focused movement/Text API tests 83/83, `npm run build`, and `npm run api:build` passed.

## Blocker 8: starter ball navigation repeats without interaction
- Type: harness selector / semantic starter interaction blocker; unresolved in this unit
- Evidence: latest trace reaches overworld at step 119 and chooses `Go to LOCALID BULBASAUR BALL`, then repeats the same navigation action at `PALLET TOWN, facing up at 8, 5` through step 202 before no-milestone rollback.
- Likely cause: once standing beside/facing the Bulbasaur ball, the harness priority continues choosing the Bulbasaur navigation option instead of a starter-ball interaction option, or the API lacks a more specific enabled semantic starter selection option.
- Remaining work: inspect starter-ball field interaction enumeration/execution and harness priority so the next action chooses/interacts with Bulbasaur rather than repeatedly navigating to the same stand tile.
