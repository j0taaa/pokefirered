# Headless compatibility audit

This audit covers the current browser runtime composition in `ts-game/src/main.ts` and the direct adapters it wires in. Browser behavior remains intact; this report only records blockers and future extraction seams for a Node/headless text API.

## Direct browser globals used by runtime composition

- `document.querySelector` selects `#app` for the browser shell mount.
- `document.createElement` creates the shell `div`, viewport `div`, and `canvas` passed to `CanvasRenderer`.
- `window.__pokemonFireRedAudioEvents`, `window.__pokemonFireRedAudioDebug`, and `window.__pokemonFireRedLinkDebug` expose browser QA/debug hooks.
- `window.localStorage` is passed into save reload/write paths as the save backing store.
- `window.addEventListener('beforeunload', ...)` detaches input, resets audio, and stops the loop on browser teardown.
- `BrowserInputAdapter.attach()` registers `window` `keydown`/`keyup` listeners and uses `KeyboardEvent.code` plus `preventDefault()`.
- `GameLoop.start()` uses `performance.now()` and `requestAnimationFrame`; `GameLoop.stop()` uses `cancelAnimationFrame`.
- `CanvasRenderer` requires an `HTMLCanvasElement`, obtains a `CanvasRenderingContext2D`, uses `Image`, `document.createElement('canvas')`, `performance.now()`, and canvas drawing APIs.
- Rendering helpers imported by `CanvasRenderer` use `fetch` to load Vite-emitted image/bin asset URLs, `ImageData`, `HTMLCanvasElement`, and `CanvasRenderingContext2D`.
- `WebAudioEventAdapter` uses `window.AudioContext` / `window.webkitAudioContext`, oscillator/gain nodes, and audio node event listeners.

## Related module compatibility

| Module | Category | Browser dependency | Node/headless path |
| --- | --- | --- | --- |
| `src/main.ts` | Browser-only | DOM shell creation, `window` debug hooks, `localStorage`, browser input, canvas renderer, Web Audio adapter, RAF loop, `beforeunload` | Extract gameplay/session composition behind injected adapters in Task 3. |
| `src/input/inputState.ts` `InputSnapshot` | Headless-safe | Type-only snapshot shape has no runtime browser dependency. | Reuse as the text API input contract. |
| `src/input/inputState.ts` `BrowserInputAdapter` | Browser-only | `KeyboardEvent`, `window.addEventListener`, `window.removeEventListener`, `preventDefault()` | Implement `InputAdapter` with queued/headless snapshots. |
| `src/core/gameLoop.ts` | Browser-only as currently written | `performance.now()`, `requestAnimationFrame`, `cancelAnimationFrame` | A Node session can step explicitly or use an injected scheduler after extraction. |
| `src/rendering/canvasRenderer.ts` | Browser-only | `HTMLCanvasElement`, `CanvasRenderingContext2D`, `Image`, `ImageData`, `document.createElement`, `fetch`, canvas drawing, Vite asset URLs | Use a no-op or text render adapter for headless sessions. |
| `src/audio/webAudioAdapter.ts` | Browser-only playback adapter | `window`, `AudioContext`, `webkitAudioContext`, oscillator/gain nodes | Use a no-op audio adapter while preserving event consumption. |
| `src/game/saveData.ts` | Headless-safe with injected storage | Defines `StorageLike`; only direct browser-specific reference is `DOMException` classification for quota messaging in the `catch` path. | Use an in-memory or file-backed storage adapter; avoid `window.localStorage`. |
| `src/game/saveMigration.ts` | Headless-safe | None found. | Can import directly in Node. |
| `src/game/saveValidation.ts` | Headless-safe | None found. | Can import directly in Node. |

## Modules that can run in Node after extraction

The gameplay/state modules already imported by `main.ts` are generally suitable for Node when they are not imported through browser adapters: player, NPC, interaction, scripts, triggers, menu, battle, field effects, weather, safari, save location, field actions, warp/collision/order coordinators, map loading, RNG, party/pokedex storage, and save serialization/validation/migration. The immediate extraction boundary should keep these pure gameplay modules behind injected `StorageAdapter`, `AudioAdapter`, `InputAdapter`, and `RenderAdapter` implementations.

## Adapter seams for Task 3

- `StorageAdapter` owns string save payload persistence with `load`, `save`, and `remove` operations.
- `AudioAdapter` consumes deterministic field audio events and can be implemented as a no-op in headless mode.
- `InputAdapter` exposes `readSnapshot()` using the existing `InputSnapshot` shape.
- `RenderAdapter` receives extracted frame state and can render to canvas, text, or no-op targets.
