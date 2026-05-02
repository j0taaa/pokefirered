import easyChatGroupsSource from '../../../src/data/easy_chat/easy_chat_groups.h?raw';

export interface EasyChatGroupEntry {
  source: string;
  wordDataKind: 'valueList' | 'words';
  numWords: number;
  numEnabledWords: number;
}

export const EASY_CHAT_GROUPS_SOURCE = easyChatGroupsSource;

export const EASY_CHAT_GROUP_INCLUDES = [
  ...easyChatGroupsSource.matchAll(/#include "([^"]+)"/gu)
].map((match) => match[1]);

export const parseEasyChatGroups = (source: string): EasyChatGroupEntry[] =>
  [...source.matchAll(
    /\.wordData = \{\.(valueList|words) = (sEasyChatGroup_\w+)\},\s*\.numWords = (\d+),\s*\.numEnabledWords = (\d+)/gu
  )].map((match) => ({
    wordDataKind: match[1] as 'valueList' | 'words',
    source: match[2],
    numWords: Number.parseInt(match[3], 10),
    numEnabledWords: Number.parseInt(match[4], 10)
  }));

export const sEasyChatGroups = parseEasyChatGroups(easyChatGroupsSource);

export const getEasyChatGroup = (source: string): EasyChatGroupEntry | undefined =>
  sEasyChatGroups.find((group) => group.source === source);
