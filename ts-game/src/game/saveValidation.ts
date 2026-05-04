import type { SaveSnapshot } from './saveData';

export const SAVE_ENVELOPE_FORMAT = 'pokefirered.ts.save';

export interface SaveEnvelope {
  schemaVersion: number;
  format: typeof SAVE_ENVELOPE_FORMAT;
  payload: SaveSnapshot;
  checksum: string;
}

const stableStringifyValue = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringifyValue(entry)).join(',')}]`;
  }

  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringifyValue(object[key])}`)
    .join(',')}}`;
};

export const stableStringifySavePayload = (payload: SaveSnapshot): string => stableStringifyValue(payload);

export const calculateSaveChecksum = (payload: SaveSnapshot): string => {
  const source = stableStringifySavePayload(payload);
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

export const createSaveEnvelope = (payload: SaveSnapshot): SaveEnvelope => ({
  schemaVersion: payload.schemaVersion,
  format: SAVE_ENVELOPE_FORMAT,
  payload,
  checksum: calculateSaveChecksum(payload)
});

export const isSaveEnvelope = (value: unknown): value is SaveEnvelope => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.format === SAVE_ENVELOPE_FORMAT
    && typeof candidate.checksum === 'string'
    && !!candidate.payload
    && typeof candidate.payload === 'object';
};

export const hasValidSaveChecksum = (envelope: SaveEnvelope): boolean =>
  envelope.checksum === calculateSaveChecksum(envelope.payload);
