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
- 2026-04-14 follow-up: Expanded move damage typing to a full Gen-3-style type chart helper (including dual-type multiplication) and STAB parity via attacker type membership checks.
- 2026-04-14 follow-up: Expanded capture flow to include Poké Ball vs Great Ball modifiers plus shake-count outcome messaging akin `BattleScript_ThrowPokeBall` pacing.
- 2026-04-14 follow-up: Expanded enemy move scoring heuristics to weight expected damage (power/accuracy), KO pressure, and type utility instead of pure max-damage tie breaks.

## Tests

- `npm run test` includes `test/battle.test.ts` covering:
  - base damage formula floor behavior and random range preview,
  - encounter start after cooldown,
  - intro -> command -> resolve flow.

## Next steps

- Expand switch flow to include forced-switch when active mon faints.
