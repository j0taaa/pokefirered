import { describe, expect, test } from 'vitest';
import {
  getCoverageStatus,
  REQUIRED_TEXT_API_CATEGORIES,
  TEXT_API_COVERAGE_MATRIX,
  type RequiredTextApiCategory
} from '../src/api/coverageMatrix';

describe('Text API semantic coverage matrix', () => {
  test('all required categories have option providers and test files', () => {
    const categories = new Map(TEXT_API_COVERAGE_MATRIX.map((entry) => [entry.category, entry]));

    for (const category of REQUIRED_TEXT_API_CATEGORIES) {
      const entry = categories.get(category);
      expect(entry, `missing coverage row for ${category}`).toBeDefined();
      expect(entry?.provider, `missing provider for ${category}`).toMatch(/^ActionEnumerator\./u);
      expect(entry?.testFile, `missing test file for ${category}`).toMatch(/^test\/.*\.test\.ts$/u);
      expect(entry?.evidence.length, `missing evidence for ${category}`).toBeGreaterThan(0);
    }
  });

  test('required categories cannot be marked missing', () => {
    const required = new Set<RequiredTextApiCategory>(REQUIRED_TEXT_API_CATEGORIES);
    const missing = TEXT_API_COVERAGE_MATRIX.filter((entry) => required.has(entry.category as RequiredTextApiCategory) && entry.status === 'missing');

    expect(missing).toEqual([]);
  });

  test('coverage report is a zero-missing gate for required playability surfaces', () => {
    const report = getCoverageStatus();

    expect(report.exportedMapCount).toBeGreaterThan(0);
    expect(report.requiredCategories).toBe(REQUIRED_TEXT_API_CATEGORIES.length);
    expect(report.totalCategories).toBeGreaterThanOrEqual(report.requiredCategories);
    expect(report.missingRequiredCategories).toBe(0);
    expect(report.coveredRequiredCategories + report.partialRequiredCategories).toBe(report.requiredCategories);
  });
});
