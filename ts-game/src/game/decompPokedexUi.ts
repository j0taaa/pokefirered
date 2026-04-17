import pokedexOrdersSource from '../../../src/data/pokemon/pokedex_orders.h?raw';
import pokedexCategoriesSource from '../../../src/data/pokemon/pokedex_categories.h?raw';
import pokedexAreaMarkersSource from '../../../src/pokedex_area_markers.c?raw';
import wildPokemonAreaSource from '../../../src/wild_pokemon_area.c?raw';
import wildEncountersSource from '../../../src/data/wild_encounters.json?raw';
import { getDecompPokedexEntry, getNationalDexNumber, getNationalDexSpecies } from './decompPokedex';
import { getDecompSpeciesInfo } from './decompSpecies';

export type PokedexCategoryId =
  | 'GRASSLAND'
  | 'FOREST'
  | 'WATERS_EDGE'
  | 'SEA'
  | 'CAVE'
  | 'MOUNTAIN'
  | 'ROUGH_TERRAIN'
  | 'URBAN'
  | 'RARE';

export type PokedexOrderId =
  | 'NUMERICAL_KANTO'
  | 'ATOZ'
  | 'TYPE'
  | 'LIGHTEST'
  | 'SMALLEST'
  | 'NUMERICAL_NATIONAL';

export type PokedexTopMenuActionId = PokedexCategoryId | PokedexOrderId | 'CLOSE';

export type PokedexAreaMarkerType =
  | 'MARKER_CIRCULAR'
  | 'MARKER_SMALL_H'
  | 'MARKER_SMALL_V'
  | 'MARKER_MED_H'
  | 'MARKER_MED_V'
  | 'MARKER_LARGE_H'
  | 'MARKER_LARGE_V';

export interface PokedexTopMenuRow {
  kind: 'header' | 'item';
  label: string;
  actionId: PokedexTopMenuActionId | null;
  enabled: boolean;
  iconId: string | null;
}

export interface PokedexOrderedEntry {
  species: string;
  nationalDexNumber: number;
  displayNumber: string;
  label: string;
  seen: boolean;
  caught: boolean;
  types: string[];
}

export interface PokedexCategoryLocation {
  categoryId: PokedexCategoryId;
  pageIndex: number;
  cursorIndex: number;
}

export interface PokedexAreaMarker {
  type: PokedexAreaMarkerType;
  x: number;
  y: number;
}

interface WildEncounterGroup {
  wild_encounter_groups?: Array<{
    encounters?: Array<Record<string, unknown>>;
  }>;
}

const CATEGORY_PREFIX_TO_ID: Record<string, PokedexCategoryId> = {
  GrasslandPkmn: 'GRASSLAND',
  ForestPkmn: 'FOREST',
  WatersEdgePkmn: 'WATERS_EDGE',
  SeaPkmn: 'SEA',
  CavePkmn: 'CAVE',
  MountainPkmn: 'MOUNTAIN',
  RoughTerrainPkmn: 'ROUGH_TERRAIN',
  UrbanPkmn: 'URBAN',
  RarePkmn: 'RARE'
};

const CATEGORY_LABELS: Record<PokedexCategoryId, string> = {
  GRASSLAND: 'GRASSLAND POKeMON',
  FOREST: 'FOREST POKeMON',
  WATERS_EDGE: 'WATERS-EDGE POKeMON',
  SEA: 'SEA POKeMON',
  CAVE: 'CAVE POKeMON',
  MOUNTAIN: 'MOUNTAIN POKeMON',
  ROUGH_TERRAIN: 'ROUGH-TERRAIN POKeMON',
  URBAN: 'URBAN POKeMON',
  RARE: 'RARE POKeMON'
};

const CATEGORY_ICON_IDS: Record<PokedexCategoryId, string> = {
  GRASSLAND: 'grassland',
  FOREST: 'forest',
  WATERS_EDGE: 'waters_edge',
  SEA: 'sea',
  CAVE: 'cave',
  MOUNTAIN: 'mountain',
  ROUGH_TERRAIN: 'rough_terrain',
  URBAN: 'urban',
  RARE: 'rare'
};

const ORDER_LABELS: Record<PokedexOrderId, string> = {
  NUMERICAL_KANTO: 'NUMERICAL MODE',
  ATOZ: 'A TO Z MODE',
  TYPE: 'TYPE MODE',
  LIGHTEST: 'LIGHTEST MODE',
  SMALLEST: 'SMALLEST MODE',
  NUMERICAL_NATIONAL: 'NUMERICAL MODE: NATIONAL'
};

const ORDER_ICON_IDS: Record<PokedexOrderId, string> = {
  NUMERICAL_KANTO: 'numerical',
  ATOZ: 'abc',
  TYPE: 'type',
  LIGHTEST: 'lightest',
  SMALLEST: 'smallest',
  NUMERICAL_NATIONAL: 'numerical'
};

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const parseOrderArray = (source: string, arrayName: string): string[] => {
  const match = source.match(new RegExp(`const u16 ${arrayName}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'));
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/(?:NATIONAL_DEX|SPECIES)_(\w+)/gu)].map((value) =>
    normalizeSpecies(value[1])
  );
};

const alphabeticalOrder = parseOrderArray(pokedexOrdersSource, 'gPokedexOrder_Alphabetical');
const typeOrder = parseOrderArray(pokedexOrdersSource, 'gPokedexOrder_Type');
const weightOrder = parseOrderArray(pokedexOrdersSource, 'gPokedexOrder_Weight');
const heightOrder = parseOrderArray(pokedexOrdersSource, 'gPokedexOrder_Height');

const parseCategoryPages = (source: string): Record<PokedexCategoryId, string[][]> => {
  const grouped = new Map<PokedexCategoryId, Array<{ page: number; species: string[] }>>();
  const pageRegex = /static const u16 sDexCategory_(\w+)_Page(\d+)\[\] = \{([\s\S]*?)\n\};/gu;

  for (const match of source.matchAll(pageRegex)) {
    const prefix = match[1];
    const categoryId = CATEGORY_PREFIX_TO_ID[prefix];
    if (!categoryId) {
      continue;
    }

    const pages = grouped.get(categoryId) ?? [];
    pages.push({
      page: Number.parseInt(match[2] ?? '0', 10),
      species: [...match[3].matchAll(/SPECIES_(\w+)/gu)].map((value) => normalizeSpecies(value[1]))
    });
    grouped.set(categoryId, pages);
  }

  return Object.fromEntries(
    Object.values(CATEGORY_PREFIX_TO_ID).map((categoryId) => {
      const pages = (grouped.get(categoryId) ?? [])
        .sort((left, right) => left.page - right.page)
        .map((entry) => entry.species);
      return [categoryId, pages];
    })
  ) as Record<PokedexCategoryId, string[][]>;
};

const categoryPages = parseCategoryPages(pokedexCategoriesSource);

const areaMarkerDefinitions = new Map<string, PokedexAreaMarker>();
for (const match of pokedexAreaMarkersSource.matchAll(
  /\[(DEX_AREA_[A-Z0-9_]+)\]\s*=\s*\{\s*(MARKER_[A-Z_]+),\s*(-?\d+),\s*(-?\d+)/gu
)) {
  areaMarkerDefinitions.set(match[1], {
    type: match[2] as PokedexAreaMarkerType,
    x: Number.parseInt(match[3] ?? '0', 10),
    y: Number.parseInt(match[4] ?? '0', 10)
  });
}

const dexAreasByMapSection = new Map<string, string[]>();
for (const match of wildPokemonAreaSource.matchAll(/\{\s*(MAPSEC_[A-Z0-9_]+),\s*(DEX_AREA_[A-Z0-9_]+)\s*\}/gu)) {
  const list = dexAreasByMapSection.get(match[1]) ?? [];
  list.push(match[2]);
  dexAreasByMapSection.set(match[1], list);
}

const mapModules = import.meta.glob('../../../data/maps/*/map.json', {
  eager: true,
  import: 'default'
}) as Record<string, { id?: string; region_map_section?: string }>;

const regionSectionByMapId = new Map<string, string>();
for (const definition of Object.values(mapModules)) {
  if (definition.id && definition.region_map_section) {
    regionSectionByMapId.set(definition.id, definition.region_map_section);
  }
}

const wildEncounters = JSON.parse(wildEncountersSource) as WildEncounterGroup;

const areaMarkersBySpecies = new Map<string, PokedexAreaMarker[]>();
for (const group of wildEncounters.wild_encounter_groups ?? []) {
  for (const encounter of group.encounters ?? []) {
    const mapId = typeof encounter.map === 'string' ? encounter.map : null;
    if (!mapId) {
      continue;
    }

    const regionSection = regionSectionByMapId.get(mapId);
    if (!regionSection) {
      continue;
    }

    const dexAreas = dexAreasByMapSection.get(regionSection) ?? [];
    if (dexAreas.length === 0) {
      continue;
    }

    for (const tableKey of ['land_mons', 'water_mons', 'rock_smash_mons', 'fishing_mons'] as const) {
      const table = encounter[tableKey];
      if (!table || typeof table !== 'object' || !('mons' in table) || !Array.isArray(table.mons)) {
        continue;
      }

      for (const mon of table.mons) {
        const rawSpecies = mon && typeof mon === 'object' && 'species' in mon ? mon.species : null;
        if (typeof rawSpecies !== 'string') {
          continue;
        }

        const species = normalizeSpecies(rawSpecies);
        const existing = areaMarkersBySpecies.get(species) ?? [];
        const seenKeys = new Set(existing.map((marker) => `${marker.type}:${marker.x}:${marker.y}`));
        for (const dexArea of dexAreas) {
          const marker = areaMarkerDefinitions.get(dexArea);
          if (!marker) {
            continue;
          }

          const key = `${marker.type}:${marker.x}:${marker.y}`;
          if (!seenKeys.has(key)) {
            existing.push(marker);
            seenKeys.add(key);
          }
        }
        areaMarkersBySpecies.set(species, existing);
      }
    }
  }
}

export const isNationalDexEnabled = (seenSpecies: string[], caughtSpecies: string[]): boolean =>
  [...seenSpecies, ...caughtSpecies].some((species) => (getNationalDexNumber(species) ?? 999) > 151);

export const getPokedexCounts = (seenSpecies: string[], caughtSpecies: string[]) => {
  const countByLimit = (speciesList: string[], maxDexNumber: number): number =>
    speciesList.filter((species) => {
      const nationalDexNumber = getNationalDexNumber(species);
      return nationalDexNumber !== null && nationalDexNumber <= maxDexNumber;
    }).length;

  return {
    seenKanto: countByLimit(seenSpecies, 151),
    ownedKanto: countByLimit(caughtSpecies, 151),
    seenNational: countByLimit(seenSpecies, Number.MAX_SAFE_INTEGER),
    ownedNational: countByLimit(caughtSpecies, Number.MAX_SAFE_INTEGER)
  };
};

export const canShowSpeciesInCurrentDex = (species: string, dexMode: 'KANTO' | 'NATIONAL'): boolean => {
  const nationalDexNumber = getNationalDexNumber(species);
  if (nationalDexNumber === null) {
    return false;
  }

  return dexMode === 'NATIONAL' || nationalDexNumber <= 151;
};

const formatOrderedEntry = (
  species: string,
  seenSpecies: Set<string>,
  caughtSpecies: Set<string>
): PokedexOrderedEntry | null => {
  const nationalDexNumber = getNationalDexNumber(species);
  if (nationalDexNumber === null) {
    return null;
  }

  const seen = seenSpecies.has(species);
  const caught = caughtSpecies.has(species);
  return {
    species,
    nationalDexNumber,
    displayNumber: String(nationalDexNumber).padStart(3, '0'),
    label: seen ? species.replace(/_/gu, ' ') : '-----',
    seen,
    caught,
    types: getDecompSpeciesInfo(species)?.types ?? []
  };
};

export const getPokedexOrderedEntries = (
  orderId: PokedexOrderId,
  dexMode: 'KANTO' | 'NATIONAL',
  seenSpeciesList: string[],
  caughtSpeciesList: string[]
): PokedexOrderedEntry[] => {
  const seenSpecies = new Set(seenSpeciesList.map(normalizeSpecies));
  const caughtSpecies = new Set(caughtSpeciesList.map(normalizeSpecies));
  const nationalLimit = dexMode === 'NATIONAL' ? Number.MAX_SAFE_INTEGER : 151;

  const includeEntry = (species: string): PokedexOrderedEntry | null => {
    const entry = formatOrderedEntry(species, seenSpecies, caughtSpecies);
    if (!entry || entry.nationalDexNumber > nationalLimit) {
      return null;
    }
    return entry;
  };

  switch (orderId) {
    case 'NUMERICAL_KANTO':
      return getNationalDexSpecies()
        .filter((species) => (getNationalDexNumber(species) ?? 999) <= 151)
        .map((species) => includeEntry(species))
        .filter((entry): entry is PokedexOrderedEntry => entry !== null);
    case 'NUMERICAL_NATIONAL':
      return getNationalDexSpecies()
        .map((species) => includeEntry(species))
        .filter((entry): entry is PokedexOrderedEntry => entry !== null);
    case 'ATOZ':
      return alphabeticalOrder
        .map(normalizeSpecies)
        .map((species) => includeEntry(species))
        .filter((entry): entry is PokedexOrderedEntry => entry !== null && entry.seen);
    case 'TYPE':
      return typeOrder
        .map(normalizeSpecies)
        .map((species) => includeEntry(species))
        .filter((entry): entry is PokedexOrderedEntry => entry !== null && entry.caught);
    case 'LIGHTEST':
      return weightOrder
        .map(normalizeSpecies)
        .map((species) => includeEntry(species))
        .filter((entry): entry is PokedexOrderedEntry => entry !== null && entry.caught);
    case 'SMALLEST':
      return heightOrder
        .map(normalizeSpecies)
        .map((species) => includeEntry(species))
        .filter((entry): entry is PokedexOrderedEntry => entry !== null && entry.caught);
  }
};

export const getPokedexTopMenuRows = (
  nationalEnabled: boolean,
  seenSpecies: string[],
  dexMode: 'KANTO' | 'NATIONAL'
): PokedexTopMenuRow[] => {
  const isCategoryEnabled = (categoryId: PokedexCategoryId): boolean =>
    getUnlockedPokedexCategoryPageIndices(categoryId, dexMode, seenSpecies).length > 0;

  const rows: PokedexTopMenuRow[] = [
    { kind: 'header', label: 'POKeMON LIST', actionId: null, enabled: false, iconId: null },
    {
      kind: 'item',
      label: nationalEnabled ? 'NUMERICAL MODE: KANTO' : ORDER_LABELS.NUMERICAL_KANTO,
      actionId: 'NUMERICAL_KANTO',
      enabled: true,
      iconId: ORDER_ICON_IDS.NUMERICAL_KANTO
    }
  ];

  if (nationalEnabled) {
    rows.push({
      kind: 'item',
      label: ORDER_LABELS.NUMERICAL_NATIONAL,
      actionId: 'NUMERICAL_NATIONAL',
      enabled: true,
      iconId: ORDER_ICON_IDS.NUMERICAL_NATIONAL
    });
  }

  rows.push(
    { kind: 'header', label: 'POKeMON HABITATS', actionId: null, enabled: false, iconId: null },
    ...(
      Object.keys(CATEGORY_LABELS) as PokedexCategoryId[]
    ).map((categoryId) => ({
      kind: 'item' as const,
      label: CATEGORY_LABELS[categoryId],
      actionId: categoryId,
      enabled: isCategoryEnabled(categoryId),
      iconId: CATEGORY_ICON_IDS[categoryId]
    })),
    { kind: 'header', label: 'SEARCH', actionId: null, enabled: false, iconId: null },
    {
      kind: 'item',
      label: ORDER_LABELS.ATOZ,
      actionId: 'ATOZ',
      enabled: getPokedexOrderedEntries('ATOZ', dexMode, seenSpecies, []).length > 0,
      iconId: ORDER_ICON_IDS.ATOZ
    },
    {
      kind: 'item',
      label: ORDER_LABELS.TYPE,
      actionId: 'TYPE',
      enabled: true,
      iconId: ORDER_ICON_IDS.TYPE
    },
    {
      kind: 'item',
      label: ORDER_LABELS.LIGHTEST,
      actionId: 'LIGHTEST',
      enabled: true,
      iconId: ORDER_ICON_IDS.LIGHTEST
    },
    {
      kind: 'item',
      label: ORDER_LABELS.SMALLEST,
      actionId: 'SMALLEST',
      enabled: true,
      iconId: ORDER_ICON_IDS.SMALLEST
    },
    { kind: 'header', label: 'POKeDEX OTHER', actionId: null, enabled: false, iconId: null },
    { kind: 'item', label: 'CLOSE POKeDEX', actionId: 'CLOSE', enabled: true, iconId: 'cancel' }
  );

  return rows;
};

export const getFirstSelectablePokedexTopMenuIndex = (rows: PokedexTopMenuRow[]): number =>
  rows.findIndex((row) => row.kind === 'item');

/** `list_menu.c` `ListMenuUpdateSelectedRowIndexAndScrollOffset` — `isHeader` ⇔ `LIST_HEADER`. */
export const listMenuUpdateScrollFireRed = (
  totalItems: number,
  maxShowed: number,
  cursorPos: number,
  itemsAbove: number,
  movingDown: boolean,
  isHeader: (flatIndex: number) => boolean
): { cursorPos: number; itemsAbove: number; changed: boolean } => {
  let ia = itemsAbove;
  let cp = cursorPos;
  const max = Math.min(maxShowed, totalItems);

  if (!movingDown) {
    const newRow = max === 1 ? 0 : max - (Math.floor(max / 2) + (max % 2)) - 1;

    if (cp === 0) {
      while (ia !== 0) {
        ia -= 1;
        if (!isHeader(cp + ia)) {
          return { cursorPos: cp, itemsAbove: ia, changed: true };
        }
      }
      return { cursorPos: cp, itemsAbove, changed: false };
    }

    while (ia > newRow) {
      ia -= 1;
      if (!isHeader(cp + ia)) {
        return { cursorPos: cp, itemsAbove: ia, changed: true };
      }
    }
    const newScroll = cp - 1;
    return { cursorPos: newScroll, itemsAbove: newRow, changed: true };
  }

  const newRowDown = max === 1 ? 0 : Math.floor(max / 2) + (max % 2);

  if (cp === totalItems - max) {
    while (ia < max - 1) {
      ia += 1;
      if (!isHeader(cp + ia)) {
        return { cursorPos: cp, itemsAbove: ia, changed: true };
      }
    }
    return { cursorPos: cp, itemsAbove, changed: false };
  }

  while (ia < newRowDown) {
    ia += 1;
    if (!isHeader(cp + ia)) {
      return { cursorPos: cp, itemsAbove: ia, changed: true };
    }
  }
  const newScrollDown = cp + 1;
  return { cursorPos: newScrollDown, itemsAbove: newRowDown, changed: true };
};

/** One DPAD step like `ListMenuChangeSelection` with `count == 1` (repeat while `ret == 2` and on header). */
export const listMenuStepFireRed = (
  totalItems: number,
  maxShowed: number,
  cursorPos: number,
  itemsAbove: number,
  movingDown: boolean,
  isHeader: (flatIndex: number) => boolean
): { cursorPos: number; itemsAbove: number; moved: boolean } => {
  let cp = cursorPos;
  let ia = itemsAbove;
  let moved = false;
  let guard = 0;

  while (guard < totalItems + 8) {
    guard += 1;
    const u = listMenuUpdateScrollFireRed(totalItems, maxShowed, cp, ia, movingDown, isHeader);
    if (!u.changed) {
      break;
    }
    moved = true;
    cp = u.cursorPos;
    ia = u.itemsAbove;
    if (!isHeader(cp + ia)) {
      break;
    }
  }

  return { cursorPos: cp, itemsAbove: ia, moved };
};

export const getPokedexCategoryPages = (
  categoryId: PokedexCategoryId,
  dexMode: 'KANTO' | 'NATIONAL',
  seenSpecies: string[]
): string[][] =>
  (categoryPages[categoryId] ?? []).map((page) =>
    page.filter(
      (species) =>
        canShowSpeciesInCurrentDex(species, dexMode) && seenSpecies.includes(species)
    )
  );

export const getUnlockedPokedexCategoryPageIndices = (
  categoryId: PokedexCategoryId,
  dexMode: 'KANTO' | 'NATIONAL',
  seenSpecies: string[]
): number[] =>
  getPokedexCategoryPages(categoryId, dexMode, seenSpecies)
    .map((page, index) => ({ page, index }))
    .filter((entry) => entry.page.length > 0)
    .map((entry) => entry.index);

export const getPokedexCategoryPageSpecies = (
  categoryId: PokedexCategoryId,
  pageIndex: number,
  dexMode: 'KANTO' | 'NATIONAL',
  seenSpecies: string[]
): string[] => getPokedexCategoryPages(categoryId, dexMode, seenSpecies)[pageIndex] ?? [];

export const findPokedexCategoryLocation = (
  species: string,
  dexMode: 'KANTO' | 'NATIONAL',
  seenSpecies: string[]
): PokedexCategoryLocation | null => {
  const target = normalizeSpecies(species);

  for (const categoryId of Object.keys(CATEGORY_LABELS) as PokedexCategoryId[]) {
    const pages = getPokedexCategoryPages(categoryId, dexMode, seenSpecies);
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const cursorIndex = pages[pageIndex]?.findIndex((pageSpecies) => pageSpecies === target) ?? -1;
      if (cursorIndex >= 0) {
        return { categoryId, pageIndex, cursorIndex };
      }
    }
  }

  return null;
};

export const getPokedexCategoryRenderablePageNumber = (
  categoryId: PokedexCategoryId,
  pageIndex: number,
  dexMode: 'KANTO' | 'NATIONAL',
  seenSpecies: string[]
): number =>
  getUnlockedPokedexCategoryPageIndices(categoryId, dexMode, seenSpecies).filter(
    (unlockedPageIndex) => unlockedPageIndex <= pageIndex
  ).length;

export const getPokedexAreaMarkers = (species: string): PokedexAreaMarker[] =>
  areaMarkersBySpecies.get(normalizeSpecies(species)) ?? [];

export const getPokedexCategoryLabel = (categoryId: PokedexCategoryId): string =>
  CATEGORY_LABELS[categoryId];

export const getPokedexOrderLabel = (orderId: PokedexOrderId, nationalEnabled: boolean): string => {
  if (orderId === 'NUMERICAL_KANTO' && nationalEnabled) {
    return 'NUMERICAL MODE: KANTO';
  }

  return ORDER_LABELS[orderId];
};

export const getPokedexTopMenuIconId = (actionId: PokedexTopMenuActionId): string =>
  actionId === 'CLOSE'
    ? 'cancel'
    : actionId in CATEGORY_ICON_IDS
      ? CATEGORY_ICON_IDS[actionId as PokedexCategoryId]
      : ORDER_ICON_IDS[actionId as PokedexOrderId];

export const getPokedexEntryCategoryLabel = (species: string): string =>
  `${getDecompPokedexEntry(species)?.category ?? 'UNKNOWN'} POKeMON`;
