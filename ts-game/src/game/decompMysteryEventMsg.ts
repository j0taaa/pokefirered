export const MYSTERY_EVENT_MESSAGES = {
  berry: 'Obtained a {STR_VAR_2} BERRY!\nDad has it at PETALBURG GYM.',
  berryTransform: 'The {STR_VAR_1} BERRY transformed into\none {STR_VAR_2} BERRY.',
  berryObtained: 'The {STR_VAR_1} BERRY has already been\nobtained.',
  specialRibbon: 'A special RIBBON was awarded to\nyour party POKeMON.',
  nationalDex: 'The POKeDEX has been upgraded\nwith the NATIONAL MODE.',
  rareWord: 'A rare word has been added.',
  sentOver: '{STR_VAR_1} was sent over!',
  fullParty: 'Your party is full.\n{STR_VAR_1} could not be sent over.',
  newTrainer: 'A new TRAINER has arrived in\nHOENN.',
  newAdversaryInBattleTower:
    '\u30d0\u30c8\u30eb\u30bf\u30ef\u30fc\u306b\u3000\u3042\u3089\u305f\u306a\n\u305f\u3044\u305b\u3093\u3057\u3083\u304c\u3000\u3042\u3089\u308f\u308c\u305f\uff01',
  cantBeUsed: "This data can't be used in\nthis version."
} as const;

export type MysteryEventMessageId = keyof typeof MYSTERY_EVENT_MESSAGES;

export const formatMysteryEventMessage = (
  template: string,
  vars: Partial<Record<'STR_VAR_1' | 'STR_VAR_2', string>> = {}
): string =>
  template.replace(/\{(STR_VAR_[12])\}/gu, (_match, key: 'STR_VAR_1' | 'STR_VAR_2') => vars[key] ?? '');
