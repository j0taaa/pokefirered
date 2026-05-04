2026-05-02: `loadMapById` now resolves through a generated `mapRegistry` and returns `null` for registered decomp maps whose compact JSON is not exported yet; named legacy loaders throw only if their expected exported source is missing.
2026-05-02: The generated registry stores all decomp IDs with `source: null` for missing exports rather than fallback maps, preserving warp/save semantics while allowing future exports to be added mechanically.

## Task 5 exporter convergence
- Chose generated runtime JSON as the source of committed map coverage: all decomp map JSON files are emitted by `export-decomp-map.mjs --all`, then registry imports are regenerated instead of hand-authoring map payloads.
- Kept map connection tests aligned with actual runtime collision gates: newly exported destination maps are no longer treated as unloaded, but transitions can still be null when the destination edge tile is blocked.
- Added runtime coverage for rotate object-event movement types using parsed decomp direction tables so the full exported NPC set remains covered.

## Task 6 warp/connection graph gates
- Removed user-facing fallback dialogue for unloaded/invalid warp destinations in `main.ts`; invalid script/player warp data now throws deterministic errors so bad exports fail during tests/runtime validation instead of silently redirecting gameplay.
- Hardened connection resolution so a declared connection with a loader that cannot resolve its neighbor throws `Invalid map connection: ...` instead of degrading to a blocked border.
2026-05-02: Task 7 kept the field-order tests focused on extracted coordinator seams rather than browser bootstrapping; `main.ts` remains responsible for DOM/game-loop setup and delegates field sequencing to coordinator modules.
2026-05-03: Task 9 kept named reachable reward flows in `scripts.ts` stateful rather than replacing them with `main.ts` one-offs: Museum admission, OLD AMBER, Seismic Toss, Berry Powder Jar, Route 4 Magikarp, Route 2 HM05, Vermilion nurse healing, and Vermilion trash locks all update runtime state directly and are covered by Vitest.
2026-05-03: The story chapter regression uses deterministic representative labels per chapter band instead of trying to exhaust every map label in one test; interactive loops like the One Island ferry sailor are avoided in favor of stable Sevii labels such as Mt. Ember Ruby Path Braille.

2026-05-03: Task 16 separates event correctness from audible fidelity by making runtime.fieldAudio.events the canonical deterministic trace and making the browser Web Audio adapter a side-effect-only consumer of already ordered events.

2026-05-03: Task 17 uses an explicit transport boundary (`BrowserLinkTransport`) plus a deterministic local hub as the CI oracle instead of coupling link/wireless parity to browser WebRTC setup; future WebRTC can implement the same endpoint interface.
