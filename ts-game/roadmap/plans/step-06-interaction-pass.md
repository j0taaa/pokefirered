# Step 06 — Interaction pass v1

## Objective

Add a first interaction vertical slice that mirrors core field behavior:

- player can trigger facing-NPC interaction with one button press
- selected NPC turns to face the player
- dialogue state is represented in runtime (stub text for now)
- active interaction pauses locomotion updates for the speaker

## Implementation notes

- 2026-04-14: Added interaction edge-triggered input (`Z`/`Enter`) via `interactPressed` in `src/input/inputState.ts`.
- 2026-04-14: Added `src/game/interaction.ts` with facing-tile NPC lookup and dialogue state transitions.
- 2026-04-14: Added face-player parity with decomp behavior by setting NPC facing opposite player-facing direction (analogous to `Script_FacePlayer` + `ObjectEventFaceOppositeDirection`).
- 2026-04-14: Updated main loop to lock player movement while dialogue is active and freeze active speaker NPC.
- 2026-04-14: Added `test/interaction.test.ts` coverage and expanded `test/npc.test.ts` to verify idle/freeze behavior.

## Follow-ups

- Replace string stubs with script callback bindings keyed by map object IDs.
- Add a dedicated dialogue box renderer layer instead of HUD text.
- Add optional multi-line advance/close behavior matching full script engine flow.
