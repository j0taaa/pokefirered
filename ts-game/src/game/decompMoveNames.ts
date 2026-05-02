import moveNamesSource from '../../../src/data/text/move_names.h?raw';

export interface MoveNameEntry {
  move: string;
  name: string;
}

export const MOVE_NAMES_SOURCE = moveNamesSource;

export const parseMoveNames = (source: string): MoveNameEntry[] =>
  [...source.matchAll(/\[(MOVE_\w+)\]\s*=\s*_\("([\s\S]*?)"\)/gu)].map((match) => ({
    move: match[1],
    name: match[2]
  }));

export const gMoveNames = parseMoveNames(moveNamesSource);

export const getMoveName = (move: string): string | undefined =>
  gMoveNames.find((entry) => entry.move === move)?.name;
