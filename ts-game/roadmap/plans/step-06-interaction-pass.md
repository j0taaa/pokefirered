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
- 2026-04-14: Switched NPC interactions to script registry callbacks (`interactScriptId`) with object-event-style IDs and added multi-line dialogue advance/close flow.

## Follow-ups

- Add a dedicated dialogue box renderer layer instead of HUD text.
- Continue aligning text window pacing/timing with full script engine behavior.
