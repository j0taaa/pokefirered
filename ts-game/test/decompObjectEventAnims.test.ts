import { describe, expect, test } from 'vitest';
import {
  gObjectEventAnims,
  gObjectEventAnimTables,
  getDecompObjectEventAnim,
  getDecompObjectEventAnimTable
} from '../src/game/decompObjectEventAnims';

describe('decomp object event anims', () => {
  test('parses every anim command array and anim table', () => {
    const totalCommands = gObjectEventAnims.reduce((sum, anim) => sum + anim.commands.length, 0);
    const totalTableEntries = gObjectEventAnimTables.reduce((sum, table) => sum + table.entries.length, 0);

    expect(gObjectEventAnims).toHaveLength(124);
    expect(totalCommands).toBe(545);
    expect(gObjectEventAnimTables).toHaveLength(16);
    expect(totalTableEntries).toBe(225);
  });

  test('preserves frame, jump, and hFlip animation commands', () => {
    expect(getDecompObjectEventAnim('sAnim_StayStill')?.commands).toEqual([
      { command: 'ANIMCMD_FRAME', rawArgs: '0, 8', frame: 0, duration: 8, hFlip: false },
      { command: 'ANIMCMD_FRAME', rawArgs: '0, 8', frame: 0, duration: 8, hFlip: false },
      { command: 'ANIMCMD_FRAME', rawArgs: '0, 8', frame: 0, duration: 8, hFlip: false },
      { command: 'ANIMCMD_FRAME', rawArgs: '0, 8', frame: 0, duration: 8, hFlip: false },
      { command: 'ANIMCMD_JUMP', rawArgs: '0', target: 0 }
    ]);
    expect(getDecompObjectEventAnim('sAnim_QuintyPlumpGoEast')?.commands[0]).toEqual({
      command: 'ANIMCMD_FRAME',
      rawArgs: '5, 8, .hFlip = TRUE',
      frame: 5,
      duration: 8,
      hFlip: true
    });
  });

  test('preserves designated anim table entries', () => {
    expect(getDecompObjectEventAnimTable('sAnimTable_Inanimate')?.entries).toEqual([
      { index: 'ANIM_STAY_STILL', position: 0, symbol: 'sAnim_StayStill' }
    ]);
    expect(getDecompObjectEventAnimTable('sAnimTable_RedGreenFish')?.entries.at(-1)).toEqual({
      index: 'ANIM_HOOKED_POKEMON_EAST',
      position: 11,
      symbol: 'sAnim_HookedPokemonEast'
    });
    expect(getDecompObjectEventAnimTable('sAnimTable_Standard')?.entries).toContainEqual({
      index: 'ANIM_RAISE_HAND',
      position: 20,
      symbol: 'sAnim_RaiseHand'
    });
    expect(getDecompObjectEventAnimTable('sAnimTable_BerryTree')?.entries).toEqual([
      { index: null, position: 0, symbol: 'sAnim_BerryTreeStage0' },
      { index: null, position: 1, symbol: 'sAnim_BerryTreeStage1' },
      { index: null, position: 2, symbol: 'sAnim_BerryTreeStage2' },
      { index: null, position: 3, symbol: 'sAnim_BerryTreeStage3' },
      { index: null, position: 4, symbol: 'sAnim_BerryTreeStage4' }
    ]);
  });
});
