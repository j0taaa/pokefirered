import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import { loadMapById } from '../src/world/mapSource';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const mapsDir = path.resolve(testDir, '../src/world/maps');
const LEGACY_NON_DECOMP_MAP_FILES = new Set(['prototypeRoute.json']);

const getMapFiles = (): string[] =>
  fs.readdirSync(mapsDir).filter((file) => file.endsWith('.json')).sort();

const readCommittedMap = (file: string): any =>
  JSON.parse(fs.readFileSync(path.join(mapsDir, file), 'utf8'));

const flattenRows = (rows: string[]): string[] => rows.flatMap((row) => [...row]);

const collisionValuesFromRows = (collisionRows: string[]): number[] =>
  flattenRows(collisionRows).map((tile) => Number.parseInt(tile, 16));

const walkableFromCollisionRows = (collisionRows: string[]): boolean[] =>
  collisionValuesFromRows(collisionRows).map((collision) => collision === 0);

const elevationsFromRows = (elevationRows: string[]): number[] =>
  flattenRows(elevationRows).map((elevation) => Number.parseInt(elevation, 16));

const terrainTypesFromRows = (terrainRows: string[]): number[] =>
  flattenRows(terrainRows).map((terrain) => Number.parseInt(terrain, 16));

const behaviorsFromRows = (behaviorRows: string[]): number[] =>
  behaviorRows.flatMap((row) => row.match(/../gu)?.map((behavior) => Number.parseInt(behavior, 16)) ?? []);

const auditedMapFiles = (): string[] => {
  const files = getMapFiles();
  for (const legacyFile of LEGACY_NON_DECOMP_MAP_FILES) {
    expect(files, `${legacyFile} must remain the only non-decomp legacy map fixture`).toContain(legacyFile);
  }

  const auditedFiles = files.filter((file) => !LEGACY_NON_DECOMP_MAP_FILES.has(file));
  const incompleteFiles = auditedFiles.filter((file) => {
    const map = readCommittedMap(file);
    return typeof map.metadata?.name !== 'string'
      || !Array.isArray(map.collisionRows)
      || !Array.isArray(map.elevationRows)
      || !Array.isArray(map.terrainRows)
      || !Array.isArray(map.behaviorRows)
      || !Array.isArray(map.encounterRows)
      || !Array.isArray(map.visual?.metatileIds)
      || !Array.isArray(map.visual?.layerTypes)
      || !Array.isArray(map.triggers)
      || !Array.isArray(map.warps)
      || !Array.isArray(map.hiddenItems)
      || !Array.isArray(map.berryTrees)
      || !Array.isArray(map.cloneObjects)
      || !Array.isArray(map.npcs);
  });

  expect(incompleteFiles, 'every committed decomp-backed map must keep the full compact export payload').toEqual([]);
  expect(auditedFiles).toHaveLength(files.length - LEGACY_NON_DECOMP_MAP_FILES.size);
  return auditedFiles;
};

describe('export-decomp-map', () => {
  test('exports maps by folder name', () => {
    const map = exportMap('Route21_North');

    expect(map.id).toBe('MAP_ROUTE21_NORTH');
    expect(map.metadata.name).toBe('Route21_North');
  });

  test('accepts MAP_* labels when they differ from folder names', () => {
    expect(exportMap('MAP_ROUTE21_NORTH')).toEqual(exportMap('Route21_North'));
  });

  test('accepts decomp labels for acronym-heavy maps', () => {
    expect(exportMap('MAP_SSANNE_EXTERIOR')).toEqual(exportMap('SSAnne_Exterior'));
  });

  test('reports label-aware lookup failures', () => {
    expect(() => exportMap('MAP_NOT_A_REAL_PLACE')).toThrow(
      'Expected a folder name, map name, or MAP_* label from data/maps.'
    );
  });

  test('exports coord/bg event elevations for decomp trigger matching', () => {
    const map = exportMap('ViridianCity');
    const gymSign = map.triggers.find((trigger: any) =>
      trigger.x === 32 && trigger.y === 10 && trigger.scriptId === 'ViridianCity_EventScript_GymSign'
    );

    expect(map.triggers.every((trigger: any) => Number.isInteger(trigger.elevation))).toBe(true);
    expect(gymSign?.elevation).toBe(0);
  });

  test('keeps every committed compact decomp map identical to a fresh export', () => {
    const exportedFields = [
      'id',
      'metadata',
      'wildEncounters',
      'width',
      'height',
      'tileSize',
      'visual',
      'collisionRows',
      'encounterRows',
      'elevationRows',
      'terrainRows',
      'behaviorRows',
      'triggers',
      'warps',
      'hiddenItems',
      'berryTrees',
      'cloneObjects',
      'npcs'
    ];

    for (const file of auditedMapFiles()) {
      const committedMap = readCommittedMap(file);
      const freshMap = exportMap(committedMap.metadata.name);
      for (const field of exportedFields) {
        expect(committedMap[field], `${file} ${field}`).toEqual(freshMap[field]);
      }
    }
  });

  test('loads every committed compact decomp map with exact runtime collision arrays', () => {
    for (const file of auditedMapFiles()) {
      const committedMap = readCommittedMap(file);
      const runtimeMap = loadMapById(committedMap.id);
      const expectedTiles = committedMap.width * committedMap.height;

      expect(runtimeMap, `${file} loadMapById(${committedMap.id})`).not.toBeNull();
      expect(runtimeMap?.width, `${file} width`).toBe(committedMap.width);
      expect(runtimeMap?.height, `${file} height`).toBe(committedMap.height);
      expect(runtimeMap?.walkable, `${file} walkable`).toEqual(walkableFromCollisionRows(committedMap.collisionRows));
      expect(runtimeMap?.collisionValues, `${file} collisionValues`).toEqual(
        collisionValuesFromRows(committedMap.collisionRows)
      );
      expect(runtimeMap?.elevations, `${file} elevations`).toEqual(elevationsFromRows(committedMap.elevationRows));
      expect(runtimeMap?.terrainTypes, `${file} terrainTypes`).toEqual(terrainTypesFromRows(committedMap.terrainRows));
      expect(runtimeMap?.tileBehaviors, `${file} tileBehaviors`).toEqual(
        behaviorsFromRows(committedMap.behaviorRows)
      );
      expect(runtimeMap?.encounterTiles, `${file} encounterTiles`).toEqual(flattenRows(committedMap.encounterRows));
      expect(runtimeMap?.visual?.metatileIds, `${file} metatileIds`).toEqual(committedMap.visual.metatileIds);
      expect(runtimeMap?.visual?.layerTypes, `${file} layerTypes`).toEqual(committedMap.visual.layerTypes);
      expect(runtimeMap?.walkable, `${file} tile count`).toHaveLength(expectedTiles);
      expect(runtimeMap?.visual?.metatileIds, `${file} visual tile count`).toHaveLength(expectedTiles);
    }
  });
});
