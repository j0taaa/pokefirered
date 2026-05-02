import movementActionFuncTablesSource from '../../../src/data/object_events/movement_action_func_tables.h?raw';

export interface DecompMovementActionFuncTable {
  symbol: string;
  functions: string[];
}

export interface DecompMovementActionFuncEntry {
  index: string;
  symbol: string;
}

export const MOVEMENT_ACTION_FUNC_TABLES_SOURCE = movementActionFuncTablesSource;

export const parseMovementActionFunctionPrototypes = (
  source = movementActionFuncTablesSource
): string[] =>
  [...source.matchAll(/^static bool8 (MovementAction_\w+)\(struct ObjectEvent \*, struct Sprite \*\);/gmu)]
    .map((match) => match[1]!);

export const parseMovementActionFunctionTableDeclarations = (
  source = movementActionFuncTablesSource
): string[] =>
  [...source.matchAll(/^static bool8 \(\*const (sMovementActionFuncs_\w+)\[\]\)\(struct ObjectEvent \*, struct Sprite \*\);/gmu)]
    .map((match) => match[1]!);

export const parseMovementActionFunctionTable = (
  source = movementActionFuncTablesSource
): DecompMovementActionFuncEntry[] => {
  const match = source.match(/static bool8 \(\*const \*const sMovementActionFuncs\[\]\)\(struct ObjectEvent \*, struct Sprite \*\)\s*=\s*\{([\s\S]*?)\n\};/u);
  return [...(match?.[1] ?? '').matchAll(/\[(MOVEMENT_ACTION_[A-Z0-9_]+)\]\s*=\s*(sMovementActionFuncs_\w+)/gu)]
    .map((entryMatch) => ({
      index: entryMatch[1]!,
      symbol: entryMatch[2]!
    }));
};

export const parseMovementActionStepTables = (
  source = movementActionFuncTablesSource
): DecompMovementActionFuncTable[] =>
  [...source.matchAll(/^static bool8 \(\*const (sMovementActionFuncs_\w+)\[\]\)\(struct ObjectEvent \*, struct Sprite \*\)\s*=\s*\{([\s\S]*?)\n\};/gmu)]
    .map((match) => ({
      symbol: match[1]!,
      functions: (match[2] ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    }));

export const parseDirectionAnimFuncsBySpeed = (
  source = movementActionFuncTablesSource
): DecompMovementActionFuncEntry[] => {
  const match = source.match(/static bool8 \(\*const sDirectionAnimFuncsBySpeed\[\]\)\(u8\)\s*=\s*\{([\s\S]*?)\n\};/u);
  return [...(match?.[1] ?? '').matchAll(/\[(MOVE_SPEED_[A-Z0-9_]+)\]\s*=\s*(GetMoveDirection\w+)/gu)]
    .map((entryMatch) => ({
      index: entryMatch[1]!,
      symbol: entryMatch[2]!
    }));
};

export const gMovementActionFunctionPrototypes = parseMovementActionFunctionPrototypes();
export const gMovementActionFunctionTableDeclarations = parseMovementActionFunctionTableDeclarations();
export const sMovementActionFuncs = parseMovementActionFunctionTable();
export const gMovementActionStepTables = parseMovementActionStepTables();
export const sDirectionAnimFuncsBySpeed = parseDirectionAnimFuncsBySpeed();

const movementActionStepTablesBySymbol = new Map(
  gMovementActionStepTables.map((table) => [table.symbol, table])
);
const movementActionFuncEntriesByIndex = new Map(
  sMovementActionFuncs.map((entry) => [entry.index, entry])
);

export const getDecompMovementActionStepTable = (
  symbol: string
): DecompMovementActionFuncTable | null =>
  movementActionStepTablesBySymbol.get(symbol) ?? null;

export const getDecompMovementActionFuncEntry = (
  index: string
): DecompMovementActionFuncEntry | null =>
  movementActionFuncEntriesByIndex.get(index) ?? null;
