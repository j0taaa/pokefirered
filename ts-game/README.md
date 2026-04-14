# ts-game (TypeScript Browser Port Track)

This folder contains a runnable browser prototype for the FireRed port effort.

## Current vertical slice

The app currently implements a functional runtime slice:

- Vite + TypeScript app shell (`index.html`, `src/main.ts`)
- Fixed-step game loop
- Browser keyboard input adapter (WASD/Arrows + Shift run)
- Map loading adapter boundary (`MapSource`) with JSON-backed prototype fixture
- Player movement + facing + movement animation state
- Camera-follow viewport with map-bound clamping
- Canvas renderer with visible-tile culling and sprite-like player rendering
- HUD for FPS + player state + camera coordinates
- Unit tests for movement, collisions, camera behavior, and map source parsing

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

1. Add NPC entities and simple trigger zones.
2. Introduce trigger zones + script callback hooks.
3. Replace primitive player visuals with true sprite-sheet frames.
