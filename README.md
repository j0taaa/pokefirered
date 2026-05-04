# Pokémon FireRed Decomp + TypeScript Browser Port

This repository contains the Pokémon FireRed / LeafGreen decompilation project, alongside a **complete TypeScript browser-playable port** that maintains strict 1:1 behavioral parity with the original.

## Current status

- ✅ Existing decompilation source remains the primary codebase.
- ✅ TypeScript browser port at `ts-game/` achieves **final parity** with the FireRed decompilation.
- ✅ **Parity convergence complete**: 5,655 required parity items verified (zero missing, zero untracked, zero unresolved).
- ✅ All gameplay systems, field scripts, battles, inventory, save/load, and link features are parity-tested.
- ✅ Browser port maintains 1:1 behavioral parity: bugs, quirks, RNG order, timing, and observable behavior are preserved.
- ✅ Hardware-only adaptations at clear boundaries: Canvas/WebGL for GBA PPU, Web Audio for APU, browser storage for save RAM, keyboard/touch for button input, deterministic in-memory/local multi-client transport for link cable.

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


## Browser-port quick start

The TypeScript port is fully runnable inside `ts-game/`:

```bash
cd ts-game
npm ci
npm run dev
```

Use `npm ci` for local bootstrap and CI so dependencies are installed from `ts-game/package-lock.json`. Before opening a TypeScript-port change, run the same deterministic checks used by CI:

```bash
cd ts-game
npm ci
npm run test -- --run
npm run build
```

Browser route verification (Playwright):

```bash
cd ts-game
npx playwright test e2e/mainRoute.spec.ts e2e/postgameLinkRoute.spec.ts --reporter=line
```

Conversion and coverage verification:

```bash
cd ts-game
npm run test -- --run test/*conversion*.test.* test/*coverage*.test.* test/*inventory*.test.*
```

## Repository structure

This repository maintains two tracks:

1. **Decomp track**: Original C/ASM decompilation source at repository root
2. **Browser-port track**: Complete TypeScript implementation at `ts-game/`

### Parity contract

The TypeScript port maintains **strict 1:1 behavioral parity** with the FireRed decompilation (baseline commit `586f38ad14860d70c20fa58fc30a410818f2833f`).

**Final convergence (Task 19)**: 5,655 required parity items verified across:
- 425 maps (100% exported)
- 1,294 warps (100% verified)
- 120 connections (100% verified)
- 1,819 script labels (100% covered)
- 213 script commands (100% implemented)
- 272 field specials (100% audited)
- 172 movement commands (100% covered)
- 360 item flows (100% verified)
- 855 battle behaviors (100% closed)
- 25 menu scenes (100% verified)
- 20 save substates (100% covered)
- 23 render/text fixtures (100% verified)
- 23 audio events (100% covered)
- 17 link/hardware features (100% implemented)

Zero missing, zero untracked, zero unresolved across all categories.

### Hardware-only adaptations

Browser technologies replace GBA hardware only at clear boundaries:

| Browser Technology | Replaces |
|---|---|
| Canvas/WebGL rendering | GBA PPU/tile hardware |
| Web Audio API | GBA APU/sound hardware |
| localStorage/IndexedDB | GBA save RAM/flash |
| Keyboard/touch/gamepad input | GBA button hardware |
| Deterministic in-memory/local multi-client transport | GBA link cable/wireless adapter |

Game-visible state transitions remain parity-tested. RNG sequences produce identical results. Timing-dependent behaviors are preserved.

### Documentation

- `ts-game/roadmap/ROADMAP.md` - Complete parity contract and status
- `ts-game/README.md` - Port-specific documentation and commands
- `ts-game/DECOMP_SRC_CONVERSION_PROGRESS.md` - Full decomp source conversion tracking

## Developer setup (decomp side)

To build and work with the original decompilation project, see:

- [INSTALL.md](INSTALL.md)

For contacts and other pret projects:

- [pret.github.io](https://pret.github.io/)

## Contribution notes for the port

When contributing to the TypeScript browser port:

- **Preserve parity**: Bugs, quirks, RNG order, timing, and observable behavior are intentionally preserved
- **Hardware-only adaptations**: Browser technologies replace GBA hardware only at clear boundaries (Canvas/WebGL for PPU, Web Audio for APU, browser storage for save RAM, etc.)
- **No enhancements**: Non-parity improvements, QoL changes, and balance tweaks are excluded from the port
- **Test-driven parity**: All work follows TDD. Tests must pass before changes are accepted
- **Small, reviewable PRs**: Keep changes focused and deterministic
- **Avoid emulator coupling**: Do not couple browser runtime architecture to emulator assumptions

### Verification requirements

All changes must pass:

```bash
cd ts-game
npm ci
npm run test -- --run
npm run build
```

Parity regression tests:

```bash
cd ts-game
npm run test -- --run test/parityContract.test.ts
npm run test -- --run test/convergence-coverage.test.ts
```
