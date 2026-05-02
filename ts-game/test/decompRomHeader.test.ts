import { describe, expect, test } from 'vitest';
import {
  ROM_HEADER_DIRECTIVES,
  ROM_HEADER_GLOBAL_LABELS,
  ROM_HEADER_NINTENDO_LOGO_SIZE,
  ROM_HEADER_TOTAL_SIZE,
  createRomHeaderDataImage,
  getRomHeaderDirective
} from '../src/game/decompRomHeader';

describe('decomp rom_header.s', () => {
  test('preserves label offsets, export surface, and directive sizes', () => {
    expect(ROM_HEADER_GLOBAL_LABELS).toEqual([
      'Start',
      'RomHeaderNintendoLogo',
      'RomHeaderGameCode',
      'RomHeaderSoftwareVersion',
      'GPIOPortData',
      'GPIOPortDirection',
      'GPIOPortReadEnable'
    ]);
    expect(getRomHeaderDirective('Start')).toMatchObject({
      offset: 0,
      size: 4,
      kind: 'instruction',
      value: 'b start_vector'
    });
    expect(getRomHeaderDirective('RomHeaderNintendoLogo')).toMatchObject({
      offset: 4,
      size: ROM_HEADER_NINTENDO_LOGO_SIZE
    });
    expect(getRomHeaderDirective('RomHeaderGameTitle')).toMatchObject({ offset: 0xa0, size: 12 });
    expect(getRomHeaderDirective('RomHeaderGameCode')).toMatchObject({ offset: 0xac, size: 4 });
    expect(getRomHeaderDirective('GPIOPortReadEnable')).toMatchObject({ offset: 0xc8, size: 2 });
  });

  test('builds the zero-filled gbafix-owned header image with trailing 0xffffffff words', () => {
    const image = createRomHeaderDataImage();
    expect(image).toHaveLength(ROM_HEADER_TOTAL_SIZE);
    expect([...image.slice(0x004, 0x0d0)]).toEqual(Array(0xcc).fill(0));
    expect([...image.slice(0x0d0)]).toEqual(Array(0x30).fill(0xff));
    expect(ROM_HEADER_DIRECTIVES.at(-1)).toMatchObject({ offset: 0xfc, size: 4, value: 0xffffffff });
  });
});
