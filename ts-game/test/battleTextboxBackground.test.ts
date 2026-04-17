import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const textboxBinPath = join(root, 'graphics', 'battle_interface', 'textbox.bin');

describe('battle textbox assets', () => {
  test('textbox.bin is large enough for a 32×20 GBA tile strip', () => {
    const tilemap = new Uint8Array(readFileSync(textboxBinPath));
    expect(tilemap.length).toBeGreaterThanOrEqual(32 * 20 * 2);
  });
});
