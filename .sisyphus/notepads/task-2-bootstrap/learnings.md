2026-05-02: `ts-game` build needed `@types/node` in devDependencies to satisfy the Node type references in `tsconfig.json`.
2026-05-02: Optional decomp-backed tests should gate both imports and execution on source-file presence to avoid runtime `?raw` import failures.
