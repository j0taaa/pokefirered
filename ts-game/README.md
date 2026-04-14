# ts-game (TypeScript Browser Port Track)

This folder now contains a runnable browser prototype for the FireRed port effort.

## Current vertical slice

The app currently implements a small but functional runtime slice:

- Vite + TypeScript app shell (`index.html`, `src/main.ts`)
- Fixed-step game loop
- Browser keyboard input adapter (WASD/Arrows + Shift run)
- Tile map data model with pixel collision checks
- Basic player movement + facing state
- Canvas renderer for map/player
- HUD for FPS + player state
- Unit tests for collision and movement logic

## Folder layout

- `src/core` — shared runtime primitives (loop, vectors)
- `src/input` — browser input adapters / snapshots
- `src/world` — map and collision data structures
- `src/game` — gameplay state stepping
- `src/rendering` — canvas rendering adapter
- `src/ui` — lightweight DOM HUD bindings
- `test` — Vitest unit tests

## Commands

Run inside `ts-game/`:

- `npm install`
- `npm run dev`
- `npm run test`
- `npm run build`

## Migration note / next steps

This is still intentionally pre-production scaffolding. Recommended next increments:

1. Add sprite-sheet based character rendering (replace placeholder rectangle).
2. Introduce camera + map chunking instead of full-map draw each frame.
3. Load extracted map metadata from decomp-generated data adapters.
4. Add NPC entities and script trigger zones.
