import movementTypeFuncTablesSource from '../../../src/data/object_events/movement_type_func_tables.h?raw';

export type DecompDirectionToken = 'DIR_SOUTH' | 'DIR_NORTH' | 'DIR_WEST' | 'DIR_EAST';

export interface DecompMovementTypePrototype {
  returnType: 'bool8' | 'u8';
  name: string;
}

export interface DecompMovementTypeFunctionTable {
  name: string;
  functions: string[];
}

export interface DecompMovementDirectionTable {
  name: string;
  directions: DecompDirectionToken[];
}

export const OBJECT_EVENT_MOVEMENT_TYPE_FUNC_TABLES_SOURCE = movementTypeFuncTablesSource;

const stripBlockComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//gu, '');

const stripLineComment = (line: string): string =>
  line.replace(/\/\/.*$/u, '').trim();

export const parseMovementTypePrototypes = (
  source = movementTypeFuncTablesSource
): DecompMovementTypePrototype[] =>
  [...source.matchAll(/^static\s+(bool8|u8)\s+([A-Za-z0-9_]+)\(/gmu)]
    .map((match) => ({
      returnType: match[1] as DecompMovementTypePrototype['returnType'],
      name: match[2]!
    }));

export const parseMovementTypeFunctionTables = (
  source = movementTypeFuncTablesSource
): DecompMovementTypeFunctionTable[] =>
  [...source.matchAll(/(?:u8|bool8)\s+\(\*const\s+(g[A-Za-z0-9_]+)\[\]\)[^{=]*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => ({
      name: match[1]!,
      functions: stripBlockComments(match[2] ?? '')
        .split(',')
        .map(stripLineComment)
        .filter(Boolean)
    }));

export const parseMovementDirectionTables = (
  source = movementTypeFuncTablesSource
): DecompMovementDirectionTable[] =>
  [...source.matchAll(/const\s+u8\s+(g[A-Za-z0-9_]+Directions)\[\]\s*=\s*\{([^}]*)\};/gu)]
    .map((match) => ({
      name: match[1]!,
      directions: (match[2] ?? '')
        .split(',')
        .map(stripLineComment)
        .filter(Boolean) as DecompDirectionToken[]
    }));

export const gMovementTypePrototypes = parseMovementTypePrototypes();
export const gMovementTypeFunctionTables = parseMovementTypeFunctionTables();
export const gMovementDirectionTables = parseMovementDirectionTables();

const functionTablesByName = new Map(gMovementTypeFunctionTables.map((table) => [table.name, table]));
const directionTablesByName = new Map(gMovementDirectionTables.map((table) => [table.name, table]));

export const getDecompMovementTypeFunctionTable = (
  name: string
): DecompMovementTypeFunctionTable | null =>
  functionTablesByName.get(name) ?? null;

export const getDecompMovementDirectionTable = (
  name: string
): DecompMovementDirectionTable | null =>
  directionTablesByName.get(name) ?? null;

export const getDecompMovementDirectionTokens = (name: string): DecompDirectionToken[] =>
  [...(getDecompMovementDirectionTable(name)?.directions ?? [])];

export const decompDirectionTokenToFacing = (
  direction: DecompDirectionToken
): 'down' | 'up' | 'left' | 'right' => {
  switch (direction) {
    case 'DIR_SOUTH':
      return 'down';
    case 'DIR_NORTH':
      return 'up';
    case 'DIR_WEST':
      return 'left';
    case 'DIR_EAST':
      return 'right';
  }
};

export const getDecompMovementDirectionFacings = (
  name: string
): Array<'down' | 'up' | 'left' | 'right'> =>
  getDecompMovementDirectionTokens(name).map(decompDirectionTokenToFacing);
