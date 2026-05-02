import itemIconTableSource from '../../../src/data/item_icon_table.h?raw';

export interface ItemIconTableEntry {
  item: string;
  iconSymbol: string;
  paletteSymbol: string;
}

export const ITEM_ICON_TABLE_SOURCE = itemIconTableSource;

export const parseItemIconTable = (source: string): ItemIconTableEntry[] =>
  [...source.matchAll(/\[(ITEMS?_\w+|ITEMS_COUNT)\]\s*=\s*\{\s*(gItemIcon_\w+),\s*(gItemIconPalette_\w+)\s*\}/gu)].map(
    (match) => ({
      item: match[1],
      iconSymbol: match[2],
      paletteSymbol: match[3]
    })
  );

export const sItemIconTable = parseItemIconTable(itemIconTableSource);

export const getItemIconTableEntry = (item: string): ItemIconTableEntry | undefined =>
  sItemIconTable.find((entry) => entry.item === item);
