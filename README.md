# Pokémon FireRed Decomp + TypeScript Browser Port (WIP)

This repository currently contains the Pokémon FireRed / LeafGreen decompilation project, and now also includes the initial scaffold direction for a **TypeScript browser-playable port**.

## Current status

- ✅ Existing decompilation source remains the primary codebase.
- ✅ A dedicated destination folder for the TypeScript/browser version has been created at `ts-game/`.
- ✅ This README and repository guidance have been updated to support incremental migration planning.
- 🚧 Browser port is now at an early playable prototype: map rendering, keyboard movement, collisions, a wild-battle command slice, and runtime tests are in `ts-game/`.

## Original project outputs

The decompilation builds the following ROM images:

- [**pokefirered.gba**](https://datomatic.no-intro.org/?page=show_record&s=23&n=1616) `sha1: 41cb23d8dccc8ebd7c649cd8fbb58eeace6e2fdc`
- [**pokeleafgreen.gba**](https://datomatic.no-intro.org/?page=show_record&s=23&n=1617) `sha1: 574fa542ffebb14be69902d1d36f1ec0a4afd71e`
- [**pokefirered_rev1.gba**](https://datomatic.no-intro.org/?page=show_record&s=23&n=1672) `sha1: dd5945db9b930750cb39d00c84da8571feebf417`
- [**pokeleafgreen_rev1.gba**](https://datomatic.no-intro.org/index.php?page=show_record&s=23&n=1668) `sha1: 7862c67bdecbe21d1d69ce082ce34327e1c6ed5e`
- [**pokefirered_switch.gba**](https://datomatic.no-intro.org/index.php?page=show_record&s=23&n=x550) `sha1: baa452d0b24629dd7782cfc07a8984085dde1311`
- [**pokeleafgreen_switch.gba**](https://datomatic.no-intro.org/index.php?page=show_record&s=23&n=x551) `sha1: 62b9fc77549dbc67032eb6cbd0ea6ad3b825690f`

## TypeScript browser-port destination

The destination folder for the web port is:

```text
ts-game/
```

Inside `ts-game/`, the initial structure is intended to support:

- Rendering and game loop systems (browser canvas/WebGL)
- Input mapping (keyboard + future touch/controller)
- Data loaders/adapters for extracted game data
- A standalone TypeScript toolchain and test setup


## Browser-port prototype quick start

The TypeScript app is now runnable inside `ts-game/`:

```bash
cd ts-game
npm install
npm run dev
```

This currently renders a prototype route map with blocked terrain, camera-follow viewport, trigger markers, and a movable player with basic animation (WASD/Arrows, Shift to run, Z/Enter to interact), backed by unit-tested movement/collision/camera/NPC/trigger modules.

## Suggested migration phases

Roadmap now lives at `ts-game/roadmap/ROADMAP.md` with status markers and per-step notes under `ts-game/roadmap/plans/`.

Current completion snapshot:

1. ✅ Runtime baseline + planning scaffolding
2. ✅ Playable viewport + camera follow
3. ✅ Player visual pass v1
4. ✅ Map loading adapter boundary
5. ✅ Entity system starter (NPC patrols + collision probes)
6. ✅ Interaction pass v1 (NPC idle pauses, face-player interaction, dialog stubs)
7. ✅ Trigger zones + script callback hooks v1 (sign/step/warp prototype events)
8. ✅ UI menus foundation (START menu open/close + selection + tests)
9. ✅ Battle slice v1 (wild encounter entry + move select + damage preview prototype)

## Developer setup (decomp side)

To build and work with the original decompilation project, see:

- [INSTALL.md](INSTALL.md)

For contacts and other pret projects:

- [pret.github.io](https://pret.github.io/)

## Contribution notes for the port

For now, prioritize:

- Small, reviewable PRs
- Deterministic tests around new logic
- Avoiding direct coupling between emulator assumptions and browser runtime architecture
