# Step 05 — Entity system starter (NPCs)

## Objective

Add a first NPC entity slice that proves:

- entity data model and update tick
- map-aware collision probes for NPC movement
- player-vs-NPC blocking hook
- renderer integration for visible NPC actors

## Implementation notes

- 2026-04-14: Added `NpcState` and patrol stepping in `src/game/npc.ts`.
- 2026-04-14: Integrated NPC update loop in `src/main.ts` and player collision callback hook in `src/game/player.ts`.
- 2026-04-14: Added NPC draw pass in `src/rendering/canvasRenderer.ts` and HUD count in `src/ui/hud.ts`.
- 2026-04-14: Added `test/npc.test.ts` plus entity-blocking test case in `test/player.test.ts`.

## Follow-ups

- Add explicit idle timers and deterministic pause windows at path nodes.
- Split NPC visual palette from renderer logic into sprite/frame data adapters.
- Extend collisions from radial probe to axis-aligned bounding boxes.
