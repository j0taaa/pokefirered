## 2026-05-05
- `ts-game/test/battle.test.ts` already had the three PP regressions requested: valid-use decrement, 1 PP -> Struggle fallback, and menu open/cancel no-consume coverage.
- Focused verification stayed green with `npm run test -- --run test/battle.test.ts` (150 tests passed).

## Task 2 PP propagation
- `battle.moves` is an accessor over the active `battle.playerMon.moves`, so the renderer and VM can share the same live move objects when battle state is configured correctly.
- The propagation gap was field/runtime conversion: `createBattlePokemonFromFieldPokemon` ignored explicit field moves/remaining PP, and `snapshotToFieldPokemon` did not write battle move PP back to runtime party state.
- Fix preserved single ownership of PP decrement in `battleScriptVm.ts`; conversion now carries `movePpRemaining` between field party state and battle snapshots.
- `ts-game/src/main.ts` exposes audio/link debug hooks only; there is no battle-specific deterministic entry hook for Playwright.
- `test/renderBattleLayout.test.ts` already verifies the battle move renderer prints current PP (`PP 34/35`) after a decrement.

## Task 4 full verification
- `cd ts-game && npm run test -- --run` completed successfully; Vitest reported `517 passed | 1 skipped` files and `4389 passed | 7 skipped` tests.
- The raw console log was copied to `.sisyphus/evidence/task-4-full-verify.txt` for traceability.

## F3 Real Manual QA - 2026-05-05
- `npm run test -- --run test/battle.test.ts` passed: 151/151 tests. This covers PP decrement exactly once (35/35 -> 34/35), fight-menu cancel no PP consumption, and 1 PP dropping to 0 before Struggle fallback.
- `npm run test -- --run test/renderBattleLayout.test.ts` passed: 15/15 tests. This covers rendering current PP after decrement (`PP 34/35`, not `PP 35/35`).
