import { describe, expect, test } from 'vitest';
import { LE26FV10N1TS, LE_MAX_TIME } from '../src/game/decompAgbFlashLe';

describe('decompAgbFlashLe', () => {
  test('ports the LE flash max-time table exactly', () => {
    expect(LE_MAX_TIME).toEqual([
      10, 65469, 0x00c2,
      10, 65469, 0x00c2,
      2000, 65469, 0x00c2,
      2000, 65469, 0x00c2
    ]);
  });

  test('ports the LE26FV10N1TS setup descriptor exactly', () => {
    expect(LE26FV10N1TS).toEqual({
      programFlashByte: 'ProgramFlashByte_MX',
      programFlashSector: 'ProgramFlashSector_MX',
      eraseFlashChip: 'EraseFlashChip_MX',
      eraseFlashSector: 'EraseFlashSector_MX',
      waitForFlashWrite: 'WaitForFlashWrite_Common',
      maxTime: LE_MAX_TIME,
      romSize: 131072,
      sector: {
        sectorSize: 4096,
        sectorShift: 12,
        sectorCount: 32,
        unused: 0
      },
      waitStateSetup: [3, 1],
      id: [0x62, 0x13]
    });
  });
});
