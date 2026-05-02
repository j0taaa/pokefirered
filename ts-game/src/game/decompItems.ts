import rawItemsData from '../../../src/data/items.json';

export interface DecompItemJsonEntry {
  english: string;
  itemId: string;
  price: number;
  holdEffect: string;
  holdEffectParam: number;
  description_english: string;
  importance: number;
  registrability: number;
  pocket: string;
  type: string | number;
  fieldUseFunc: string;
  battleUsage: number;
  battleUseFunc: string;
  secondaryId: number;
  moveId?: string;
}

export interface DecompItemsJson {
  items: DecompItemJsonEntry[];
}

export const gItemsJson = rawItemsData as DecompItemsJson;
export const gItems = gItemsJson.items;

const itemsById = new Map(gItems.map((item) => [item.itemId, item]));

export const getDecompItem = (itemId: string): DecompItemJsonEntry | null =>
  itemsById.get(itemId) ?? null;

export const getDecompItemsByPocket = (pocket: string): DecompItemJsonEntry[] =>
  gItems.filter((item) => item.pocket === pocket);
