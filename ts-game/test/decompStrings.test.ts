import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import * as strings from '../src/game/decompStrings';

type StringEntry = readonly [string, string];

const repoRoot = resolve(process.cwd(), '..');

const unescapeCString = (text: string): string => {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '\\') {
      out += text[i];
      continue;
    }
    const esc = text[++i];
    if (esc === undefined) {
      out += '\\';
    } else if (esc === 'n') {
      out += '\n';
    } else if (esc === 'r') {
      out += '\r';
    } else if (esc === 't') {
      out += '\t';
    } else if (esc === '\\') {
      out += '\\';
    } else if (esc === '"') {
      out += '"';
    } else if (esc === '0') {
      out += '\0';
    } else {
      out += `\\${esc}`;
    }
  }
  return out;
};

const expandStringsSource = (): string => {
  const main = readFileSync(resolve(repoRoot, 'src/strings.c'), 'utf8');
  return main
    .replace('#include "data/text/quest_log.h"', readFileSync(resolve(repoRoot, 'src/data/text/quest_log.h'), 'utf8'))
    .replace('#include "data/text/teachy_tv.h"', readFileSync(resolve(repoRoot, 'src/data/text/teachy_tv.h'), 'utf8'));
};

const parseCStringDeclarations = (): StringEntry[] => {
  const source = expandStringsSource();
  const declarationPattern = /(?:ALIGNED\(4\)\s*)?const\s+u8\s+(\w+)\[\]\s*=\s*_\((.*?)\);/gs;
  const literalPattern = /"((?:\\.|[^"\\])*)"/gs;
  const entries: StringEntry[] = [];
  for (const declaration of source.matchAll(declarationPattern)) {
    const [, name, body] = declaration;
    const value = [...body.matchAll(literalPattern)].map((literal) => unescapeCString(literal[1])).join('');
    entries.push([name, value]);
  }
  return entries;
};

describe('decomp strings.c parity', () => {
  test('exports every strings.c declaration including expanded text headers in order', () => {
    const parsed = parseCStringDeclarations();
    expect(strings.decompStringsSourceFiles).toEqual(['src/strings.c', 'src/data/text/quest_log.h', 'src/data/text/teachy_tv.h']);
    expect(strings.decompStrings).toHaveLength(parsed.length);
    expect(strings.decompStrings.map(([name]) => name)).toEqual(parsed.map(([name]) => name));
    for (const [name, value] of parsed) {
      expect(strings.decompStringByName[name as keyof typeof strings.decompStringByName]).toBe(value);
    }
  });

  test('preserves representative control sequences, multiline literals, and unicode text exactly', () => {
    expect(strings.gText_MenuPokemon).toBe('POKéMON');
    expect(strings.gText_OakForbidsUseOfItemHere).toBe("OAK: {PLAYER}!\nThis isn't the time to use that!{PAUSE_UNTIL_PRESS}");
    expect(strings.gText_HOFDexRating).toContain('\\p');
    expect(strings.gTeachyTvText_PokedudeSaysHello).toContain("It's me, the POKé DUDE!");
    expect(strings.gText_QuestLog_PreviouslyOnYourQuest).toBe('Previously on your quest…');
    expect(strings.gText_QuestLog_UsedDive).toContain('ダイビング');
  });
});
