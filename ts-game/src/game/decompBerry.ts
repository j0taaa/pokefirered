import berrySource from '../../../src/berry.c?raw';

export const BERRY_SOURCE = berrySource;

export const BERRY_FIRMNESS_UNKNOWN = 0;
export const BERRY_FIRMNESS_VERY_SOFT = 1;
export const BERRY_FIRMNESS_SOFT = 2;
export const BERRY_FIRMNESS_HARD = 3;
export const BERRY_FIRMNESS_VERY_HARD = 4;
export const BERRY_FIRMNESS_SUPER_HARD = 5;

export const FLAVOR_SPICY = 0;
export const FLAVOR_DRY = 1;
export const FLAVOR_SWEET = 2;
export const FLAVOR_BITTER = 3;
export const FLAVOR_SOUR = 4;
export const FLAVOR_COUNT = 5;

export const BERRY_NAME_LENGTH = 6;
export const BERRY_NAME_COUNT = 7;
export const BERRY_ITEM_EFFECT_COUNT = 18;
export const NUM_BERRIES = 44;
export const ITEM_CHERI_BERRY = 133;
export const ITEM_ENIGMA_BERRY = 175;
export const FIRST_BERRY_INDEX = ITEM_CHERI_BERRY;
export const LAST_BERRY_INDEX = ITEM_ENIGMA_BERRY;
export const ENIGMA_BERRY_TYPE = itemToBerry(ITEM_ENIGMA_BERRY);

export interface Berry {
  itemId: number;
  itemConstant: string;
  name: string;
  nameBytes: number[];
  firmness: number;
  size: number;
  maxYield: number;
  minYield: number;
  description1: string;
  description2: string;
  stageDuration: number;
  spicy: number;
  dry: number;
  sweet: number;
  bitter: number;
  sour: number;
  smoothness: number;
}

export interface BerryCrushStats {
  difficulty: number;
  powder: number;
}

export interface EnigmaBerry {
  berry: Berry;
  itemEffect: number[];
  holdEffect: number;
  holdEffectParam: number;
  checksum: number;
}

export interface BerryRuntime {
  gSaveBlock1Ptr: {
    enigmaBerry: EnigmaBerry;
  };
}

const firmnessValues: Record<string, number> = {
  BERRY_FIRMNESS_UNKNOWN,
  BERRY_FIRMNESS_VERY_SOFT,
  BERRY_FIRMNESS_SOFT,
  BERRY_FIRMNESS_HARD,
  BERRY_FIRMNESS_VERY_HARD,
  BERRY_FIRMNESS_SUPER_HARD
};

const berryItemIds: Record<string, number> = {
  CHERI: 133,
  CHESTO: 134,
  PECHA: 135,
  RAWST: 136,
  ASPEAR: 137,
  LEPPA: 138,
  ORAN: 139,
  PERSIM: 140,
  LUM: 141,
  SITRUS: 142,
  FIGY: 143,
  WIKI: 144,
  MAGO: 145,
  AGUAV: 146,
  IAPAPA: 147,
  RAZZ: 148,
  BLUK: 149,
  NANAB: 150,
  WEPEAR: 151,
  PINAP: 152,
  POMEG: 153,
  KELPSY: 154,
  QUALOT: 155,
  HONDEW: 156,
  GREPA: 157,
  TAMATO: 158,
  CORNN: 159,
  MAGOST: 160,
  RABUTA: 161,
  NOMEL: 162,
  SPELON: 163,
  PAMTRE: 164,
  WATMEL: 165,
  DURIN: 166,
  BELUE: 167,
  LIECHI: 168,
  GANLON: 169,
  SALAC: 170,
  PETAYA: 171,
  APICOT: 172,
  LANSAT: 173,
  STARF: 174,
  ENIGMA: 175
};

const decodeCStringLiteral = (value: string): string =>
  value.replace(/\\p/gu, '\\p').replace(/\\"/gu, '"').replace(/\\\\/gu, '\\');

const nameToBytes = (name: string): number[] => {
  const bytes = Array.from({ length: BERRY_NAME_COUNT }, () => 0);
  for (let i = 0; i < Math.min(name.length, BERRY_NAME_LENGTH); i += 1) {
    bytes[i] = name.charCodeAt(i) & 0xff;
  }
  return bytes;
};

const parseDescriptions = (source: string): Record<string, string> => {
  const descriptions: Record<string, string> = {};
  const regex = /static const u8 (sBerryDescriptionPart[12]_\w+)\[\] = _\("([\s\S]*?)"\);/gu;
  for (const match of source.matchAll(regex)) {
    descriptions[match[1]] = decodeCStringLiteral(match[2]);
  }
  return descriptions;
};

const getField = (body: string, field: string): string => {
  const match = new RegExp(`\\.${field}\\s*=\\s*([^,\\n]+)(?:,|\\n|$)`, 'u').exec(body);
  if (!match) throw new Error(`Missing Berry field ${field}`);
  return match[1].trim();
};

export const parseBerries = (source: string): Berry[] => {
  const descriptions = parseDescriptions(source);
  const berries: Berry[] = [];
  const table = source.split('const struct Berry gBerries[] = {', 2)[1].split('const struct BerryCrushStats', 1)[0];
  const regex = /\[ITEM_(\w+)_BERRY - FIRST_BERRY_INDEX\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;
  for (const match of table.matchAll(regex)) {
    const token = match[1];
    const body = match[2];
    const name = /_\("([\s\S]*?)"\)/u.exec(getField(body, 'name'))?.[1] ?? '';
    const description1Key = getField(body, 'description1');
    const description2Key = getField(body, 'description2');
    berries[itemToBerry(berryItemIds[token]) - 1] = {
      itemId: berryItemIds[token],
      itemConstant: `ITEM_${token}_BERRY`,
      name,
      nameBytes: nameToBytes(name),
      firmness: firmnessValues[getField(body, 'firmness')],
      size: Number(getField(body, 'size')),
      maxYield: Number(getField(body, 'maxYield')),
      minYield: Number(getField(body, 'minYield')),
      description1: descriptions[description1Key],
      description2: descriptions[description2Key],
      stageDuration: Number(getField(body, 'stageDuration')),
      spicy: Number(getField(body, 'spicy')),
      dry: Number(getField(body, 'dry')),
      sweet: Number(getField(body, 'sweet')),
      bitter: Number(getField(body, 'bitter')),
      sour: Number(getField(body, 'sour')),
      smoothness: Number(getField(body, 'smoothness'))
    };
  }
  return berries;
};

export const parseBerryCrushStats = (source: string): BerryCrushStats[] => {
  const stats: BerryCrushStats[] = [];
  const table = source.split('const struct BerryCrushStats gBerryCrush_BerryData[] = {', 2)[1].split('};', 1)[0];
  const regex = /\[ITEM_(\w+)_BERRY\s+- FIRST_BERRY_INDEX\]\s*=\s*\{\s*(\d+),\s*(\d+)\s*\}/gu;
  for (const match of table.matchAll(regex)) {
    stats[itemToBerry(berryItemIds[match[1]]) - 1] = {
      difficulty: Number(match[2]),
      powder: Number(match[3])
    };
  }
  return stats;
};

export const gBerries = parseBerries(berrySource);
export const gBerryCrush_BerryData = parseBerryCrushStats(berrySource);
export const gBlankBerryTree = {
  berry: 0,
  stage: 0,
  growthSparkle: 0,
  minutesUntilNextStage: 0,
  berryYield: 0,
  regrowthCount: 0,
  watered1: 0,
  watered2: 0,
  watered3: 0,
  watered4: 0
} as const;

export function itemToBerry(itemId: number): number {
  return itemId - FIRST_BERRY_INDEX + 1;
}

const cloneBerry = (berry: Berry): Berry => ({
  ...berry,
  nameBytes: [...berry.nameBytes]
});

const cloneEnigmaBerry = (enigmaBerry: EnigmaBerry): EnigmaBerry => ({
  berry: cloneBerry(enigmaBerry.berry),
  itemEffect: [...enigmaBerry.itemEffect],
  holdEffect: enigmaBerry.holdEffect,
  holdEffectParam: enigmaBerry.holdEffectParam,
  checksum: enigmaBerry.checksum
});

const defaultEnigmaBerryWithoutChecksum = (): EnigmaBerry => ({
  berry: cloneBerry(gBerries[ENIGMA_BERRY_TYPE - 1]),
  itemEffect: Array.from({ length: BERRY_ITEM_EFFECT_COUNT }, () => 0),
  holdEffect: 0,
  holdEffectParam: 0,
  checksum: 0
});

export const createBerryRuntime = (): BerryRuntime => {
  const enigmaBerry = defaultEnigmaBerryWithoutChecksum();
  enigmaBerry.checksum = getEnigmaBerryChecksum(enigmaBerry);
  return { gSaveBlock1Ptr: { enigmaBerry } };
};

const pushU16LE = (bytes: number[], value: number): void => {
  bytes.push(value & 0xff, (value >> 8) & 0xff);
};

const pushStringBytes = (bytes: number[], value: string): void => {
  for (let i = 0; i < value.length; i += 1) bytes.push(value.charCodeAt(i) & 0xff);
  bytes.push(0);
};

const enigmaBytesBeforeChecksum = (enigmaBerry: EnigmaBerry): number[] => {
  const bytes = [...enigmaBerry.berry.nameBytes];
  bytes.push(enigmaBerry.berry.firmness & 0xff);
  pushU16LE(bytes, enigmaBerry.berry.size);
  bytes.push(enigmaBerry.berry.maxYield & 0xff, enigmaBerry.berry.minYield & 0xff);
  pushStringBytes(bytes, enigmaBerry.berry.description1);
  pushStringBytes(bytes, enigmaBerry.berry.description2);
  bytes.push(
    enigmaBerry.berry.stageDuration & 0xff,
    enigmaBerry.berry.spicy & 0xff,
    enigmaBerry.berry.dry & 0xff,
    enigmaBerry.berry.sweet & 0xff,
    enigmaBerry.berry.bitter & 0xff,
    enigmaBerry.berry.sour & 0xff,
    enigmaBerry.berry.smoothness & 0xff
  );
  bytes.push(...enigmaBerry.itemEffect.map((value) => value & 0xff));
  bytes.push(enigmaBerry.holdEffect & 0xff, enigmaBerry.holdEffectParam & 0xff);
  return bytes;
};

export const getEnigmaBerryChecksum = (enigmaBerry: EnigmaBerry): number =>
  enigmaBytesBeforeChecksum(enigmaBerry).reduce((sum, value) => (sum + value) >>> 0, 0);

export const initEnigmaBerry = (runtime: BerryRuntime): void => {
  const enigmaBerry = defaultEnigmaBerryWithoutChecksum();
  enigmaBerry.checksum = getEnigmaBerryChecksum(enigmaBerry);
  runtime.gSaveBlock1Ptr.enigmaBerry = enigmaBerry;
};

export const clearEnigmaBerries = (runtime: BerryRuntime): void => {
  runtime.gSaveBlock1Ptr.enigmaBerry = {
    berry: {
      itemId: 0,
      itemConstant: '',
      name: '',
      nameBytes: Array.from({ length: BERRY_NAME_COUNT }, () => 0),
      firmness: 0,
      size: 0,
      maxYield: 0,
      minYield: 0,
      description1: '',
      description2: '',
      stageDuration: 0,
      spicy: 0,
      dry: 0,
      sweet: 0,
      bitter: 0,
      sour: 0,
      smoothness: 0
    },
    itemEffect: Array.from({ length: BERRY_ITEM_EFFECT_COUNT }, () => 0),
    holdEffect: 0,
    holdEffectParam: 0,
    checksum: 0
  };
  initEnigmaBerry(runtime);
};

export const setEnigmaBerry = (runtime: BerryRuntime, received: Omit<EnigmaBerry, 'checksum'>): void => {
  clearEnigmaBerries(runtime);
  runtime.gSaveBlock1Ptr.enigmaBerry = {
    berry: cloneBerry(received.berry),
    itemEffect: received.itemEffect.slice(0, BERRY_ITEM_EFFECT_COUNT),
    holdEffect: received.holdEffect,
    holdEffectParam: received.holdEffectParam,
    checksum: 0
  };
  while (runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect.length < BERRY_ITEM_EFFECT_COUNT) {
    runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect.push(0);
  }
  runtime.gSaveBlock1Ptr.enigmaBerry.checksum = getEnigmaBerryChecksum(runtime.gSaveBlock1Ptr.enigmaBerry);
};

export const isEnigmaBerryValid = (runtime: BerryRuntime): boolean => {
  const enigmaBerry = runtime.gSaveBlock1Ptr.enigmaBerry;
  if (enigmaBerry.berry.stageDuration === 0) return false;
  if (enigmaBerry.berry.maxYield === 0) return false;
  if (getEnigmaBerryChecksum(enigmaBerry) !== enigmaBerry.checksum) return false;
  return true;
};

export const getBerryInfo = (runtime: BerryRuntime, berryIdx: number): Berry => {
  let idx = berryIdx;
  if (idx === ENIGMA_BERRY_TYPE && isEnigmaBerryValid(runtime)) {
    return runtime.gSaveBlock1Ptr.enigmaBerry.berry;
  }
  if (idx === 0 || idx > ENIGMA_BERRY_TYPE) {
    idx = 1;
  }
  return gBerries[idx - 1];
};

export const itemIdToBerryType = (itemId: number): number => {
  if (itemId - FIRST_BERRY_INDEX < 0 || itemId - FIRST_BERRY_INDEX > ITEM_ENIGMA_BERRY - FIRST_BERRY_INDEX) {
    return 1;
  }
  return itemToBerry(itemId);
};

export const berryTypeToItemId = (berryType: number): number => {
  if (berryType - 1 < 0 || berryType - 1 > ITEM_ENIGMA_BERRY - FIRST_BERRY_INDEX) {
    return FIRST_BERRY_INDEX;
  }
  return berryType + FIRST_BERRY_INDEX - 1;
};

export const getBerryNameBytesByBerryType = (runtime: BerryRuntime, berryType: number): number[] => {
  const berry = getBerryInfo(runtime, berryType);
  const dest = berry.nameBytes.slice(0, BERRY_NAME_LENGTH);
  dest[BERRY_NAME_LENGTH] = 0;
  return dest;
};

export const getBerryNameByBerryType = (runtime: BerryRuntime, berryType: number): string => {
  const bytes = getBerryNameBytesByBerryType(runtime, berryType);
  const eos = bytes.indexOf(0);
  return String.fromCharCode(...bytes.slice(0, eos < 0 ? bytes.length : eos));
};

export const copyEnigmaBerry = (runtime: BerryRuntime): EnigmaBerry => cloneEnigmaBerry(runtime.gSaveBlock1Ptr.enigmaBerry);

export function InitEnigmaBerry(runtime: BerryRuntime): void {
  initEnigmaBerry(runtime);
}

export function ClearEnigmaBerries(runtime: BerryRuntime): void {
  clearEnigmaBerries(runtime);
}

export function SetEnigmaBerry(runtime: BerryRuntime, berry: Omit<EnigmaBerry, 'checksum'>): void {
  setEnigmaBerry(runtime, berry);
}

export function GetEnigmaBerryChecksum(enigmaBerry: EnigmaBerry): number {
  return getEnigmaBerryChecksum(enigmaBerry);
}

export function IsEnigmaBerryValid(runtime: BerryRuntime): boolean {
  return isEnigmaBerryValid(runtime);
}

export function GetBerryInfo(runtime: BerryRuntime, berryIdx: number): Berry {
  return getBerryInfo(runtime, berryIdx);
}

export function ItemIdToBerryType(itemId: number): number {
  return itemIdToBerryType(itemId);
}

export function BerryTypeToItemId(berryType: number): number {
  return berryTypeToItemId(berryType);
}

export function GetBerryNameByBerryType(runtime: BerryRuntime, berryType: number, dest: number[]): void {
  const bytes = getBerryNameBytesByBerryType(runtime, berryType);
  for (let i = 0; i <= BERRY_NAME_LENGTH; i += 1) {
    dest[i] = bytes[i] ?? 0;
  }
}
