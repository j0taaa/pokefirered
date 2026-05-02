import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('DECOMP_SRC_CONVERSION_PROGRESS', () => {
  it('tracks every top-level decompiled src C file and has no unchecked entries', () => {
    const srcDir = join(repoRoot, 'src');
    const progressPath = join(repoRoot, 'ts-game', 'DECOMP_SRC_CONVERSION_PROGRESS.md');
    const srcFiles = readdirSync(srcDir)
      .filter((name) => name.endsWith('.c'))
      .map((name) => `src/${name}`)
      .sort();
    const progress = readFileSync(progressPath, 'utf8');
    const tracked = progress
      .split('\n')
      .filter((line) => /^- \[[ x]\] src\/.*\.c$/u.test(line))
      .map((line) => line.replace(/^- \[[ x]\] /u, ''))
      .sort();
    const unchecked = progress
      .split('\n')
      .filter((line) => /^- \[ \] src\/.*\.c$/u.test(line));

    expect(tracked).toEqual(srcFiles);
    expect(unchecked).toEqual([]);
  });
});
