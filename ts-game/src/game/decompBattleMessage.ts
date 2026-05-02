import battleMessageSource from '../../../src/battle_message.c?raw';
import battleStringIdsSource from '../../../include/constants/battle_string_ids.h?raw';
import moveConstantsSource from '../../../include/constants/moves.h?raw';

export const PLACEHOLDER_BEGIN = 0xfd;
export const B_BUFF_PLACEHOLDER_BEGIN = 0xfd;
export const B_BUFF_EOS = 0xff;

export const B_BUFF_STRING = 0;
export const B_BUFF_NUMBER = 1;
export const B_BUFF_MOVE = 2;
export const B_BUFF_TYPE = 3;
export const B_BUFF_MON_NICK_WITH_PREFIX = 4;
export const B_BUFF_STAT = 5;
export const B_BUFF_SPECIES = 6;
export const B_BUFF_MON_NICK = 7;
export const B_BUFF_NEGATIVE_FLAVOR = 8;
export const B_BUFF_ABILITY = 9;
export const B_BUFF_ITEM = 10;

export const STRINGID_INTROMSG = 0;
export const STRINGID_INTROSENDOUT = 1;
export const STRINGID_RETURNMON = 2;
export const STRINGID_SWITCHINMON = 3;
export const STRINGID_USEDMOVE = 4;
export const STRINGID_BATTLEEND = 5;
export const STRINGID_TRAINER1LOSETEXT = 12;
export const STRINGID_ATTACKMISSED = 23;
export const STRINGID_TRAINER2LOSETEXT = 375;
export const STRINGID_TRAINER2WINTEXT = 376;
export const STRINGID_TRAINER1WINTEXT = 383;
export const BATTLESTRINGS_TABLE_START = STRINGID_TRAINER1LOSETEXT;

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const BIT_SIDE = 1;

export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_BATTLE_TOWER = 1 << 8;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const BATTLE_TYPE_EREADER_TRAINER = 1 << 11;
export const BATTLE_TYPE_LEGENDARY = 1 << 13;
export const BATTLE_TYPE_GHOST_UNVEILED = 1 << 13;
export const BATTLE_TYPE_GHOST = 1 << 15;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const BATTLE_TYPE_TRAINER_TOWER = 1 << 19;

export const B_OUTCOME_WON = 1;
export const B_OUTCOME_LOST = 2;
export const B_OUTCOME_DREW = 3;
export const B_OUTCOME_LINK_BATTLE_RAN = 1 << 7;

export const TRAINER_LINK_OPPONENT = 0x400;
export const TRAINER_SECRET_BASE = 0x401;
export const TRAINER_UNION_ROOM = 0x400;
export const ITEM_ENIGMA_BERRY = 175;
export const MOVES_COUNT = 355;
export const MAX_MON_MOVES = 4;
export const MOVE_NONE = 0;

export const B_WIN_MSG = 0;
export const B_WIN_ACTION_PROMPT = 1;
export const B_WIN_OAK_OLD_MAN = 0x17;
export const B_WIN_VS_PLAYER = 0x18;
export const B_WIN_VS_OPPONENT = 0x19;
export const B_WIN_VS_MULTI_PLAYER_1 = 0x1a;
export const B_WIN_VS_MULTI_PLAYER_2 = 0x1b;
export const B_WIN_VS_MULTI_PLAYER_3 = 0x1c;
export const B_WIN_VS_MULTI_PLAYER_4 = 0x1d;
export const B_WIN_VS_OUTCOME_DRAW = 0x1e;
export const B_WIN_VS_OUTCOME_LEFT = 0x1f;
export const B_WIN_VS_OUTCOME_RIGHT = 0x20;

export interface BattleMessageMon {
  nickname: string;
}

export interface BattleMessageTrainer {
  trainerClass: number;
  trainerName: string;
}

export interface BattleMessageLinkPlayer {
  id: number;
  name: string;
}

export interface BattleMsgData {
  currentMove: number;
  originallyUsedMove: number;
  lastItem: number;
  lastAbility: number;
  scrActive: number;
  bakScriptPartyIdx: number;
  hpScale: number;
  itemEffectBattler: number;
  moveType: number;
  abilities: number[];
  textBuffs: number[][];
}

export interface BattleTextPrinter {
  text: string;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  speed: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface BattleMessageRuntime {
  battleTypeFlags: number;
  activeBattler: number;
  battlerAttacker: number;
  battlerTarget: number;
  effectBattler: number;
  battlerPartyIndexes: number[];
  battlerPositions: number[];
  multiplayerId: number;
  trainerBattleOpponentA: number;
  battleScriptingBattler: number;
  scriptPartyIdx: number;
  hpScale: number;
  potentialItemEffectBattler: number;
  stringMoveType: number;
  lastUsedItem: number;
  lastUsedAbility: number;
  battlerAbilities: number[];
  battleTextBuff1: number[];
  battleTextBuff2: number[];
  battleTextBuff3: number[];
  stringVar1: string;
  stringVar2: string;
  stringVar3: string;
  stringVar4: string;
  displayedStringBattle: string;
  battleMsgData: BattleMsgData;
  playerParty: BattleMessageMon[];
  enemyParty: BattleMessageMon[];
  linkPlayers: BattleMessageLinkPlayer[];
  trainers: BattleMessageTrainer[];
  trainerClassNames: string[];
  moveNames: string[];
  typeNames: string[];
  abilityNames: string[];
  speciesNames: string[];
  itemNames: string[];
  enigmaBerries: { name: string }[];
  playerName: string;
  flags: Record<string, boolean>;
  textFlags: { useAlternateDownArrow: boolean; autoScroll: boolean; canABSpeedUpPrint: boolean };
  printers: BattleTextPrinter[];
  operations: string[];
  gPlttBufferUnfaded: number[];
  gPlttBufferFaded: number[];
  chooseMoveCurrentPp: number[];
  chooseMoveMaxPp: number[];
  moveSelectionCursor: number[];
}

const cString = (source: string): string => source
  .replace(/\\n/gu, '\n')
  .replace(/\\l/gu, '\n')
  .replace(/\\p/gu, '\n\n')
  .replace(/\\"/gu, '"');

const textConstants = new Map<string, string>();
for (const match of battleMessageSource.matchAll(/(?:static\s+)?(?:const\s+)?u8\s+(g?\w+)\[\]\s*=\s*_\("((?:\\.|[^"\\])*)"\);/gu))
  textConstants.set(match[1], cString(match[2]));

const stringIds = new Map<string, number>();
for (const match of battleStringIdsSource.matchAll(/^#define\s+(STRINGID_\w+)\s+(\d+)/gmu))
  stringIds.set(match[1], Number.parseInt(match[2], 10));

const moveConstants = new Map<string, number>();
for (const match of moveConstantsSource.matchAll(/^#define\s+(MOVE_\w+)\s+(\d+)/gmu))
  moveConstants.set(match[1], Number.parseInt(match[2], 10));

const grammarMoveUsedTable: number[] = [];
const grammarTableMatch = /static const u16 sGrammarMoveUsedTable\[\]\s*=\s*\{([\s\S]*?)\n\};/u.exec(battleMessageSource);
if (grammarTableMatch) {
  for (const match of grammarTableMatch[1].matchAll(/MOVE_\w+/gu))
    grammarMoveUsedTable.push(moveConstants.get(match[0]) ?? MOVE_NONE);
}

const tableEntryRegex = /\[(STRINGID_\w+)\s*-\s*BATTLESTRINGS_TABLE_START\]\s*=\s*(\w+)/gu;
const battleStringsTable = new Map<number, string>();
for (const match of battleMessageSource.matchAll(tableEntryRegex)) {
  const stringId = stringIds.get(match[1]);
  if (stringId !== undefined)
    battleStringsTable.set(stringId, textConstants.get(match[2]) ?? match[2]);
}

const getText = (name: string): string => textConstants.get(name) ?? name;

const sATypeMoveTable = ['NORMAL', 'FIGHTING', 'FLYING', 'POISON', 'GROUND', 'ROCK', 'BUG', 'GHOST', 'STEEL', '???', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC', 'ICE', 'DRAGON', 'DARK'];
const statNamesTable = ['HP', 'ATTACK', 'DEFENSE', 'SPEED', 'SP. ATK', 'SP. DEF', 'accuracy', 'evasiveness'];
const pokeblockWasTooXStringTable = ['was too spicy!', 'was too dry!', 'was too sweet!', 'was too bitter!', 'was too sour!'];
const statusConditionStringsTable: readonly (readonly [string, string])[] = [
  ['SLP', 'sleep'], ['PSN', 'poison'], ['BRN', 'burn'], ['FRZ', 'freeze'], ['PAR', 'paralysis'], ['TOX', 'poison']
];
const ppTextPalette = [0x7fff, 0x0000, 0x001f, 0x0000, 0x03e0, 0x0000, 0x7fff, 0x0000];

const defaultMsgData = (): BattleMsgData => ({
  currentMove: 0,
  originallyUsedMove: 0,
  lastItem: 0,
  lastAbility: 0,
  scrActive: 0,
  bakScriptPartyIdx: 0,
  hpScale: 0,
  itemEffectBattler: 0,
  moveType: 0,
  abilities: [0, 0, 0, 0],
  textBuffs: [[], [], []]
});

export const createBattleMessageRuntime = (overrides: Partial<BattleMessageRuntime> = {}): BattleMessageRuntime => ({
  battleTypeFlags: 0,
  activeBattler: 0,
  battlerAttacker: 0,
  battlerTarget: 1,
  effectBattler: 0,
  battlerPartyIndexes: [0, 0, 1, 1],
  battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT],
  multiplayerId: 0,
  trainerBattleOpponentA: 0,
  battleScriptingBattler: 0,
  scriptPartyIdx: 0,
  hpScale: 0,
  potentialItemEffectBattler: 0,
  stringMoveType: 0,
  lastUsedItem: 0,
  lastUsedAbility: 0,
  battlerAbilities: [0, 0, 0, 0],
  battleTextBuff1: [],
  battleTextBuff2: [],
  battleTextBuff3: [],
  stringVar1: '',
  stringVar2: '',
  stringVar3: '',
  stringVar4: '',
  displayedStringBattle: '',
  battleMsgData: defaultMsgData(),
  playerParty: [{ nickname: 'PLAYERMON' }, { nickname: 'PLAYERMON2' }],
  enemyParty: [{ nickname: 'ENEMYMON' }, { nickname: 'ENEMYMON2' }],
  linkPlayers: [{ id: 0, name: 'PLAYER' }, { id: 1, name: 'LINK1' }, { id: 2, name: 'LINK2' }, { id: 3, name: 'LINK3' }],
  trainers: [{ trainerClass: 0, trainerName: 'TRAINER' }],
  trainerClassNames: ['TRAINER'],
  moveNames: Array.from({ length: MOVES_COUNT }, (_, i) => `MOVE_${i}`),
  typeNames: sATypeMoveTable,
  abilityNames: Array.from({ length: 256 }, (_, i) => `ABILITY_${i}`),
  speciesNames: Array.from({ length: 500 }, (_, i) => `SPECIES_${i}`),
  itemNames: Array.from({ length: 400 }, (_, i) => `ITEM_${i}`),
  enigmaBerries: Array.from({ length: 4 }, () => ({ name: 'ENIGMA' })),
  playerName: 'PLAYER',
  flags: {},
  textFlags: { useAlternateDownArrow: true, autoScroll: false, canABSpeedUpPrint: false },
  printers: [],
  operations: [],
  gPlttBufferUnfaded: Array.from({ length: 256 }, () => 0),
  gPlttBufferFaded: Array.from({ length: 256 }, () => 0),
  chooseMoveCurrentPp: [0, 0, 0, 0],
  chooseMoveMaxPp: [0, 0, 0, 0],
  moveSelectionCursor: [0, 0, 0, 0],
  ...overrides
});

const getBattlerSide = (runtime: BattleMessageRuntime, battlerId: number): number => runtime.battlerPositions[battlerId] & BIT_SIDE;
const getBattlerAtPosition = (runtime: BattleMessageRuntime, position: number): number => runtime.battlerPositions.indexOf(position);
const battlePartner = (id: number): number => id ^ 2;
const battleOpposite = (id: number): number => id ^ 1;
const getBattlerMultiplayerId = (runtime: BattleMessageRuntime, battlerId: number): number =>
  runtime.linkPlayers.findIndex((player) => player.id === battlerId);
const copyItemName = (runtime: BattleMessageRuntime, item: number): string => runtime.itemNames[item] ?? `ITEM_${item}`;
const getSpeciesName = (runtime: BattleMessageRuntime, species: number): string => runtime.speciesNames[species] ?? `SPECIES_${species}`;
const getExpandedPlaceholder = (placeholder: string): string => `{${placeholder}}`;
const getTrainerALoseText = (): string => '{TRAINER_A_LOSE_TEXT}';
const getTrainerWonSpeech = (): string => '{TRAINER_A_WIN_TEXT}';
const getTrainerTowerOpponentLoseText = (index: number): string => `{TRAINER_TOWER_${index}_LOSE_TEXT}`;
const getTrainerTowerOpponentWinText = (index: number): string => `{TRAINER_TOWER_${index}_WIN_TEXT}`;
const getBattleTowerTrainerClassNameId = (): number => 0;
const getTrainerTowerOpponentClass = (): number => 0;
const getEreaderTrainerClassId = (): number => 0;
const getSecretBaseTrainerNameIndex = (): number => 0;
const getUnionRoomTrainerClass = (): number => 0;
const getBattleTowerTrainerName = (): string => '{BATTLE_TOWER_TRAINER}';
const getTrainerTowerOpponentName = (): string => '{TRAINER_TOWER_OPPONENT}';
const copyEReaderTrainerName5 = (): string => '{EREADER_TRAINER}';
const contextNpcGetTextColor = (): number => 3;
const getTextSpeedSetting = (): number => 1;

const appendToCString = (dst: string, text: string): string => dst + text;
const read16 = (src: readonly number[], offset: number): number => (src[offset] ?? 0) | ((src[offset + 1] ?? 0) << 8);
const read32 = (src: readonly number[], offset: number): number =>
  ((src[offset] ?? 0) | ((src[offset + 1] ?? 0) << 8) | ((src[offset + 2] ?? 0) << 16) | ((src[offset + 3] ?? 0) << 24)) >>> 0;

const battleStringById = (stringId: number): string => battleStringsTable.get(stringId) ?? `BattleString:${stringId}`;

const tryGetStatusString = (src: string): string | null => {
  const status = src.slice(0, 8).padEnd(8, '$');
  for (const [needle, replacement] of statusConditionStringsTable) {
    if (status.startsWith(needle))
      return replacement;
  }
  return null;
};

export const TryGetStatusString = tryGetStatusString;

const getMonNicknameWithPrefix = (runtime: BattleMessageRuntime, battlerId: number, monIndex: number): string => {
  if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) {
    const prefix = runtime.battleTypeFlags & BATTLE_TYPE_TRAINER ? getText('sText_FoePkmnPrefix') : getText('sText_WildPkmnPrefix');
    return `${prefix}${runtime.enemyParty[monIndex]?.nickname ?? ''}`;
  }
  return runtime.playerParty[monIndex]?.nickname ?? '';
};

const numericBufferToString = (buffer: readonly number[]): string =>
  buffer.map((ch) => String.fromCharCode(ch)).join('').replace(/\0.*$/u, '');

const findMoveUsedGrammarCounter = (currentMove: number): number => {
  let counter = 0;
  let i = 0;

  while (counter !== MAX_MON_MOVES) {
    if (grammarMoveUsedTable[i] === MOVE_NONE)
      counter++;
    if (grammarMoveUsedTable[i++] === currentMove)
      break;
  }
  return counter;
};

export function BufferStringBattle(runtime: BattleMessageRuntime, stringId: number): void {
  const data = runtime.battleMsgData;
  let stringPtr: string | null = null;

  runtime.lastUsedItem = data.lastItem;
  runtime.lastUsedAbility = data.lastAbility;
  runtime.battleScriptingBattler = data.scrActive;
  runtime.scriptPartyIdx = data.bakScriptPartyIdx;
  runtime.hpScale = data.hpScale;
  runtime.potentialItemEffectBattler = data.itemEffectBattler;
  runtime.stringMoveType = data.moveType;

  for (let i = 0; i < 4; i += 1)
    runtime.battlerAbilities[i] = data.abilities[i] ?? 0;

  runtime.battleTextBuff1 = [...(data.textBuffs[0] ?? [])];
  runtime.battleTextBuff2 = [...(data.textBuffs[1] ?? [])];
  runtime.battleTextBuff3 = [...(data.textBuffs[2] ?? [])];

  switch (stringId) {
    case STRINGID_INTROMSG:
      if (runtime.battleTypeFlags & BATTLE_TYPE_TRAINER) {
        if (runtime.battleTypeFlags & BATTLE_TYPE_LINK) {
          if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI)
            stringPtr = getText('sText_TwoLinkTrainersWantToBattle');
          else if (runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM)
            stringPtr = getText('sText_Trainer1WantsToBattle');
          else
            stringPtr = getText('sText_LinkTrainerWantsToBattle');
        } else {
          stringPtr = getText('sText_Trainer1WantsToBattle');
        }
      } else if (runtime.battleTypeFlags & BATTLE_TYPE_GHOST) {
        stringPtr = runtime.battleTypeFlags & BATTLE_TYPE_GHOST_UNVEILED ? getText('sText_TheGhostAppeared') : getText('sText_GhostAppearedCantId');
      } else if (runtime.battleTypeFlags & BATTLE_TYPE_LEGENDARY) {
        stringPtr = getText('sText_WildPkmnAppeared2');
      } else if (runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE) {
        stringPtr = getText('sText_TwoWildPkmnAppeared');
      } else if (runtime.battleTypeFlags & BATTLE_TYPE_OLD_MAN_TUTORIAL) {
        stringPtr = getText('sText_WildPkmnAppearedPause');
      } else {
        stringPtr = getText('sText_WildPkmnAppeared');
      }
      break;
    case STRINGID_INTROSENDOUT:
      if (getBattlerSide(runtime, runtime.activeBattler) === B_SIDE_PLAYER) {
        if (runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE)
          stringPtr = runtime.battleTypeFlags & BATTLE_TYPE_MULTI ? getText('sText_LinkPartnerSentOutPkmnGoPkmn') : getText('sText_GoTwoPkmn');
        else
          stringPtr = getText('sText_GoPkmn');
      } else if (runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE) {
        if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI)
          stringPtr = getText('sText_TwoLinkTrainersSentOutPkmn');
        else if (runtime.battleTypeFlags & BATTLE_TYPE_LINK)
          stringPtr = getText('sText_LinkTrainerSentOutTwoPkmn');
        else
          stringPtr = getText('sText_Trainer1SentOutTwoPkmn');
      } else if (!(runtime.battleTypeFlags & BATTLE_TYPE_LINK) || runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM) {
        stringPtr = getText('sText_Trainer1SentOutPkmn');
      } else {
        stringPtr = getText('sText_LinkTrainerSentOutPkmn');
      }
      break;
    case STRINGID_RETURNMON:
      if (getBattlerSide(runtime, runtime.activeBattler) === B_SIDE_PLAYER) {
        if (runtime.hpScale === 0)
          stringPtr = getText('sText_PkmnThatsEnough');
        else if (runtime.hpScale === 1 || runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE)
          stringPtr = getText('sText_PkmnComeBack');
        else if (runtime.hpScale === 2)
          stringPtr = getText('sText_PkmnOkComeBack');
        else
          stringPtr = getText('sText_PkmnGoodComeBack');
      } else if (runtime.trainerBattleOpponentA === TRAINER_LINK_OPPONENT) {
        stringPtr = runtime.battleTypeFlags & BATTLE_TYPE_MULTI ? getText('sText_LinkTrainer2WithdrewPkmn') : getText('sText_LinkTrainer1WithdrewPkmn');
      } else {
        stringPtr = getText('sText_Trainer1WithdrewPkmn');
      }
      break;
    case STRINGID_SWITCHINMON:
      if (getBattlerSide(runtime, runtime.battleScriptingBattler) === B_SIDE_PLAYER) {
        if (runtime.hpScale === 0 || runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE)
          stringPtr = getText('sText_GoPkmn2');
        else if (runtime.hpScale === 1)
          stringPtr = getText('sText_DoItPkmn');
        else if (runtime.hpScale === 2)
          stringPtr = getText('sText_GoForItPkmn');
        else
          stringPtr = getText('sText_YourFoesWeakGetEmPkmn');
      } else if (runtime.battleTypeFlags & BATTLE_TYPE_LINK) {
        if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI)
          stringPtr = getText('sText_LinkTrainerMultiSentOutPkmn');
        else if (runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM)
          stringPtr = getText('sText_Trainer1SentOutPkmn2');
        else
          stringPtr = getText('sText_LinkTrainerSentOutPkmn2');
      } else {
        stringPtr = getText('sText_Trainer1SentOutPkmn2');
      }
      break;
    case STRINGID_USEDMOVE:
      ChooseMoveUsedParticle(runtime, 1);
      runtime.battleTextBuff2 = Array.from(runtime.battleMsgData.currentMove >= MOVES_COUNT ? sATypeMoveTable[runtime.stringMoveType] : (runtime.moveNames[runtime.battleMsgData.currentMove] ?? `MOVE_${runtime.battleMsgData.currentMove}`), (ch) => ch.charCodeAt(0));
      runtime.battleTextBuff2 = Array.from(ChooseTypeOfMoveUsedString(runtime, numericBufferToString(runtime.battleTextBuff2)), (ch) => ch.charCodeAt(0));
      stringPtr = getText('sText_AttackerUsedX');
      break;
    case STRINGID_BATTLEEND:
      if (runtime.battleTextBuff1[0] & B_OUTCOME_LINK_BATTLE_RAN) {
        runtime.battleTextBuff1[0] &= ~B_OUTCOME_LINK_BATTLE_RAN;
        if (getBattlerSide(runtime, runtime.activeBattler) === B_SIDE_OPPONENT && runtime.battleTextBuff1[0] !== B_OUTCOME_DREW)
          runtime.battleTextBuff1[0] ^= B_OUTCOME_LOST | B_OUTCOME_WON;
        if (runtime.battleTextBuff1[0] === B_OUTCOME_LOST || runtime.battleTextBuff1[0] === B_OUTCOME_DREW)
          stringPtr = getText('sText_GotAwaySafely');
        else if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI)
          stringPtr = getText('sText_TwoWildFled');
        else if (runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM)
          stringPtr = getText('sText_Trainer1Fled');
        else
          stringPtr = getText('sText_WildFled');
      } else {
        if (getBattlerSide(runtime, runtime.activeBattler) === B_SIDE_OPPONENT && runtime.battleTextBuff1[0] !== B_OUTCOME_DREW)
          runtime.battleTextBuff1[0] ^= B_OUTCOME_LOST | B_OUTCOME_WON;
        if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI) {
          if (runtime.battleTextBuff1[0] === B_OUTCOME_WON)
            stringPtr = getText('sText_TwoLinkTrainersDefeated');
          else if (runtime.battleTextBuff1[0] === B_OUTCOME_LOST)
            stringPtr = getText('sText_PlayerLostToTwo');
          else if (runtime.battleTextBuff1[0] === B_OUTCOME_DREW)
            stringPtr = getText('sText_PlayerBattledToDrawVsTwo');
        } else if (runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM) {
          if (runtime.battleTextBuff1[0] === B_OUTCOME_WON)
            stringPtr = getText('sText_PlayerDefeatedLinkTrainerTrainer1');
          else if (runtime.battleTextBuff1[0] === B_OUTCOME_LOST)
            stringPtr = getText('sText_PlayerLostAgainstTrainer1');
          else if (runtime.battleTextBuff1[0] === B_OUTCOME_DREW)
            stringPtr = getText('sText_PlayerBattledToDrawTrainer1');
        } else if (runtime.battleTextBuff1[0] === B_OUTCOME_WON) {
          stringPtr = getText('sText_PlayerDefeatedLinkTrainer');
        } else if (runtime.battleTextBuff1[0] === B_OUTCOME_LOST) {
          stringPtr = getText('sText_PlayerLostAgainstLinkTrainer');
        } else if (runtime.battleTextBuff1[0] === B_OUTCOME_DREW) {
          stringPtr = getText('sText_PlayerBattledToDrawLinkTrainer');
        }
      }
      break;
    default:
      if (!battleStringsTable.has(stringId)) {
        runtime.displayedStringBattle = '';
        return;
      }
      stringPtr = battleStringById(stringId);
      break;
  }

  BattleStringExpandPlaceholdersToDisplayedString(runtime, stringPtr ?? '');
}

export function BattleStringExpandPlaceholdersToDisplayedString(runtime: BattleMessageRuntime, src: string): number {
  runtime.displayedStringBattle = BattleStringExpandPlaceholders(runtime, src);
  return runtime.displayedStringBattle.length + 1;
}

export function BattleStringExpandPlaceholders(runtime: BattleMessageRuntime, src: string): string {
  const placeholderValues: Record<string, () => string> = {
    B_BUFF1: () => {
      if (runtime.battleTextBuff1[0] === B_BUFF_PLACEHOLDER_BEGIN) {
        runtime.stringVar1 = ExpandBattleTextBuffPlaceholders(runtime, runtime.battleTextBuff1);
        return runtime.stringVar1;
      }
      return tryGetStatusString(numericBufferToString(runtime.battleTextBuff1)) ?? numericBufferToString(runtime.battleTextBuff1);
    },
    B_BUFF2: () => {
      if (runtime.battleTextBuff2[0] === B_BUFF_PLACEHOLDER_BEGIN) {
        runtime.stringVar2 = ExpandBattleTextBuffPlaceholders(runtime, runtime.battleTextBuff2);
        return runtime.stringVar2;
      }
      return numericBufferToString(runtime.battleTextBuff2);
    },
    B_BUFF3: () => {
      if (runtime.battleTextBuff3[0] === B_BUFF_PLACEHOLDER_BEGIN) {
        runtime.stringVar3 = ExpandBattleTextBuffPlaceholders(runtime, runtime.battleTextBuff3);
        return runtime.stringVar3;
      }
      return numericBufferToString(runtime.battleTextBuff3);
    },
    B_COPY_VAR_1: () => runtime.stringVar1,
    B_COPY_VAR_2: () => runtime.stringVar2,
    B_COPY_VAR_3: () => runtime.stringVar3,
    B_PLAYER_MON1_NAME: () => runtime.playerParty[runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT)]]?.nickname ?? '',
    B_OPPONENT_MON1_NAME: () => runtime.enemyParty[runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT)]]?.nickname ?? '',
    B_PLAYER_MON2_NAME: () => runtime.playerParty[runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, B_POSITION_PLAYER_RIGHT)]]?.nickname ?? '',
    B_OPPONENT_MON2_NAME: () => runtime.enemyParty[runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, B_POSITION_OPPONENT_RIGHT)]]?.nickname ?? '',
    B_LINK_PLAYER_MON1_NAME: () => runtime.playerParty[runtime.battlerPartyIndexes[runtime.linkPlayers[runtime.multiplayerId].id]]?.nickname ?? '',
    B_LINK_OPPONENT_MON1_NAME: () => runtime.enemyParty[runtime.battlerPartyIndexes[runtime.linkPlayers[runtime.multiplayerId].id ^ 1]]?.nickname ?? '',
    B_LINK_PLAYER_MON2_NAME: () => runtime.playerParty[runtime.battlerPartyIndexes[runtime.linkPlayers[runtime.multiplayerId].id ^ 2]]?.nickname ?? '',
    B_LINK_OPPONENT_MON2_NAME: () => runtime.enemyParty[runtime.battlerPartyIndexes[runtime.linkPlayers[runtime.multiplayerId].id ^ 3]]?.nickname ?? '',
    B_ATK_NAME_WITH_PREFIX_MON1: () => getMonNicknameWithPrefix(runtime, runtime.battlerAttacker, runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, getBattlerSide(runtime, runtime.battlerAttacker))]),
    B_ATK_PARTNER_NAME: () => getBattlerSide(runtime, runtime.battlerAttacker) === B_SIDE_PLAYER
      ? runtime.playerParty[runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, getBattlerSide(runtime, runtime.battlerAttacker) + 2)]]?.nickname ?? ''
      : runtime.enemyParty[runtime.battlerPartyIndexes[getBattlerAtPosition(runtime, getBattlerSide(runtime, runtime.battlerAttacker) + 2)]]?.nickname ?? '',
    B_ATK_NAME_WITH_PREFIX: () => getMonNicknameWithPrefix(runtime, runtime.battlerAttacker, runtime.battlerPartyIndexes[runtime.battlerAttacker]),
    B_DEF_NAME_WITH_PREFIX: () => getMonNicknameWithPrefix(runtime, runtime.battlerTarget, runtime.battlerPartyIndexes[runtime.battlerTarget]),
    B_EFF_NAME_WITH_PREFIX: () => getMonNicknameWithPrefix(runtime, runtime.effectBattler, runtime.battlerPartyIndexes[runtime.effectBattler]),
    B_ACTIVE_NAME_WITH_PREFIX: () => getMonNicknameWithPrefix(runtime, runtime.activeBattler, runtime.battlerPartyIndexes[runtime.activeBattler]),
    B_SCR_ACTIVE_NAME_WITH_PREFIX: () => getMonNicknameWithPrefix(runtime, runtime.battleScriptingBattler, runtime.battlerPartyIndexes[runtime.battleScriptingBattler]),
    B_CURRENT_MOVE: () => runtime.battleMsgData.currentMove >= MOVES_COUNT ? sATypeMoveTable[runtime.stringMoveType] : runtime.moveNames[runtime.battleMsgData.currentMove] ?? '',
    B_LAST_MOVE: () => runtime.battleMsgData.originallyUsedMove >= MOVES_COUNT ? sATypeMoveTable[runtime.stringMoveType] : runtime.moveNames[runtime.battleMsgData.originallyUsedMove] ?? '',
    B_LAST_ITEM: () => {
      if ((runtime.battleTypeFlags & BATTLE_TYPE_LINK) && runtime.lastUsedItem === ITEM_ENIGMA_BERRY) {
        if (!(runtime.battleTypeFlags & BATTLE_TYPE_MULTI)) {
          if ((runtime.multiplayerId !== 0 && (runtime.potentialItemEffectBattler & BIT_SIDE)) || (runtime.multiplayerId === 0 && !(runtime.potentialItemEffectBattler & BIT_SIDE)))
            return `${runtime.enigmaBerries[runtime.potentialItemEffectBattler]?.name ?? 'ENIGMA'} BERRY`;
          return getText('sText_EnigmaBerry');
        }
        if (runtime.linkPlayers[runtime.multiplayerId].id === runtime.potentialItemEffectBattler)
          return `${runtime.enigmaBerries[runtime.potentialItemEffectBattler]?.name ?? 'ENIGMA'} BERRY`;
        return getText('sText_EnigmaBerry');
      }
      return copyItemName(runtime, runtime.lastUsedItem);
    },
    B_LAST_ABILITY: () => runtime.abilityNames[runtime.lastUsedAbility] ?? '',
    B_ATK_ABILITY: () => runtime.abilityNames[runtime.battlerAbilities[runtime.battlerAttacker]] ?? '',
    B_DEF_ABILITY: () => runtime.abilityNames[runtime.battlerAbilities[runtime.battlerTarget]] ?? '',
    B_SCR_ACTIVE_ABILITY: () => runtime.abilityNames[runtime.battlerAbilities[runtime.battleScriptingBattler]] ?? '',
    B_EFF_ABILITY: () => runtime.abilityNames[runtime.battlerAbilities[runtime.effectBattler]] ?? '',
    B_TRAINER1_CLASS: () => {
      if (runtime.trainerBattleOpponentA === TRAINER_SECRET_BASE)
        return runtime.trainerClassNames[getSecretBaseTrainerNameIndex()] ?? '';
      if (runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM)
        return runtime.trainerClassNames[getUnionRoomTrainerClass()] ?? '';
      if (runtime.battleTypeFlags & BATTLE_TYPE_BATTLE_TOWER)
        return runtime.trainerClassNames[getBattleTowerTrainerClassNameId()] ?? '';
      if (runtime.battleTypeFlags & BATTLE_TYPE_TRAINER_TOWER)
        return runtime.trainerClassNames[getTrainerTowerOpponentClass()] ?? '';
      if (runtime.battleTypeFlags & BATTLE_TYPE_EREADER_TRAINER)
        return runtime.trainerClassNames[getEreaderTrainerClassId()] ?? '';
      return runtime.trainerClassNames[runtime.trainers[runtime.trainerBattleOpponentA]?.trainerClass ?? 0] ?? '';
    },
    B_TRAINER1_NAME: () => {
      if (runtime.trainerBattleOpponentA === TRAINER_SECRET_BASE)
        return '{SECRET_BASE_TRAINER}';
      if (runtime.trainerBattleOpponentA === TRAINER_UNION_ROOM)
        return runtime.linkPlayers[runtime.multiplayerId ^ BIT_SIDE]?.name ?? '';
      if (runtime.battleTypeFlags & BATTLE_TYPE_BATTLE_TOWER)
        return getBattleTowerTrainerName();
      if (runtime.battleTypeFlags & BATTLE_TYPE_TRAINER_TOWER)
        return getTrainerTowerOpponentName();
      if (runtime.battleTypeFlags & BATTLE_TYPE_EREADER_TRAINER)
        return copyEReaderTrainerName5();
      return runtime.trainers[runtime.trainerBattleOpponentA]?.trainerName ?? getExpandedPlaceholder('RIVAL');
    },
    B_LINK_PLAYER_NAME: () => runtime.linkPlayers[runtime.multiplayerId]?.name ?? '',
    B_LINK_PARTNER_NAME: () => runtime.linkPlayers[getBattlerMultiplayerId(runtime, battlePartner(runtime.linkPlayers[runtime.multiplayerId].id))]?.name ?? '',
    B_LINK_OPPONENT1_NAME: () => runtime.linkPlayers[getBattlerMultiplayerId(runtime, battleOpposite(runtime.linkPlayers[runtime.multiplayerId].id))]?.name ?? '',
    B_LINK_OPPONENT2_NAME: () => runtime.linkPlayers[getBattlerMultiplayerId(runtime, battlePartner(battleOpposite(runtime.linkPlayers[runtime.multiplayerId].id)))]?.name ?? '',
    B_LINK_SCR_TRAINER_NAME: () => runtime.linkPlayers[getBattlerMultiplayerId(runtime, runtime.battleScriptingBattler)]?.name ?? '',
    B_PLAYER_NAME: () => runtime.playerName,
    B_TRAINER1_LOSE_TEXT: () => runtime.battleTypeFlags & BATTLE_TYPE_TRAINER_TOWER ? getTrainerTowerOpponentLoseText(0) : getTrainerALoseText(),
    B_TRAINER1_WIN_TEXT: () => runtime.battleTypeFlags & BATTLE_TYPE_TRAINER_TOWER ? getTrainerTowerOpponentWinText(0) : getTrainerWonSpeech(),
    B_TRAINER2_LOSE_TEXT: () => getTrainerTowerOpponentLoseText(1),
    B_TRAINER2_WIN_TEXT: () => getTrainerTowerOpponentWinText(1),
    B_26: () => getMonNicknameWithPrefix(runtime, runtime.battleScriptingBattler, runtime.scriptPartyIdx),
    B_PC_CREATOR_NAME: () => runtime.flags.FLAG_SYS_NOT_SOMEONES_PC ? getText('sText_Bills') : getText('sText_Someones'),
    B_ATK_PREFIX2: () => getBattlerSide(runtime, runtime.battlerAttacker) === B_SIDE_PLAYER ? getText('sText_AllyPkmnPrefix2') : getText('sText_FoePkmnPrefix3'),
    B_DEF_PREFIX2: () => getBattlerSide(runtime, runtime.battlerTarget) === B_SIDE_PLAYER ? getText('sText_AllyPkmnPrefix2') : getText('sText_FoePkmnPrefix3'),
    B_ATK_PREFIX1: () => getBattlerSide(runtime, runtime.battlerAttacker) === B_SIDE_PLAYER ? getText('sText_AllyPkmnPrefix') : getText('sText_FoePkmnPrefix2'),
    B_DEF_PREFIX1: () => getBattlerSide(runtime, runtime.battlerTarget) === B_SIDE_PLAYER ? getText('sText_AllyPkmnPrefix') : getText('sText_FoePkmnPrefix2'),
    B_ATK_PREFIX3: () => getBattlerSide(runtime, runtime.battlerAttacker) === B_SIDE_PLAYER ? getText('sText_AllyPkmnPrefix3') : getText('sText_FoePkmnPrefix4'),
    B_DEF_PREFIX3: () => getBattlerSide(runtime, runtime.battlerTarget) === B_SIDE_PLAYER ? getText('sText_AllyPkmnPrefix3') : getText('sText_FoePkmnPrefix4')
  };

  return src.replace(/\{([^}]+)\}/gu, (_whole, key: string) => {
    const value = placeholderValues[key]?.() ?? `{${key}}`;
    if (key === 'B_TRAINER1_LOSE_TEXT' || key === 'B_TRAINER1_WIN_TEXT' || key === 'B_TRAINER2_LOSE_TEXT' || key === 'B_TRAINER2_WIN_TEXT')
      return `${value}{PAUSE_UNTIL_PRESS}`;
    return value;
  });
}

export function ExpandBattleTextBuffPlaceholders(runtime: BattleMessageRuntime, src: readonly number[]): string {
  let srcId = 1;
  let dst = '';

  while (src[srcId] !== B_BUFF_EOS && srcId < src.length) {
    switch (src[srcId]) {
      case B_BUFF_STRING:
        dst = appendToCString(dst, battleStringById(read16(src, srcId + 1)));
        srcId += 3;
        break;
      case B_BUFF_NUMBER: {
        let value = 0;
        if (src[srcId + 1] === 1)
          value = src[srcId + 3] ?? 0;
        else if (src[srcId + 1] === 2)
          value = read16(src, srcId + 3);
        else if (src[srcId + 1] === 4)
          value = read32(src, srcId + 3);
        dst = `${dst}${value.toString().slice(0, src[srcId + 2] ?? 0)}`;
        srcId += (src[srcId + 1] ?? 0) + 3;
        break;
      }
      case B_BUFF_MOVE:
        dst = appendToCString(dst, runtime.moveNames[read16(src, srcId + 1)] ?? `MOVE_${read16(src, srcId + 1)}`);
        srcId += 3;
        break;
      case B_BUFF_TYPE:
        dst = appendToCString(dst, runtime.typeNames[src[srcId + 1] ?? 0] ?? '');
        srcId += 2;
        break;
      case B_BUFF_MON_NICK_WITH_PREFIX:
        dst = appendToCString(dst, getMonNicknameWithPrefix(runtime, src[srcId + 1] ?? 0, src[srcId + 2] ?? 0));
        srcId += 3;
        break;
      case B_BUFF_STAT:
        dst = appendToCString(dst, statNamesTable[src[srcId + 1] ?? 0] ?? '');
        srcId += 2;
        break;
      case B_BUFF_SPECIES:
        dst = getSpeciesName(runtime, read16(src, srcId + 1));
        srcId += 3;
        break;
      case B_BUFF_MON_NICK:
        dst = getBattlerSide(runtime, src[srcId + 1] ?? 0) === B_SIDE_PLAYER
          ? runtime.playerParty[src[srcId + 2] ?? 0]?.nickname ?? ''
          : runtime.enemyParty[src[srcId + 2] ?? 0]?.nickname ?? '';
        srcId += 3;
        break;
      case B_BUFF_NEGATIVE_FLAVOR:
        dst = appendToCString(dst, pokeblockWasTooXStringTable[src[srcId + 1] ?? 0] ?? '');
        srcId += 2;
        break;
      case B_BUFF_ABILITY:
        dst = appendToCString(dst, runtime.abilityNames[src[srcId + 1] ?? 0] ?? '');
        srcId += 2;
        break;
      case B_BUFF_ITEM: {
        const item = read16(src, srcId + 1);
        if ((runtime.battleTypeFlags & BATTLE_TYPE_LINK) && item === ITEM_ENIGMA_BERRY) {
          if (runtime.linkPlayers[runtime.multiplayerId].id === runtime.potentialItemEffectBattler)
            dst = `${runtime.enigmaBerries[runtime.potentialItemEffectBattler]?.name ?? 'ENIGMA'} BERRY`;
          else
            dst = appendToCString(dst, getText('sText_EnigmaBerry'));
        } else {
          dst = copyItemName(runtime, item);
        }
        srcId += 3;
        break;
      }
      default:
        srcId++;
        break;
    }
  }

  return dst;
}

export function ChooseMoveUsedParticle(runtime: BattleMessageRuntime, textBuff: 1 | 2 | 3): string {
  const counter = findMoveUsedGrammarCounter(runtime.battleMsgData.currentMove);
  const text = counter <= 2 ? ' is' : "'s";
  if (textBuff === 1)
    runtime.battleTextBuff1 = Array.from(text, (ch) => ch.charCodeAt(0));
  else if (textBuff === 2)
    runtime.battleTextBuff2 = Array.from(text, (ch) => ch.charCodeAt(0));
  else
    runtime.battleTextBuff3 = Array.from(text, (ch) => ch.charCodeAt(0));
  return text;
}

export function ChooseTypeOfMoveUsedString(runtime: BattleMessageRuntime, dst: string): string {
  switch (findMoveUsedGrammarCounter(runtime.battleMsgData.currentMove)) {
    case 0:
    case 1:
      return `${dst}!`;
    case 2:
      return `${dst}!`;
    case 3:
      return `${dst}!`;
    case 4:
      return `${dst} attack!`;
  }
  return dst;
}

const textOnWindowsInfoNormal: Record<number, { fillValue: number; fontId: number; x: number; y: number; letterSpacing: number; lineSpacing: number; speed: number; fgColor: number; bgColor: number; shadowColor: number }> = {
  [B_WIN_MSG]: { fillValue: 0xf, fontId: 0, x: 2, y: 2, letterSpacing: 0, lineSpacing: 2, speed: 1, fgColor: 1, bgColor: 15, shadowColor: 6 },
  [B_WIN_ACTION_PROMPT]: { fillValue: 0xf, fontId: 0, x: 2, y: 2, letterSpacing: 0, lineSpacing: 2, speed: 1, fgColor: 1, bgColor: 15, shadowColor: 6 },
  [B_WIN_OAK_OLD_MAN]: { fillValue: 0xf, fontId: 0, x: 2, y: 2, letterSpacing: 0, lineSpacing: 2, speed: 1, fgColor: 1, bgColor: 15, shadowColor: 6 }
};

export function BattlePutTextOnWindow(runtime: BattleMessageRuntime, text: string, windowIdFlags: number): void {
  const textFlags = windowIdFlags & 0xc0;
  const windowId = windowIdFlags & 0x3f;
  const info = textOnWindowsInfoNormal[windowId] ?? textOnWindowsInfoNormal[B_WIN_MSG];
  let x: number;
  let fontId: number;

  if (!(textFlags & 0x80))
    runtime.operations.push(`FillWindowPixelBuffer:${windowId}:${info.fillValue}`);

  if (textFlags & 0x40)
    fontId = [1, 2, 0, 0][contextNpcGetTextColor()] ?? info.fontId;
  else
    fontId = info.fontId;

  switch (windowId) {
    case B_WIN_VS_PLAYER:
    case B_WIN_VS_OPPONENT:
    case B_WIN_VS_MULTI_PLAYER_1:
    case B_WIN_VS_MULTI_PLAYER_2:
    case B_WIN_VS_MULTI_PLAYER_3:
    case B_WIN_VS_MULTI_PLAYER_4:
      x = Math.trunc((48 - text.length * 6) / 2);
      break;
    case B_WIN_VS_OUTCOME_DRAW:
    case B_WIN_VS_OUTCOME_LEFT:
    case B_WIN_VS_OUTCOME_RIGHT:
      x = Math.trunc((64 - text.length * 6) / 2);
      break;
    default:
      x = info.x;
      break;
  }
  if (x < 0)
    x = 0;

  runtime.textFlags.useAlternateDownArrow = windowId !== B_WIN_OAK_OLD_MAN;
  runtime.textFlags.autoScroll = Boolean((runtime.battleTypeFlags & BATTLE_TYPE_LINK) || ((runtime.battleTypeFlags & BATTLE_TYPE_POKEDUDE) && windowId !== B_WIN_OAK_OLD_MAN));
  const speed = windowId === B_WIN_MSG || windowId === B_WIN_OAK_OLD_MAN
    ? (runtime.battleTypeFlags & BATTLE_TYPE_LINK ? 1 : getTextSpeedSetting())
    : info.speed;
  runtime.textFlags.canABSpeedUpPrint = windowId === B_WIN_MSG || windowId === B_WIN_OAK_OLD_MAN;
  runtime.printers.push({ text, windowId, fontId, x, y: info.y, speed, fgColor: info.fgColor, bgColor: info.bgColor, shadowColor: info.shadowColor });

  if (!(textFlags & 0x80))
    runtime.operations.push(`PutWindowTilemap:${windowId}`, `CopyWindowToVram:${windowId}:full`);
}

export function BattleStringShouldBeColored(stringId: number): boolean {
  return stringId === STRINGID_TRAINER1LOSETEXT
    || stringId === STRINGID_TRAINER2LOSETEXT
    || stringId === STRINGID_TRAINER1WINTEXT
    || stringId === STRINGID_TRAINER2WINTEXT;
}

export function SetPpNumbersPaletteInMoveSelection(runtime: BattleMessageRuntime): void {
  const varState = GetCurrentPpToMaxPpState(
    runtime.chooseMoveCurrentPp[runtime.moveSelectionCursor[runtime.activeBattler]],
    runtime.chooseMoveMaxPp[runtime.moveSelectionCursor[runtime.activeBattler]]
  );
  const base = 5 * 16;
  runtime.gPlttBufferUnfaded[base + 12] = ppTextPalette[(varState * 2) + 0];
  runtime.gPlttBufferUnfaded[base + 11] = ppTextPalette[(varState * 2) + 1];
  runtime.gPlttBufferFaded[base + 12] = runtime.gPlttBufferUnfaded[base + 12];
  runtime.gPlttBufferFaded[base + 11] = runtime.gPlttBufferUnfaded[base + 11];
}

export function GetCurrentPpToMaxPpState(currentPp: number, maxPp: number): number {
  if (maxPp === currentPp)
    return 3;
  if (maxPp <= 2) {
    if (currentPp > 1)
      return 3;
    return 2 - currentPp;
  }
  if (maxPp <= 7) {
    if (currentPp > 2)
      return 3;
    return 2 - currentPp;
  }
  if (currentPp === 0)
    return 2;
  if (currentPp <= maxPp / 4)
    return 1;
  if (currentPp > maxPp / 2)
    return 3;

  return 0;
}
