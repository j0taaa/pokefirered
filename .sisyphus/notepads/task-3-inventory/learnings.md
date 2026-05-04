2026-05-02: Coverage inventory can read decomp maps from `data/maps/*/map.json`; generated aggregate includes 425 required maps and committed TS map JSON currently implements 77 non-prototype maps.
2026-05-02: `data/script_cmd_table.inc` is the reliable field command table; implemented TS handlers are exported as `ScrCmd_*` functions in `ts-game/src/game/decompScrcmd.ts`.
2026-05-02: Item inventory source of truth is `src/data/items.json`, which includes `fieldUseFunc`, `battleUseFunc`, pocket, and type fields needed for item-use context coverage.
