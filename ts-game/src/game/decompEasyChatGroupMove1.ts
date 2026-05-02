import easyChatGroupMove1Source from '../../../src/data/easy_chat/easy_chat_group_move_1.h?raw';

export const EASY_CHAT_GROUP_MOVE_1_SOURCE = easyChatGroupMove1Source;
export const EASY_CHAT_GROUP_MOVE_1_INCLUDE = 'constants/moves.h';

export const parseEasyChatGroupMove1 = (source: string): string[] => {
  const block = source.match(/static const u16 sEasyChatGroup_Move1\[\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...block.matchAll(/\b(MOVE_\w+)\b/gu)].map((match) => match[1]);
};

export const sEasyChatGroup_Move1 = parseEasyChatGroupMove1(easyChatGroupMove1Source);
