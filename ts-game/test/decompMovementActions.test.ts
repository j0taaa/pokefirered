import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getDecompMovementActionById,
  getDecompMovementActionForCommand
} from '../src/game/decompMovementActions';

describe('decomp movement actions', () => {
  test('maps script movement commands to FireRed movement action ids', () => {
    expect(getDecompMovementActionForCommand('face_down')).toMatchObject({
      actionId: 0x00,
      kind: 'face',
      direction: 'down',
      distanceTiles: 0
    });
    expect(getDecompMovementActionForCommand('face_up_fast')).toMatchObject({
      actionId: 0x05,
      kind: 'face',
      direction: 'up'
    });
    expect(getDecompMovementActionForCommand('walk_down')).toMatchObject({
      actionId: 0x10,
      kind: 'step',
      direction: 'down',
      distanceTiles: 1
    });
    expect(getDecompMovementActionForCommand('walk_faster_left')).toMatchObject({
      actionId: 0x37,
      kind: 'step',
      direction: 'left'
    });
    expect(getDecompMovementActionForCommand('jump_2_down')).toMatchObject({
      actionId: 0x14,
      kind: 'jump',
      direction: 'down',
      distanceTiles: 2
    });
    expect(getDecompMovementActionForCommand('delay_16')).toMatchObject({
      actionId: 0x1c,
      kind: 'delay',
      durationFrames: 16
    });
    expect(getDecompMovementActionForCommand('set_invisible')).toMatchObject({
      actionId: 0x60,
      kind: 'visibility',
      visible: false
    });
  });

  test('decodes held movement action ids back into executable movement actions', () => {
    expect(getDecompMovementActionById(0x10)).toMatchObject({
      command: 'walk_down',
      kind: 'step',
      direction: 'down'
    });
    expect(getDecompMovementActionById(0x15)).toMatchObject({
      command: 'jump_2_up',
      kind: 'jump',
      direction: 'up',
      distanceTiles: 2
    });
    expect(getDecompMovementActionById(0x4a)).toMatchObject({
      command: 'face_player',
      kind: 'face'
    });
    expect(getDecompMovementActionById(0x60)).toMatchObject({
      command: 'set_invisible',
      kind: 'visibility',
      visible: false
    });
  });

  test('recognizes every movement command used by loaded decomp applymovement blocks', () => {
    const roots = ['data/maps', 'data/scripts'];
    const labels = new Set<string>();
    const unsupported: string[] = [];

    for (const root of roots) {
      for (const file of listIncFiles(path.resolve(process.cwd(), '..', root))) {
        const source = fs.readFileSync(file, 'utf8');
        for (const match of source.matchAll(/applymovement\s+[^,]+,\s*([A-Za-z0-9_]+)/gu)) {
          labels.add(match[1]);
        }
      }
    }

    for (const root of roots) {
      for (const file of listIncFiles(path.resolve(process.cwd(), '..', root))) {
        const blocks = parseMovementBlocks(fs.readFileSync(file, 'utf8'));
        for (const label of labels) {
          const lines = blocks.get(label);
          if (!lines) continue;
          for (const command of lines) {
            if (command === 'step_end') break;
            if (getDecompMovementActionForCommand(command).actionId === 0xff) {
              unsupported.push(`${path.relative(path.resolve(process.cwd(), '..'), file)}:${label}:${command}`);
            }
          }
        }
      }
    }

    expect(unsupported).toEqual([]);
  });
});

const listIncFiles = (root: string): string[] => {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return listIncFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.inc') ? [fullPath] : [];
  });
};

const parseMovementBlocks = (source: string): Map<string, string[]> => {
  const macros = new Map<string, string[]>();
  const blocks = new Map<string, string[]>();
  let currentMacro: string | null = null;
  let currentMacroLines: string[] = [];
  let currentLabel: string | null = null;
  let currentLines: string[] = [];

  for (const rawLine of source.split(/\r?\n/gu)) {
    const line = rawLine.replace(/@.*$/u, '').trim();
    if (!line) continue;

    const macroMatch = line.match(/^\.macro\s+([A-Za-z0-9_]+)/u);
    if (macroMatch) {
      currentMacro = macroMatch[1];
      currentMacroLines = [];
      continue;
    }

    if (currentMacro) {
      if (line === '.endm') {
        macros.set(currentMacro, currentMacroLines);
        currentMacro = null;
      } else {
        currentMacroLines.push(line);
      }
      continue;
    }

    const labelMatch = line.match(/^([A-Za-z0-9_]+):{1,2}$/u);
    if (labelMatch) {
      if (currentLabel) {
        blocks.set(currentLabel, currentLines);
      }
      currentLabel = labelMatch[1];
      currentLines = [];
      continue;
    }

    if (!currentLabel) continue;
    const command = line.split(/\s+/u)[0];
    const macroLines = macros.get(command);
    if (macroLines) {
      currentLines.push(...macroLines.map((macroLine) => macroLine.split(/\s+/u)[0]));
    } else {
      currentLines.push(command);
    }
  }

  if (currentLabel) {
    blocks.set(currentLabel, currentLines);
  }

  return blocks;
};
