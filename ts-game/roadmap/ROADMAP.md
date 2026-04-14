# TS Port Roadmap

This roadmap tracks the browser-port effort with explicit status markers.

Legend: `✅ Done` · `🟡 In Progress` · `⬜ Planned`

| Step | Status | Target Window | Goal | Exit Criteria |
|---|---|---|---|---|
| 01. Runtime baseline + plan scaffolding | ✅ Done | 2026-04-14 | Create roadmap/plans structure and keep progress visible in-repo. | `ts-game/roadmap/` exists, step docs exist, roadmap status updated when work lands. |
| 02. Playable viewport + camera follow | ✅ Done | 2026-04-14 | Move from full-map render to camera viewport with map-bound clamping. | Camera follows player, viewport is smaller than map, HUD shows camera coordinates. |
| 03. Player visual pass v1 | ✅ Done | 2026-04-14 | Replace static marker with a directional sprite-like render + walk bob. | Directional pose markers and animated walk bob when moving. |
| 04. Map loading adapter boundary | ✅ Done | 2026-04-14 | Separate prototype map from loading contract for future extracted data. | `MapSource` interface, JSON-backed loader, tests. |
| 05. Entity system starter (NPCs) | ✅ Done | 2026-04-14 | Add NPC entities with simple idle/path behavior and collisions. | NPC data model, draw/update pass, collision probes, tests. |
| 06. Trigger zones + scripts v1 | ⬜ Planned | 2026-04-24 to 2026-04-27 | Add sign/warp triggers and basic script execution hooks. | Trigger map layer + callback registry + tests. |
| 07. UI menus foundation | ⬜ Planned | 2026-04-28 to 2026-05-02 | Add menu stack and keyboard navigation primitives. | Start menu opens/closes, selection state, test coverage. |
| 08. Battle vertical slice | ⬜ Planned | 2026-05-03 to 2026-05-09 | Prototype one wild encounter flow end-to-end. | Enter battle scene, selectable move, damage preview. |
| 09. Save/load browser persistence | ⬜ Planned | 2026-05-10 to 2026-05-12 | Persist player/map state to local storage. | Save schema, migration guard, resume flow, tests. |
| 10. Data convergence with decomp exports | ⬜ Planned | 2026-05-13+ | Incrementally replace placeholder data with extracted assets/metadata. | At least one route fully data-driven from exported adapter format. |

## Status update rule

Whenever a step receives merged implementation work:

1. Update this table status marker.
2. Add date-stamped notes in `ts-game/roadmap/plans/step-XX-*.md`.
3. Link any new tests under the step note.
