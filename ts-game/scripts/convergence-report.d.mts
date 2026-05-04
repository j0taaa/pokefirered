export interface ConvergenceCategory {
  category: string;
  requiredCount: number;
  expectedRequiredCount: number;
  directCount: number;
  evidenceCoveredCount: number;
  missingCount: number;
  untrackedCount: number;
  unresolvedGapCount: number;
  status: 'closed' | 'blocked';
  closure: string;
  evidenceFiles: string[];
  missingEvidence: string[];
}

export interface ConvergenceReport {
  title: string;
  generatedAt: string;
  categories: ConvergenceCategory[];
  totals: {
    required: number;
    direct: number;
    evidenceCovered: number;
    missing: number;
    untracked: number;
    unresolved: number;
  };
}

export function buildConvergenceReport(): ConvergenceReport;
export function validateConvergenceReport(report: ConvergenceReport): string[];
export function formatConvergenceReport(report: ConvergenceReport): string;
