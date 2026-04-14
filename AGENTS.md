# AGENTS.md

Repository guidance for contributors and coding agents.

## Goal

This repository now has two tracks:

1. **Decomp track** (existing C/ASM codebase)
2. **Browser port track** (`ts-game/`, TypeScript)

Keep work clearly scoped to one track per change when possible.

## Rules for TypeScript browser-port work

- Put all web/TypeScript runtime code under `ts-game/`.
- Prefer small, incremental commits that keep the project runnable.
- Add tests for new non-trivial logic where practical.
- Do not commit generated bundles or binary artifacts.
- Keep architecture decoupled (rendering/input/data adapters separated).

## Documentation expectations

When adding or changing major structure:

- Update `README.md` at repo root for high-level orientation.
- Update `ts-game/README.md` for local folder expectations.
- Include a brief migration/next-steps note when introducing new port scaffolding.

## Commit quality checklist

Before committing:

- Confirm files are in the correct track (`ts-game/` vs decomp tree).
- Run available checks/tests relevant to changed files.
- Keep commit messages descriptive and scoped.

