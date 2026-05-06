/**
 * Text API Contract Validation Tests
 *
 * These tests pin the public accessible text API contract without introducing
 * gameplay or server implementation details.
 */

import { describe, expect, it } from 'vitest';
import {
  TEXT_API_CONTRACT_EXAMPLES,
  TEXT_API_ENDPOINT_CONTRACT
} from '../src/api/textApiTypes';

const RAW_CONTROL_PATTERN = /(^|[^a-z0-9])((?:press|tap|hold|use)\s+(?:a|b|start|select|up|down|left|right)|(?:a|b|start|select|up|down|left|right)\s+(?:button|key)|button|key)(?=$|[^a-z0-9])/i;

function stringValuesFrom(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => stringValuesFrom(item));
  }

  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(item => stringValuesFrom(item));
  }

  return [];
}

function containsRawControl(values: readonly string[]): boolean {
  return values.some(value => RAW_CONTROL_PATTERN.test(value));
}

describe('Text API Contract', () => {
  describe('Endpoint status codes', () => {
    it('declares exact success and endpoint error status codes', () => {
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.createSession).toMatchObject({
        method: 'POST',
        path: '/sessions',
        successStatus: 201,
        errorStatuses: []
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.getState).toMatchObject({
        method: 'GET',
        path: '/sessions/:id/state?debug=true',
        successStatus: 200,
        errorStatuses: [404]
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.postAction).toMatchObject({
        method: 'POST',
        path: '/sessions/:id/actions',
        successStatus: 200,
        errorStatuses: [400, 409, 404]
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.getSave).toMatchObject({
        method: 'GET',
        path: '/sessions/:id/save',
        successStatus: 200,
        errorStatuses: [404]
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.loadSave).toMatchObject({
        method: 'POST',
        path: '/sessions/:id/load',
        successStatus: 200,
        errorStatuses: [400, 404]
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.deleteSession).toMatchObject({
        method: 'DELETE',
        path: '/sessions/:id',
        successStatus: 204,
        errorStatuses: [404]
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.health).toMatchObject({
        method: 'GET',
        path: '/health',
        successStatus: 200,
        errorStatuses: []
      });
    });

    it('declares global HTTP error rules', () => {
      expect(TEXT_API_ENDPOINT_CONTRACT.globalErrors.wrongMethod).toEqual({
        status: 405,
        requiresAllowHeader: true
      });
      expect(TEXT_API_ENDPOINT_CONTRACT.globalErrors.badJson).toEqual({ status: 400 });
      expect(TEXT_API_ENDPOINT_CONTRACT.globalErrors.oversizedBody).toEqual({ status: 413 });
    });
  });

  describe('Response shapes', () => {
    it('asserts POST /sessions returns sessionId and snapshot', () => {
      const response = TEXT_API_CONTRACT_EXAMPLES.createSessionResponse;

      expect(response.sessionId).toBeDefined();
      expect(typeof response.sessionId).toBe('string');
      expect(response.snapshot).toBeDefined();
      expect(response.snapshot.version).toBe(1);
    });

    it('asserts snapshot responses include concise summary, expanded details, version, options, and optional debug', () => {
      const snapshot = TEXT_API_CONTRACT_EXAMPLES.snapshot;

      expect(snapshot.mode).toBe('overworld');
      expect(typeof snapshot.version).toBe('number');
      expect(snapshot.summary).toBe('You are standing in Pallet Town near your home.');
      expect(snapshot.summary.length).toBeLessThanOrEqual(80);
      expect(snapshot.details).toContain('Route 1');
      expect(snapshot.details.length).toBeGreaterThan(snapshot.summary.length);
      expect(Array.isArray(snapshot.options)).toBe(true);
      expect(snapshot.debug).toBeDefined();
    });

    it('asserts POST /sessions/:id/actions request and result shapes', () => {
      const request = TEXT_API_CONTRACT_EXAMPLES.actionRequest;
      const result = TEXT_API_CONTRACT_EXAMPLES.actionResult;

      expect(typeof request.version).toBe('number');
      expect(typeof request.actionId).toBe('string');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.newVersion).toBe('number');
      expect(result.snapshot.version).toBe(result.newVersion);
      expect('error' in result).toBe(false);
    });

    it('asserts error responses include code, message, and optional details', () => {
      const error = TEXT_API_CONTRACT_EXAMPLES.error;

      expect(error.code).toBe('STALE_VERSION');
      expect(error.message).toBe('The session changed before the action was applied.');
      expect(error.details).toEqual({ expectedVersion: 8, receivedVersion: 7 });
    });

    it('asserts save, session, load, delete, and health response contracts', () => {
      const saveBlob = TEXT_API_CONTRACT_EXAMPLES.saveBlob;
      const session = TEXT_API_CONTRACT_EXAMPLES.session;
      const loadResponse = TEXT_API_CONTRACT_EXAMPLES.snapshot;
      const health = TEXT_API_CONTRACT_EXAMPLES.healthResponse;

      expect(saveBlob.schemaVersion).toBe(1);
      expect(saveBlob.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(saveBlob.data).toBeDefined();
      expect(session.sessionId).toBe('session-example');
      expect(session.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(session.lastActivityAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(loadResponse.version).toBe(7);
      expect(TEXT_API_ENDPOINT_CONTRACT.endpoints.deleteSession.successStatus).toBe(204);
      expect(health).toEqual({ status: 'ok' });
    });
  });

  describe('Option contract', () => {
    it('asserts options expose id, label, description, category, enabled, disabledReason, and action shape', () => {
      const [enabledOption, disabledOption] = TEXT_API_CONTRACT_EXAMPLES.snapshot.options;

      expect(enabledOption).toMatchObject({
        id: 'walk-north',
        label: 'Walk north',
        description: 'Move toward Route 1.',
        category: 'movement',
        enabled: true,
        action: {
          type: 'move',
          target: 'north'
        }
      });
      expect(disabledOption).toMatchObject({
        id: 'inspect-home-door',
        label: 'Inspect home door',
        description: 'Check the entrance to your home.',
        category: 'inspection',
        enabled: false,
        disabledReason: 'You are not facing the entrance.',
        action: {
          type: 'inspect',
          target: 'home-door'
        }
      });
    });
  });

  describe('Semantic-only public contract', () => {
    it('rejects raw controls in public option labels and payload strings', () => {
      const publicOptionStrings = TEXT_API_CONTRACT_EXAMPLES.snapshot.options.flatMap(option =>
        stringValuesFrom(option)
      );

      expect(publicOptionStrings).not.toHaveLength(0);
      expect(containsRawControl(publicOptionStrings)).toBe(false);
    });

    it('makes the raw-control leakage guard testable', () => {
      expect(containsRawControl(['Press START to continue'])).toBe(true);
      expect(containsRawControl(['Press A to continue'])).toBe(true);
      expect(containsRawControl(['Use the button now'])).toBe(true);
      expect(containsRawControl(['A person or object is blocking the way.'])).toBe(false);
      expect(containsRawControl(['Face this nearby person and start their interaction.'])).toBe(false);
      expect(containsRawControl(['Semantic action only'])).toBe(false);
    });
  });
});
