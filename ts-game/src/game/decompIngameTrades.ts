import ingameTradesSource from '../../../src/data/ingame_trades.h?raw';

export type InGameTradeVersion = 'FIRERED' | 'LEAFGREEN';

export interface InGameTrade {
  id: string;
  nickname?: string;
  species?: string;
  ivs?: number[];
  abilityNum?: number;
  otId?: number;
  conditions?: number[];
  personality?: number;
  heldItem?: string;
  mailNum?: number;
  otName?: string;
  otGender?: string;
  sheen?: number;
  requestedSpecies?: string;
}

interface ConditionalTradePatch {
  condition?: InGameTradeVersion;
  fields: Partial<InGameTrade>;
}

export const INGAME_TRADES_SOURCE = ingameTradesSource;

const parseNumericValue = (value: string): number =>
  value.startsWith('0x') ? Number.parseInt(value, 16) : Number.parseInt(value, 10);

const parseValue = (value: string): string | number | number[] => {
  const stringMatch = value.match(/^_\("([\s\S]*?)"\)$/u);
  if (stringMatch) {
    return stringMatch[1];
  }

  const arrayMatch = value.match(/^\{([\d,\s]+)\}$/u);
  if (arrayMatch) {
    return arrayMatch[1].split(',').map((part) => Number.parseInt(part.trim(), 10));
  }

  if (/^(?:0x[\da-f]+|\d+)$/iu.test(value)) {
    return parseNumericValue(value);
  }

  return value;
};

const parseTradeFields = (body: string): ConditionalTradePatch[] => {
  const patches: ConditionalTradePatch[] = [{ fields: {} }];
  let condition: InGameTradeVersion | undefined;

  for (const line of body.split('\n')) {
    if (line.includes('#if defined(FIRERED)')) {
      condition = 'FIRERED';
      patches.push({ condition, fields: {} });
      continue;
    }
    if (line.includes('#elif defined(LEAFGREEN)')) {
      condition = 'LEAFGREEN';
      patches.push({ condition, fields: {} });
      continue;
    }
    if (line.includes('#endif')) {
      condition = undefined;
      continue;
    }

    const match = line.match(/\.(\w+)\s*=\s*(.*?)(?:,)?\s*$/u);
    if (!match) {
      continue;
    }

    const patch = condition ? patches.find((entry) => entry.condition === condition) : patches[0];
    if (patch) {
      patch.fields[match[1] as keyof InGameTrade] = parseValue(match[2].trim()) as never;
    }
  }

  return patches;
};

export const parseInGameTrades = (source: string, version: InGameTradeVersion): InGameTrade[] =>
  [...source.matchAll(/^\s*\[(INGAME_TRADE_\w+)\]\s*=\s*\{([\s\S]*?)^\s*\},?/gmu)].map((match) => {
    const patches = parseTradeFields(match[2]);
    const base = patches.find((patch) => !patch.condition)?.fields ?? {};
    const conditional = patches.find((patch) => patch.condition === version)?.fields ?? {};
    return {
      id: match[1],
      ...base,
      ...conditional
    };
  });

export const sInGameTradesFireRed = parseInGameTrades(ingameTradesSource, 'FIRERED');
export const sInGameTradesLeafGreen = parseInGameTrades(ingameTradesSource, 'LEAFGREEN');

export const parseInGameTradeMailMessages = (source: string): string[][] => {
  const block = source.match(/static const u16 sInGameTradeMailMessages\[\]\[10\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...block.matchAll(/\{([\s\S]*?)\}/gu)].map((row) =>
    [...row[1].matchAll(/\b(EC_WORD_\w+|EC_POKEMON\(\w+\))/gu)].map((token) => token[1])
  );
};

export const sInGameTradeMailMessages = parseInGameTradeMailMessages(ingameTradesSource);

export const getInGameTrade = (id: string, version: InGameTradeVersion = 'FIRERED'): InGameTrade | undefined =>
  (version === 'FIRERED' ? sInGameTradesFireRed : sInGameTradesLeafGreen).find((trade) => trade.id === id);
