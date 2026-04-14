# Step 09 — Battle vertical slice

Status: ✅ Done  
Date: 2026-04-14

## What shipped

- Added a step-driven wild encounter gate modeled after FRLG wild encounter cooldown behavior from `src/wild_encounter.c` (min-step cooldown + chance roll).
- Added a battle state machine that enters an intro phase, advances to command selection, executes one move turn, and resolves back to field.
- Added a compact command UI overlay with move choice and damage preview.
- Added a Gen 3-inspired damage preview calculation based on `CalculateBaseDamage` flow from `src/pokemon.c`.
- 2026-04-14 follow-up: Added explicit command phase (`FIGHT`/`RUN`), speed-ordered turn resolution, simple enemy move-choice logic, and FRLG-like run-attempt speed check inspired by `TryRunFromBattle` in `src/battle_main.c`.
- 2026-04-14 follow-up: Added `BAG` and `POKéMON` command flows with Poké Ball catch attempts and party switching; also added simple type-effectiveness scaling and RNG tie-break behavior for enemy move choices.

## Tests

- `npm run test` includes `test/battle.test.ts` covering:
  - base damage formula floor behavior and random range preview,
  - encounter start after cooldown,
  - intro -> command -> resolve flow.

## Next steps

- Add type-effectiveness matrix and STAB/type parity from decomp constants.
- Expand capture parity to include shake-count messaging and ball-specific modifiers.
- Expand switch flow to include forced-switch when active mon faints.
