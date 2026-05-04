/**
 * Parity Contract Validation Tests
 * 
 * These tests assert that the canonical parity contract exists,
 * is properly structured, and documents the required policies.
 */

import { describe, it, expect } from 'vitest';
import { PARITY_CONTRACT } from './fixtures/parityContract';

describe('Parity Contract', () => {
  it('should have a valid version', () => {
    expect(PARITY_CONTRACT.version).toBeDefined();
    expect(typeof PARITY_CONTRACT.version).toBe('string');
    expect(PARITY_CONTRACT.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  describe('Baseline', () => {
    it('should record the correct decomp commit SHA', () => {
      expect(PARITY_CONTRACT.baseline.decompCommitSha).toBe(
        '586f38ad14860d70c20fa58fc30a410818f2833f'
      );
    });

    it('should have a recorded date', () => {
      expect(PARITY_CONTRACT.baseline.recordedAt).toBeDefined();
      expect(typeof PARITY_CONTRACT.baseline.recordedAt).toBe('string');
    });

    it('should identify as decomp-track source', () => {
      expect(PARITY_CONTRACT.baseline.source).toBe('decomp-track');
    });
  });

  describe('Scope', () => {
    it('should target the correct ROM', () => {
      expect(PARITY_CONTRACT.scope.targetRom).toBe('pokefirered.gba');
      expect(PARITY_CONTRACT.scope.targetSha1).toBe(
        '41cb23d8dccc8ebd7c649cd8fbb58eeace6e2fdc'
      );
    });

    it('should include link/wireless/Mystery Gift/e-Reader/Union Room/Trainer Tower', () => {
      const includes = PARITY_CONTRACT.scope.includes;
      expect(includes).toContain('Link/wireless connectivity');
      expect(includes).toContain('Mystery Gift');
      expect(includes).toContain('e-Reader functionality');
      expect(includes).toContain('Union Room');
      expect(includes).toContain('Trainer Tower');
    });

    it('should include all bugs and quirks in scope', () => {
      const includes = PARITY_CONTRACT.scope.includes;
      expect(includes).toContain('All bugs, quirks, and timing dependencies');
    });
  });

  describe('Parity Policy', () => {
    it('should require 1:1 observable/game-visible behavioral parity', () => {
      expect(PARITY_CONTRACT.parityPolicy.strictness).toBe(
        '1:1 observable/game-visible behavioral parity'
      );
    });

    it('should preserve bugs', () => {
      expect(PARITY_CONTRACT.parityPolicy.includes.bugs).toBe(true);
    });

    it('should preserve quirks', () => {
      expect(PARITY_CONTRACT.parityPolicy.includes.quirks).toBe(true);
    });

    it('should preserve RNG order', () => {
      expect(PARITY_CONTRACT.parityPolicy.includes.rngOrder).toBe(true);
    });

    it('should preserve timing', () => {
      expect(PARITY_CONTRACT.parityPolicy.includes.timing).toBe(true);
    });

    it('should preserve observable behavior', () => {
      expect(PARITY_CONTRACT.parityPolicy.includes.observableBehavior).toBe(true);
    });

    it('should exclude non-parity enhancements', () => {
      expect(PARITY_CONTRACT.parityPolicy.exclusions.nonParityEnhancements).toBe(true);
    });
  });

  describe('Browser Adaptations', () => {
    it('should allow adaptations only at hardware boundaries', () => {
      expect(PARITY_CONTRACT.browserAdaptations.policy).toBe('Hardware boundary only');
    });

    it('should list Canvas/WebGL as rendering replacement', () => {
      const canvasAdaptation = PARITY_CONTRACT.browserAdaptations.allowedAt.find(
        a => a.boundary === 'Canvas/WebGL rendering'
      );
      expect(canvasAdaptation).toBeDefined();
      expect(canvasAdaptation?.replaces).toBe('GBA hardware PPU/tile rendering');
    });

    it('should list Web Audio API as sound replacement', () => {
      const audioAdaptation = PARITY_CONTRACT.browserAdaptations.allowedAt.find(
        a => a.boundary === 'Web Audio API'
      );
      expect(audioAdaptation).toBeDefined();
      expect(audioAdaptation?.replaces).toBe('GBA APU/sound hardware');
    });

    it('should list browser storage as save replacement', () => {
      const storageAdaptation = PARITY_CONTRACT.browserAdaptations.allowedAt.find(
        a => a.boundary === 'Browser storage (localStorage/IndexedDB)'
      );
      expect(storageAdaptation).toBeDefined();
      expect(storageAdaptation?.replaces).toBe('GBA save RAM/flash');
    });

    it('should list input adapters as button replacement', () => {
      const inputAdaptation = PARITY_CONTRACT.browserAdaptations.allowedAt.find(
        a => a.boundary === 'Keyboard/touch/gamepad input'
      );
      expect(inputAdaptation).toBeDefined();
      expect(inputAdaptation?.replaces).toBe('GBA button hardware');
    });

    it('should list deterministic local multi-client transport as link cable replacement', () => {
      const linkAdaptation = PARITY_CONTRACT.browserAdaptations.allowedAt.find(
        a => a.boundary === 'Deterministic in-memory/local multi-client transport'
      );
      expect(linkAdaptation).toBeDefined();
      expect(linkAdaptation?.replaces).toBe('GBA link cable/wireless adapter');
    });

    it('should require game-visible state transitions to remain parity-tested', () => {
      const stateRestriction = PARITY_CONTRACT.browserAdaptations.restrictions.find(
        r => r.includes('state transitions')
      );
      expect(stateRestriction).toBeDefined();
    });
  });

  describe('Completion Evidence', () => {
    it('should require tests to pass', () => {
      expect(PARITY_CONTRACT.completionEvidence.testRequirements).toContain(
        'All parity tests must pass'
      );
    });

    it('should require decomp fixture comparisons', () => {
      expect(PARITY_CONTRACT.completionEvidence.testRequirements).toContain(
        'Decomp fixture comparisons must match'
      );
    });

    it('should require deterministic trace serialization', () => {
      expect(PARITY_CONTRACT.completionEvidence.testRequirements).toContain(
        'Trace serialization must be deterministic'
      );
    });

    it('should document baseline SHA requirement', () => {
      expect(PARITY_CONTRACT.completionEvidence.documentationRequirements).toContain(
        'Baseline commit SHA must be recorded'
      );
    });

    it('should use TDD for parity', () => {
      expect(PARITY_CONTRACT.completionEvidence.verificationMethod).toBe(
        'TDD for parity - test first, implement to pass'
      );
    });
  });
});
