# ts-game (TypeScript Browser Port Track)

This folder contains a runnable browser prototype for the FireRed port effort.

## Current vertical slice

The app currently implements a functional runtime slice:

- Vite + TypeScript app shell (`index.html`, `src/main.ts`)
- Fixed-step game loop
- Browser keyboard input adapter (WASD/Arrows + Shift run + Z/Enter interact)
- Map loading adapter boundary (`MapSource`) with JSON-backed prototype fixture
- Player movement + facing + movement animation state
- NPC entity starter with patrol paths, idle pauses, and map-aware collision probes
- Object-event-style NPC interaction scripts (`interactScriptId`) with face-player behavior
- Camera-follow viewport with map-bound clamping
- Canvas renderer with visible-tile culling and sprite-like player rendering
- HUD for FPS + player state + camera coordinates + NPC/dialog status + last-run script id
- START menu flow with FireRed-like dynamic option composition and submenu callbacks
- Battle vertical slice v1: step-triggered wild encounter entry, command-select move UI, and Gen-3-style damage preview
- Browser save/load persistence adapter (localStorage-backed) wired to START > SAVE confirmation
- Unit tests for movement, collisions (map + entity), camera behavior, NPC logic, trigger execution, and map source parsing

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

## Migration note / next steps

Roadmap source of truth is now in `ts-game/roadmap/ROADMAP.md`.

Near-term next increments:

1. Replace START-menu placeholder panels with fully interactive menu scenes (party/bag/options + deeper save UX parity).
2. Expand trigger/script parity to include richer variable/flag gates and object-event scripts.
3. Replace primitive player visuals with true sprite-sheet frames.
4. Extend battle scene parity beyond single-turn knockout prototype (AI choice, capture, and switch flow).
