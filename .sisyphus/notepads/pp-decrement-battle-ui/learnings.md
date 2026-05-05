## 2026-05-05
- `ts-game/test/battle.test.ts` already had the three PP regressions requested: valid-use decrement, 1 PP -> Struggle fallback, and menu open/cancel no-consume coverage.
- Focused verification stayed green with `npm run test -- --run test/battle.test.ts` (150 tests passed).

## Task 2 PP propagation
- `battle.moves` is an accessor over the active `battle.playerMon.moves`, so the renderer and VM can share the same live move objects when battle state is configured correctly.
- The propagation gap was field/runtime conversion: `createBattlePokemonFromFieldPokemon` ignored explicit field moves/remaining PP, and `snapshotToFieldPokemon` did not write battle move PP back to runtime party state.
- Fix preserved single ownership of PP decrement in `battleScriptVm.ts`; conversion now carries `movePpRemaining` between field party state and battle snapshots.
