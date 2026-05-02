import itemEffectConstantsSource from '../../../include/constants/item_effects.h?raw';
import itemEffectsSource from '../../../src/data/pokemon/item_effects.h?raw';

export interface DecompItemEffect {
  itemId: string;
  symbol: string;
  length: number;
  fields: number[];
}

export interface DecompItemEffectTableDefinition {
  symbol: string;
  length: number;
  fields: number[];
}

export interface DecompItemEffectTableEntry {
  itemId: string;
  symbol: string | null;
  effect: DecompItemEffect | null;
}

export type DecompTrainerAiItemType =
  | 'AI_ITEM_FULL_RESTORE'
  | 'AI_ITEM_HEAL_HP'
  | 'AI_ITEM_CURE_CONDITION'
  | 'AI_ITEM_X_STAT'
  | 'AI_ITEM_GUARD_SPECS'
  | 'AI_ITEM_NOT_RECOGNIZABLE';

const stripLineComment = (value: string): string =>
  value.replace(/\/\/.*$/u, '').trim();

const rawConstantExpressions = new Map<string, string>();
for (const match of itemEffectConstantsSource.matchAll(/^#define\s+([A-Z0-9_]+)\s+(.+)$/gmu)) {
  const value = stripLineComment(match[2] ?? '');
  if (value && !value.includes('\\')) {
    rawConstantExpressions.set(match[1]!, value);
  }
}

const evaluatedConstants = new Map<string, number>();

const normalizeExpression = (expression: string): string =>
  stripLineComment(expression)
    .replace(/\(\s*u8\s*\)/gu, 'u8 ')
    .replace(/[()]/gu, ' ')
    .trim();

const evaluateExpression = (expression: string, seen = new Set<string>()): number => {
  const normalized = normalizeExpression(expression);
  if (!normalized) {
    return 0;
  }

  const u8CastMatch = normalized.match(/^u8\s+(.+)$/u);
  if (u8CastMatch) {
    return evaluateExpression(u8CastMatch[1]!, seen) & 0xff;
  }

  const orParts = normalized.split('|').map((part) => part.trim()).filter(Boolean);
  if (orParts.length > 1) {
    return orParts.reduce((value, part) => value | evaluateExpression(part, seen), 0);
  }

  const shiftParts = normalized.split('<<').map((part) => part.trim()).filter(Boolean);
  if (shiftParts.length === 2) {
    return evaluateExpression(shiftParts[0]!, seen) << evaluateExpression(shiftParts[1]!, seen);
  }

  if (/^-?0x[0-9a-f]+$/iu.test(normalized) || /^-?\d+$/u.test(normalized)) {
    return Number.parseInt(normalized, 0);
  }

  if (evaluatedConstants.has(normalized)) {
    return evaluatedConstants.get(normalized)!;
  }

  const raw = rawConstantExpressions.get(normalized);
  if (!raw || seen.has(normalized)) {
    return 0;
  }

  seen.add(normalized);
  const evaluated = evaluateExpression(raw, seen);
  evaluatedConstants.set(normalized, evaluated);
  seen.delete(normalized);
  return evaluated;
};

const getConstant = (name: string): number => evaluateExpression(name);

const toU8 = (value: number): number => value & 0xff;

const expandItemEffectMacros = (body: string): string =>
  body
    .replace(/VITAMIN_FRIENDSHIP_CHANGE\((\d+)\)/gu, (_match, index: string) => {
      const offset = Number.parseInt(index, 10);
      return `[${offset + 0}] = 5,\n[${offset + 1}] = 3,\n[${offset + 2}] = 2`;
    })
    .replace(/STAT_BOOST_FRIENDSHIP_CHANGE/gu, '[6] = 1,\n[7] = 1');

const parseItemEffectTableDefinitions = (): Map<string, DecompItemEffectTableDefinition> => {
  const symbolFields = new Map<string, DecompItemEffectTableDefinition>();
  const effectRegex = /static const u8 (sItemEffect_[A-Za-z0-9_]+)\[(\d+)\]\s*=\s*\{([\s\S]*?)\n\};/gu;

  for (const match of itemEffectsSource.matchAll(effectRegex)) {
    const symbol = match[1]!;
    const length = Number.parseInt(match[2]!, 10);
    const fields = Array.from({ length }, () => 0);
    const body = expandItemEffectMacros(match[3] ?? '');
    for (const fieldMatch of body.matchAll(/\[(\d+)\]\s*=\s*([^,\n]+)/gu)) {
      const fieldIndex = Number.parseInt(fieldMatch[1]!, 10);
      if (fieldIndex < fields.length) {
        fields[fieldIndex] = toU8(evaluateExpression(fieldMatch[2] ?? ''));
      }
    }
    symbolFields.set(symbol, { symbol, length, fields });
  }

  return symbolFields;
};

export const sItemEffectTableDefinitions = parseItemEffectTableDefinitions();

const parseItemEffectTable = (): DecompItemEffectTableEntry[] => {
  const tableMatch = itemEffectsSource.match(/const u8 \*const gItemEffectTable\[\]\s*=\s*\{([\s\S]*?)\n\};/u);
  if (!tableMatch) {
    return [];
  }

  const entries: DecompItemEffectTableEntry[] = [];
  for (const match of tableMatch[1]!.matchAll(/\[(ITEM_[A-Z0-9_]+|LAST_BERRY_INDEX)\s+-\s+ITEM_POTION\]\s*=\s*(sItemEffect_[A-Za-z0-9_]+|NULL)/gu)) {
    const itemId = match[1]!;
    const symbol = match[2]!;
    if (symbol === 'NULL') {
      entries.push({ itemId, symbol: null, effect: null });
      continue;
    }

    const definition = sItemEffectTableDefinitions.get(symbol);
    entries.push({
      itemId,
      symbol,
      effect: definition
        ? {
        itemId,
        symbol,
            length: definition.length,
            fields: [...definition.fields]
          }
        : null
    });
  }

  return entries;
};

export const gItemEffectTable = parseItemEffectTable();

const parseItemEffects = (): Map<string, DecompItemEffect> => {
  const effectsByItem = new Map<string, DecompItemEffect>();

  for (const entry of gItemEffectTable) {
    if (entry.effect) {
      effectsByItem.set(entry.itemId, entry.effect);
    }
  }

  return effectsByItem;
};

const itemEffects = parseItemEffects();

export const getDecompItemEffect = (itemId: string): DecompItemEffect | null =>
  itemEffects.get(itemId) ?? null;

export const getAllDecompItemEffects = (): DecompItemEffect[] =>
  [...itemEffects.values()];

export const getDecompTrainerAiItemType = (itemId: string): DecompTrainerAiItemType => {
  const effect = getDecompItemEffect(itemId);
  if (!effect) {
    return 'AI_ITEM_NOT_RECOGNIZABLE';
  }

  if (itemId === 'ITEM_FULL_RESTORE') {
    return 'AI_ITEM_FULL_RESTORE';
  }
  if ((effect.fields[4] ?? 0) & getConstant('ITEM4_HEAL_HP')) {
    return 'AI_ITEM_HEAL_HP';
  }
  if ((effect.fields[3] ?? 0) & getConstant('ITEM3_STATUS_ALL')) {
    return 'AI_ITEM_CURE_CONDITION';
  }
  if (
    ((effect.fields[0] ?? 0) & (getConstant('ITEM0_DIRE_HIT') | getConstant('ITEM0_X_ATTACK')))
    || (effect.fields[1] ?? 0) !== 0
    || (effect.fields[2] ?? 0) !== 0
  ) {
    return 'AI_ITEM_X_STAT';
  }
  if ((effect.fields[3] ?? 0) & getConstant('ITEM3_GUARD_SPEC')) {
    return 'AI_ITEM_GUARD_SPECS';
  }
  return 'AI_ITEM_NOT_RECOGNIZABLE';
};

export const getDecompItemEffectField = (itemId: string, field: number): number =>
  getDecompItemEffect(itemId)?.fields[field] ?? 0;

export const itemEffectConstant = (name: string): number => getConstant(name);
