# Battle Parity Gap Tracker

Last updated: 2026-04-26

Open major gaps left to close: 0

## Open

None tracked. Any newly discovered parity divergence should be added here with a failing fixture or hardening gate before implementation.

## Closed Recently

- The TS battle script VM now records common decomp controller/message script commands while stepping (`attackanimation`, `waitanimation`, `effectivenesssound`, `hitanimation`, `waitstate`, `waitmessage`, `pause`, `printstring`, `printfromtable`, status/animation commands, multi-hit scratch, and move-value cleanup markers), and resolves more native branch opcodes (`jumpifbattletype`, `jumpifnotbattletype`, `jumpifhasnohp`, `jumpifstat`, `jumpifbytenotequal`, `jumpifbyteequal`, `jumpifcantmakeasleep`, `jumpifcantswitch`, `jumpifconfusedandstatmaxed`, `jumpifnodamage`, `jumpifnotfirstturn`, `jumpifplayerran`, `jumpifnopursuitswitchdmg`, and `jumpifnexttargetvalid`).
- The VM parser/stepper now recognizes every opcode currently parsed from `data/battle_scripts_1.s` and `data/battle_scripts_2.s`; no parsed battle-script opcode is silently invisible to the VM surface. Lower-frequency mechanic opcodes now have test-backed coverage through the VM command fixture corpus and hardening gates.
- The TS-side parity corpus now includes side-condition, weather, and low-frequency command-path fixtures for Light Screen, Sandstorm, and Disable. These are marked TS-only until the native host harness can be extended without touching the browser-port scope.
- Side-condition and weather setup now execute through VM command handlers (`setreflect`, `setlightscreen`, `setsafeguard`, `setmist`, `setrain`, `setsunny`, `setsandstorm`, `sethail`) instead of being applied directly in the compatibility resolver.
- Volatile setup for Leech Seed, Focus Energy, Torment, Taunt, Destiny Bond, Foresight, Charge, and Yawn now executes through VM command handlers instead of direct resolver-only mutations.
- Last-used-move restriction commands for Disable, Encore, and Spite now execute through VM command handlers, including their FRLG-shaped RNG turn/PP-loss ranges.
- Setup utility commands for Spikes, Grudge, Ingrain, Minimize, Defense Curl, Magic Coat, Snatch, Helping Hand, and Imprison now execute through VM command handlers instead of direct resolver-only mutations.
- Healing/setup commands for Wish, half-HP recovery, sunlight-based recovery, Softboiled-style recovery, and Rest now execute through VM command handlers.
- Refresh status curing now executes through the VM `cureifburnedparalysedorpoisoned` command handler.
- Special-effect commands for Nightmare, Perish Song, Stockpile, Swallow, Pain Split, Trick, Recycle, Role Play, and Skill Swap now execute through VM command handlers instead of resolver-only mutation branches.
- Field/targeting setup commands for Haze, Lock-On, Mud Sport, Water Sport, Camouflage, Mean Look, Psych Up, Heal Bell, and Follow Me now execute through VM command handlers (`normalisebuffs`, `setalwayshitflag`, `settypebasedhalvers`, `settypetoterrain`, `seteffectprimary` with `MOVE_EFFECT_PREVENT_ESCAPE`, `copyfoestats`, `healpartystatus`, and `setforcedtarget`).
- Setup/status commands for Substitute, Protect/Endure, Attract, Ghost Curse, Belly Drum, and Memento now execute through VM command handlers (`setsubstitute`, `setprotectlike`, `tryinfatuating`, `cursetarget`, `maxattackhalvehp`, `trymemento`, and `setatkhptozero`).
- Post-hit move-effect commands for Pay Day, Rage, Recharge, Rampage, Uproar, trapping, SmellingSalt paralysis clearing, and Rapid Spin freeing now execute through VM command handlers (`seteffectprimary`, `confuseifrepeatingattackends`, `clearstatusfromeffect`, and `rapidspinfree`) instead of direct resolver-only mutation.
- Special setup commands for Bide, Roar phasing, Transform, Conversion, Conversion 2, and Future Sight now execute through VM command handlers (`setbide`, `forcerandomswitch`, `transformdataexecution`, `tryconversiontypechange`, `settypetorandomresistance`, and `trysetfutureattack`) instead of direct resolver-only calls.
- Dynamic, fixed, Present, Counter, and Mirror Coat damage calculation paths now run through VM command handlers (`remaininghptopower`, `weightdamagecalculation`, `magnitudedamagecalculation`, `rolloutdamagecalculation`, `furycuttercalc`, `friendshiptodamagecalculation`, `scaledamagebyhealthratio`, `hiddenpowercalc`, `weatherdamage`, `doubledamagedealtifdamaged`, `stockpiletobasedamage`, `presentdamagecalculation`, `counterdamagecalculator`, `mirrorcoatdamagecalculator`, `adjustsetdamage`, `psywavedamageeffect`, `dmgtolevel`, `damagetohalftargethp`, and `setdamagetohealthdifference`) instead of bypassing the script-command layer.
- The seeded TS-side parity corpus now covers the previously open hardening categories with 20 fixtures: move effects, dynamic/fixed damage, ability timing, trainer item timing, trainer switch AI, doubles/partner targeting, safari, ghost, old-man tutorial, capture/flee, switch/faint replacement, and post-battle reward handoff.
- [battleParityHardening.test.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/test/parity/battleParityHardening.test.ts) now gates the fixture corpus against the tracked hardening categories and verifies that native-oracle fixtures stay marked and produce non-trivial script/message/action traces.
- Follow-up gap hunting fixed battler-indexed doubles VM move memory, Counter/Mirror Coat `typecalc2` / `adjustsetdamage` command sequencing, unsupported trainer-AI opcode hardening, and a real doubles trainer switch path for endangered opponent battlers.
- Follow-up doubles command hardening made active-battler script commands stop assuming only primary slots: sleep prevention now sees any active Uproar, Haze clears stat stages on every active battler, and Perish Song applies across all active battlers while respecting Soundproof.
- A native decomp-backed battle parity harness now exists under [tools/battletrace/](/Users/jota/Documents/codigos/pokefirered/tools/battletrace): `make tools` builds the `battletrace` host tool, the tool boots [pokefirered_modern.gba](/Users/jota/Documents/codigos/pokefirered/pokefirered_modern.gba) under mGBA/GDB, injects fixture requests into the in-ROM [battle_trace_harness.c](/Users/jota/Documents/codigos/pokefirered/src/battle_trace_harness.c), dumps native EWRAM result structs, and [battleParityHost.test.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/test/parity/battleParityHost.test.ts) compares those decomp-produced traces against TS battle traces.
- The native oracle corpus now covers seven deterministic fixtures: wild opening exchange, trainer shift prompt, wild catch, wild status exchange, wild player switch, wild run escape, and trainer whiteout.
- Trainer AI switch/item/action ordering is now decomp-shaped in [battle.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/src/game/battle.ts): trainers can now switch off Perish Song / Wonder Guard / absorbing-ability / Natural Cure and last-hit matchup pressure, use healing and curing items at decomp thresholds, spend first-turn X-items and Guard Spec, and choose `switch -> item -> move` in the same top-level order as `AI_TrySwitchOrUseItem`.
- Real doubles / partner / link execution now runs through [battle.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/src/game/battle.ts): four active battlers can act in speed/priority order, `Follow Me` and `Helping Hand` now work as ally-aware doubles interactions, replacement slots refill from the correct bench pool, partner-party runtime slots are now real instead of scaffold-only, and end-of-turn effects iterate across every active battler.
- Trainer move-selection scoring now runs through a decomp-shaped AI VM for the real trainer AI flags currently used by the port.
- Structured post-battle handoff now records catches, pending move learns, and pending evolutions for runtime consumption.
- Seeded TS-side battle parity fixtures now snapshot deterministic traces under [test/parity/](/Users/jota/Documents/codigos/pokefirered/ts-game/test/parity/).
- Singles turn-shell orchestration now runs through [battleScriptVm.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/src/game/battleScriptVm.ts) for:
  - selected-move turn order
  - enemy-only turns after switches / failed catches / similar flows
  - VM-local tracking of turn resolver and action order
- The `executeMove(...)` mechanics body is now VM-owned via [executeBattleMoveVm(...)](/Users/jota/Documents/codigos/pokefirered/ts-game/src/game/battleScriptVm.ts), and [battle.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/src/game/battle.ts) now only provides a dependency-injection wrapper for that move-resolution path.
- Battler runtime is now the active-mon source of truth for singles: [battle.ts](/Users/jota/Documents/codigos/pokefirered/ts-game/src/game/battle.ts) derives `playerMon`, `wildMon`, `party`, `moves`, and `wildMoves` as compatibility views from battler/party state instead of caching separate active-mon fields.
- The focused battle and parity checks are green after the VM migration slices; the unrelated full-suite map/export parity failures around trigger `elevation`/undefined fields remain outside this battle-core tracker.

## Remaining Hardening

No major hardening gaps are currently tracked. The guardrail is now test-driven: add a failing fixture, host-oracle comparison, or required coverage tag before adding any new parity gap to this tracker.
