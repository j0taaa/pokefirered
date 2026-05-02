import teachyTvSource from '../../../src/data/text/teachy_tv.h?raw';

export interface TeachyTvTextEntry {
  symbol: string;
  text: string;
}

export const TEACHY_TV_SOURCE = teachyTvSource;

export const parseTeachyTvText = (source: string): TeachyTvTextEntry[] =>
  [...source.matchAll(/const u8 (g\w+)\[\]\s*=\s*_\(([\s\S]*?)\);/gu)].map((match) => ({
    symbol: match[1],
    text: [...match[2].matchAll(/"([\s\S]*?)"/gu)].map((part) => part[1]).join('')
  }));

export const gTeachyTvText = parseTeachyTvText(teachyTvSource);

export const getTeachyTvText = (symbol: string): string | undefined =>
  gTeachyTvText.find((entry) => entry.symbol === symbol)?.text;
