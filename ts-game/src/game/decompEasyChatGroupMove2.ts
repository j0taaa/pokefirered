import easyChatGroupMove2Source from '../../../src/data/easy_chat/easy_chat_group_move_2.h?raw';

export const EASY_CHAT_GROUP_MOVE_2_SOURCE = easyChatGroupMove2Source;
export const EASY_CHAT_GROUP_MOVE_2_INCLUDE = 'constants/moves.h';

export const parseEasyChatGroupMove2 = (source: string): string[] => {
  const block = source.match(/static const u16 sEasyChatGroup_Move2\[\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...block.matchAll(/\b(MOVE_\w+)\b/gu)].map((match) => match[1]);
};

export const sEasyChatGroup_Move2 = parseEasyChatGroupMove2(easyChatGroupMove2Source);
