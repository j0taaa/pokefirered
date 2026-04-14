# Step 10 — Save/load browser persistence

## Goal

Persist field runtime state to browser storage and resume safely with schema/map guards.

## 2026-04-14 implementation notes

- Added `src/game/saveData.ts` as an adapter boundary for serializing/deserializing save snapshots.
- Mirrored FireRed-style monotonically increasing save index concept via `runtime.saveCounter`.
- Wired START menu `SAVE` panel confirm action to call persistence callback and report result text in-panel.
- Added startup resume flow in `src/main.ts` to load and apply save snapshot before gameplay begins.
- Added migration/validation guards: unknown schema, invalid payload, or map mismatch are rejected.
- Added tests in `test/saveData.test.ts` and extended menu/runtime tests.

## Follow-ups

- Replace single-slot prototype with dual-slot + backup semantics matching GBA save sectors.
- Persist NPC dynamic state once object-event parity is introduced.
