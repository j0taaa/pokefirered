import questLogTextSource from '../../../src/data/text/quest_log.h?raw';

export interface QuestLogTextEntry {
  symbol: string;
  text: string;
}

export const QUEST_LOG_TEXT_SOURCE = questLogTextSource;

export const parseQuestLogText = (source: string): QuestLogTextEntry[] =>
  [...source.matchAll(/const u8 (gText_QuestLog_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const QUEST_LOG_TEXTS = parseQuestLogText(questLogTextSource);

export const getQuestLogText = (symbol: string): string | undefined =>
  QUEST_LOG_TEXTS.find((entry) => entry.symbol === symbol)?.text;
