export const DEFAULT_MAX_SIZE = 0;
export const PARTY_SIZE = 6;
export const SPECIES_NONE = 0;
export const SPECIES_HERACROSS = 214;
export const SPECIES_MAGIKARP = 129;
export const VAR_HERACROSS_SIZE_RECORD = 0x403d;
export const VAR_MAGIKARP_SIZE_RECORD = 0x4040;
export const FLAG_SYS_RIBBON_GET = 0x83b;

export const MON_DATA_MARINE_RIBBON = 72;
export const MON_DATA_LAND_RIBBON = 73;
export const MON_DATA_SKY_RIBBON = 74;
export const MON_DATA_COUNTRY_RIBBON = 75;
export const MON_DATA_NATIONAL_RIBBON = 76;
export const MON_DATA_EARTH_RIBBON = 77;
export const MON_DATA_WORLD_RIBBON = 78;

export const BIG_MON_SIZE_TABLE = [
  { unk0: 290, unk2: 1, unk4: 0 },
  { unk0: 300, unk2: 1, unk4: 10 },
  { unk0: 400, unk2: 2, unk4: 110 },
  { unk0: 500, unk2: 4, unk4: 310 },
  { unk0: 600, unk2: 20, unk4: 710 },
  { unk0: 700, unk2: 50, unk4: 2710 },
  { unk0: 800, unk2: 100, unk4: 7710 },
  { unk0: 900, unk2: 150, unk4: 17710 },
  { unk0: 1000, unk2: 150, unk4: 32710 },
  { unk0: 1100, unk2: 100, unk4: 47710 },
  { unk0: 1200, unk2: 50, unk4: 57710 },
  { unk0: 1300, unk2: 20, unk4: 62710 },
  { unk0: 1400, unk2: 5, unk4: 64710 },
  { unk0: 1500, unk2: 2, unk4: 65210 },
  { unk0: 1600, unk2: 1, unk4: 65410 },
  { unk0: 1700, unk2: 1, unk4: 65510 }
] as const;

export const GIFT_RIBBONS_MON_DATA_IDS = [
  MON_DATA_MARINE_RIBBON,
  MON_DATA_LAND_RIBBON,
  MON_DATA_SKY_RIBBON,
  MON_DATA_COUNTRY_RIBBON,
  MON_DATA_NATIONAL_RIBBON,
  MON_DATA_EARTH_RIBBON,
  MON_DATA_WORLD_RIBBON
] as const;

export interface SizeRecordMon {
  species: number;
  isEgg: boolean;
  sanityIsEgg: boolean;
  personality: number;
  hpIV: number;
  attackIV: number;
  defenseIV: number;
  speedIV: number;
  spAtkIV: number;
  spDefIV: number;
  ribbons: Record<number, number>;
}

export interface PokemonSizeRecordRuntime {
  playerParty: SizeRecordMon[];
  specialVarResult: number;
  vars: Record<number, number>;
  flags: Set<number>;
  giftRibbons: number[];
  stringVar1: string;
  stringVar2: string;
  stringVar3: string;
  speciesNames: Record<number, string>;
  pokedexHeights: Record<number, number>;
}

export const createSizeRecordMon = (
  species = SPECIES_NONE
): SizeRecordMon => ({
  species,
  isEgg: false,
  sanityIsEgg: false,
  personality: 0,
  hpIV: 0,
  attackIV: 0,
  defenseIV: 0,
  speedIV: 0,
  spAtkIV: 0,
  spDefIV: 0,
  ribbons: {}
});

export const createPokemonSizeRecordRuntime = (): PokemonSizeRecordRuntime => ({
  playerParty: Array.from({ length: PARTY_SIZE }, () => createSizeRecordMon()),
  specialVarResult: 0,
  vars: {},
  flags: new Set(),
  giftRibbons: Array.from({ length: 11 }, () => 0),
  stringVar1: '',
  stringVar2: '',
  stringVar3: '',
  speciesNames: {
    [SPECIES_HERACROSS]: 'HERACROSS',
    [SPECIES_MAGIKARP]: 'MAGIKARP'
  },
  pokedexHeights: {
    [SPECIES_HERACROSS]: 15,
    [SPECIES_MAGIKARP]: 9
  }
});

export const getMonSizeHash = (mon: SizeRecordMon): number => {
  const personality = mon.personality & 0xffff;
  const hpIV = mon.hpIV & 0xf;
  const attackIV = mon.attackIV & 0xf;
  const defenseIV = mon.defenseIV & 0xf;
  const speedIV = mon.speedIV & 0xf;
  const spAtkIV = mon.spAtkIV & 0xf;
  const spDefIV = mon.spDefIV & 0xf;
  const hibyte = (((attackIV ^ defenseIV) * hpIV) ^ (personality & 0xff)) >>> 0;
  const lobyte = (((spAtkIV ^ spDefIV) * speedIV) ^ (personality >> 8)) >>> 0;
  return ((hibyte << 8) + lobyte) >>> 0;
};

export const translateBigMonSizeTableIndex = (a: number): number => {
  let i = 1;
  for (; i < 15; i += 1) {
    if (a < BIG_MON_SIZE_TABLE[i].unk4) {
      return i - 1;
    }
  }
  return i;
};

export const getMonSize = (
  runtime: PokemonSizeRecordRuntime,
  species: number,
  b: number
): number => {
  const height = runtime.pokedexHeights[species] ?? 0;
  const tableIndex = translateBigMonSizeTableIndex(b & 0xffff);
  const entry = BIG_MON_SIZE_TABLE[tableIndex];
  const unk0 = entry.unk0 + Math.trunc(((b & 0xffff) - entry.unk4) / entry.unk2);
  return Math.trunc((height * unk0) / 10);
};

export const formatMonSizeRecord = (
  size: number,
  imperial = false
): string => {
  const normalized = imperial ? Math.trunc((size * 100) / 254) : size;
  return `${Math.trunc(normalized / 10)}.${normalized % 10}`;
};

export const compareMonSize = (
  runtime: PokemonSizeRecordRuntime,
  species: number,
  sizeRecordVar: number
): number => {
  if (runtime.specialVarResult >= PARTY_SIZE) {
    return 0;
  }

  const mon = runtime.playerParty[runtime.specialVarResult];
  if (mon.isEgg === true || mon.species !== species) {
    return 1;
  }

  const sizeParams = getMonSizeHash(mon) & 0xffff;
  const oldSize = getMonSize(runtime, species, runtime.vars[sizeRecordVar] ?? 0);
  const newSize = getMonSize(runtime, species, sizeParams);
  runtime.stringVar3 = formatMonSizeRecord(oldSize);
  runtime.stringVar2 = formatMonSizeRecord(newSize);

  if (newSize === oldSize) {
    return 4;
  }
  if (newSize < oldSize) {
    return 2;
  }

  runtime.vars[sizeRecordVar] = sizeParams;
  return 3;
};

export const getMonSizeRecordInfo = (
  runtime: PokemonSizeRecordRuntime,
  species: number,
  sizeRecordVar: number
): void => {
  const size = getMonSize(runtime, species, runtime.vars[sizeRecordVar] ?? 0);
  runtime.stringVar3 = formatMonSizeRecord(size);
  runtime.stringVar1 = runtime.speciesNames[species] ?? '';
};

export const initHeracrossSizeRecord = (
  runtime: PokemonSizeRecordRuntime
): void => {
  runtime.vars[VAR_HERACROSS_SIZE_RECORD] = DEFAULT_MAX_SIZE;
};

export const getHeracrossSizeRecordInfo = (
  runtime: PokemonSizeRecordRuntime
): void => getMonSizeRecordInfo(runtime, SPECIES_HERACROSS, VAR_HERACROSS_SIZE_RECORD);

export const compareHeracrossSize = (
  runtime: PokemonSizeRecordRuntime
): void => {
  runtime.specialVarResult = compareMonSize(runtime, SPECIES_HERACROSS, VAR_HERACROSS_SIZE_RECORD);
};

export const initMagikarpSizeRecord = (
  runtime: PokemonSizeRecordRuntime
): void => {
  runtime.vars[VAR_MAGIKARP_SIZE_RECORD] = DEFAULT_MAX_SIZE;
};

export const getMagikarpSizeRecordInfo = (
  runtime: PokemonSizeRecordRuntime
): void => getMonSizeRecordInfo(runtime, SPECIES_MAGIKARP, VAR_MAGIKARP_SIZE_RECORD);

export const compareMagikarpSize = (
  runtime: PokemonSizeRecordRuntime
): void => {
  runtime.specialVarResult = compareMonSize(runtime, SPECIES_MAGIKARP, VAR_MAGIKARP_SIZE_RECORD);
};

export const giveGiftRibbonToParty = (
  runtime: PokemonSizeRecordRuntime,
  index: number,
  ribbonId: number
): void => {
  let gotRibbon = false;
  const data = 1;
  const array = [...GIFT_RIBBONS_MON_DATA_IDS];

  if (index < 11 && ribbonId < 65) {
    runtime.giftRibbons[index] = ribbonId;
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      const mon = runtime.playerParty[i];
      if (mon.species !== SPECIES_NONE && !mon.sanityIsEgg) {
        mon.ribbons[array[index]] = data;
        gotRibbon = true;
      }
    }
    if (gotRibbon) {
      runtime.flags.add(FLAG_SYS_RIBBON_GET);
    }
  }
};

export function GetMonSizeHash(mon: SizeRecordMon): number {
  return getMonSizeHash(mon);
}

export function TranslateBigMonSizeTableIndex(a: number): number {
  return translateBigMonSizeTableIndex(a);
}

export function GetMonSize(
  runtime: PokemonSizeRecordRuntime,
  species: number,
  b: number
): number {
  return getMonSize(runtime, species, b);
}

export function FormatMonSizeRecord(size: number, imperial = false): string {
  return formatMonSizeRecord(size, imperial);
}

export function CompareMonSize(
  runtime: PokemonSizeRecordRuntime,
  species: number,
  sizeRecordVar: number
): number {
  return compareMonSize(runtime, species, sizeRecordVar);
}

export function GetMonSizeRecordInfo(
  runtime: PokemonSizeRecordRuntime,
  species: number,
  sizeRecordVar: number
): void {
  getMonSizeRecordInfo(runtime, species, sizeRecordVar);
}

export function InitHeracrossSizeRecord(runtime: PokemonSizeRecordRuntime): void {
  initHeracrossSizeRecord(runtime);
}

export function GetHeracrossSizeRecordInfo(runtime: PokemonSizeRecordRuntime): void {
  getHeracrossSizeRecordInfo(runtime);
}

export function CompareHeracrossSize(runtime: PokemonSizeRecordRuntime): void {
  compareHeracrossSize(runtime);
}

export function InitMagikarpSizeRecord(runtime: PokemonSizeRecordRuntime): void {
  initMagikarpSizeRecord(runtime);
}

export function GetMagikarpSizeRecordInfo(runtime: PokemonSizeRecordRuntime): void {
  getMagikarpSizeRecordInfo(runtime);
}

export function CompareMagikarpSize(runtime: PokemonSizeRecordRuntime): void {
  compareMagikarpSize(runtime);
}

export function GiveGiftRibbonToParty(
  runtime: PokemonSizeRecordRuntime,
  index: number,
  ribbonId: number
): void {
  giveGiftRibbonToParty(runtime, index, ribbonId);
}
