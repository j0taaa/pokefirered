import { describe, expect, test } from 'vitest';
import {
  buildConvergenceReport,
  formatConvergenceReport,
  validateConvergenceReport,
  type ConvergenceCategory,
  type ConvergenceReport
} from '../scripts/convergence-report.mjs';

const requiredCategories = [
  'maps',
  'warps',
  'connections',
  'script labels',
  'script commands',
  'specials',
  'movement commands',
  'item flows',
  'battle behavior',
  'menu scenes',
  'save substates',
  'render/text fixtures',
  'audio events',
  'link/hardware features',
  'Task 18 browser route evidence'
];

describe('Task 19 final convergence report gates', () => {
  test('reports zero missing and untracked required parity entries for every subsystem', () => {
    const report = buildConvergenceReport();
    const text = formatConvergenceReport(report);

    console.log(text);

    expect(report.categories.map((category: ConvergenceCategory) => category.category)).toEqual(requiredCategories);
    expect(report.totals.required).toBeGreaterThan(0);
    expect(report.totals.missing).toBe(0);
    expect(report.totals.untracked).toBe(0);
    expect(report.totals.unresolved).toBe(0);
    expect(validateConvergenceReport(report)).toEqual([]);
    for (const category of report.categories) {
      expect(category.requiredCount, `${category.category} required total`).toBeGreaterThan(0);
      expect(text, `${category.category} report line`).toContain(
        `[${category.category}] required=${category.requiredCount} direct=${category.directCount} evidenceCovered=${category.evidenceCoveredCount} missing=0 untracked=0 unresolved=0 status=closed`
      );
      expect(category.evidenceFiles.length, `${category.category} evidence files`).toBeGreaterThan(0);
    }
    expect(text).toContain('Final state: zero missing/untracked required parity entries across every subsystem.');
    expect(text).toContain('ts-game/e2e/mainRoute.spec.ts');
    expect(text).toContain('ts-game/e2e/postgameLinkRoute.spec.ts');
  }, 20000);

  test('negative fixture fails when a required entry is removed or marked as a gap', () => {
    const report = buildConvergenceReport();
    const negativeReport: ConvergenceReport = {
      ...report,
      categories: report.categories.map((category: ConvergenceCategory) => category.category === 'maps'
        ? {
            ...category,
            requiredCount: category.requiredCount - 1,
            missingCount: 1,
            status: 'blocked' as const
          }
        : category)
    };

    const failures = validateConvergenceReport(negativeReport);
    console.log([
      'Task 19 negative convergence fixture',
      `failures=${failures.length}`,
      ...failures
    ].join('\n'));

    expect(failures).toEqual(expect.arrayContaining([
      'maps: required count changed from 425 to 424',
      'maps: status=blocked',
      'maps: missing=1'
    ]));
  }, 20000);
});
