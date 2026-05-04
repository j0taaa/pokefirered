/**
 * Canonical Parity Contract for Pokemon FireRed TypeScript Port
 * 
 * This module defines the machine-readable parity contract baseline.
 * It serves as the source of truth for:
 * - Decomp workspace baseline commit
 * - Vanilla FireRed scope definition
 * - Bug/quirk preservation policy
 * - Browser adaptation boundaries
 * - Completion evidence rules
 */

export const PARITY_CONTRACT = {
  version: '1.0.0',
  
  baseline: {
    decompCommitSha: '586f38ad14860d70c20fa58fc30a410818f2833f',
    decompCommitMessage: 'Fix remaining TS parity mismatches',
    recordedAt: '2026-05-02',
    source: 'decomp-track'
  },
  
  scope: {
    targetRom: 'pokefirered.gba',
    targetSha1: '41cb23d8dccc8ebd7c649cd8fbb58eeace6e2fdc',
    description: 'Pokemon FireRed US revision 0 (vanilla)',
    includes: [
      'All gameplay systems',
      'Battle mechanics',
      'Field scripts',
      'Overworld movement',
      'Inventory/bag systems',
      'Save/load systems',
      'Link/wireless connectivity',
      'Mystery Gift',
      'e-Reader functionality',
      'Union Room',
      'Trainer Tower',
      'All bugs, quirks, and timing dependencies'
    ]
  },
  
  parityPolicy: {
    strictness: '1:1 observable/game-visible behavioral parity',
    includes: {
      bugs: true,
      quirks: true,
      rngOrder: true,
      timing: true,
      observableBehavior: true
    },
    exclusions: {
      nonParityEnhancements: true,
      qualityOfLifeChanges: true,
      balanceChanges: true
    }
  },
  
  browserAdaptations: {
    policy: 'Hardware boundary only',
    allowedAt: [
      {
        boundary: 'Canvas/WebGL rendering',
        replaces: 'GBA hardware PPU/tile rendering'
      },
      {
        boundary: 'Web Audio API',
        replaces: 'GBA APU/sound hardware'
      },
      {
        boundary: 'Browser storage (localStorage/IndexedDB)',
        replaces: 'GBA save RAM/flash'
      },
      {
        boundary: 'Keyboard/touch/gamepad input',
        replaces: 'GBA button hardware'
      },
      {
        boundary: 'Deterministic in-memory/local multi-client transport',
        replaces: 'GBA link cable/wireless adapter'
      }
    ],
    restrictions: [
      'Game-visible state transitions must remain parity-tested',
      'RNG sequences must produce identical results',
      'Timing-dependent behaviors must be preserved',
      'Frame counts and animation timings must match'
    ]
  },
  
  completionEvidence: {
    testRequirements: [
      'All parity tests must pass',
      'Decomp fixture comparisons must match',
      'Trace serialization must be deterministic',
      'Battle parity corpus must validate'
    ],
    documentationRequirements: [
      'Baseline commit SHA must be recorded',
      'Policy must be explicitly stated',
      'Any deviations must be documented with rationale'
    ],
    verificationMethod: 'TDD for parity - test first, implement to pass'
  }
} as const;

export type ParityContract = typeof PARITY_CONTRACT;
export type ParityContractVersion = typeof PARITY_CONTRACT.version;
