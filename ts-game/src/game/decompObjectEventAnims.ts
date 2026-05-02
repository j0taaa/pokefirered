import objectEventAnimsSource from '../../../src/data/object_events/object_event_anims.h?raw';

export interface DecompObjectEventAnimCommand {
  command: 'ANIMCMD_FRAME' | 'ANIMCMD_JUMP';
  rawArgs: string;
  frame?: number;
  duration?: number;
  target?: number;
  hFlip?: boolean;
}

export interface DecompObjectEventAnim {
  symbol: string;
  commands: DecompObjectEventAnimCommand[];
}

export interface DecompObjectEventAnimTableEntry {
  index: string | null;
  position: number;
  symbol: string;
}

export interface DecompObjectEventAnimTable {
  symbol: string;
  entries: DecompObjectEventAnimTableEntry[];
}

export const OBJECT_EVENT_ANIMS_SOURCE = objectEventAnimsSource;

const parseAnimCommand = (command: string, rawArgs: string): DecompObjectEventAnimCommand => {
  const args = rawArgs.split(',').map((arg) => arg.trim()).filter(Boolean);

  if (command === 'FRAME') {
    return {
      command: 'ANIMCMD_FRAME',
      rawArgs,
      frame: Number.parseInt(args[0]!, 10),
      duration: Number.parseInt(args[1]!, 10),
      hFlip: rawArgs.includes('.hFlip = TRUE')
    };
  }

  return {
    command: 'ANIMCMD_JUMP',
    rawArgs,
    target: Number.parseInt(args[0]!, 10)
  };
};

export const parseObjectEventAnims = (
  source = objectEventAnimsSource
): DecompObjectEventAnim[] =>
  [...source.matchAll(/static const union AnimCmd (sAnim_\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => ({
      symbol: match[1]!,
      commands: [...(match[2] ?? '').matchAll(/ANIMCMD_(FRAME|JUMP)\(([^)]*)\)/gu)]
        .map((commandMatch) => parseAnimCommand(commandMatch[1]!, commandMatch[2]!.trim()))
    }));

export const parseObjectEventAnimTables = (
  source = objectEventAnimsSource
): DecompObjectEventAnimTable[] =>
  [...source.matchAll(/const union AnimCmd \*const (sAnimTable_\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => ({
      symbol: match[1]!,
      entries: (match[2] ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry, position) => {
          const designatedMatch = entry.match(/^\[([A-Z0-9_]+)\]\s*=\s*(sAnim_\w+)$/u);
          return designatedMatch
            ? {
              index: designatedMatch[1]!,
              position,
              symbol: designatedMatch[2]!
            }
            : {
              index: null,
              position,
              symbol: entry
            };
        })
    }));

export const gObjectEventAnims = parseObjectEventAnims();
export const gObjectEventAnimTables = parseObjectEventAnimTables();

const objectEventAnimsBySymbol = new Map(gObjectEventAnims.map((anim) => [anim.symbol, anim]));
const objectEventAnimTablesBySymbol = new Map(gObjectEventAnimTables.map((table) => [table.symbol, table]));

export const getDecompObjectEventAnim = (
  symbol: string
): DecompObjectEventAnim | null =>
  objectEventAnimsBySymbol.get(symbol) ?? null;

export const getDecompObjectEventAnimTable = (
  symbol: string
): DecompObjectEventAnimTable | null =>
  objectEventAnimTablesBySymbol.get(symbol) ?? null;
