
## 2026-05-06T00:37:03.403170+00:00 Task 2 raw-control leak
- First live smoke failed because navigation options exposed tile/input direction `up` in the public action payload. Fixed `actionEnumerator` to expose semantic directions and `actionExecutor` to translate them back internally.
- `lsp_diagnostics` could not run because `typescript-language-server` is not installed in this environment; used `node --check`, focused tests, full tests, `npm run build`, and `npm run api:build` instead.

## 2026-05-06 Task 3 verification notes
- `lsp_diagnostics` remains unavailable because `typescript-language-server` and `biome` are not installed. Used `node --check`, Vitest, `npm run build`, `npm run api:build`, and live API smoke instead.
- The plan's lowercase glob `test/textApi*.test.ts test/api*.test.ts` does not match under zsh/current filenames. Exact current `textApi*` test file paths were used instead and all 72 tests passed.
## Unresolved Task 4 blocker
- Full harness remains blocked at `Exit north to Route1`: semantic connection navigation repeats from Pallet Town without crossing to `MAP_ROUTE1`. Evidence: `.sisyphus/evidence/api-elite-four-trace.jsonl` and blocker 4 in `.sisyphus/evidence/api-elite-four-blockers.md`.
- A direct boundary-step attempt did not resolve the connection transition and was reverted to avoid leaving unverified code.

## 2026-05-06 Task 4 Pallet starter blocker status
- Fixed the stale script-wait lock: completed but undisposed script movement tasks no longer keep the Text API in `script` mode. This let the harness leave Oak's pre-starter script and reach overworld starter selection.
- Fixed semantic guard false positives for normal prose (`A person...`, `start their interaction`) by requiring input-context wording for raw control tokens.
- Current unresolved blocker: the harness repeatedly chooses `Go to LOCALID BULBASAUR BALL` while already at `PALLET TOWN, facing up at 8, 5`; next work should make starter-ball interaction explicit or prioritize interaction over same-location navigation.
