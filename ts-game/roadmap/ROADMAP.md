# TS Port Roadmap

This roadmap tracks the browser-port effort with explicit status markers.

Legend: `✅ Done` · `🟡 In Progress` · `⬜ Planned`

---

## Parity Contract (Wave 0)

**Baseline Commit**: `586f38ad14860d70c20fa58fc30a410818f2833f`

This project maintains strict 1:1 parity with the Pokemon FireRed decompilation. The following policies govern all port work:

### Scope

- Target: Pokemon FireRed US revision 0 (`pokefirered.gba`, SHA1: `41cb23d8dccc8ebd7c649cd8fbb58eeace6e2fdc`)
- Includes: All gameplay systems, battles, field scripts, overworld movement, inventory, save/load, link/wireless, Mystery Gift, e-Reader, Union Room, Trainer Tower
- **Important**: All bugs, quirks, RNG sequences, timing dependencies, and observable behaviors are in scope for preservation

### Parity Policy

- **Strictness**: 1:1 observable/game-visible behavioral parity with the decomp
- **Preserve**: Bugs, quirks, RNG order, timing, and all observable behavior
- **Exclude**: Non-parity enhancements, quality-of-life changes, balance changes

### Browser Adaptations (Hardware Boundaries Only)

The following substitutions are permitted at hardware boundaries only:

| Browser Technology | Replaces |
|---|---|
| Canvas/WebGL rendering | GBA PPU/tile hardware |
| Web Audio API | GBA APU/sound hardware |
| localStorage/IndexedDB | GBA save RAM/flash |
| Keyboard/touch/gamepad input | GBA button hardware |
| Deterministic in-memory/local multi-client transport | GBA link cable/wireless adapter |

**Restrictions**: Game-visible state transitions must remain parity-tested. RNG sequences must produce identical results. Timing-dependent behaviors must be preserved.

### Completion Evidence

- All parity tests must pass
- Decomp fixture comparisons must match
- Trace serialization must be deterministic
- Battle parity corpus must validate
- TDD approach: test first, implement to pass

### Contract Verification

Run: `npm run test -- --run test/parityContract.test.ts`

---

## Final Convergence Summary (Task 19)

**Status**: ✅ **COMPLETE** - Zero missing parity items across all systems.

| Category | Required | Direct | Evidence-Covered | Status |
|----------|----------|--------|------------------|--------|
| Maps | 425 | 425 | 0 | ✅ Closed |
| Warps | 1,294 | 1,275 | 19 | ✅ Closed |
| Connections | 120 | 120 | 0 | ✅ Closed |
| Script labels | 1,819 | 501 | 1,318 | ✅ Closed |
| Script commands | 213 | 213 | 0 | ✅ Closed |
| Field specials | 272 | 272 | 0 | ✅ Closed |
| Movement commands | 172 | 172 | 0 | ✅ Closed |
| Item flows | 360 | 180 | 180 | ✅ Closed |
| Battle behaviors | 855 | 270 | 585 | ✅ Closed |
| Menu scenes | 25 | 25 | 0 | ✅ Closed |
| Save substates | 20 | 20 | 0 | ✅ Closed |
| Render/text fixtures | 23 | 23 | 0 | ✅ Closed |
| Audio events | 23 | 14 | 9 | ✅ Closed |
| Link/hardware features | 17 | 17 | 0 | ✅ Closed |
| Browser routes | 17 | 17 | 0 | ✅ Closed |

**Total**: 5,655 required parity items. Missing: 0. Untracked: 0. Unresolved: 0.

See `.sisyphus/evidence/task-19-convergence-report.txt` for detailed breakdown.

### Key evidence locations

| Evidence | Location |
|----------|----------|
| Convergence report | `.sisyphus/evidence/task-19-convergence-report.txt` |
| Map registry | `.sisyphus/evidence/task-4-map-registry.txt` |
| Export audit | `.sisyphus/evidence/task-5-export-audit.txt` |
| Warp graph | `.sisyphus/evidence/task-6-warp-graph.txt` |
| Script coverage | `.sisyphus/evidence/task-9-script-coverage.txt` |
| Bag parity | `.sisyphus/evidence/task-10-bag-parity.txt` |
| Battle fixtures | `.sisyphus/evidence/task-13-battle-fixture-list.txt` |
| Menu parity | `.sisyphus/evidence/task-11-menu-parity.txt` |
| Save inventory | `.sisyphus/evidence/task-12-save-inventory.txt` |
| Render screenshots | `.sisyphus/evidence/task-15-render-screenshots.txt` |
| Audio events | `.sisyphus/evidence/task-16-pokemon-center-audio.txt` |
| Link handshake | `.sisyphus/evidence/task-17-link-handshake.txt` |
| Browser routes | `e2e/mainRoute.spec.ts`, `e2e/postgameLinkRoute.spec.ts` |

---

| Step | Status | Target | Exit Criteria |
|---|---|---|---|
| 01. Runtime baseline + plan scaffolding | ✅ Done | 2026-04-14 | `ts-game/roadmap/` exists, step docs exist, roadmap status updated when work lands. |
| 02. Playable viewport + camera follow | ✅ Done | 2026-04-14 | Camera follows player, viewport is smaller than map, HUD shows camera coordinates. |
| 03. Player visual pass v1 | ✅ Done | 2026-04-14 | Directional pose markers and animated walk bob when moving. |
| 04. Map loading adapter boundary | ✅ Done | 2026-04-14 | `MapSource` interface, JSON-backed loader, tests. |
| 05. Entity system starter (NPCs) | ✅ Done | 2026-04-14 | NPC data model, draw/update pass, collision probes, tests. |
| 06. Interaction pass v1 | ✅ Done | 2026-04-14 | `Z/Enter` interaction input, NPC face-player turn, dialogue state/HUD, tests. |
| 07. Trigger zones + scripts v1 | ✅ Done | 2026-04-14 | Trigger map layer + callback registry + tests. |
| 08. UI menus foundation | ✅ Done | 2026-04-14 | Start menu opens/closes, selection state, test coverage. |
| 09. Battle vertical slice | ✅ Done | 2026-04-14 | Enter battle scene, selectable move, damage preview. |
| 10. Save/load browser persistence | ✅ Done | 2026-04-14 | Save schema, migration guard, resume flow, tests. |
| 11. Full data convergence | ✅ Done | 2026-05-03 | All 425 maps exportable and verified; complete parity convergence achieved. |
| 12. Save system parity | ✅ Done | 2026-05-03 | All 20 save substates covered, corruption handling, migration. |
| 13. Battle oracle fixtures | ✅ Done | 2026-05-03 | Native battletrace oracle, seeded TS fixtures, Safari coverage. |
| 14. Battle runtime hardening | ✅ Done | 2026-05-03 | Zero-missing battle inventory, trainer rewards, status ordering. |
| 15. Render parity fixtures | ✅ Done | 2026-05-03 | Control code behavior, PP state, pixel layout, map popup state. |
| 16. Audio event parity | ✅ Done | 2026-05-03 | Deterministic audio events, Web Audio playback, script audio. |
| 17. Link/wireless parity | ✅ Done | 2026-05-03 | In-memory link hub, Mystery Gift, Union Room, Trainer Tower. |
| 18. Browser route verification | ✅ Done | 2026-05-03 | Playwright route specs covering main story, postgame, link scenarios. |
| 19. Final convergence gate | ✅ Done | 2026-05-03 | Zero missing parity items across all 5,655 required entries. |

---

## Contributor guardrails

The port is now at **final parity**. Future contributors must follow these rules to preserve 1:1 parity and avoid regressions:

### What is in scope

- Bug fixes that align the port closer to decomp behavior
- Performance optimizations that do not change observable behavior
- Test coverage improvements
- Documentation clarifications

### What is NOT in scope

- **QoL improvements**: Speed-up toggle, auto-save, skip dialog, faster text, etc.
- **Balance changes**: Difficulty modes, nerfs/buffs, encounter rate changes
- **New features**: Randomizers, remasters, new areas, new Pokemon, new moves
- **LeafGreen-only behavior**: This is a FireRed port; LeafGreen differences are not parity
- **Modernizations**: Higher resolutions, widescreen, new UI themes, etc.

### Hard boundaries

1. **Bugs are features**: If the decomp has a bug, the port must preserve it unless the decomp fixes it
2. **RNG must match**: Any change affecting randomness must produce identical sequences to the decomp
3. **Timing must match**: Frame counts, animation durations, and input windows must match
4. **State transitions must match**: Every game-visible state change must be parity-tested
5. **Hardware boundaries only**: Browser tech replaces GBA hardware only at these boundaries:
   - Canvas/WebGL for PPU
   - Web Audio for APU
   - Browser storage for save RAM
   - Input devices for GBA buttons
   - Deterministic in-memory/local multi-client transport for link cable

### Required verification

Every PR must pass:

```bash
cd ts-game
npm ci
npm run test -- --run
npm run build
```

Changes affecting parity-relevant code must also pass:

```bash
npm run test -- --run test/parityContract.test.ts
npm run test -- --run test/convergence-coverage.test.ts
npx playwright test e2e/mainRoute.spec.ts e2e/postgameLinkRoute.spec.ts --reporter=line
```

### How to propose changes

1. Open an issue describing the proposed change
2. Cite the decomp source or evidence that supports the change
3. Explain why the change preserves or improves parity (not enhancements)
4. Include tests that verify the behavior matches decomp

### Regression policy

If a change breaks parity (fails tests, alters RNG, changes timing, etc.), it will be reverted. The 1:1 parity contract is the top priority.
