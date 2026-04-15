# ts-game (TypeScript Browser Port Track)

This folder contains a runnable browser prototype for the FireRed port effort.

## Current vertical slice

The app currently implements a functional runtime slice:

- Vite + TypeScript app shell (`index.html`, `src/main.ts`)
- Fixed-step game loop
- Browser keyboard input adapter (WASD/Arrows + Shift run + Z/Enter interact)
- Map loading adapter boundary (`MapSource`) with JSON-backed prototype fixture
- Compact Route 1 adapter data checked against original decomp map/layout files
- Metatile behavior rows for Route 1 ledges/signs/grass and directional blocking helpers
- Route 1 metadata/connections exported from decomp map JSON
- South ledge jumping as a two-tile movement action
- Player movement + facing + movement animation state
- NPC entity starter with patrol paths, idle pauses, and map-aware collision probes
- Object-event-style NPC interaction scripts (`interactScriptId`) with face-player behavior
- Camera-follow viewport with map-bound clamping
- Canvas renderer with visible-tile culling and sprite-like player rendering
- HUD for FPS + player state + camera coordinates + NPC/dialog status + last-run script id
- START menu flow with FireRed-like dynamic option composition and submenu callbacks
- START > OPTION panel now supports editable Text Speed / Battle Scene / Battle Style settings
- Battle vertical slice v4: command selection (`FIGHT`/`BAG`/`POKéMON`/`RUN`), full Gen-3 type-chart effectiveness sampling for preview math, Poké Ball/Great Ball shake-count capture messaging, poison end-turn chip damage, party switching, and improved enemy move-utility heuristics
- Browser save/load persistence adapter (localStorage-backed) wired to FireRed-style START > SAVE ask/overwrite flow
- Unit tests for movement, collisions (map + entity), camera behavior, NPC logic, trigger execution, and map source parsing
- Route 1 parity tests compare metadata, connections, object events, background events, dimensions, `MAPGRID_COLLISION_MASK` collision rows, encounter-terrain bits, and metatile behavior rows with the original decomp data

## Folder layout

- `src/core` — runtime primitives (loop, vectors, camera)
- `src/input` — browser input adapters / snapshots
- `src/world` — map and collision data structures
- `src/game` — gameplay state stepping
- `src/rendering` — canvas rendering adapter
- `src/ui` — lightweight DOM HUD bindings
- `test` — Vitest unit tests
- `roadmap` — tracked roadmap + per-step planning notes

## Commands

Run inside `ts-game/`:

- `npm install`
- `npm run dev`
- `npm run test`
- `npm run build`
- `npm run export:map -- Route1`

## Migration note / next steps

Roadmap source of truth is now in `ts-game/roadmap/ROADMAP.md`.

Near-term next increments:

1. Replace START-menu placeholder panels with fully interactive menu scenes (party/bag/options + deeper save UX parity).
2. Expand map switching through Route 1 connections.
3. Replace primitive player visuals with true sprite-sheet frames.
4. Extend battle scene parity with status conditions, proper Poké Ball shake phases, and richer AI move utility heuristics.
