import type { InputSnapshot } from '../input/inputState';
import { vec2 } from '../core/vec2';
import {
  addBagItem,
  getBagVisibleRows,
  getSelectedBagEntry,
  moveBagSelection,
  switchBagPocket,
  checkBagHasItem,
  checkBagHasSpace,
  getItemDefinition,
  removeBagItem
} from './bag';
import {
  createBattlePokemonFromSpecies,
  createBattlePokemonFromSpeciesWithMoves
} from './battle';
import { addCoins, getCoins, removeCoins } from './decompCoins';
import {
  buyMenuConfirmPurchase,
  buyMenuDrawMoneyBox,
  buyMenuInitWindows,
  itemListIsSellingTm,
  type BuyMenuConfirmPurchaseDescriptor,
  type BuyMenuInitWindowsResult,
  type BuyMenuMoneyBoxDescriptor
} from './decompBuyMenuHelpers';
import { lookThroughPorthole } from './decompFieldSpecialScene';
import {
  checkPartyMove,
  doFieldEffectStrength,
  getPartySizeConstant,
  setFieldEffectArgument
} from './decompFldEffStrength';
import { doFieldEffectRockSmash } from './decompFldEffRockSmash';
import { doFieldEffectDig } from './decompFldEffDig';
import { doFieldEffectTeleport } from './decompFldEffTeleport';
import { doFieldEffectSweetScent } from './decompFldEffSweetScent';
import { addMoney, getMoney, removeMoney } from './decompMoney';
import {
  clearPlayerHeldMovementAndUnfreezeObjectEvents,
  freezeObjectsWaitForPlayer,
  freezeObjectsWaitForPlayerAndSelected,
  isFreezePlayerFinished,
  isFreezeSelectedObjectAndPlayerFinished,
  scriptClearHeldMovement,
  scriptFacePlayer,
  setSelectedObjectEvent,
  tickEventObjectLock,
  unlockPlayerAndSelectedObject
} from './decompEventObjectLock';
import {
  createFieldMessageBoxState,
  hideFieldMessageBox,
  requestFieldTextPrinterSpeedUp,
  showFieldAutoScrollMessage,
  showFieldMessage,
  startFieldTextPrinter,
  type FieldMessageBoxFont,
  type FieldMessageBoxFrame,
  type FieldTextSpeed
} from './decompFieldMessageBox';
import {
  beginFieldFadeScreen,
  FADE_FROM_BLACK,
  FADE_FROM_WHITE,
  FADE_TO_BLACK,
  FADE_TO_WHITE,
  updateFieldPaletteFade,
  type FieldFadeMode
} from './decompFieldPaletteFade';
import {
  fadeDefaultFieldBgm,
  fadeInFieldBgm,
  fadeNewFieldBgm,
  fadeOutFieldBgm,
  playFieldBgm,
  playFieldFanfare,
  playFieldSoundEffect,
  saveFieldBgm,
  setFieldDefaultMapMusic,
  updateFieldFanfare
} from './decompFieldSound';
import { expandRuntimePlaceholders } from './decompDynamicPlaceholderTextUtil';
import {
  getBedroomPcMenuOptions,
  getCenterPcMenuOptions,
  getHallOfFamePcPages
} from './decompHofPc';
import {
  canPokemonBeTaughtTutorMove,
  formatDecompMoveName,
  getDaycareCompatibilityText,
  getDecompInGameTradeDefinition,
  getRelearnableMovesForPokemon,
  getTutorMoveId
} from './decompPartySubsystems';
import { getProfOaksRatingMessageByCount, getProfPcPokedexCount } from './decompProfPc';
import {
  hasAllKantoMons,
  hasAllMons
} from './decompPokedex';
import { isNationalDexEnabled } from './decompPokedexUi';
import {
  beginPcScreenEffectTurnOff,
  beginPcScreenEffectTurnOn
} from './decompPcScreenEffect';
import { enterHallOfFame } from './decompPostBattleEvents';
import { setUnlockedPokedexFlags } from './decompSaveLocation';
import { enterSafariMode, exitSafariMode } from './decompSafariZone';
import { initRoamer } from './decompRoamer';
import { cb2ShowDiploma } from './decompDiploma';
import {
  getDecompMovementActionById,
  getDecompMovementActionForCommand,
  type DecompMovementAction
} from './decompMovementActions';
import {
  createMovementObjectEvent,
  getMoveObjectsTaskId,
  scriptMovementIsObjectMovementFinished,
  scriptMovementMoveObjects,
  scriptMovementStartObjectMovementScript,
  TAIL_SENTINEL
} from './decompScriptMovement';
import { getDecompTrainerDefinition, getDecompTrainerFlag } from './decompTrainerData';
import type { DialogueState } from './interaction';
import { getMartStockForScriptId } from './martTemplate';
import type { NpcState } from './npc';
import {
  NAMING_SCREEN_INITIAL_MON_PAGE,
  NAMING_SCREEN_MAX_MON_CHARS,
  NAMING_SCREEN_MON_TITLE,
  saveNamingScreenInputText,
  stepNamingScreen
} from './decompNamingScreen';
import {
  addObjectEvent,
  removeObjectEvent,
  resetNpcFixedSubpriority,
  setNpcFixedSubpriority,
  setObjectEventInvisibility
} from './npc';
import type { PlayerState } from './player';
import {
  forcePlayerOntoMachBike,
  forcePlayerToStartSurfing
} from './playerAvatarTransition';
import {
  addPokedexCaughtSpecies,
  addPokedexSeenSpecies,
  getFieldPokemonDisplayName,
  getSpeciesDisplayName,
  type FieldPokemon
} from './pokemonStorage';
import type { ScriptRuntimeState } from './scripts';
import { adjustQuantityAccordingToDPadInput } from './decompMenuHelpers';

const COUNTER_PAGE_BREAK = '\f';
const SCR_MENU_CANCEL = 127;

const rawMapScriptFiles = import.meta.glob('../../../data/maps/*/scripts.inc', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawMapHeaderFiles = import.meta.glob('../../../data/maps/*/map.json', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawGlobalScriptFiles = import.meta.glob('../../../data/scripts/**/*.inc', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawMapTextFiles = import.meta.glob('../../../data/maps/*/text.inc', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawGlobalTextFiles = import.meta.glob('../../../data/text/**/*.inc', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawEventScriptsFiles = import.meta.glob('../../../data/event_scripts.s', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawFieldSpecialsFiles = import.meta.glob('../../../src/field_specials.c', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawMenuConstantsFiles = import.meta.glob('../../../include/constants/menu.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawItemConstantsFiles = import.meta.glob('../../../include/constants/items.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawSpeciesConstantsFiles = import.meta.glob('../../../include/constants/species.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawSongConstantsFiles = import.meta.glob('../../../include/constants/songs.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawFameCheckerConstantsFiles = import.meta.glob('../../../include/constants/fame_checker.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawScriptMenuFiles = import.meta.glob('../../../src/script_menu.c', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawStringSourceFiles = import.meta.glob('../../../src/strings.c', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const LABEL_RE = /^([A-Za-z0-9_]+):{1,2}/u;
const STRING_RE = /"((?:[^"\\]|\\.)*)"/gu;
const MULTICHOICE_CONSTANT_RE = /^#define\s+(MULTICHOICE_[A-Z0-9_]+)\s+(\d+)/gmu;
const LISTMENU_CONSTANT_RE = /^#define\s+(LISTMENU_[A-Z0-9_]+)\s+(\d+)/gmu;
const MULTICHOICE_LIST_RE = /static const struct MenuAction ([A-Za-z0-9_]+)\[\] = \{([\s\S]*?)\};/gu;
const MENU_ACTION_RE = /\{\s*([A-Za-z0-9_]+)\s*\}/gu;
const MULTICHOICE_TABLE_RE = /\[(MULTICHOICE_[A-Z0-9_]+)\]\s*=\s*MULTICHOICE\(([A-Za-z0-9_]+)\)/gu;
const STRING_CONSTANT_RE = /(?:ALIGNED\(\d+\)\s+)?const u8 ([A-Za-z0-9_]+)\[\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\);/gu;
const LISTMENU_CONFIG_CASE_RE = /case\s+(LISTMENU_[A-Z0-9_]+):([\s\S]*?)break;/gu;
const LISTMENU_LABELS_RE = /\[(LISTMENU_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\},/gu;
const ITEM_CONSTANT_RE = /^#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)$/gmu;
const SPECIES_CONSTANT_RE = /^#define\s+(SPECIES_[A-Z0-9_]+)\s+(\d+)$/gmu;
const SONG_CONSTANT_RE = /^#define\s+((?:MUS|SE)_[A-Z0-9_]+)\s+(\d+)\b/gmu;
const FAME_CHECKER_CONSTANT_RE = /^#define\s+((?:FAMECHECKER|FCPICKSTATE)_[A-Z0-9_]+)\s+(\d+)\b/gmu;
const STD_STRING_PTR_RE = /^\s*\[(STDSTRING_[A-Z0-9_]+)\]\s*=\s*([A-Za-z0-9_]+)/gmu;
const SPECIAL_COMMAND_RE = /^\s*special\s+([A-Za-z0-9_]+)/gmu;
const SPECIALVAR_COMMAND_RE = /^\s*specialvar\s+[A-Za-z0-9_]+,\s*([A-Za-z0-9_]+)/gmu;

const IGNORED_SCRIPT_COMMANDS = [
  'waitfieldeffect',
  'waitse',
  'waitmoncry',
  '.align'
] as const;

const PASS_THROUGH_SCRIPT_PREFIXES = [
  'playmoncry ',
  'lockfacing ',
  'showmoneybox',
  'hidemoneybox',
  'updatemoneybox',
  'compare ',
  'checkcoins ',
  'addcoins '
] as const;

const scriptBlocks = new Map<string, string[]>();
const textPages = new Map<string, string[]>();

type ScriptValue = number | string;

export interface DialogueChoiceState {
  kind: 'yesno' | 'multichoice' | 'listmenu';
  options: string[];
  selectedIndex: number;
  columns: number;
  tilemapLeft: number;
  tilemapTop: number;
  ignoreCancel: boolean;
  cancelValue: number;
  wrapAround: boolean;
  maxVisibleOptions?: number;
  scrollOffset?: number;
  reopenAfterSelection?: boolean;
  listMenuId?: string;
}

export interface FieldScriptSessionState {
  rootScriptId: string;
  currentLabel: string;
  lineIndex: number;
  lastTrainerId: string | null;
  hiddenItemFlag: string | null;
  loadedPointerTextLabel: string | null;
  callStack: Array<{
    label: string;
    lineIndex: number;
  }>;
  waitingFor: 'text' | 'choice' | 'task' | 'movement' | null;
  movingLocalId: number;
  waitingMovementLocalId: number | null;
  suspendedChoice: DialogueChoiceState | null;
  specialState: SpecialState | null;
  messageBoxFrame: FieldMessageBoxFrame;
  messageBoxAutoScroll: boolean;
}

interface PcSpecialState {
  kind: 'pcMenu' | 'playerPc' | 'hallOfFamePc';
  phase:
    | 'menu'
    | 'submenuMessage'
    | 'playerPcTopMenu'
    | 'playerPcItemStorageMenu'
    | 'playerPcWithdrawList'
    | 'playerPcDepositList'
    | 'playerPcMailboxList'
    | 'playerPcReturnToTopMenu'
    | 'playerPcReturnToItemStorageMenu'
    | 'hallOfFameMessage';
  submenu?: 'itemStorage' | 'mailbox';
}

interface MartSpecialState {
  kind: 'mart';
  scriptId: string;
  items: string[];
}

interface DaycareLevelMenuState {
  kind: 'daycareLevelMenu';
  daycareKind: 'route5' | 'fourIsland';
}

interface StrengthFieldEffectState {
  kind: 'strengthFieldEffect';
}

interface RockSmashFieldEffectState {
  kind: 'rockSmashFieldEffect';
}

interface DigFieldEffectState {
  kind: 'digFieldEffect';
}

interface TeleportFieldEffectState {
  kind: 'teleportFieldEffect';
}

interface SweetScentFieldEffectState {
  kind: 'sweetScentFieldEffect';
}

interface PartySelectionSpecialState {
  kind: 'partySelection';
  purpose: 'trade' | 'moveTutor' | 'moveRelearner' | 'daycare';
  slotOptions: number[];
}

interface MoveRelearnerSelectionSpecialState {
  kind: 'moveRelearnerSelection';
  slot: number;
  moveIds: string[];
}

interface NicknameSpecialState {
  kind: 'nickname';
  slot: number;
  phase: 'fadeIn' | 'input' | 'fadeOut' | 'returnFadeIn';
}

interface PaletteFadeSpecialState {
  kind: 'paletteFade';
}

interface FanfareSpecialState {
  kind: 'fanfare';
}

interface DelaySpecialState {
  kind: 'delay';
  counter: number;
}

interface DoorAnimationSpecialState {
  kind: 'doorAnimation';
}

type SpecialState =
  | PcSpecialState
  | MartSpecialState
  | DaycareLevelMenuState
  | StrengthFieldEffectState
  | RockSmashFieldEffectState
  | DigFieldEffectState
  | TeleportFieldEffectState
  | SweetScentFieldEffectState
  | PartySelectionSpecialState
  | MoveRelearnerSelectionSpecialState
  | NicknameSpecialState
  | PaletteFadeSpecialState
  | FanfareSpecialState
  | DelaySpecialState
  | DoorAnimationSpecialState;

export type ShopMode =
  | 'mainMenu'
  | 'buyList'
  | 'buyQuantity'
  | 'buyConfirm'
  | 'sellList'
  | 'sellQuantity'
  | 'sellConfirm'
  | 'message';

export interface ShopState {
  kind: 'mart';
  mode: ShopMode;
  items: string[];
  buyMenuWindows: BuyMenuInitWindowsResult;
  moneyBox: BuyMenuMoneyBoxDescriptor;
  yesNoWindow: BuyMenuConfirmPurchaseDescriptor;
  prompt: string;
  selectedIndex: number;
  scrollOffset: number;
  currentItemId: string | null;
  quantity: number;
  maxQuantity: number;
  pendingMode: Exclude<ShopMode, 'message'> | null;
}

interface ListMenuDefinition {
  id: string;
  options: string[];
  maxShowed: number;
  tilemapLeft: number;
  tilemapTop: number;
  closeOnChoose: boolean;
}

const STD_SCRIPT_LABEL_BY_ID: Record<string, string> = {
  STD_OBTAIN_ITEM: 'Std_ObtainItem',
  STD_FIND_ITEM: 'Std_FindItem',
  MSGBOX_NPC: 'Std_MsgboxNPC',
  MSGBOX_SIGN: 'Std_MsgboxSign',
  MSGBOX_DEFAULT: 'Std_MsgboxDefault',
  MSGBOX_YESNO: 'Std_MsgboxYesNo',
  MSGBOX_AUTOCLOSE: 'Std_MsgboxAutoclose',
  STD_OBTAIN_DECORATION: 'Std_ObtainDecoration',
  STD_PUT_ITEM_AWAY: 'Std_PutItemAway',
  STD_RECEIVED_ITEM: 'Std_ReceivedItem',
  '0': 'Std_ObtainItem',
  '1': 'Std_FindItem',
  '2': 'Std_MsgboxNPC',
  '3': 'Std_MsgboxSign',
  '4': 'Std_MsgboxDefault',
  '5': 'Std_MsgboxYesNo',
  '6': 'Std_MsgboxAutoclose',
  '7': 'Std_ObtainDecoration',
  '8': 'Std_PutItemAway',
  '9': 'Std_ReceivedItem'
};

interface ParsedTrainerBattleCommand {
  trainerId: string;
  introLabel: string | null;
  postBattleScriptLabel: string | null;
  format: 'singles' | 'doubles';
}

export interface DecompTrainerBattleInfo {
  trainerId: string;
  defeatFlag: string;
  format: 'singles' | 'doubles';
}

const SCRIPT_VALUE_CONSTANTS: Record<string, ScriptValue> = {
  TRUE: 1,
  FALSE: 0,
  YES: 1,
  NO: 0,
  DIR_NONE: 0,
  DIR_SOUTH: 1,
  DIR_NORTH: 2,
  DIR_WEST: 3,
  DIR_EAST: 4,
  DIR_SOUTHWEST: 5,
  DIR_SOUTHEAST: 6,
  DIR_NORTHWEST: 7,
  DIR_NORTHEAST: 8,
  MALE: 0,
  FEMALE: 1,
  PARTY_SIZE: getPartySizeConstant(),
  POCKET_ITEMS: 1,
  POCKET_KEY_ITEMS: 2,
  POCKET_POKE_BALLS: 3,
  POCKET_TM_CASE: 4,
  POCKET_BERRY_POUCH: 5,
  FADE_FROM_BLACK,
  FADE_TO_BLACK,
  FADE_FROM_WHITE,
  FADE_TO_WHITE,
  NPC_TEXT_COLOR_MALE: 0,
  NPC_TEXT_COLOR_FEMALE: 1,
  NPC_TEXT_COLOR_MON: 2,
  NPC_TEXT_COLOR_NEUTRAL: 3,
  NPC_TEXT_COLOR_DEFAULT: 255,
  FCPICKSTATE_NO_DRAW: 0,
  FCPICKSTATE_SILHOUETTE: 1,
  FCPICKSTATE_COLORED: 2,
  FAMECHECKER_OAK: 0,
  INGAME_TRADE_MR_MIME: 0,
  INGAME_TRADE_JYNX: 1,
  INGAME_TRADE_NIDORAN: 2,
  INGAME_TRADE_FARFETCHD: 3,
  INGAME_TRADE_NIDORINOA: 4,
  INGAME_TRADE_LICKITUNG: 5,
  INGAME_TRADE_ELECTRODE: 6,
  INGAME_TRADE_TANGELA: 7,
  INGAME_TRADE_SEEL: 8,
  DAYCARE_NO_MONS: 0,
  DAYCARE_EGG_WAITING: 1,
  DAYCARE_ONE_MON: 2,
  DAYCARE_TWO_MONS: 3,
  DAYCARE_LEVEL_MENU_EXIT: 5,
  DAYCARE_EXITED_LEVEL_MENU: 2,
  USING_SINGLE_BATTLE: 1,
  USING_DOUBLE_BATTLE: 2,
  USING_TRADE_CENTER: 3,
  USING_MULTI_BATTLE: 5,
  USING_UNION_ROOM: 6,
  USING_BERRY_CRUSH: 7,
  USING_MINIGAME: 8,
  LINKUP_ONGOING: 0,
  LINKUP_SUCCESS: 1,
  LINKUP_SOMEONE_NOT_READY: 2,
  LINKUP_DIFF_SELECTIONS: 3,
  LINKUP_WRONG_NUM_PLAYERS: 4,
  LINKUP_FAILED: 5,
  LINKUP_CONNECTION_ERROR: 6,
  LINKUP_PLAYER_NOT_READY: 7,
  LINKUP_RETRY_ROLE_ASSIGN: 8,
  LINKUP_PARTNER_NOT_READY: 9,
  LINK_GROUP_SINGLE_BATTLE: 0,
  LINK_GROUP_DOUBLE_BATTLE: 1,
  LINK_GROUP_MULTI_BATTLE: 2,
  LINK_GROUP_TRADE: 3,
  LINK_GROUP_POKEMON_JUMP: 4,
  LINK_GROUP_BERRY_CRUSH: 5,
  LINK_GROUP_BERRY_PICKING: 6,
  LINK_GROUP_WONDER_CARD: 7,
  LINK_GROUP_WONDER_NEWS: 8,
  LINK_GROUP_UNION_ROOM_RESUME: 9,
  LINK_GROUP_UNION_ROOM_INIT: 10,
  PLAYER_HAS_TWO_USABLE_MONS: 0,
  SCR_MENU_CANCEL
};

const PLAYER_FACING_TO_DIR: Record<PlayerState['facing'], string> = {
  up: 'DIR_NORTH',
  down: 'DIR_SOUTH',
  left: 'DIR_WEST',
  right: 'DIR_EAST'
};

const DIR_TO_FACING: Partial<Record<number | string, PlayerState['facing']>> = {
  1: 'down',
  DIR_SOUTH: 'down',
  2: 'up',
  DIR_NORTH: 'up',
  3: 'left',
  DIR_WEST: 'left',
  4: 'right',
  DIR_EAST: 'right'
};

const stripComment = (line: string): string => {
  const commentIndex = line.indexOf('@');
  return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
};

const decodeTextValue = (value: string, runtime: ScriptRuntimeState): string =>
  expandRuntimePlaceholders(value, runtime)
    .replace(/\\n/gu, '\n')
    .replace(/\\l/gu, '\n')
    .replace(/\\p/gu, COUNTER_PAGE_BREAK)
    .replace(/\\e/gu, '')
    .replace(/\$/gu, '');

const decodeMenuStringValue = (value: string): string =>
  value
    .replace(/\\n/gu, '\n')
    .replace(/\\l/gu, '\n')
    .replace(/\\p/gu, ' ')
    .replace(/\\e/gu, '')
    .replace(/\$/gu, '')
    .trim();

const parseLabeledBlocks = (source: string): Map<string, string[]> => {
  const blocks = new Map<string, string[]>();
  const macros = new Map<string, string[]>();
  let currentLabel: string | null = null;
  let currentLines: string[] = [];
  let currentMacro: string | null = null;
  let currentMacroLines: string[] = [];

  for (const rawLine of source.split(/\r?\n/gu)) {
    const line = stripComment(rawLine);
    const trimmed = line.trim();

    const macroMatch = trimmed.match(/^\.macro\s+([A-Za-z0-9_]+)/u);
    if (macroMatch) {
      currentMacro = macroMatch[1];
      currentMacroLines = [];
      continue;
    }

    if (currentMacro) {
      if (trimmed === '.endm') {
        macros.set(currentMacro, currentMacroLines);
        currentMacro = null;
        currentMacroLines = [];
      } else if (trimmed.length > 0) {
        currentMacroLines.push(line);
      }
      continue;
    }

    const labelMatch = line.match(LABEL_RE);
    if (labelMatch) {
      if (currentLabel) {
        blocks.set(currentLabel, currentLines);
      }
      currentLabel = labelMatch[1];
      currentLines = [];
      continue;
    }

    if (currentLabel) {
      const macroLines = macros.get(trimmed);
      if (macroLines) {
        currentLines.push(...macroLines);
      } else {
        currentLines.push(line);
      }
    }
  }

  if (currentLabel) {
    blocks.set(currentLabel, currentLines);
  }

  return blocks;
};

const parseTextPagesFromBlock = (lines: string[], runtime: ScriptRuntimeState): string[] | null => {
  const fragments: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('.string') && !line.startsWith('.braille')) {
      continue;
    }

    for (const match of line.matchAll(STRING_RE)) {
      fragments.push(match[1]);
    }
  }

  if (fragments.length === 0) {
    return null;
  }

  return decodeTextValue(fragments.join(''), runtime)
    .split(COUNTER_PAGE_BREAK)
    .map((page) => page.trim())
    .filter((page) => page.length > 0);
};

const registerTextSources = (sources: Record<string, string>): void => {
  for (const source of Object.values(sources)) {
    for (const [label, lines] of parseLabeledBlocks(source)) {
      if (!textPages.has(label)) {
        textPages.set(label, lines);
      }
    }
  }
};

const registerScriptSources = (sources: Record<string, string>): void => {
  for (const source of Object.values(sources)) {
    for (const [label, lines] of parseLabeledBlocks(source)) {
      scriptBlocks.set(label, lines);
    }
  }
};

const parseMultichoiceConstantMap = (): Map<string, number> => {
  const constants = new Map<string, number>();
  for (const source of Object.values(rawMenuConstantsFiles)) {
    for (const match of source.matchAll(MULTICHOICE_CONSTANT_RE)) {
      constants.set(match[1], Number.parseInt(match[2], 10));
    }
  }
  return constants;
};

const parseListMenuConstantMap = (): Map<string, number> => {
  const constants = new Map<string, number>();
  for (const source of Object.values(rawMenuConstantsFiles)) {
    for (const match of source.matchAll(LISTMENU_CONSTANT_RE)) {
      constants.set(match[1], Number.parseInt(match[2], 10));
    }
  }
  return constants;
};

const folderNameToMapConstant = (folderName: string): string =>
  `MAP_${folderName
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/gu, '$1_$2')
    .toUpperCase()}`;

const parseMapScriptBaseByMapId = (): Map<string, string> => {
  const bases = new Map<string, string>();
  for (const path of Object.keys(rawMapScriptFiles)) {
    const folderName = path.match(/data\/maps\/([^/]+)\/scripts\.inc$/u)?.[1];
    if (folderName) {
      bases.set(folderNameToMapConstant(folderName), folderName);
    }
  }
  return bases;
};

const parseItemConstantMaps = (): {
  byName: Map<string, number>;
  byValue: Map<number, string>;
} => {
  const byName = new Map<string, number>();
  const byValue = new Map<number, string>();

  for (const source of Object.values(rawItemConstantsFiles)) {
    for (const match of source.matchAll(ITEM_CONSTANT_RE)) {
      const value = Number.parseInt(match[2], 10);
      byName.set(match[1], value);
      if (!byValue.has(value)) {
        byValue.set(value, match[1]);
      }
    }
  }

  return { byName, byValue };
};

const parseSpeciesConstantMaps = (): {
  byName: Map<string, number>;
  byValue: Map<number, string>;
} => {
  const byName = new Map<string, number>();
  const byValue = new Map<number, string>();

  for (const source of Object.values(rawSpeciesConstantsFiles)) {
    for (const match of source.matchAll(SPECIES_CONSTANT_RE)) {
      const value = Number.parseInt(match[2], 10);
      byName.set(match[1], value);
      if (!byValue.has(value)) {
        byValue.set(value, match[1]);
      }
    }
  }

  return { byName, byValue };
};

const parseSongConstantMap = (): Map<string, number> => {
  const constants = new Map<string, number>();
  for (const source of Object.values(rawSongConstantsFiles)) {
    for (const match of source.matchAll(SONG_CONSTANT_RE)) {
      constants.set(match[1], Number.parseInt(match[2], 10));
    }
  }
  return constants;
};

const parseFameCheckerConstantMap = (): Map<string, number> => {
  const constants = new Map<string, number>();
  for (const source of Object.values(rawFameCheckerConstantsFiles)) {
    for (const match of source.matchAll(FAME_CHECKER_CONSTANT_RE)) {
      constants.set(match[1], Number.parseInt(match[2], 10));
    }
  }
  return constants;
};

const parseDefaultMapMusicByScriptPrefix = (songs: Map<string, number>): Map<string, number> => {
  const musicByPrefix = new Map<string, number>();
  for (const [path, source] of Object.entries(rawMapHeaderFiles)) {
    const folderName = path.match(/data\/maps\/([^/]+)\/map\.json$/u)?.[1];
    if (!folderName) {
      continue;
    }
    try {
      const parsed = JSON.parse(source) as { music?: unknown };
      if (typeof parsed.music !== 'string') {
        continue;
      }
      const song = songs.get(parsed.music);
      if (song !== undefined) {
        musicByPrefix.set(folderName, song);
      }
    } catch {
      continue;
    }
  }
  return musicByPrefix;
};

const parseMenuStringConstantMap = (): Map<string, string> => {
  const strings = new Map<string, string>();
  for (const source of Object.values(rawStringSourceFiles)) {
    for (const match of source.matchAll(STRING_CONSTANT_RE)) {
      strings.set(match[1], decodeMenuStringValue(match[2]));
    }
  }
  return strings;
};

const parseStdStringMap = (): Map<string, string> => {
  const menuStringMap = parseMenuStringConstantMap();
  const stdStrings = new Map<string, string>();

  for (const source of Object.values(rawScriptMenuFiles)) {
    for (const match of source.matchAll(STD_STRING_PTR_RE)) {
      stdStrings.set(match[1], menuStringMap.get(match[2]) ?? fallbackMenuTextLabel(match[2]));
    }
  }

  return stdStrings;
};

const collectReferencedCommandNames = (pattern: RegExp): string[] => {
  const names = new Set<string>();
  for (const source of [
    ...Object.values(rawMapScriptFiles),
    ...Object.values(rawGlobalScriptFiles),
    ...Object.values(rawEventScriptsFiles)
  ]) {
    for (const match of source.matchAll(pattern)) {
      names.add(match[1]);
    }
  }
  return [...names].sort((left, right) => left.localeCompare(right));
};

const fallbackMenuTextLabel = (label: string): string =>
  label
    .replace(/^(?:gText|gOtherText)_?/u, '')
    .replace(/_/gu, ' ')
    .trim()
    .toUpperCase();

const parseMultichoiceOptionMap = (): Map<number, string[]> => {
  const constantMap = parseMultichoiceConstantMap();
  const stringMap = parseMenuStringConstantMap();
  const listItems = new Map<string, string[]>();
  const idToOptions = new Map<number, string[]>();

  for (const source of Object.values(rawScriptMenuFiles)) {
    for (const match of source.matchAll(MULTICHOICE_LIST_RE)) {
      const itemLabels = [...match[2].matchAll(MENU_ACTION_RE)].map((entry) => entry[1]);
      const options = itemLabels.map((label) => stringMap.get(label) ?? fallbackMenuTextLabel(label));
      listItems.set(match[1], options);
    }

    for (const match of source.matchAll(MULTICHOICE_TABLE_RE)) {
      const id = constantMap.get(match[1]);
      const options = listItems.get(match[2]);
      if (id === undefined || !options) {
        continue;
      }
      idToOptions.set(id, options);
    }
  }

  return idToOptions;
};

registerScriptSources(rawMapScriptFiles);
registerScriptSources(rawGlobalScriptFiles);
registerScriptSources(rawEventScriptsFiles);
registerTextSources(rawMapScriptFiles);
registerTextSources(rawGlobalScriptFiles);
registerTextSources(rawMapTextFiles);
registerTextSources(rawGlobalTextFiles);
registerTextSources(rawEventScriptsFiles);

const multichoiceConstantMap = parseMultichoiceConstantMap();
const listMenuConstantMap = parseListMenuConstantMap();
const multichoiceOptionMap = parseMultichoiceOptionMap();
const itemConstantMaps = parseItemConstantMaps();
const speciesConstantMaps = parseSpeciesConstantMaps();
const songConstantMap = parseSongConstantMap();
const fameCheckerConstantMap = parseFameCheckerConstantMap();
const defaultMapMusicByScriptPrefix = parseDefaultMapMusicByScriptPrefix(songConstantMap);
const stdStringMap = parseStdStringMap();
const mapScriptBaseByMapId = parseMapScriptBaseByMapId();
export const referencedDecompSpecialNames = collectReferencedCommandNames(SPECIAL_COMMAND_RE);
export const referencedDecompSpecialVarNames = collectReferencedCommandNames(SPECIALVAR_COMMAND_RE);

const parseFieldSpecialListMenus = (): Map<number, ListMenuDefinition> => {
  const menuStringMap = parseMenuStringConstantMap();
  const labelsById = new Map<string, string[]>();
  const definitions = new Map<number, ListMenuDefinition>();

  for (const source of Object.values(rawFieldSpecialsFiles)) {
    for (const match of source.matchAll(LISTMENU_LABELS_RE)) {
      const options = [...match[2].matchAll(/[A-Za-z0-9_]+/gu)]
        .map((entry) => entry[0])
        .filter((token) => token.startsWith('g'))
        .map((label) => menuStringMap.get(label) ?? fallbackMenuTextLabel(label));
      labelsById.set(match[1], options);
    }

    for (const match of source.matchAll(LISTMENU_CONFIG_CASE_RE)) {
      const body = match[2];
      const id = listMenuConstantMap.get(match[1]);
      const options = labelsById.get(match[1]);
      if (id === undefined || !options) {
        continue;
      }

      const maxShowed = Number.parseInt(body.match(/task->data\[0\] = (\d+)/u)?.[1] ?? `${options.length}`, 10);
      const tilemapLeft = Number.parseInt(body.match(/task->data\[2\] = (\d+)/u)?.[1] ?? '1', 10);
      const tilemapTop = Number.parseInt(body.match(/task->data\[3\] = (\d+)/u)?.[1] ?? '1', 10);
      const closeMode = Number.parseInt(body.match(/task->data\[6\] = (\d+)/u)?.[1] ?? '0', 10);

      definitions.set(id, {
        id: match[1],
        options,
        maxShowed,
        tilemapLeft,
        tilemapTop,
        closeOnChoose: closeMode === 0
      });
    }
  }

  return definitions;
};

const listMenuDefinitionMap = parseFieldSpecialListMenus();

const INLINE_DIALOGUE_SPECIALS = new Set([
  'AnimatePcTurnOn',
  'AnimatePcTurnOff',
  'CreatePCMenu',
  'BedroomPC',
  'PlayerPC',
  'HallOfFamePCBeginFade',
  'ListMenu',
  'ReturnToListMenu',
  'SetHiddenItemFlag'
]);

const IMPLEMENTED_SPECIALS = new Set([
  'BackupHelpContext',
  'BufferMoveDeleterNicknameAndMove',
  'BufferBigGuyOrBigGirlString',
  'BufferMonNickname',
  'ChooseHalfPartyForBattle',
  'ChooseMonForMoveRelearner',
  'ChooseMonForMoveTutor',
  'ChooseMonForWirelessMinigame',
  'ChoosePartyMon',
  'ChooseSendDaycareMon',
  'CloseLink',
  'CleanupLinkRoomState',
  'DoCableClubWarp',
  'DrawWholeMapView',
  'EnableNationalPokedex',
  'EnterColosseumPlayerSpot',
  'EnterHallOfFame',
  'EnterTradeSeat',
  'EnterSafariMode',
  'ExitLinkRoom',
  'ExitSafariMode',
  'Field_AskSaveTheGame',
  'ForcePlayerOntoBike',
  'ForcePlayerToStartSurfing',
  'GetCostToWithdrawRoute5DaycareMon',
  'GetDaycareCost',
  'GetDaycareMonNicknames',
  'GetNumMovesSelectedMonHas',
  'GetProfOaksRatingMessage',
  'HasAtLeastOneBerry',
  'HasEnoughMonsForDoubleBattle',
  'HealPlayerParty',
  'HelpSystem_Disable',
  'HelpSystem_Enable',
  'InitRoamer',
  'InitUnionRoom',
  'IsMonOTIDNotPlayers',
  'IsSelectedMonEgg',
  'MoveDeleterForgetMove',
  'ReturnFromLinkRoom',
  'RestoreHelpContext',
  'RunUnionRoom',
  'Script_BufferFanClubTrainerName',
  'Script_ResetUnionRoomTrade',
  'Script_SetHelpContext',
  'Script_ShowLinkTrainerCard',
  'SelectMoveDeleterMove',
  'SetCableClubWarp',
  'SetHelpContextForMap',
  'SetSeenMon',
  'SetUnlockedPokedexFlags',
  'SetDaycareCompatibilityString',
  'StoreSelectedPokemonInDaycare',
  'ShowBattleRecords',
  'ShowDiploma',
  'ShowEasyChatMessage',
  'ShowFieldMessageStringVar4',
  'ShowPokemonStorageSystemPC',
  'ShowWirelessCommunicationScreen',
  'ShowTownMap',
  'TeachMoveRelearnerMove',
  'CreateInGameTradePokemon',
  'DoInGameTradeScene',
  'AnimateTeleporterCable',
  'AnimateTeleporterHousing',
  'DoFallWarp',
  'DoPokemonLeagueLightingEffect',
  'DoSSAnneDepartureCutscene',
  'DoSeagallopFerryScene',
  'RemoveCameraObject',
  'ShakeScreen',
  'SpawnCameraObject',
  'TryBattleLinkup',
  'TryBecomeLinkLeader',
  'TryJoinLinkGroup',
  'TryTradeLinkup'
]);

const PASS_THROUGH_SPECIALS = new Set([
  'AnimateElevator',
  'BrailleCursorToggle',
  'BufferEReaderTrainerGreeting',
  'BufferEReaderTrainerName',
  'CallTrainerTowerFunc',
  'ChangeBoxPokemonNickname',
  'ChangePokemonNickname',
  'CloseMuseumFossilPic',
  'CloseElevatorCurrentFloorWindow',
  'CompareHeracrossSize',
  'CompareMagikarpSize',
  'CreateInGameTradePokemon',
  'DaisyMassageServices',
  'DisableMsgBoxWalkaway',
  'DisplayBerryPowderVendorMenu',
  'DoCredits',
  'DoDeoxysTriangleInteraction',
  'DoPicboxCancel',
  'DrawSeagallopDestinationMenu',
  'DrawElevatorCurrentFloorWindow',
  'EggHatch',
  'EndTrainerApproach',
  'GiveEggFromDaycare',
  'GetElevatorFloor',
  'GetHeracrossSizeRecordInfo',
  'GetMagikarpSizeRecordInfo',
  'IsDodrioInParty',
  'IsPokemonJumpSpeciesInParty',
  'LoadPlayerBag',
  'LoadPlayerParty',
  'LoopWingFlapSound',
  'MoveDeleterForgetMove',
  'OpenMuseumFossilPic',
  'OverworldWhiteOutGetMoneyLoss',
  'PlayTrainerEncounterMusic',
  'PlayerPC',
  'PrintPlayerBerryPowderAmount',
  'PutMonInRoute5Daycare',
  'QuestLog_CutRecording',
  'QuestLog_StartRecordingInputsAfterDeferredEvent',
  'ReducePlayerPartyToThree',
  'RejectEggFromDayCare',
  'RemoveBerryPowderVendorMenu',
  'RockSmashWildEncounter',
  'SampleResortGorgeousMonAndReward',
  'SavePlayerParty',
  'Script_FadeOutMapMusic',
  'Script_ClearHeldMovement',
  'SetCB2WhiteOut',
  'Script_FacePlayer',
  'SetIcefallCaveCrackedIceMetatiles',
  'SetWalkingIntoSignVars',
  'Script_TakeBerryPowder',
  'Script_TryGainNewFanFromCounter',
  'Script_TryLoseFansFromPlayTime',
  'Script_UpdateTrainerFanClubGameClear',
  'SeafoamIslandsB4F_CurrentDumpsPlayerOnLand',
  'SetBattledTrainerFlag',
  'SetDeoxysTrianglePalette',
  'SetEReaderTrainerGfxId',
  'SetPostgameFlags',
  'SetUpTrainerMovement',
  'SetUsedPkmnCenterQuestLogEvent',
  'SetVermilionTrashCans',
  'ShowBerryCrushRankings',
  'ShowDaycareLevelMenu',
  'ShowDodrioBerryPickingRecords',
  'ShowEasyChatScreen',
  'ShowPokemonJumpRecords',
  'ShowTrainerCantBattleSpeech',
  'ShowTrainerIntroSpeech',
  'StartLegendaryBattle',
  'StartMarowakBattle',
  'StartOldManTutorialBattle',
  'StartRematchBattle',
  'StartSpecialBattle',
  'SubtractMoneyFromVar0x8005',
  'TryFieldPoisonWhiteOut',
  'UpdateLoreleiDollCollection',
  'UpdateTrainerCardPhotoIcons',
  'ValidateEReaderTrainer',
  'VsSeekerFreezeObjectsAfterChargeComplete',
  'VsSeekerResetObjectMovementAfterChargeComplete'
]);

const IMPLEMENTED_SPECIALVARS = new Set([
  'CapeBrinkGetMoveToTeachLeadPokemon',
  'CalculatePlayerPartyCount',
  'CheckAddCoins',
  'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot',
  'CountPartyNonEggMons',
  'DoesPlayerPartyContainSpecies',
  'GetBattleOutcome',
  'BufferUnionRoomPlayerName',
  'GetDaycareState',
  'GetInGameTradeSpeciesInfo',
  'GetLeadMonFriendship',
  'GetPartyMonSpecies',
  'GetPokedexCount',
  'GetSelectedMonNicknameAndSpecies',
  'GetTradeSpecies',
  'GetTrainerBattleMode',
  'HasLearnedAllMovesFromCapeBrinkTutor',
  'HasAllKantoMons',
  'HasAllMons',
  'InitElevatorFloorSelectMenuPos',
  'IsMonOTNameNotPlayers',
  'IsEnoughForCostInVar0x8005',
  'IsNationalPokedexEnabled',
  'IsWirelessAdapterConnected',
  'TakePokemonFromDaycare',
  'TakePokemonFromRoute5Daycare',
  'PlayerPartyContainsSpeciesWithPlayerID',
  'GetRandomSlotMachineId',
  'Script_HasTrainerBeenFought',
  'ShouldTryRematchBattle',
  'ValidateSavedWonderCard'
]);

const DEFAULT_ZERO_SPECIALVARS = new Set([
  'BufferTMHMMoveName',
  'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot',
  'DoesPartyHaveEnigmaBerry',
  'DoesPlayerPartyContainSpecies',
  'GetDaycareState',
  'GetLeadMonFriendship',
  'GetMartClerkObjectId',
  'GetNumLevelsGainedForRoute5DaycareMon',
  'GetNumLevelsGainedFromDaycare',
  'GetPCBoxToSendMon',
  'GetPartyMonSpecies',
  'GetPlayerFacingDirection',
  'GetPokedexCount',
  'GetSeagallopNumber',
  'GetSelectedMonNicknameAndSpecies',
  'GetSelectedSeagallopDestination',
  'GetStarterSpecies',
  'GetTrainerBattleMode',
  'HasAllKantoMons',
  'HasAllMons',
  'InitElevatorFloorSelectMenuPos',
  'IsBadEggInParty',
  'IsEnoughForCostInVar0x8005',
  'IsNationalPokedexEnabled',
  'IsPlayerLeftOfVermilionSailor',
  'IsPlayerNotInTrainerTowerLobby',
  'IsThereMonInRoute5Daycare',
  'IsThereRoomInAnyBoxForMorePokemon',
  'IsTrainerReadyForRematch',
  'NameRaterWasNicknameChanged',
  'PlayerPartyContainsSpeciesWithPlayerID',
  'Script_GetNumFansOfPlayerInTrainerFanClub',
  'Script_HasTrainerBeenFought',
  'Script_IsFanClubMemberFanOfPlayer',
  'Script_HasEnoughBerryPowder',
  'ShouldShowBoxWasFullMessage',
  'ShouldTryRematchBattle',
  'StickerManGetBragFlags',
  'WonderNews_GetRewardInfo'
]);

const HANDLED_SPECIALS = new Set([
  ...INLINE_DIALOGUE_SPECIALS,
  ...IMPLEMENTED_SPECIALS,
  ...PASS_THROUGH_SPECIALS
]);

const HANDLED_SPECIALVARS = new Set([
  ...IMPLEMENTED_SPECIALVARS,
  ...DEFAULT_ZERO_SPECIALVARS
]);

export const getUntrackedDecompSpecialNames = (): string[] =>
  referencedDecompSpecialNames.filter((name) => !HANDLED_SPECIALS.has(name));

export const getUntrackedDecompSpecialVarNames = (): string[] =>
  referencedDecompSpecialVarNames.filter((name) => !HANDLED_SPECIALVARS.has(name));

const isIgnoredScriptLine = (line: string): boolean => {
  if (IGNORED_SCRIPT_COMMANDS.some((prefix) => line === prefix || line.startsWith(`${prefix} `))) {
    return true;
  }

  return PASS_THROUGH_SCRIPT_PREFIXES.some((prefix) => line.startsWith(prefix));
};

const parseCommandArgs = (line: string): string[] =>
  line
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

const isScriptLabelToken = (token: string | undefined): token is string =>
  !!token
  && /^[A-Za-z0-9_]+$/u.test(token)
  && token !== 'FALSE'
  && token !== 'TRUE'
  && token !== 'NO_MUSIC';

const parseTrainerBattleCommand = (line: string): ParsedTrainerBattleCommand | null => {
  const match = line.match(/^(trainerbattle(?:_[a-z_]+)?)\s+(.+)$/u);
  if (!match) {
    return null;
  }

  const command = match[1];
  const args = parseCommandArgs(match[2]);

  switch (command) {
    case 'trainerbattle_single':
      return args[0] && args[1] ? {
        trainerId: args[0],
        introLabel: args[1],
        postBattleScriptLabel: isScriptLabelToken(args[3]) ? args[3] : null,
        format: 'singles'
      } : null;
    case 'trainerbattle_double':
      return args[0] && args[1] ? {
        trainerId: args[0],
        introLabel: args[1],
        postBattleScriptLabel: isScriptLabelToken(args[4]) ? args[4] : null,
        format: 'doubles'
      } : null;
    case 'trainerbattle_rematch':
      return args[0] && args[1] ? {
        trainerId: args[0],
        introLabel: args[1],
        postBattleScriptLabel: null,
        format: 'singles'
      } : null;
    case 'trainerbattle_rematch_double':
      return args[0] && args[1] ? {
        trainerId: args[0],
        introLabel: args[1],
        postBattleScriptLabel: null,
        format: 'doubles'
      } : null;
    case 'trainerbattle_no_intro':
    case 'trainerbattle_earlyrival':
      return args[0] ? {
        trainerId: args[0],
        introLabel: null,
        postBattleScriptLabel: null,
        format: 'singles'
      } : null;
    default:
      return null;
  }
};

export const getDecompTrainerBattleInfoForScript = (scriptId: string): DecompTrainerBattleInfo | null => {
  const lines = scriptBlocks.get(scriptId);
  if (!lines) {
    return null;
  }

  for (const rawLine of lines) {
    const trainerBattle = parseTrainerBattleCommand(rawLine.trim());
    if (trainerBattle) {
      return {
        trainerId: trainerBattle.trainerId,
        defeatFlag: getDecompTrainerFlag(trainerBattle.trainerId),
        format: trainerBattle.format
      };
    }
  }

  return null;
};

const getScriptVarValue = (
  runtime: ScriptRuntimeState,
  key: string,
  player?: PlayerState
): ScriptValue | undefined => {
  if (key === 'VAR_FACING' && player) {
    return SCRIPT_VALUE_CONSTANTS[PLAYER_FACING_TO_DIR[player.facing]];
  }

  if (Object.prototype.hasOwnProperty.call(runtime.vars, key)) {
    return runtime.vars[key];
  }

  return undefined;
};

const resolveScriptValue = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): ScriptValue => {
  const trimmed = token.trim();
  const runtimeValue = getScriptVarValue(runtime, trimmed, player);
  if (runtimeValue !== undefined) {
    return runtimeValue;
  }

  if (trimmed in SCRIPT_VALUE_CONSTANTS) {
    return SCRIPT_VALUE_CONSTANTS[trimmed];
  }

  const multichoiceValue = multichoiceConstantMap.get(trimmed);
  if (multichoiceValue !== undefined) {
    return multichoiceValue;
  }

  const listMenuValue = listMenuConstantMap.get(trimmed);
  if (listMenuValue !== undefined) {
    return listMenuValue;
  }

  const speciesValue = speciesConstantMaps.byName.get(trimmed);
  if (speciesValue !== undefined) {
    return speciesValue;
  }

  const songValue = songConstantMap.get(trimmed);
  if (songValue !== undefined) {
    return songValue;
  }

  const fameCheckerValue = fameCheckerConstantMap.get(trimmed);
  if (fameCheckerValue !== undefined) {
    return fameCheckerValue;
  }

  if (/^-?\d+$/u.test(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }

  if (/^0x[0-9a-f]+$/iu.test(trimmed)) {
    return Number.parseInt(trimmed, 16);
  }

  return trimmed;
};

const resolveNumericExpression = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): number => {
  const normalized = token.replace(/[()]/gu, '').trim();
  if (normalized.includes('|')) {
    return normalized
      .split('|')
      .map((part) => resolveNumericExpression(part, runtime, player))
      .reduce((value, part) => value | part, 0);
  }

  if (normalized.includes('<<')) {
    const [lhs, rhs] = normalized.split('<<');
    return resolveNumericExpression(lhs ?? '0', runtime, player) << resolveNumericExpression(rhs ?? '0', runtime, player);
  }

  const resolved = resolveScriptValue(normalized, runtime, player);
  return typeof resolved === 'number' ? resolved : 0;
};

const resolveFadeMode = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): FieldFadeMode | null => {
  const mode = resolveNumericExpression(token, runtime, player);
  return mode === FADE_FROM_BLACK
    || mode === FADE_TO_BLACK
    || mode === FADE_FROM_WHITE
    || mode === FADE_TO_WHITE
    ? mode
    : null;
};

const resolveSetVarValue = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): ScriptValue => {
  const trimmed = token.trim();
  const resolved = resolveScriptValue(trimmed, runtime, player);
  if (
    typeof resolved === 'string'
    && resolved === trimmed
    && (
      trimmed.startsWith('LOCALID_')
      || trimmed.startsWith('MAP_')
      || trimmed.startsWith('SPECIES_')
    )
  ) {
    return resolved;
  }

  return resolveNumericExpression(trimmed, runtime, player);
};

export type DecompMapScriptType =
  | 'MAP_SCRIPT_ON_LOAD'
  | 'MAP_SCRIPT_ON_FRAME_TABLE'
  | 'MAP_SCRIPT_ON_TRANSITION'
  | 'MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE'
  | 'MAP_SCRIPT_ON_RESUME'
  | 'MAP_SCRIPT_ON_DIVE_WARP'
  | 'MAP_SCRIPT_ON_RETURN_TO_FIELD';

export interface DecompMapScript2Entry {
  varName: string;
  valueToken: string;
  scriptId: string;
}

export const getDecompMapScriptLabel = (
  mapId: string,
  scriptType: DecompMapScriptType
): string | null => {
  const base = mapScriptBaseByMapId.get(mapId);
  if (!base) {
    return null;
  }

  const lines = scriptBlocks.get(`${base}_MapScripts`);
  if (!lines) {
    return null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const match = line.match(/^map_script\s+([A-Z0-9_]+),\s*([A-Za-z0-9_]+)/u);
    if (match?.[1] === scriptType) {
      return match[2];
    }
  }

  return null;
};

export const getDecompMapScript2Entries = (
  mapId: string,
  scriptType: DecompMapScriptType
): DecompMapScript2Entry[] => {
  const tableLabel = getDecompMapScriptLabel(mapId, scriptType);
  if (!tableLabel) {
    return [];
  }

  const lines = scriptBlocks.get(tableLabel);
  if (!lines) {
    return [];
  }

  const entries: DecompMapScript2Entry[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '.2byte 0' || line === '.byte 0') {
      break;
    }
    const match = line.match(/^map_script_2\s+([A-Za-z0-9_]+),\s*([^,]+),\s*([A-Za-z0-9_]+)/u);
    if (match) {
      entries.push({
        varName: match[1],
        valueToken: match[2].trim(),
        scriptId: match[3]
      });
    }
  }

  return entries;
};

export const getMatchingDecompMapScript2ScriptId = (
  mapId: string,
  scriptType: DecompMapScriptType,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string | null => {
  for (const entry of getDecompMapScript2Entries(mapId, scriptType)) {
    if (
      resolveNumericExpression(entry.varName, runtime, player)
      === resolveNumericExpression(entry.valueToken, runtime, player)
    ) {
      return entry.scriptId;
    }
  }

  return null;
};

const evaluateConditionalComparison = (
  operator: 'eq' | 'ne' | 'lt' | 'gt' | 'le' | 'ge',
  lhs: string,
  rhs: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): boolean => {
  if (operator === 'eq') {
    return resolveScriptValue(lhs, runtime, player) === resolveScriptValue(rhs, runtime, player);
  }

  if (operator === 'ne') {
    return resolveScriptValue(lhs, runtime, player) !== resolveScriptValue(rhs, runtime, player);
  }

  const left = resolveNumericExpression(lhs, runtime, player);
  const right = resolveNumericExpression(rhs, runtime, player);
  switch (operator) {
    case 'lt':
      return left < right;
    case 'gt':
      return left > right;
    case 'le':
      return left <= right;
    case 'ge':
      return left >= right;
    default:
      return false;
  }
};

const tryEvaluateConditionalTransfer = (
  line: string,
  transfer: 'goto' | 'call',
  runtime: ScriptRuntimeState,
  player?: PlayerState
): { matched: boolean; target: string | null } => {
  let match = line.match(new RegExp(`^${transfer}_if_set\\s+([A-Za-z0-9_]+),\\s*([A-Za-z0-9_]+)$`, 'u'));
  if (match) {
    return { matched: true, target: runtime.flags.has(match[1]) ? match[2] : null };
  }

  match = line.match(new RegExp(`^${transfer}_if_unset\\s+([A-Za-z0-9_]+),\\s*([A-Za-z0-9_]+)$`, 'u'));
  if (match) {
    return { matched: true, target: runtime.flags.has(match[1]) ? null : match[2] };
  }

  for (const operator of ['eq', 'ne', 'lt', 'gt', 'le', 'ge'] as const) {
    match = line.match(new RegExp(`^${transfer}_if_${operator}\\s+([^,]+),\\s*([^,]+),\\s*([A-Za-z0-9_]+)$`, 'u'));
    if (match) {
      return {
        matched: true,
        target: evaluateConditionalComparison(operator, match[1], match[2], runtime, player)
          ? match[3]
          : null
      };
    }
  }

  if (transfer === 'goto') {
    match = line.match(/^goto_if_defeated\s+([A-Za-z0-9_]+)\s*,?\s*([A-Za-z0-9_]+)/u);
    if (match) {
      return {
        matched: true,
        target: runtime.flags.has(getDecompTrainerFlag(match[1])) ? match[2] : null
      };
    }

    match = line.match(/^goto_if_not_defeated\s+([A-Za-z0-9_]+)\s*,?\s*([A-Za-z0-9_]+)/u);
    if (match) {
      return {
        matched: true,
        target: runtime.flags.has(getDecompTrainerFlag(match[1])) ? null : match[2]
      };
    }

    if (line.startsWith('goto_if_questlog')) {
      return { matched: true, target: null };
    }
  }

  if (transfer === 'call') {
    match = line.match(/^call_if_defeated\s+([A-Za-z0-9_]+)\s*,?\s*([A-Za-z0-9_]+)/u);
    if (match) {
      return {
        matched: true,
        target: runtime.flags.has(getDecompTrainerFlag(match[1])) ? match[2] : null
      };
    }

    match = line.match(/^call_if_not_defeated\s+([A-Za-z0-9_]+)\s*,?\s*([A-Za-z0-9_]+)/u);
    if (match) {
      return {
        matched: true,
        target: runtime.flags.has(getDecompTrainerFlag(match[1])) ? null : match[2]
      };
    }
  }

  return { matched: false, target: null };
};

const tryEvaluateGotoCondition = (
  line: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): { matched: boolean; target: string | null } =>
  tryEvaluateConditionalTransfer(line, 'goto', runtime, player);

const tryEvaluateCallCondition = (
  line: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): { matched: boolean; target: string | null } =>
  tryEvaluateConditionalTransfer(line, 'call', runtime, player);

const getTextPagesForLabel = (
  label: string,
  runtime: ScriptRuntimeState
): string[] | null => {
  const lines = textPages.get(label);
  if (!lines) {
    return null;
  }
  return parseTextPagesFromBlock(lines, runtime);
};

const resolveMessagePointerLabel = (
  token: string,
  session: FieldScriptSessionState
): string | null => {
  const trimmed = token.trim();
  if (trimmed === '0x0') {
    return session.loadedPointerTextLabel;
  }
  return trimmed;
};

const resolveStdScriptLabel = (token: string): string | null =>
  STD_SCRIPT_LABEL_BY_ID[token.trim()] ?? null;

const setBufferedString = (
  runtime: ScriptRuntimeState,
  target: string,
  value: string
): void => {
  runtime.stringVars[target.trim()] = value;
};

const formatMoveName = (value: string): string =>
  value
    .replace(/^MOVE_/u, '')
    .replace(/_/gu, ' ')
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .toUpperCase();

const normalizeSpeciesId = (value: string): string =>
  value.replace(/^SPECIES_/u, '').toUpperCase();

const resolveItemIdToken = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string | null => {
  const trimmed = token.trim();
  if (trimmed.startsWith('ITEM_')) {
    return trimmed;
  }

  const resolved = resolveScriptValue(trimmed, runtime, player);
  if (typeof resolved === 'string' && resolved.startsWith('ITEM_')) {
    return resolved;
  }

  if (typeof resolved === 'number') {
    return itemConstantMaps.byValue.get(resolved) ?? null;
  }

  const constantValue = itemConstantMaps.byName.get(trimmed);
  return constantValue === undefined ? null : itemConstantMaps.byValue.get(constantValue) ?? null;
};

const resolveItemCount = (
  token: string | undefined,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): number =>
  Math.max(1, resolveNumericExpression(token ?? '1', runtime, player));

const resolveSpeciesIdToken = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string | null => {
  const trimmed = token.trim();
  if (trimmed.startsWith('SPECIES_')) {
    return normalizeSpeciesId(trimmed);
  }

  const resolved = resolveScriptValue(trimmed, runtime, player);
  if (typeof resolved === 'string' && resolved.startsWith('SPECIES_')) {
    return normalizeSpeciesId(resolved);
  }

  if (typeof resolved === 'number') {
    const speciesToken = speciesConstantMaps.byValue.get(resolved);
    return speciesToken ? normalizeSpeciesId(speciesToken) : null;
  }

  return null;
};

const resolveMonPicSpeciesToken = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string | null => {
  const speciesId = resolveSpeciesIdToken(token, runtime, player);
  return speciesId ? `SPECIES_${speciesId}` : null;
};

const resolveObjectEventIdToken = (
  token: string,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  npcs: readonly NpcState[]
): string | null => {
  const trimmed = token.trim();

  if (trimmed === 'VAR_LAST_TALKED') {
    return dialogue.speakerId && dialogue.speakerId !== 'system' && dialogue.speakerId !== 'sign'
      ? dialogue.speakerId
      : null;
  }

  if (npcs.some((npc) => npc.id === trimmed)) {
    return trimmed;
  }

  const resolved = resolveScriptValue(trimmed, runtime);
  if (typeof resolved === 'string' && npcs.some((npc) => npc.id === resolved)) {
    return resolved;
  }

  if (typeof resolved === 'number') {
    const resolvedId = `${resolved}`;
    if (npcs.some((npc) => npc.id === resolvedId)) {
      return resolvedId;
    }
  }

  return null;
};

const LOCALID_NONE = 0;
const LOCALID_PLAYER = 0xff;
const LOCALID_CAMERA = 0xfe;
const SCRIPT_MOVEMENT_MAP_NUM = 0;
const SCRIPT_MOVEMENT_MAP_GROUP = 0;

type MovementActor = (PlayerState | NpcState | NonNullable<ScriptRuntimeState['fieldCamera']>) & {
  facingLocked?: boolean;
  movementDirection?: PlayerState['facing'];
  previousMovementDirection?: PlayerState['facing'];
  movementDelayFrames?: number;
  lastMovementActionId?: number;
  lastStartedMovementActionId?: number;
  animationDisabled?: boolean;
  activeEmote?: string;
  affineAnimInitialized?: boolean;
  fixedPriority?: boolean;
  invisible?: boolean;
};

const scriptMovementActors = new WeakMap<ScriptRuntimeState, Map<number, MovementActor>>();
const scriptMovementActionOffsets = new WeakMap<ScriptRuntimeState, Map<number, number>>();

const bindScriptMovementActor = (
  runtime: ScriptRuntimeState,
  localId: number,
  actor: MovementActor | null
): void => {
  if (!actor) {
    return;
  }

  let actors = scriptMovementActors.get(runtime);
  if (!actors) {
    actors = new Map<number, MovementActor>();
    scriptMovementActors.set(runtime, actors);
  }
  actors.set(localId, actor);
};

const getAllocatedMovementLocalId = (runtime: ScriptRuntimeState, key: string): number => {
  const existing = runtime.scriptMovementLocalIds[key];
  if (existing !== undefined) {
    return existing;
  }

  let next = runtime.nextScriptMovementLocalId;
  while (next === LOCALID_NONE || next === LOCALID_CAMERA || next === LOCALID_PLAYER) {
    next += 1;
  }
  runtime.scriptMovementLocalIds[key] = next;
  runtime.nextScriptMovementLocalId = next + 1;
  return next;
};

const ensureScriptMovementObjectEvent = (
  runtime: ScriptRuntimeState,
  localId: number
): void => {
  if (runtime.scriptMovement.objectEvents.some((event) =>
    event.localId === localId
      && event.mapNum === SCRIPT_MOVEMENT_MAP_NUM
      && event.mapGroup === SCRIPT_MOVEMENT_MAP_GROUP
  )) {
    return;
  }

  const objectEventId = runtime.scriptMovement.objectEvents.length;
  runtime.scriptMovement.objectEvents[objectEventId] = createMovementObjectEvent(
    objectEventId,
    localId,
    SCRIPT_MOVEMENT_MAP_NUM,
    SCRIPT_MOVEMENT_MAP_GROUP
  );
};

const resolveMovementTarget = (
  token: string,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): { localId: number; actor: MovementActor | null } => {
  const trimmed = token.trim();
  if (trimmed === 'LOCALID_NONE') {
    return { localId: LOCALID_NONE, actor: null };
  }
  if (trimmed === 'LOCALID_PLAYER') {
    return { localId: LOCALID_PLAYER, actor: player ?? null };
  }
  if (trimmed === 'LOCALID_CAMERA') {
    return { localId: LOCALID_CAMERA, actor: runtime.fieldCamera?.active ? runtime.fieldCamera : null };
  }

  const objectEventId = resolveObjectEventIdToken(trimmed, dialogue, runtime, npcs);
  if (objectEventId) {
    const actor = npcs.find((candidate) => candidate.id === objectEventId) ?? null;
    const resolved = resolveScriptValue(trimmed, runtime, player);
    const localId = typeof resolved === 'number'
      ? resolved
      : getAllocatedMovementLocalId(runtime, `npc:${objectEventId}`);
    return { localId, actor };
  }

  const resolved = resolveScriptValue(trimmed, runtime, player);
  if (typeof resolved === 'number') {
    return { localId: resolved, actor: null };
  }

  return {
    localId: getAllocatedMovementLocalId(runtime, `token:${trimmed}`),
    actor: null
  };
};

const startDecompScriptMovement = (
  session: FieldScriptSessionState,
  targetToken: string,
  movementLabel: string,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void => {
  const target = resolveMovementTarget(targetToken, dialogue, runtime, player, npcs);
  const actionScript = getDecompMovementActionScript(movementLabel);
  if (!actionScript) {
    return;
  }

  if (target.localId !== LOCALID_NONE) {
    ensureScriptMovementObjectEvent(runtime, target.localId);
    bindScriptMovementActor(runtime, target.localId, target.actor);
    scriptMovementStartObjectMovementScript(
      runtime.scriptMovement,
      target.localId,
      SCRIPT_MOVEMENT_MAP_NUM,
      SCRIPT_MOVEMENT_MAP_GROUP,
      actionScript
    );
    session.movingLocalId = target.localId;
  }
};

const isDecompScriptMovementFinished = (
  runtime: ScriptRuntimeState,
  localId: number
): boolean => {
  if (localId === LOCALID_NONE || getMoveObjectsTaskId(runtime.scriptMovement) === TAIL_SENTINEL) {
    return true;
  }

  return scriptMovementIsObjectMovementFinished(
    runtime.scriptMovement,
    localId,
    SCRIPT_MOVEMENT_MAP_NUM,
    SCRIPT_MOVEMENT_MAP_GROUP
  );
};

const applyNewScriptMovementActorActions = (
  runtime: ScriptRuntimeState,
  player?: PlayerState
): void => {
  const actors = scriptMovementActors.get(runtime);
  if (!actors) {
    return;
  }

  let offsets = scriptMovementActionOffsets.get(runtime);
  if (!offsets) {
    offsets = new Map<number, number>();
    scriptMovementActionOffsets.set(runtime, offsets);
  }

  for (const objectEvent of runtime.scriptMovement.objectEvents) {
    const actor = actors.get(objectEvent.localId);
    if (!actor) {
      continue;
    }

    const appliedCount = offsets.get(objectEvent.id) ?? 0;
    for (let i = appliedCount; i < objectEvent.heldMovements.length; i += 1) {
      applyMovementAction(actor, getDecompMovementActionById(objectEvent.heldMovements[i]!), player);
    }
    offsets.set(objectEvent.id, objectEvent.heldMovements.length);
  }
};

const tickDecompScriptMovement = (
  runtime: ScriptRuntimeState,
  player?: PlayerState
): void => {
  const taskId = getMoveObjectsTaskId(runtime.scriptMovement);
  if (taskId === TAIL_SENTINEL) {
    return;
  }

  scriptMovementMoveObjects(runtime.scriptMovement, taskId);
  applyNewScriptMovementActorActions(runtime, player);
};

const resolveFacingDirection = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): PlayerState['facing'] | null => {
  const trimmed = token.trim();
  const resolved = resolveScriptValue(trimmed, runtime, player);
  if (typeof resolved === 'number') {
    return DIR_TO_FACING[resolved] ?? null;
  }
  if (typeof resolved === 'string') {
    return DIR_TO_FACING[resolved] ?? null;
  }
  return DIR_TO_FACING[trimmed] ?? null;
};

const facingFromMovementTypeToken = (token: string): PlayerState['facing'] | null => {
  switch (token.trim()) {
    case 'MOVEMENT_TYPE_FACE_UP':
      return 'up';
    case 'MOVEMENT_TYPE_FACE_DOWN':
      return 'down';
    case 'MOVEMENT_TYPE_FACE_LEFT':
      return 'left';
    case 'MOVEMENT_TYPE_FACE_RIGHT':
      return 'right';
    default:
      return null;
  }
};

const MOVEMENT_DIRECTION_DELTAS: Record<PlayerState['facing'], { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const COMMON_MOVEMENT_FALLBACKS: Record<string, string[]> = {
  Common_Movement_FacePlayer: ['face_player', 'step_end'],
  Common_Movement_FaceAwayPlayer: ['face_away_player', 'step_end'],
  Common_Movement_FaceOriginalDirection: ['face_original_direction', 'step_end'],
  Common_Movement_WalkInPlaceFasterLeft: ['walk_in_place_faster_left', 'step_end'],
  Common_Movement_WalkInPlaceFasterUp: ['walk_in_place_faster_up', 'step_end'],
  Common_Movement_WalkInPlaceFasterRight: ['walk_in_place_faster_right', 'step_end'],
  Common_Movement_WalkInPlaceFasterDown: ['walk_in_place_faster_down', 'step_end'],
  Common_Movement_FaceRight: ['face_right', 'step_end'],
  Common_Movement_FaceDown: ['face_down', 'step_end']
};

const getMovementScriptLines = (movementLabel: string): string[] | null =>
  scriptBlocks.get(movementLabel) ?? COMMON_MOVEMENT_FALLBACKS[movementLabel] ?? null;

export const getDecompMovementActionScript = (movementLabel: string): number[] | null => {
  const movementLines = getMovementScriptLines(movementLabel);
  if (!movementLines) {
    return null;
  }

  const actionIds: number[] = [];
  for (const rawLine of movementLines) {
    const command = rawLine.trim();
    if (command.length === 0 || command.startsWith('.')) {
      continue;
    }
    const action = getDecompMovementActionForCommand(command);
    actionIds.push(action.actionId);
    if (command === 'step_end') {
      break;
    }
  }

  return actionIds;
};

const setMovementActorDirection = (actor: MovementActor, facing: PlayerState['facing']): void => {
  actor.previousMovementDirection = actor.facing;
  actor.movementDirection = facing;
  if (!actor.facingLocked) {
    actor.facing = facing;
  }
};

const faceActorTowardTarget = (
  actor: MovementActor,
  target: PlayerState | NpcState,
  away = false
): void => {
  const dx = target.position.x - actor.position.x;
  const dy = target.position.y - actor.position.y;
  let facing: PlayerState['facing'];
  if (Math.abs(dx) >= Math.abs(dy)) {
    facing = dx >= 0 ? 'right' : 'left';
  } else {
    facing = dy >= 0 ? 'down' : 'up';
  }

  if (away) {
    facing = facing === 'up' ? 'down'
      : facing === 'down' ? 'up'
        : facing === 'left' ? 'right'
          : 'left';
  }

  setMovementActorDirection(actor, facing);
};

const moveActorTiles = (actor: MovementActor, facing: PlayerState['facing'], distanceTiles: number): void => {
  const delta = MOVEMENT_DIRECTION_DELTAS[facing];
  const tileSize = 16;
  setMovementActorDirection(actor, facing);
  actor.position = vec2(
    actor.position.x + delta.x * tileSize * distanceTiles,
    actor.position.y + delta.y * tileSize * distanceTiles
  );
  actor.previousTile = actor.currentTile ? vec2(actor.currentTile.x, actor.currentTile.y) : undefined;
  actor.currentTile = vec2(Math.round(actor.position.x / tileSize), Math.round(actor.position.y / tileSize));
  if ('moving' in actor) {
    actor.moving = false;
  }
  if ('stepTarget' in actor) {
    delete actor.stepTarget;
  }
  if ('stepDirection' in actor) {
    delete actor.stepDirection;
  }
};

const moveNpcToScriptTile = (npc: NpcState, x: number, y: number, permanent: boolean): void => {
  const tile = vec2(x, y);
  npc.position = vec2(x * 16, y * 16);
  npc.previousTile = vec2(tile.x, tile.y);
  npc.currentTile = vec2(tile.x, tile.y);
  if (permanent) {
    npc.initialTile = vec2(tile.x, tile.y);
  }
  npc.moving = false;
  npc.animationTime = 0;
  delete npc.stepTarget;
  delete npc.stepDirection;
};

const doorAnimationKey = (x: number, y: number): string => `${x},${y}`;

const DOOR_ANIMATION_FRAME_COUNT = 20;

const startDoorAnimationTask = (runtime: ScriptRuntimeState, key: string): void => {
  runtime.doorAnimationTask = {
    active: true,
    framesRemaining: DOOR_ANIMATION_FRAME_COUNT,
    key
  };
};

const updateDoorAnimationTask = (runtime: ScriptRuntimeState): boolean => {
  if (!runtime.doorAnimationTask.active) {
    return false;
  }

  if (runtime.doorAnimationTask.framesRemaining > 1) {
    runtime.doorAnimationTask.framesRemaining -= 1;
    return true;
  }

  runtime.doorAnimationTask = {
    active: false,
    framesRemaining: 0,
    key: runtime.doorAnimationTask.key
  };
  return false;
};

const updateFameCheckerPickState = (runtime: ScriptRuntimeState, person: number, pickState: number): void => {
  if (person < 0 || person >= 16 || pickState < 0 || pickState >= 3) {
    return;
  }
  if (pickState === 0) {
    return;
  }
  if (pickState === 1 && runtime.fameChecker.pickStates[person] === 2) {
    return;
  }
  runtime.fameChecker.pickStates[person] = pickState;
};

const setFameCheckerFlavorTextFlag = (runtime: ScriptRuntimeState, person: number, flag: number): void => {
  if (person < 0 || person >= 16 || flag < 0 || flag >= 6) {
    return;
  }
  runtime.fameChecker.flavorTextFlags[person] = (runtime.fameChecker.flavorTextFlags[person] ?? 0) | (1 << flag);
  runtime.vars.VAR_0x8005 = 1;
  updateFameCheckerPickState(runtime, person, 1);
};

const getDefaultMapMusicForScriptSession = (session: FieldScriptSessionState): number | null => {
  const entries = [...defaultMapMusicByScriptPrefix.entries()]
    .sort(([left], [right]) => right.length - left.length);
  for (const [scriptPrefix, music] of entries) {
    if (
      session.rootScriptId === scriptPrefix
      || session.rootScriptId.startsWith(`${scriptPrefix}_`)
      || session.currentLabel === scriptPrefix
      || session.currentLabel.startsWith(`${scriptPrefix}_`)
    ) {
      return music;
    }
  }
  return null;
};

const recordFieldSpecialEffect = (
  runtime: ScriptRuntimeState,
  specialName: string
): void => {
  runtime.fieldEffects.triggeredSpecials[specialName] = (runtime.fieldEffects.triggeredSpecials[specialName] ?? 0) + 1;
};

const resolveMapIdToken = (
  token: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string => `${resolveScriptValue(token, runtime, player)}`;

const parseWarpDestinationArgs = (
  argsLine: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): { mapId: string; warpId: number; x: number; y: number } | null => {
  const args = parseCommandArgs(argsLine);
  if (args.length !== 3 && args.length !== 4) {
    return null;
  }

  const [mapToken, secondToken, thirdToken, fourthToken] = args;
  if (!mapToken || !secondToken || !thirdToken) {
    return null;
  }

  return {
    mapId: resolveMapIdToken(mapToken, runtime, player),
    warpId: fourthToken ? resolveNumericExpression(secondToken, runtime, player) : 255,
    x: resolveNumericExpression(fourthToken ? thirdToken : secondToken, runtime, player),
    y: resolveNumericExpression(fourthToken ?? thirdToken, runtime, player)
  };
};

const applyMovementAction = (
  actor: MovementActor,
  action: DecompMovementAction,
  player?: PlayerState
): void => {
  actor.lastMovementActionId = action.actionId;
  if (action.kind !== 'none') {
    actor.lastStartedMovementActionId = action.actionId;
  }

  if (action.kind === 'none') {
    return;
  }

  if (action.command === 'face_player') {
    if (player && actor !== player) {
      faceActorTowardTarget(actor, player);
    }
    return;
  }

  if (action.command === 'face_away_player') {
    if (player && actor !== player) {
      faceActorTowardTarget(actor, player, true);
    }
    return;
  }

  if (action.command === 'face_original_direction') {
    if ('initialFacing' in actor && actor.initialFacing) {
      setMovementActorDirection(actor, actor.initialFacing);
    }
    return;
  }

  if (action.kind === 'delay') {
    actor.movementDelayFrames = (actor.movementDelayFrames ?? 0) + (action.durationFrames ?? 0);
    return;
  }

  if (action.kind === 'visibility') {
    actor.invisible = action.visible === false;
    return;
  }

  if (action.kind === 'facingLock') {
    actor.facingLocked = action.locked;
    return;
  }

  if (action.kind === 'animation') {
    actor.animationDisabled = action.animationDisabled;
    return;
  }

  if (action.kind === 'emote') {
    actor.activeEmote = action.emote;
    return;
  }

  if (action.kind === 'fixedPriority') {
    actor.fixedPriority = action.fixedPriority;
    return;
  }

  if (action.kind === 'affine') {
    actor.affineAnimInitialized = action.actionId === 0x6c;
    return;
  }

  if (!action.direction) {
    return;
  }

  if (action.kind === 'face' || action.kind === 'jumpInPlace') {
    setMovementActorDirection(actor, action.direction);
    return;
  }

  if (action.kind === 'step' || action.kind === 'jump') {
    moveActorTiles(actor, action.direction, action.distanceTiles ?? 1);
  }
};

const applyMovementCommand = (
  actor: MovementActor,
  command: string,
  player?: PlayerState
): void => {
  applyMovementAction(actor, getDecompMovementActionForCommand(command), player);
};

export const applyDecompMovementScript = (
  actor: MovementActor,
  movementLabel: string,
  player?: PlayerState
): boolean => {
  const movementLines = getMovementScriptLines(movementLabel);
  if (!movementLines) {
    return false;
  }

  for (const rawLine of movementLines) {
    const command = rawLine.trim();
    if (command.length === 0 || command.startsWith('.')) {
      continue;
    }
    applyMovementCommand(actor, command, player);
    if (command === 'step_end') {
      break;
    }
  }

  return true;
};

const callScriptLabel = (
  session: FieldScriptSessionState,
  label: string
): void => {
  session.callStack.push({
    label: session.currentLabel,
    lineIndex: session.lineIndex
  });
  jumpSession(session, label);
};

const openDialoguePages = (
  dialogue: DialogueState,
  speakerId: string,
  pages: string[],
  {
    frame = 'std',
    autoScroll = false,
    font = 'normal',
    textSpeed = 'mid'
  }: {
    frame?: FieldMessageBoxFrame;
    autoScroll?: boolean;
    font?: FieldMessageBoxFont;
    textSpeed?: FieldTextSpeed;
  } = {}
): void => {
  dialogue.active = pages.length > 0;
  dialogue.speakerId = speakerId;
  dialogue.queue = [...pages];
  dialogue.queueIndex = 0;
  dialogue.text = dialogue.queue[0] ?? '';
  dialogue.choice = null;
  dialogue.shop = null;
  hideFieldMessageBox(dialogue.fieldMessageBox);
  if (pages.length > 0) {
    if (autoScroll) {
      showFieldAutoScrollMessage(dialogue.fieldMessageBox, frame);
    } else {
      showFieldMessage(dialogue.fieldMessageBox, frame);
    }
    dialogue.fieldMessageBox.font = font;
    startFieldTextPrinter(dialogue.fieldMessageBox, dialogue.text, textSpeed);
  }
};

const clearVisibleDialogue = (dialogue: DialogueState): void => {
  dialogue.active = false;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
  dialogue.choice = null;
  dialogue.shop = null;
  hideFieldMessageBox(dialogue.fieldMessageBox);
};

const finishDialogueSession = (dialogue: DialogueState): void => {
  dialogue.scriptSession = null;
  dialogue.choice = null;
  dialogue.shop = null;
  if (!dialogue.active) {
    dialogue.speakerId = null;
  }
};

export const cloneFieldScriptSession = (
  session: FieldScriptSessionState
): FieldScriptSessionState => ({
  rootScriptId: session.rootScriptId,
  currentLabel: session.currentLabel,
  lineIndex: session.lineIndex,
  lastTrainerId: session.lastTrainerId,
  hiddenItemFlag: session.hiddenItemFlag,
  loadedPointerTextLabel: session.loadedPointerTextLabel,
  callStack: session.callStack.map((frame) => ({ ...frame })),
  waitingFor: session.waitingFor,
  movingLocalId: session.movingLocalId,
  waitingMovementLocalId: session.waitingMovementLocalId,
  suspendedChoice: session.suspendedChoice ? {
    ...session.suspendedChoice,
    options: [...session.suspendedChoice.options]
  } : null,
  specialState: session.specialState ? { ...session.specialState } : null,
  messageBoxFrame: session.messageBoxFrame,
  messageBoxAutoScroll: session.messageBoxAutoScroll
});

const createFieldScriptSessionAtLabel = (
  session: FieldScriptSessionState,
  label: string,
  lastTrainerId: string | null
): FieldScriptSessionState => ({
  rootScriptId: session.rootScriptId,
  currentLabel: label,
  lineIndex: 0,
  lastTrainerId,
  hiddenItemFlag: session.hiddenItemFlag,
  loadedPointerTextLabel: session.loadedPointerTextLabel,
  callStack: [],
  waitingFor: null,
  movingLocalId: session.movingLocalId,
  waitingMovementLocalId: null,
  suspendedChoice: null,
  specialState: null,
  messageBoxFrame: session.messageBoxFrame,
  messageBoxAutoScroll: session.messageBoxAutoScroll
});

const hasTrainerBeenFought = (
  runtime: ScriptRuntimeState,
  trainerId: string
): boolean => runtime.flags.has(getDecompTrainerFlag(trainerId));

const queueDecompTrainerBattle = (
  runtime: ScriptRuntimeState,
  trainerId: string,
  format: 'singles' | 'doubles' = 'singles'
): boolean => {
  const definition = getDecompTrainerDefinition(trainerId);
  if (!definition || definition.party.length === 0) {
    return false;
  }

  runtime.pendingTrainerBattle = {
    trainerId,
    trainerName: definition.trainerName,
    defeatFlag: getDecompTrainerFlag(trainerId),
    trainerClass: definition.trainerClass,
    format,
    victoryFlags: [],
    trainerItems: [...definition.trainerItems],
    trainerAiFlags: [...definition.trainerAiFlags],
    opponentParty: definition.party.map((entry) => {
      const pokemon = entry.moveIds && entry.moveIds.length > 0
        ? createBattlePokemonFromSpeciesWithMoves(entry.species, entry.level, entry.moveIds, {
          heldItemId: entry.heldItemId ?? null
        })
        : createBattlePokemonFromSpecies(entry.species, entry.level);
      pokemon.heldItemId = entry.heldItemId ?? pokemon.heldItemId;
      return pokemon;
    }),
    started: false,
    resolved: false,
    result: null,
    continueScriptSession: null
  };
  return true;
};

const jumpSession = (session: FieldScriptSessionState, target: string): void => {
  session.currentLabel = target;
  session.lineIndex = 0;
};

const popCallStack = (session: FieldScriptSessionState): boolean => {
  const frame = session.callStack.pop();
  if (!frame) {
    return false;
  }

  session.currentLabel = frame.label;
  session.lineIndex = frame.lineIndex;
  return true;
};

const evaluateSwitchCases = (
  session: FieldScriptSessionState,
  lines: string[],
  switchValue: ScriptValue,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): boolean => {
  while (session.lineIndex < lines.length) {
    const line = lines[session.lineIndex]?.trim() ?? '';
    if (line.length === 0) {
      session.lineIndex += 1;
      continue;
    }

    const caseMatch = line.match(/^case\s+([^,]+),\s*([A-Za-z0-9_]+)/u);
    if (!caseMatch) {
      return false;
    }

    session.lineIndex += 1;
    if (resolveScriptValue(caseMatch[1], runtime, player) === switchValue) {
      jumpSession(session, caseMatch[2]);
      return true;
    }
  }

  return false;
};

const startChoicePrompt = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  options: string[],
  {
    kind,
    tilemapLeft,
    tilemapTop,
    columns = 1,
    ignoreCancel = false,
    cancelValue = SCR_MENU_CANCEL,
    maxVisibleOptions,
    reopenAfterSelection = false,
    listMenuId
  }: {
    kind: DialogueChoiceState['kind'];
    tilemapLeft: number;
    tilemapTop: number;
    columns?: number;
    ignoreCancel?: boolean;
    cancelValue?: number;
    maxVisibleOptions?: number;
    reopenAfterSelection?: boolean;
    listMenuId?: string;
  }
): void => {
  dialogue.active = true;
  dialogue.choice = {
    kind,
    options,
    selectedIndex: 0,
    columns: Math.max(1, columns),
    tilemapLeft,
    tilemapTop,
    ignoreCancel,
    cancelValue,
    wrapAround: columns === 1 && options.length > 3,
    maxVisibleOptions,
    scrollOffset: 0,
    reopenAfterSelection,
    listMenuId
  };
  session.waitingFor = 'choice';
};

const openCenterPcMenuChoice = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  runtime: ScriptRuntimeState
): void => {
  startChoicePrompt(dialogue, session, getCenterPcMenuOptions(runtime), {
    kind: 'multichoice',
    tilemapLeft: 0,
    tilemapTop: 0
  });
};

const openBedroomPcMenuChoice = (
  dialogue: DialogueState,
  session: FieldScriptSessionState
): void => {
  if (session.specialState?.kind === 'playerPc') {
    session.specialState.phase = 'playerPcTopMenu';
  }
  startChoicePrompt(dialogue, session, getBedroomPcMenuOptions(), {
    kind: 'multichoice',
    tilemapLeft: 1,
    tilemapTop: 1,
    cancelValue: 2
  });
};

const openPlayerPcItemStorageMenuChoice = (
  dialogue: DialogueState,
  session: FieldScriptSessionState
): void => {
  if (session.specialState?.kind === 'playerPc') {
    session.specialState.phase = 'playerPcItemStorageMenu';
  }
  startChoicePrompt(dialogue, session, ['WITHDRAW ITEM', 'DEPOSIT ITEM', 'CANCEL'], {
    kind: 'multichoice',
    tilemapLeft: 1,
    tilemapTop: 1,
    cancelValue: 2
  });
};

const getPlayerPcItemSlots = (runtime: ScriptRuntimeState): Array<{ itemId: string; quantity: number }> =>
  runtime.newGame.pcItems.filter((slot) => slot.itemId !== 'ITEM_NONE' && slot.quantity > 0);

const removePlayerPcItem = (
  runtime: ScriptRuntimeState,
  index: number,
  quantity: number
): { itemId: string; quantity: number } | null => {
  const slots = getPlayerPcItemSlots(runtime);
  const slot = slots[index];
  if (!slot || quantity <= 0 || slot.quantity < quantity) {
    return null;
  }

  slot.quantity -= quantity;
  const itemId = slot.itemId;
  runtime.newGame.pcItems = runtime.newGame.pcItems.filter((entry) => entry.itemId !== 'ITEM_NONE' && entry.quantity > 0);
  return { itemId, quantity };
};

const addPlayerPcItem = (
  runtime: ScriptRuntimeState,
  itemId: string,
  quantity: number
): boolean => {
  if (quantity <= 0 || itemId === 'ITEM_NONE') {
    return false;
  }

  const existing = runtime.newGame.pcItems.find((slot) => slot.itemId === itemId);
  if (existing) {
    if (existing.quantity + quantity > 999) {
      return false;
    }
    existing.quantity += quantity;
    return true;
  }

  if (getPlayerPcItemSlots(runtime).length >= 30) {
    return false;
  }

  runtime.newGame.pcItems.push({ itemId, quantity });
  return true;
};

const getBagItemSlotsForPlayerPc = (runtime: ScriptRuntimeState): Array<{ itemId: string; quantity: number }> =>
  runtime.bag.pockets.items.filter((slot) => slot.itemId !== 'ITEM_NONE' && slot.quantity > 0);

const formatPlayerPcItemLabel = (slot: { itemId: string; quantity: number }): string => {
  const item = getItemDefinition(slot.itemId);
  return slot.quantity > 1 ? `${item.name} x${slot.quantity}` : item.name;
};

const openPlayerPcMessage = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  text: string,
  nextPhase: PcSpecialState['phase']
): void => {
  if (session.specialState?.kind === 'playerPc') {
    session.specialState.phase = nextPhase;
  }
  openDialoguePages(dialogue, dialogue.speakerId ?? 'system', [text]);
  session.waitingFor = 'text';
};

const openPlayerPcWithdrawList = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  runtime: ScriptRuntimeState
): void => {
  const slots = getPlayerPcItemSlots(runtime);
  if (slots.length === 0) {
    openPlayerPcMessage(dialogue, session, 'There are no items.', 'playerPcReturnToItemStorageMenu');
    return;
  }

  if (session.specialState?.kind === 'playerPc') {
    session.specialState.phase = 'playerPcWithdrawList';
  }
  startChoicePrompt(dialogue, session, [...slots.map(formatPlayerPcItemLabel), 'CANCEL'], {
    kind: 'listmenu',
    tilemapLeft: 1,
    tilemapTop: 1,
    cancelValue: slots.length,
    maxVisibleOptions: 8
  });
};

const openPlayerPcDepositList = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  runtime: ScriptRuntimeState
): void => {
  const slots = getBagItemSlotsForPlayerPc(runtime);
  if (slots.length === 0) {
    openPlayerPcMessage(dialogue, session, 'There are no items.', 'playerPcReturnToItemStorageMenu');
    return;
  }

  if (session.specialState?.kind === 'playerPc') {
    session.specialState.phase = 'playerPcDepositList';
  }
  startChoicePrompt(dialogue, session, [...slots.map(formatPlayerPcItemLabel), 'CANCEL'], {
    kind: 'listmenu',
    tilemapLeft: 1,
    tilemapTop: 1,
    cancelValue: slots.length,
    maxVisibleOptions: 8
  });
};

const openPlayerPcMailboxList = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  runtime: ScriptRuntimeState
): void => {
  const mails = runtime.newGame.mail.filter((mail) => mail.itemId !== null);
  if (mails.length === 0) {
    openPlayerPcMessage(dialogue, session, "There's no mail here.", 'playerPcReturnToTopMenu');
    return;
  }

  if (session.specialState?.kind === 'playerPc') {
    session.specialState.phase = 'playerPcMailboxList';
  }
  startChoicePrompt(dialogue, session, [...mails.map((mail) => `${mail.playerName}'s mail`), 'CANCEL'], {
    kind: 'listmenu',
    tilemapLeft: 1,
    tilemapTop: 1,
    cancelValue: mails.length,
    maxVisibleOptions: 8
  });
};

const setRuntimeScriptValue = (
  runtime: ScriptRuntimeState,
  key: string,
  value: ScriptValue
): void => {
  (runtime.vars as Record<string, ScriptValue>)[key] = value;
};

const getPartyMonAt = (
  runtime: ScriptRuntimeState,
  slot: number
) => runtime.party[slot] ?? null;

const selectFirstPartyMonSlot = (
  runtime: ScriptRuntimeState,
  predicate: (slot: number) => boolean = () => true
): number => {
  for (let slot = 0; slot < runtime.party.length; slot += 1) {
    if (predicate(slot)) {
      return slot;
    }
  }
  return runtime.party.length;
};

const choosePartyMonIntoVar = (
  runtime: ScriptRuntimeState,
  predicate?: (slot: number) => boolean
): void => {
  const slot = selectFirstPartyMonSlot(runtime, predicate);
  runtime.vars.VAR_0x8004 = slot;
  runtime.vars.VAR_RESULT = slot;
};

const getCancelPartySlotValue = (): number => getPartySizeConstant();

const getMonDisplayNameForBuffer = (runtime: ScriptRuntimeState, slot: number): string => {
  const pokemon = getPartyMonAt(runtime, slot);
  return pokemon ? getFieldPokemonDisplayName(pokemon) : '';
};

const getPartyMonMoveCount = (runtime: ScriptRuntimeState, slot: number): number => {
  const pokemon = getPartyMonAt(runtime, slot);
  if (!pokemon) {
    return 0;
  }

  if (pokemon.moves && pokemon.moves.length > 0) {
    return pokemon.moves.length;
  }

  const storedCount = runtime.vars[`partyMonMoveCount_${slot}`];
  return Math.max(1, Math.min(4, storedCount ?? 4));
};

const getPartyMonMoveName = (runtime: ScriptRuntimeState, slot: number, moveIndex: number): string => {
  const pokemon = getPartyMonAt(runtime, slot);
  const storedMove = pokemon?.moves?.[moveIndex]?.trim();
  if (storedMove) {
    return storedMove;
  }

  const stored = runtime.stringVars[`partyMonMove_${slot}_${moveIndex}`]?.trim();
  if (stored) {
    return stored;
  }

  switch (moveIndex) {
    case 0:
      return 'TACKLE';
    case 1:
      return 'GROWL';
    case 2:
      return 'TAIL WHIP';
    case 3:
      return 'QUICK ATTACK';
    default:
      return 'TACKLE';
  }
};

const getPlayerTrainerId = (runtime: ScriptRuntimeState): number =>
  Math.trunc(runtime.vars.playerTrainerId ?? 0) >>> 0;

const getPartyMonOtId = (runtime: ScriptRuntimeState, slot: number): number =>
  Math.trunc(getPartyMonAt(runtime, slot)?.otId ?? runtime.vars[`partyMonOtId_${slot}`] ?? getPlayerTrainerId(runtime)) >>> 0;

const getPartyMonOtName = (runtime: ScriptRuntimeState, slot: number): string =>
  getPartyMonAt(runtime, slot)?.otName ?? runtime.stringVars[`partyMonOtName_${slot}`] ?? runtime.startMenu.playerName;

const getDaycareSlotName = (slot: number): string => `daycareMon${slot + 1}`;
const DAYCARE_DATA_KEY = (slot: number): string => `daycareMonData_${slot}`;
const ROUTE5_DAYCARE_DATA_KEY = 'route5DaycareMonData';
const PC_BOX_CAPACITY = 30;

const serializeFieldPokemon = (pokemon: FieldPokemon): string => JSON.stringify(pokemon);

const deserializeFieldPokemon = (value: string | undefined): FieldPokemon | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as FieldPokemon;
    return typeof parsed.species === 'string' ? parsed : null;
  } catch {
    return null;
  }
};

const createFieldPokemonFromSpeciesToken = (
  species: string,
  level: number,
  runtime: ScriptRuntimeState,
  {
    isEgg = false
  }: {
    isEgg?: boolean;
  } = {}
): FieldPokemon => {
  const snapshot = createBattlePokemonFromSpecies(species, level);
  return {
    species: snapshot.species,
    nickname: isEgg ? 'EGG' : getSpeciesDisplayName(snapshot.species),
    moves: snapshot.moves.map((move) => move.name),
    otName: runtime.startMenu.playerName,
    otId: getPlayerTrainerId(runtime),
    friendship: snapshot.friendship,
    isEgg,
    heldItemId: snapshot.heldItemId,
    level: snapshot.level,
    expProgress: snapshot.expProgress,
    evs: {
      hp: snapshot.evs.hp,
      attack: snapshot.evs.attack,
      defense: snapshot.evs.defense,
      speed: snapshot.evs.speed,
      spAttack: snapshot.evs.spAttack,
      spDefense: snapshot.evs.spDefense
    },
    maxHp: snapshot.maxHp,
    hp: snapshot.hp,
    attack: snapshot.attack,
    defense: snapshot.defense,
    speed: snapshot.speed,
    spAttack: snapshot.spAttack,
    spDefense: snapshot.spDefense,
    catchRate: snapshot.catchRate,
    types: [...snapshot.types],
    status: 'none'
  };
};

const getNextPcBoxWithSpace = (
  runtime: ScriptRuntimeState
): { boxIndex: number; currentBoxWasFull: boolean } | null => {
  const startIndex = runtime.pcStorage.currentBox;
  const boxes = runtime.pcStorage.boxes;
  for (let offset = 0; offset < boxes.length; offset += 1) {
    const boxIndex = (startIndex + offset) % boxes.length;
    if (boxes[boxIndex] && boxes[boxIndex]!.length < PC_BOX_CAPACITY) {
      return {
        boxIndex,
        currentBoxWasFull: boxIndex !== startIndex
      };
    }
  }
  return null;
};

const storePokemonInPc = (
  runtime: ScriptRuntimeState,
  pokemon: FieldPokemon
): 1 | 2 => {
  const target = getNextPcBoxWithSpace(runtime);
  if (!target) {
    return 2;
  }

  runtime.pcStorage.boxes[target.boxIndex]!.push(JSON.parse(serializeFieldPokemon(pokemon)) as FieldPokemon);
  setRuntimeScriptValue(runtime, 'VAR_PC_BOX_TO_SEND_MON', target.boxIndex);
  runtime.vars.pcBoxWasFullMessage = target.currentBoxWasFull ? 1 : 0;
  if (target.currentBoxWasFull) {
    setRuntimeScriptValue(runtime, 'pcNextBoxToSendMon', target.boxIndex);
  } else {
    setRuntimeScriptValue(runtime, 'pcNextBoxToSendMon', target.boxIndex);
  }
  return 1;
};

const storeGiftPokemon = (
  runtime: ScriptRuntimeState,
  pokemon: FieldPokemon
): 0 | 1 | 2 => {
  if (runtime.party.length < 6) {
    runtime.party.push(pokemon);
    return 0;
  }

  return storePokemonInPc(runtime, pokemon);
};

const getPcBoxName = (runtime: ScriptRuntimeState, token: string): string => {
  const index = resolveNumericExpression(token, runtime);
  return runtime.pcStorage.boxNames[index] ?? `BOX ${index + 1}`;
};

const getStoredDaycarePokemon = (runtime: ScriptRuntimeState, slot: number): FieldPokemon | null =>
  deserializeFieldPokemon(runtime.stringVars[DAYCARE_DATA_KEY(slot)]);

const getStoredRoute5DaycarePokemon = (runtime: ScriptRuntimeState): FieldPokemon | null =>
  deserializeFieldPokemon(runtime.stringVars[ROUTE5_DAYCARE_DATA_KEY]);

const getDaycareStoredCount = (runtime: ScriptRuntimeState): number => {
  let count = 0;
  for (let slot = 0; slot < 2; slot += 1) {
    if (getStoredDaycarePokemon(runtime, slot)) {
      count += 1;
    }
  }
  return count;
};

const syncDaycareState = (runtime: ScriptRuntimeState): void => {
  const storedCount = getDaycareStoredCount(runtime);
  runtime.vars.daycareState = runtime.flags.has('FLAG_PENDING_DAYCARE_EGG')
    ? 1
    : storedCount === 0
      ? 0
      : storedCount + 1;
};

const getDaycareLevelGain = (runtime: ScriptRuntimeState, slot: number): number =>
  Math.max(0, runtime.vars[`daycareLevelsGained_${slot}`] ?? 0);

const setDaycareSlot = (
  runtime: ScriptRuntimeState,
  slot: number,
  pokemon: FieldPokemon
): void => {
  runtime.stringVars[getDaycareSlotName(slot)] = getFieldPokemonDisplayName(pokemon);
  runtime.stringVars[`daycareSpecies_${slot}`] = normalizeSpeciesId(pokemon.species);
  runtime.stringVars[DAYCARE_DATA_KEY(slot)] = serializeFieldPokemon(pokemon);
  runtime.vars[`daycareLevelsGained_${slot}`] = 0;
};

const clearDaycareSlot = (
  runtime: ScriptRuntimeState,
  slot: number
): void => {
  runtime.stringVars[getDaycareSlotName(slot)] = '';
  runtime.stringVars[`daycareSpecies_${slot}`] = '';
  runtime.stringVars[DAYCARE_DATA_KEY(slot)] = '';
  runtime.vars[`daycareLevelsGained_${slot}`] = 0;
};

const shiftDaycareSlotsIfNeeded = (runtime: ScriptRuntimeState): void => {
  if (getStoredDaycarePokemon(runtime, 0) || !getStoredDaycarePokemon(runtime, 1)) {
    return;
  }

  runtime.stringVars[getDaycareSlotName(0)] = runtime.stringVars[getDaycareSlotName(1)] ?? '';
  runtime.stringVars.daycareSpecies_0 = runtime.stringVars.daycareSpecies_1 ?? '';
  runtime.stringVars[DAYCARE_DATA_KEY(0)] = runtime.stringVars[DAYCARE_DATA_KEY(1)] ?? '';
  runtime.vars.daycareLevelsGained_0 = runtime.vars.daycareLevelsGained_1 ?? 0;

  clearDaycareSlot(runtime, 1);
};

const setRoute5DaycarePokemon = (
  runtime: ScriptRuntimeState,
  pokemon: FieldPokemon
): void => {
  runtime.stringVars.route5DaycareMon = getFieldPokemonDisplayName(pokemon);
  runtime.stringVars.route5DaycareSpecies = normalizeSpeciesId(pokemon.species);
  runtime.stringVars[ROUTE5_DAYCARE_DATA_KEY] = serializeFieldPokemon(pokemon);
  runtime.vars.route5DaycareLevelsGained = 0;
};

const clearRoute5DaycarePokemon = (runtime: ScriptRuntimeState): void => {
  runtime.stringVars.route5DaycareMon = '';
  runtime.stringVars.route5DaycareSpecies = '';
  runtime.stringVars[ROUTE5_DAYCARE_DATA_KEY] = '';
  runtime.vars.route5DaycareLevelsGained = 0;
};

const getMoveTutorMoveName = (runtime: ScriptRuntimeState): string => {
  const tutorId = resolveNumericExpression('VAR_0x8005', runtime);
  const moveId = getTutorMoveId(tutorId);
  return moveId ? formatDecompMoveName(moveId) : runtime.stringVars.STR_VAR_2 ?? 'SPECIAL MOVE';
};

const getFanClubTrainerName = (runtime: ScriptRuntimeState): string => {
  switch (resolveNumericExpression('VAR_0x8004', runtime)) {
    case 4:
      return 'LT. SURGE';
    case 6:
      return 'KOGA';
    default:
      return runtime.stringVars.rivalName || 'BLUE';
  }
};

const getSelectablePartySlots = (
  runtime: ScriptRuntimeState,
  predicate: (pokemon: FieldPokemon, slot: number) => boolean
): number[] =>
  runtime.party
    .map((pokemon, slot) => ({ pokemon, slot }))
    .filter(({ pokemon, slot }) => predicate(pokemon, slot))
    .map(({ slot }) => slot);

const getPartySelectionLabels = (runtime: ScriptRuntimeState, slotOptions: number[]): string[] =>
  slotOptions.map((slot) => {
    const pokemon = getPartyMonAt(runtime, slot);
    return pokemon ? `${getFieldPokemonDisplayName(pokemon)} Lv${pokemon.level}` : `PARTY ${slot + 1}`;
  });

const startPartySelectionPrompt = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  runtime: ScriptRuntimeState,
  specialState: PartySelectionSpecialState
): void => {
  const options = [...getPartySelectionLabels(runtime, specialState.slotOptions), 'CANCEL'];
  dialogue.active = false;
  startChoicePrompt(dialogue, session, options, {
    kind: 'listmenu',
    tilemapLeft: 1,
    tilemapTop: 1,
    cancelValue: specialState.slotOptions.length,
    maxVisibleOptions: 6
  });
};

const buildInGameTradePokemon = (
  runtime: ScriptRuntimeState,
  tradeId: number,
  playerSlot: number
): FieldPokemon | null => {
  const definition = getDecompInGameTradeDefinition(tradeId);
  const playerPokemon = getPartyMonAt(runtime, playerSlot);
  if (!definition || !playerPokemon) {
    return null;
  }

  const pokemon = createFieldPokemonFromSpeciesToken(
    `SPECIES_${definition.species}`,
    playerPokemon.level,
    runtime
  );
  pokemon.nickname = definition.nickname;
  pokemon.otName = definition.otName;
  pokemon.otId = definition.otId;
  pokemon.heldItemId = definition.heldItemId;
  pokemon.personality = definition.personality;
  return pokemon;
};

const completeInGameTrade = (
  runtime: ScriptRuntimeState,
  tradeId: number,
  playerSlot: number
): boolean => {
  const tradePokemon = buildInGameTradePokemon(runtime, tradeId, playerSlot);
  const playerPokemon = getPartyMonAt(runtime, playerSlot);
  if (!tradePokemon || !playerPokemon) {
    return false;
  }

  runtime.party[playerSlot] = tradePokemon;
  addPokedexSeenSpecies(runtime.pokedex, tradePokemon.species);
  addPokedexCaughtSpecies(runtime.pokedex, tradePokemon.species);
  runtime.startMenu.seenPokemonCount = runtime.pokedex.seenSpecies.length;
  runtime.stringVars.STR_VAR_1 = playerPokemon.nickname ?? getSpeciesDisplayName(playerPokemon.species);
  runtime.stringVars.STR_VAR_2 = getSpeciesDisplayName(tradePokemon.species);
  return true;
};

const teachMoveToPokemon = (
  pokemon: FieldPokemon,
  moveName: string
): void => {
  pokemon.moves = [...(pokemon.moves ?? [])];
  if (pokemon.moves.includes(moveName)) {
    return;
  }
  if (pokemon.moves.length >= 4) {
    pokemon.moves[0] = moveName;
  } else {
    pokemon.moves.push(moveName);
  }
};

const completeTutorMoveOnSlot = (
  runtime: ScriptRuntimeState,
  tutorId: number,
  slot: number
): boolean => {
  const pokemon = getPartyMonAt(runtime, slot);
  if (!pokemon || !canPokemonBeTaughtTutorMove(pokemon, tutorId)) {
    return false;
  }

  const moveId = getTutorMoveId(tutorId);
  const moveName = moveId ? formatDecompMoveName(moveId) : getMoveTutorMoveName(runtime);
  teachMoveToPokemon(pokemon, moveName);
  setBufferedString(runtime, 'STR_VAR_2', moveName);
  return true;
};

const openSpecialStubPages = (
  dialogue: DialogueState,
  session: FieldScriptSessionState,
  pages: string[]
): void => {
  openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages);
  session.waitingFor = 'text';
};

const SHOP_LIST_VISIBLE_ROWS = 6;
const SHOP_MAIN_OPTIONS = ['BUY', 'SELL', 'SEE YA!'] as const;
const SHOP_PROMPT_WELCOME = 'What would you like to do?';
const SHOP_PROMPT_ANYTHING_ELSE = 'Is there anything else I can do?';
const SHOP_PROMPT_NO_MONEY = "You don't have enough money.";
const SHOP_PROMPT_NO_ROOM = 'You have no more room for this\nitem.';
const SHOP_PROMPT_THANK_YOU = 'Here you are!\nThank you!';

const formatShopMoney = (amount: number): string => `¥${amount}`;

const formatShopSaleText = (itemName: string, total: number): string =>
  `Turned over the ${itemName}\nworth ${formatShopMoney(total)}.`;

const createMartShopState = (items: string[], runtime: ScriptRuntimeState): ShopState => {
  const buyMenuWindows = buyMenuInitWindows(
    itemListIsSellingTm(items, (itemId) => getItemDefinition(itemId).pocket)
  );

  return {
    kind: 'mart',
    mode: 'mainMenu',
    items,
    buyMenuWindows,
    moneyBox: buyMenuDrawMoneyBox(getMoney(runtime)),
    yesNoWindow: buyMenuConfirmPurchase(0),
    prompt: SHOP_PROMPT_WELCOME,
    selectedIndex: 0,
    scrollOffset: 0,
    currentItemId: null,
    quantity: 1,
    maxQuantity: 1,
    pendingMode: null
  };
};

const setShopPrompt = (
  dialogue: DialogueState,
  shop: ShopState,
  prompt: string,
  pendingMode: Exclude<ShopMode, 'message'> | null
): void => {
  dialogue.active = true;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
  dialogue.choice = null;
  hideFieldMessageBox(dialogue.fieldMessageBox);
  shop.mode = 'message';
  shop.prompt = prompt;
  shop.pendingMode = pendingMode;
};

const enterMartMainMenu = (shop: ShopState, prompt: string): void => {
  shop.mode = 'mainMenu';
  shop.prompt = prompt;
  shop.selectedIndex = 0;
  shop.pendingMode = null;
  shop.currentItemId = null;
  shop.quantity = 1;
  shop.maxQuantity = 1;
};

const ensureMartScrollVisible = (shop: ShopState, optionCount: number): void => {
  const maxVisible = Math.min(SHOP_LIST_VISIBLE_ROWS, optionCount);
  if (shop.selectedIndex < shop.scrollOffset) {
    shop.scrollOffset = shop.selectedIndex;
  } else if (shop.selectedIndex >= shop.scrollOffset + maxVisible) {
    shop.scrollOffset = shop.selectedIndex - maxVisible + 1;
  }
  shop.scrollOffset = Math.max(0, Math.min(shop.scrollOffset, Math.max(0, optionCount - maxVisible)));
};

const exitMartShop = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  session: FieldScriptSessionState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void => {
  dialogue.shop = null;
  dialogue.active = false;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
  dialogue.choice = null;
  hideFieldMessageBox(dialogue.fieldMessageBox);
  session.specialState = null;
  session.waitingFor = null;
  continueFieldScriptSession(dialogue, runtime, player, npcs);
};

function nextCommandIsWaitState(session: FieldScriptSessionState): boolean {
  const lines = scriptBlocks.get(session.currentLabel);
  if (!lines) {
    return false;
  }

  for (let index = session.lineIndex; index < lines.length; index += 1) {
    const nextLine = lines[index]?.trim() ?? '';
    if (nextLine.length === 0 || isIgnoredScriptLine(nextLine)) {
      continue;
    }

    return nextLine === 'waitstate';
  }

  return false;
}

const pauseForWaitStateIfNeeded = (
  session: FieldScriptSessionState
): 'continue' | 'pause' => nextCommandIsWaitState(session) ? 'continue' : 'pause';

const HELPCONTEXT_SURFING = 22;
const DEFAULT_LINKUP_RESULT = 5;

const getConfiguredLinkupResult = (
  runtime: ScriptRuntimeState,
  overrideVar: string
): number => runtime.vars[overrideVar] ?? runtime.vars.linkupResult ?? DEFAULT_LINKUP_RESULT;

const runDecompSpecialVar = (
  target: string,
  specialName: string,
  runtime: ScriptRuntimeState,
  player: PlayerState | undefined,
  _session: FieldScriptSessionState
): boolean => {
  switch (specialName) {
    case 'GetBattleOutcome':
      runtime.vars[target] = runtime.vars.battleOutcome ?? 0;
      return true;
    case 'GetPokedexCount': {
      const useNationalDex = resolveNumericExpression('VAR_0x8004', runtime, player) !== 0;
      const summary = getProfPcPokedexCount(runtime, useNationalDex);
      runtime.vars.VAR_0x8005 = summary.seenCount;
      runtime.vars.VAR_0x8006 = summary.ownedCount;
      runtime.vars[target] = summary.nationalDexEnabled ? 1 : 0;
      return true;
    }
    case 'IsNationalPokedexEnabled':
      runtime.vars[target] = isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies) ? 1 : 0;
      return true;
    case 'CalculatePlayerPartyCount':
      runtime.vars[target] = runtime.party.length;
      return true;
    case 'BufferUnionRoomPlayerName': {
      const unionRoomPlayerName = runtime.stringVars.unionRoomPlayerName?.trim() ?? '';
      if (runtime.startMenu.mode === 'unionRoom' && unionRoomPlayerName.length > 0) {
        setBufferedString(runtime, 'STR_VAR_1', unionRoomPlayerName);
        runtime.vars[target] = 1;
      } else {
        runtime.vars[target] = 0;
      }
      return true;
    }
    case 'CountPartyNonEggMons':
      runtime.vars[target] = runtime.party.reduce((count, pokemon) => count + (pokemon.isEgg ? 0 : 1), 0);
      return true;
    case 'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot': {
      const ignoredSlot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars[target] = runtime.party.reduce(
        (count, pokemon, slot) => count + (slot !== ignoredSlot && !pokemon.isEgg && pokemon.hp > 0 ? 1 : 0),
        0
      );
      return true;
    }
    case 'DoesPlayerPartyContainSpecies':
    case 'PlayerPartyContainsSpeciesWithPlayerID': {
      const speciesId = resolveSpeciesIdToken('VAR_0x8004', runtime, player);
      runtime.vars[target] = speciesId
        ? runtime.party.some((pokemon) => normalizeSpeciesId(pokemon.species) === speciesId)
          ? 1
          : 0
        : 0;
      return true;
    }
    case 'GetSelectedMonNicknameAndSpecies': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      setBufferedString(runtime, 'STR_VAR_1', getMonDisplayNameForBuffer(runtime, slot));
      const pokemon = getPartyMonAt(runtime, slot);
      setRuntimeScriptValue(runtime, target, pokemon ? `SPECIES_${normalizeSpeciesId(pokemon.species)}` : 'SPECIES_NONE');
      return true;
    }
    case 'GetInGameTradeSpeciesInfo': {
      const tradeId = resolveNumericExpression('VAR_0x8004', runtime, player);
      const definition = getDecompInGameTradeDefinition(tradeId);
      setBufferedString(runtime, 'STR_VAR_1', definition ? getSpeciesDisplayName(definition.requestedSpecies) : '');
      setBufferedString(runtime, 'STR_VAR_2', definition ? getSpeciesDisplayName(definition.species) : '');
      setRuntimeScriptValue(runtime, target, definition ? `SPECIES_${definition.requestedSpecies}` : 'SPECIES_NONE');
      return true;
    }
    case 'GetPartyMonSpecies': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getPartyMonAt(runtime, slot);
      setRuntimeScriptValue(runtime, target, pokemon ? `SPECIES_${normalizeSpeciesId(pokemon.species)}` : 'SPECIES_NONE');
      return true;
    }
    case 'GetTradeSpecies': {
      const slot = resolveNumericExpression('VAR_0x8005', runtime, player);
      const pokemon = getPartyMonAt(runtime, slot);
      setRuntimeScriptValue(
        runtime,
        target,
        !pokemon || pokemon.isEgg ? 'SPECIES_NONE' : `SPECIES_${normalizeSpeciesId(pokemon.species)}`
      );
      return true;
    }
    case 'GetLeadMonFriendship': {
      const friendship = Math.max(0, Math.min(255, runtime.vars.leadMonFriendship ?? 70));
      runtime.vars[target] = friendship === 255
        ? 6
        : friendship >= 200
          ? 5
          : friendship >= 150
            ? 4
            : friendship >= 100
              ? 3
              : friendship >= 50
                ? 2
                : friendship > 0
                  ? 1
                  : 0;
      return true;
    }
    case 'GetDaycareState':
      syncDaycareState(runtime);
      runtime.vars[target] = runtime.vars.daycareState ?? 0;
      return true;
    case 'InitElevatorFloorSelectMenuPos':
      runtime.vars[target] = runtime.vars.elevatorCursorPos ?? 0;
      return true;
    case 'IsEnoughForCostInVar0x8005':
      runtime.vars[target] = getMoney(runtime) >= resolveNumericExpression('VAR_0x8005', runtime, player) ? 1 : 0;
      return true;
    case 'IsWirelessAdapterConnected':
      runtime.vars[target] = runtime.vars.wirelessAdapterConnected ?? 0;
      return true;
    case 'CheckAddCoins':
      runtime.vars[target] = getCoins(runtime) < 9_999 ? 1 : 0;
      return true;
    case 'HasAllMons': {
      runtime.vars[target] = hasAllMons(runtime) ? 1 : 0;
      return true;
    }
    case 'HasAllKantoMons':
      runtime.vars[target] = hasAllKantoMons(runtime) ? 1 : 0;
      return true;
    case 'GetTrainerBattleMode':
      runtime.vars[target] = runtime.pendingTrainerBattle?.format === 'doubles' ? 2 : 0;
      return true;
    case 'GetPlayerFacingDirection':
      setRuntimeScriptValue(runtime, target, player ? PLAYER_FACING_TO_DIR[player.facing] : 'DIR_SOUTH');
      return true;
    case 'GetPlayerAvatarBike':
      runtime.vars[target] = player?.avatarMode === 'acroBike'
        ? 1
        : player?.avatarMode === 'machBike'
          ? 2
          : 0;
      return true;
    case 'GetNumLevelsGainedFromDaycare': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars[target] = getDaycareLevelGain(runtime, slot);
      return true;
    }
    case 'GetNumLevelsGainedForRoute5DaycareMon':
      runtime.vars[target] = Math.max(0, runtime.vars.route5DaycareLevelsGained ?? 0);
      return true;
    case 'IsThereMonInRoute5Daycare':
      runtime.vars[target] = getStoredRoute5DaycarePokemon(runtime) ? 1 : 0;
      return true;
    case 'TakePokemonFromDaycare': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getStoredDaycarePokemon(runtime, slot);
      runtime.vars[target] = 0;
      if (!pokemon) {
        return true;
      }

      runtime.party.push(pokemon);
      runtime.vars[target] = speciesConstantMaps.byName.get(`SPECIES_${normalizeSpeciesId(pokemon.species)}`) ?? 0;
      clearDaycareSlot(runtime, slot);
      shiftDaycareSlotsIfNeeded(runtime);
      syncDaycareState(runtime);
      return true;
    }
    case 'TakePokemonFromRoute5Daycare': {
      const pokemon = getStoredRoute5DaycarePokemon(runtime);
      runtime.vars[target] = 0;
      if (!pokemon) {
        return true;
      }

      runtime.party.push(pokemon);
      runtime.vars[target] = speciesConstantMaps.byName.get(`SPECIES_${normalizeSpeciesId(pokemon.species)}`) ?? 0;
      clearRoute5DaycarePokemon(runtime);
      return true;
    }
    case 'ShouldShowBoxWasFullMessage':
      runtime.vars[target] = runtime.vars.pcBoxWasFullMessage ?? 0;
      return true;
    case 'GetPCBoxToSendMon':
      runtime.vars[target] = resolveNumericExpression('pcNextBoxToSendMon', runtime, player);
      return true;
    case 'GetRandomSlotMachineId':
      runtime.vars[target] = runtime.vars.slotMachineId ?? 0;
      return true;
    case 'IsMonOTNameNotPlayers': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars[target] = getPartyMonOtName(runtime, slot) === runtime.startMenu.playerName ? 0 : 1;
      return true;
    }
    case 'CapeBrinkGetMoveToTeachLeadPokemon': {
      const leadSlot = selectFirstPartyMonSlot(runtime);
      const leadMon = getPartyMonAt(runtime, leadSlot);
      runtime.vars.VAR_0x8007 = leadSlot;
      if (!leadMon) {
        runtime.vars[target] = 0;
        return true;
      }

      const tutorData = {
        VENUSAUR: { tutorId: 15, moveName: 'FRENZY PLANT' },
        CHARIZARD: { tutorId: 16, moveName: 'BLAST BURN' },
        BLASTOISE: { tutorId: 17, moveName: 'HYDRO CANNON' }
      }[normalizeSpeciesId(leadMon.species)];

      if (!tutorData || Math.max(0, Math.min(255, runtime.vars.leadMonFriendship ?? 70)) !== 255) {
        runtime.vars[target] = 0;
        return true;
      }

      runtime.vars.VAR_0x8005 = tutorData.tutorId;
      runtime.vars.VAR_0x8006 = getPartyMonMoveCount(runtime, leadSlot);
      setBufferedString(runtime, 'STR_VAR_2', tutorData.moveName);
      runtime.vars[target] = 1;
      return true;
    }
    case 'HasLearnedAllMovesFromCapeBrinkTutor': {
      const tutorId = resolveNumericExpression('VAR_0x8005', runtime, player);
      if (tutorId === 15) {
        runtime.flags.add('FLAG_TUTOR_FRENZY_PLANT');
      } else if (tutorId === 16) {
        runtime.flags.add('FLAG_TUTOR_BLAST_BURN');
      } else if (tutorId === 17) {
        runtime.flags.add('FLAG_TUTOR_HYDRO_CANNON');
      }

      runtime.vars[target] = ['FLAG_TUTOR_FRENZY_PLANT', 'FLAG_TUTOR_BLAST_BURN', 'FLAG_TUTOR_HYDRO_CANNON']
        .every((flag) => runtime.flags.has(flag))
        ? 1
        : 0;
      return true;
    }
    case 'ValidateSavedWonderCard':
      runtime.vars[target] = runtime.vars.savedWonderCardValid ?? 0;
      return true;
    default:
      if (DEFAULT_ZERO_SPECIALVARS.has(specialName)) {
        runtime.vars[target] = 0;
        return true;
      }
      return false;
  }
};

const runDecompSpecial = (
  specialName: string,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  player: PlayerState | undefined,
  session: FieldScriptSessionState,
  npcs: readonly NpcState[]
): 'continue' | 'pause' | 'unhandled' => {
  switch (specialName) {
    case 'HealPlayerParty':
      for (const pokemon of runtime.party) {
        pokemon.hp = pokemon.maxHp;
        pokemon.status = 'none';
      }
      return 'continue';
    case 'SetSeenMon': {
      const speciesId = resolveSpeciesIdToken('VAR_0x8004', runtime, player);
      if (speciesId) {
        addPokedexSeenSpecies(runtime.pokedex, speciesId);
      }
      return 'continue';
    }
    case 'SetHiddenItemFlag':
      if (session.hiddenItemFlag) {
        runtime.flags.add(session.hiddenItemFlag);
      }
      return 'continue';
    case 'IsMonOTIDNotPlayers': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars.VAR_RESULT = getPartyMonOtId(runtime, slot) === getPlayerTrainerId(runtime) ? 0 : 1;
      return 'continue';
    }
    case 'EnterSafariMode':
      enterSafariMode(runtime);
      runtime.startMenu.mode = 'safari';
      return 'continue';
    case 'ExitSafariMode':
      exitSafariMode(runtime);
      runtime.startMenu.mode = 'normal';
      return 'continue';
    case 'Script_SetHelpContext':
      runtime.vars.helpContext = resolveNumericExpression('VAR_0x8004', runtime, player);
      return 'continue';
    case 'BackupHelpContext':
      runtime.vars.helpContextBackup = runtime.vars.helpContext ?? 0;
      return 'continue';
    case 'RestoreHelpContext':
      runtime.vars.helpContext = runtime.vars.helpContextBackup ?? runtime.vars.helpContext ?? 0;
      return 'continue';
    case 'SetHelpContextForMap':
      runtime.vars.helpContext = runtime.vars.mapHelpContext ?? 0;
      return 'continue';
    case 'ForcePlayerOntoBike':
      if (player) forcePlayerOntoMachBike(player);
      return 'continue';
    case 'ForcePlayerToStartSurfing':
      runtime.vars.helpContext = HELPCONTEXT_SURFING;
      if (player) forcePlayerToStartSurfing(player);
      return 'continue';
    case 'CloseLink':
      runtime.vars.linkClosed = 1;
      return 'continue';
    case 'CleanupLinkRoomState':
      runtime.vars.linkRoomCleanedUp = 1;
      runtime.stringVars.unionRoomPlayerName = '';
      return 'continue';
    case 'DoCableClubWarp':
      runtime.vars.cableClubWarpPending = 0;
      runtime.startMenu.mode = 'link';
      return 'continue';
    case 'DrawWholeMapView':
      runtime.vars.wholeMapViewDrawn = 1;
      return 'continue';
    case 'EnterColosseumPlayerSpot':
      openSpecialStubPages(dialogue, session, ['Please take your seat and start\nyour battle.']);
      return pauseForWaitStateIfNeeded(session);
    case 'EnterTradeSeat':
      openSpecialStubPages(dialogue, session, ['Please take your seat and start\nyour trade.']);
      return pauseForWaitStateIfNeeded(session);
    case 'ExitLinkRoom':
      runtime.vars.linkRoomExitRequested = 1;
      runtime.startMenu.mode = 'normal';
      return 'continue';
    case 'HasAtLeastOneBerry':
      runtime.vars.VAR_RESULT = runtime.bag.pockets.berryPouch.some((slot) => slot.quantity > 0) ? 1 : 0;
      return 'continue';
    case 'HasEnoughMonsForDoubleBattle':
      runtime.vars.VAR_RESULT = runtime.party.filter((pokemon) => !pokemon.isEgg && pokemon.hp > 0).length >= 2
        ? resolveNumericExpression('PLAYER_HAS_TWO_USABLE_MONS', runtime, player)
        : 1;
      return 'continue';
    case 'HelpSystem_Disable':
      runtime.vars.helpSystemDisabled = 1;
      return 'continue';
    case 'HelpSystem_Enable':
      runtime.vars.helpSystemDisabled = 0;
      return 'continue';
    case 'InitUnionRoom':
      runtime.vars.unionRoomInitialized = 1;
      runtime.startMenu.mode = 'unionRoom';
      return 'continue';
    case 'ShowFieldMessageStringVar4':
      openSpecialStubPages(dialogue, session, [runtime.stringVars.STR_VAR_4 || '']);
      return 'pause';
    case 'Field_AskSaveTheGame':
      startChoicePrompt(dialogue, session, ['YES', 'NO'], {
        kind: 'yesno',
        tilemapLeft: 20,
        tilemapTop: 8
      });
      return pauseForWaitStateIfNeeded(session);
    case 'ShowTownMap':
      openSpecialStubPages(dialogue, session, ['The TOWN MAP opened.']);
      return pauseForWaitStateIfNeeded(session);
    case 'ShowBattleRecords':
      openSpecialStubPages(dialogue, session, ['The BATTLE RECORDS were checked.']);
      return pauseForWaitStateIfNeeded(session);
    case 'ShowDiploma':
      runtime.diploma.playerName = runtime.startMenu.playerName;
      runtime.diploma.hasAllMons = hasAllMons(runtime);
      cb2ShowDiploma(runtime.diploma);
      openSpecialStubPages(dialogue, session, ['The DIPLOMA was displayed.']);
      return pauseForWaitStateIfNeeded(session);
    case 'ShowEasyChatMessage':
      openSpecialStubPages(dialogue, session, [runtime.stringVars.STR_VAR_4 || 'Easy Chat message.']);
      return 'pause';
    case 'ShowWirelessCommunicationScreen':
      runtime.vars.wirelessCommunicationScreenShown = 1;
      return 'continue';
    case 'ShowPokemonStorageSystemPC':
      openSpecialStubPages(dialogue, session, ['The POKeMON STORAGE SYSTEM opened.']);
      return pauseForWaitStateIfNeeded(session);
    case 'LookThroughPorthole':
      lookThroughPorthole();
      return 'continue';
    case 'BufferMonNickname':
      setBufferedString(runtime, 'STR_VAR_1', getMonDisplayNameForBuffer(runtime, resolveNumericExpression('VAR_0x8004', runtime, player)));
      return 'continue';
    case 'BufferBigGuyOrBigGirlString':
      setBufferedString(runtime, 'STR_VAR_1', runtime.startMenu.playerGender === 'female' ? 'BIG GIRL' : 'BIG GUY');
      return 'continue';
    case 'IsSelectedMonEgg': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars.VAR_RESULT = normalizeSpeciesId(getPartyMonAt(runtime, slot)?.species ?? 'SPECIES_NONE') === 'EGG' ? 1 : 0;
      return 'continue';
    }
    case 'GetNumMovesSelectedMonHas': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars.VAR_RESULT = getPartyMonMoveCount(runtime, slot);
      return 'continue';
    }
    case 'SelectMoveDeleterMove': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      runtime.vars.VAR_0x8005 = getPartyMonMoveCount(runtime, slot) > 1 ? 0 : 4;
      return 'continue';
    }
    case 'BufferMoveDeleterNicknameAndMove': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const moveIndex = Math.max(0, Math.min(3, resolveNumericExpression('VAR_0x8005', runtime, player)));
      setBufferedString(runtime, 'STR_VAR_1', getMonDisplayNameForBuffer(runtime, slot));
      setBufferedString(runtime, 'STR_VAR_2', getPartyMonMoveName(runtime, slot, moveIndex));
      return 'continue';
    }
    case 'MoveDeleterForgetMove': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getPartyMonAt(runtime, slot);
      if (pokemon?.moves && pokemon.moves.length > 1) {
        pokemon.moves.splice(Math.max(0, Math.min(pokemon.moves.length - 1, resolveNumericExpression('VAR_0x8005', runtime, player))), 1);
      } else {
        const nextCount = Math.max(1, getPartyMonMoveCount(runtime, slot) - 1);
        runtime.vars[`partyMonMoveCount_${slot}`] = nextCount;
      }
      return 'continue';
    }
    case 'GetDaycareMonNicknames':
      setBufferedString(runtime, 'STR_VAR_1', runtime.stringVars.daycareMon1 ?? '');
      setBufferedString(runtime, 'STR_VAR_2', runtime.stringVars.daycareMon2 ?? '');
      setBufferedString(runtime, 'STR_VAR_3', getStoredDaycarePokemon(runtime, 0)?.otName ?? '');
      return 'continue';
    case 'StoreSelectedPokemonInDaycare': {
      const partySlot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getPartyMonAt(runtime, partySlot);
      const daycareSlot = getDaycareStoredCount(runtime);
      if (!pokemon || runtime.party.length <= 1 || daycareSlot >= 2) {
        return 'continue';
      }

      setDaycareSlot(runtime, daycareSlot, pokemon);
      runtime.party.splice(partySlot, 1);
      syncDaycareState(runtime);
      return 'continue';
    }
    case 'GetDaycareCost': {
      const daycareSlot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const nickname = runtime.stringVars[getDaycareSlotName(daycareSlot)] ?? '';
      const levelsGained = getDaycareLevelGain(runtime, daycareSlot);
      const cost = 100 + (levelsGained * 100);
      setBufferedString(runtime, 'STR_VAR_1', nickname);
      setBufferedString(runtime, 'STR_VAR_2', `${cost}`);
      runtime.vars.VAR_0x8005 = cost;
      return 'continue';
    }
    case 'GetCostToWithdrawRoute5DaycareMon': {
      const levelsGained = Math.max(0, runtime.vars.route5DaycareLevelsGained ?? 0);
      const cost = 100 + (levelsGained * 100);
      setBufferedString(runtime, 'STR_VAR_1', runtime.stringVars.route5DaycareMon ?? '');
      setBufferedString(runtime, 'STR_VAR_2', `${cost}`);
      runtime.vars.VAR_0x8005 = cost;
      return 'continue';
    }
    case 'Script_BufferFanClubTrainerName':
      setBufferedString(runtime, 'STR_VAR_1', getFanClubTrainerName(runtime));
      return 'continue';
    case 'GetProfOaksRatingMessage': {
      const rating = getProfOaksRatingMessageByCount(resolveNumericExpression('VAR_0x8004', runtime, player), runtime.pokedex.caughtSpecies);
      runtime.vars.VAR_RESULT = rating.complete ? 1 : 0;
      openSpecialStubPages(dialogue, session, rating.pages);
      return 'pause';
    }
    case 'EnableNationalPokedex':
      runtime.pokedex.dexMode = 'NATIONAL';
      runtime.startMenu.hasPokedex = true;
      setUnlockedPokedexFlags(runtime);
      return 'continue';
    case 'SetUnlockedPokedexFlags':
      setUnlockedPokedexFlags(runtime);
      return 'continue';
    case 'EnterHallOfFame':
      enterHallOfFame(runtime);
      return 'continue';
    case 'ReturnFromLinkRoom':
      runtime.vars.returnedFromLinkRoom = 1;
      runtime.startMenu.mode = 'normal';
      return 'continue';
    case 'RunUnionRoom':
      runtime.vars.unionRoomRunning = 1;
      runtime.startMenu.mode = 'unionRoom';
      return 'continue';
    case 'Script_FacePlayer':
      scriptFacePlayer(runtime.eventObjectLock, player, npcs);
      return 'continue';
    case 'Script_ClearHeldMovement':
      scriptClearHeldMovement(runtime.eventObjectLock, npcs);
      return 'continue';
    case 'SetFlavorTextFlagFromSpecialVars':
      setFameCheckerFlavorTextFlag(
        runtime,
        resolveNumericExpression('VAR_0x8004', runtime, player),
        resolveNumericExpression('VAR_0x8005', runtime, player)
      );
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'UpdatePickStateFromSpecialVar8005':
      updateFameCheckerPickState(
        runtime,
        resolveNumericExpression('VAR_0x8004', runtime, player),
        resolveNumericExpression('VAR_0x8005', runtime, player)
      );
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'Script_ResetUnionRoomTrade':
      runtime.vars.unionRoomTradeState = 0;
      return 'continue';
    case 'Script_ShowLinkTrainerCard':
      runtime.vars.linkTrainerCardShown = 1;
      return 'continue';
    case 'ChoosePartyMon':
    case 'ChooseMonForWirelessMinigame':
      if (runtime.party.length === 0) {
        runtime.vars.VAR_0x8004 = getCancelPartySlotValue();
        runtime.vars.VAR_RESULT = getCancelPartySlotValue();
        return 'continue';
      }
      session.specialState = {
        kind: 'partySelection',
        purpose: 'trade',
        slotOptions: runtime.party.map((_, slot) => slot)
      };
      startPartySelectionPrompt(dialogue, session, runtime, session.specialState);
      return pauseForWaitStateIfNeeded(session);
    case 'ChooseMonForMoveTutor': {
      const tutorId = resolveNumericExpression('VAR_0x8005', runtime, player);
      if (tutorId >= 15) {
        const slot = resolveNumericExpression('VAR_0x8007', runtime, player);
        runtime.vars.VAR_0x8004 = slot;
        runtime.vars.VAR_RESULT = completeTutorMoveOnSlot(runtime, tutorId, slot) ? 1 : 0;
        return 'continue';
      }

      const slotOptions = getSelectablePartySlots(
        runtime,
        (pokemon) => canPokemonBeTaughtTutorMove(pokemon, tutorId)
      );
      if (slotOptions.length === 0) {
        runtime.vars.VAR_0x8004 = getCancelPartySlotValue();
        runtime.vars.VAR_RESULT = 0;
        return 'continue';
      }

      session.specialState = {
        kind: 'partySelection',
        purpose: 'moveTutor',
        slotOptions
      };
      startPartySelectionPrompt(dialogue, session, runtime, session.specialState);
      return pauseForWaitStateIfNeeded(session);
    }
    case 'ChooseMonForMoveRelearner':
      if (runtime.party.length === 0) {
        runtime.vars.VAR_0x8004 = getCancelPartySlotValue();
        runtime.vars.VAR_0x8005 = 0;
        runtime.vars.VAR_RESULT = 0;
        return 'continue';
      }
      session.specialState = {
        kind: 'partySelection',
        purpose: 'moveRelearner',
        slotOptions: runtime.party.map((_, slot) => slot)
      };
      startPartySelectionPrompt(dialogue, session, runtime, session.specialState);
      return pauseForWaitStateIfNeeded(session);
    case 'ChooseHalfPartyForBattle':
      choosePartyMonIntoVar(runtime, (slot) => slot < Math.min(3, runtime.party.length));
      return 'continue';
    case 'ChooseSendDaycareMon': {
      const slotOptions = getSelectablePartySlots(
        runtime,
        (pokemon) => runtime.party.length > 1 && !pokemon.isEgg
      );
      if (slotOptions.length === 0) {
        runtime.vars.VAR_0x8004 = getCancelPartySlotValue();
        runtime.vars.VAR_RESULT = getCancelPartySlotValue();
        return 'continue';
      }
      session.specialState = {
        kind: 'partySelection',
        purpose: 'daycare',
        slotOptions
      };
      startPartySelectionPrompt(dialogue, session, runtime, session.specialState);
      return pauseForWaitStateIfNeeded(session);
    }
    case 'TeachMoveRelearnerMove': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getPartyMonAt(runtime, slot);
      const moveIds = pokemon ? getRelearnableMovesForPokemon(pokemon) : [];
      if (!pokemon || moveIds.length === 0) {
        runtime.vars.VAR_0x8004 = 0;
        return 'continue';
      }
      session.specialState = {
        kind: 'moveRelearnerSelection',
        slot,
        moveIds
      };
      startChoicePrompt(dialogue, session, [...moveIds.map((moveId) => formatDecompMoveName(moveId)), 'CANCEL'], {
        kind: 'listmenu',
        tilemapLeft: 1,
        tilemapTop: 1,
        cancelValue: moveIds.length,
        maxVisibleOptions: 6
      });
      return pauseForWaitStateIfNeeded(session);
    }
    case 'PutMonInRoute5Daycare': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getPartyMonAt(runtime, slot);
      if (pokemon && runtime.party.length > 1) {
        setRoute5DaycarePokemon(runtime, pokemon);
        runtime.party.splice(slot, 1);
      }
      return 'continue';
    }
    case 'ShowDaycareLevelMenu': {
      const options = [0, 1]
        .map((slot) => getStoredDaycarePokemon(runtime, slot))
        .filter((pokemon): pokemon is FieldPokemon => !!pokemon)
        .map((pokemon) => getFieldPokemonDisplayName(pokemon));
      if (options.length === 0) {
        runtime.vars.VAR_RESULT = 2;
        return 'continue';
      }
      session.specialState = {
        kind: 'daycareLevelMenu',
        daycareKind: 'fourIsland'
      };
      startChoicePrompt(dialogue, session, [...options, 'CANCEL'], {
        kind: 'multichoice',
        tilemapLeft: 1,
        tilemapTop: 1,
        cancelValue: 2
      });
      return pauseForWaitStateIfNeeded(session);
    }
    case 'ChangePokemonNickname': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getPartyMonAt(runtime, slot);
      if (!pokemon) {
        return 'continue';
      }

      dialogue.active = false;
      dialogue.choice = null;
      dialogue.shop = null;
      dialogue.namingScreen = {
        kind: 'nickname',
        slot,
        species: `SPECIES_${normalizeSpeciesId(pokemon.species)}`,
        textBuffer: '',
        destBuffer: getFieldPokemonDisplayName(pokemon).slice(0, NAMING_SCREEN_MAX_MON_CHARS),
        cursorX: 0,
        cursorY: 0,
        buttonId: 0,
        maxLength: NAMING_SCREEN_MAX_MON_CHARS,
        currentPage: NAMING_SCREEN_INITIAL_MON_PAGE,
        initialPage: NAMING_SCREEN_INITIAL_MON_PAGE,
        copyExistingString: false,
        title: NAMING_SCREEN_MON_TITLE
      };
      hideFieldMessageBox(dialogue.fieldMessageBox);
      beginFieldFadeScreen(runtime, FADE_FROM_BLACK, 0);
      session.specialState = { kind: 'nickname', slot, phase: 'fadeIn' };
      return 'pause';
    }
    case 'ChangeBoxPokemonNickname':
      return pauseForWaitStateIfNeeded(session);
    case 'GiveEggFromDaycare': {
      const speciesId = runtime.stringVars.daycareEggSpecies || 'TOGEPI';
      const result = storeGiftPokemon(runtime, createFieldPokemonFromSpeciesToken(speciesId, 5, runtime, { isEgg: true }));
      runtime.vars.VAR_RESULT = result;
      runtime.flags.delete('FLAG_PENDING_DAYCARE_EGG');
      syncDaycareState(runtime);
      return 'continue';
    }
    case 'TakePokemonFromDaycare': {
      const slot = resolveNumericExpression('VAR_0x8004', runtime, player);
      const pokemon = getStoredDaycarePokemon(runtime, slot);
      if (!pokemon) {
        runtime.vars.VAR_RESULT = 0;
        return 'continue';
      }
      runtime.party.push(pokemon);
      runtime.vars.VAR_RESULT = speciesConstantMaps.byName.get(`SPECIES_${normalizeSpeciesId(pokemon.species)}`) ?? 0;
      clearDaycareSlot(runtime, slot);
      shiftDaycareSlotsIfNeeded(runtime);
      syncDaycareState(runtime);
      return 'continue';
    }
    case 'TakePokemonFromRoute5Daycare': {
      const pokemon = getStoredRoute5DaycarePokemon(runtime);
      if (!pokemon) {
        runtime.vars.VAR_RESULT = 0;
        return 'continue';
      }
      runtime.party.push(pokemon);
      runtime.vars.VAR_RESULT = speciesConstantMaps.byName.get(`SPECIES_${normalizeSpeciesId(pokemon.species)}`) ?? 0;
      clearRoute5DaycarePokemon(runtime);
      return 'continue';
    }
    case 'SetDaycareCompatibilityString': {
      const first = getStoredDaycarePokemon(runtime, 0);
      const second = getStoredDaycarePokemon(runtime, 1);
      setBufferedString(
        runtime,
        'STR_VAR_4',
        first && second
          ? getDaycareCompatibilityText(first, second)
          : "The two prefer to play with other\nPOKeMON than each other."
      );
      return 'continue';
    }
    case 'SetCableClubWarp':
      runtime.vars.cableClubWarpPending = 1;
      runtime.vars.cableClubWarpState = resolveNumericExpression('VAR_CABLE_CLUB_STATE', runtime, player);
      return 'continue';
    case 'CreateInGameTradePokemon': {
      const tradeId = resolveNumericExpression('VAR_0x8004', runtime, player);
      const slot = resolveNumericExpression('VAR_0x8005', runtime, player);
      const tradePokemon = buildInGameTradePokemon(runtime, tradeId, slot);
      runtime.stringVars.pendingInGameTradePokemon = tradePokemon ? serializeFieldPokemon(tradePokemon) : '';
      return 'continue';
    }
    case 'DoInGameTradeScene': {
      const tradeId = resolveNumericExpression('VAR_0x8004', runtime, player);
      const slot = resolveNumericExpression('VAR_0x8005', runtime, player);
      runtime.vars.VAR_RESULT = completeInGameTrade(runtime, tradeId, slot) ? 1 : 0;
      runtime.stringVars.pendingInGameTradePokemon = '';
      return 'continue';
    }
    case 'TryBattleLinkup':
      runtime.vars.VAR_RESULT = getConfiguredLinkupResult(runtime, 'tryBattleLinkupResult');
      return 'continue';
    case 'TryBecomeLinkLeader':
      runtime.vars.VAR_RESULT = getConfiguredLinkupResult(runtime, 'tryBecomeLinkLeaderResult');
      return 'continue';
    case 'TryJoinLinkGroup':
      runtime.vars.VAR_RESULT = getConfiguredLinkupResult(runtime, 'tryJoinLinkGroupResult');
      return 'continue';
    case 'TryTradeLinkup':
      runtime.vars.VAR_RESULT = getConfiguredLinkupResult(runtime, 'tryTradeLinkupResult');
      return 'continue';
    case 'SpawnCameraObject': {
      const position = player?.position ?? vec2(0, 0);
      const facing = player?.facing ?? 'down';
      runtime.fieldCamera = {
        active: true,
        position: vec2(position.x, position.y),
        facing,
        initialFacing: facing,
        currentTile: player?.currentTile ? vec2(player.currentTile.x, player.currentTile.y) : undefined,
        previousTile: player?.previousTile ? vec2(player.previousTile.x, player.previousTile.y) : undefined
      };
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    }
    case 'RemoveCameraObject':
      if (runtime.fieldCamera) {
        runtime.fieldCamera.active = false;
      }
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'ShakeScreen':
      runtime.fieldEffects.screenShakeCount += 1;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'AnimateTeleporterHousing':
      runtime.fieldEffects.teleporterHousingPhase += 1;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'AnimateTeleporterCable':
      runtime.fieldEffects.teleporterCablePhase += 1;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'DoPokemonLeagueLightingEffect':
      runtime.fieldEffects.pokemonLeagueLightingActive = true;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'DoSSAnneDepartureCutscene':
      runtime.fieldEffects.ssAnneDepartureScenePlayed = true;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'DoSeagallopFerryScene':
      runtime.fieldEffects.seagallopFerryScenePlayed = true;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'DoFallWarp':
      runtime.fieldEffects.fallWarpCount += 1;
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    case 'InitRoamer':
      initRoamer(runtime.roamer);
      recordFieldSpecialEffect(runtime, specialName);
      return 'continue';
    default:
      if (PASS_THROUGH_SPECIALS.has(specialName)) {
        recordFieldSpecialEffect(runtime, specialName);
        return 'continue';
      }
      return 'unhandled';
  }
};

const continueSpecialState = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  session: FieldScriptSessionState
): boolean => {
  const specialState = session.specialState;
  if (!specialState) {
    return false;
  }

  if (specialState.kind === 'mart') {
    return false;
  }

  if (specialState.kind === 'daycareLevelMenu') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'partySelection') {
    const result = Number(runtime.vars.VAR_RESULT ?? specialState.slotOptions.length);
    const selectedSlot = result >= 0 && result < specialState.slotOptions.length
      ? specialState.slotOptions[result]!
      : getCancelPartySlotValue();
    session.specialState = null;

    switch (specialState.purpose) {
      case 'trade':
      case 'daycare':
        runtime.vars.VAR_0x8004 = selectedSlot;
        runtime.vars.VAR_RESULT = selectedSlot;
        return false;
      case 'moveRelearner': {
        runtime.vars.VAR_0x8004 = selectedSlot;
        runtime.vars.VAR_0x8005 = selectedSlot >= runtime.party.length
          ? 0
          : getRelearnableMovesForPokemon(getPartyMonAt(runtime, selectedSlot)!).length;
        runtime.vars.VAR_RESULT = selectedSlot >= runtime.party.length ? 0 : 1;
        return false;
      }
      case 'moveTutor': {
        runtime.vars.VAR_0x8004 = selectedSlot;
        runtime.vars.VAR_RESULT = selectedSlot < runtime.party.length
          && completeTutorMoveOnSlot(runtime, resolveNumericExpression('VAR_0x8005', runtime), selectedSlot)
          ? 1
          : 0;
        return false;
      }
    }
  }

  if (specialState.kind === 'moveRelearnerSelection') {
    const result = Number(runtime.vars.VAR_RESULT ?? specialState.moveIds.length);
    session.specialState = null;
    if (result < 0 || result >= specialState.moveIds.length) {
      runtime.vars.VAR_0x8004 = 0;
      runtime.vars.VAR_RESULT = 0;
      return false;
    }

    const pokemon = getPartyMonAt(runtime, specialState.slot);
    const moveId = specialState.moveIds[result]!;
    if (!pokemon) {
      runtime.vars.VAR_0x8004 = 0;
      runtime.vars.VAR_RESULT = 0;
      return false;
    }

    teachMoveToPokemon(pokemon, formatDecompMoveName(moveId));
    setBufferedString(runtime, 'STR_VAR_2', formatDecompMoveName(moveId));
    runtime.vars.VAR_0x8004 = 1;
    runtime.vars.VAR_RESULT = 1;
    return false;
  }

  if (specialState.kind === 'strengthFieldEffect') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'rockSmashFieldEffect') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'digFieldEffect') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'teleportFieldEffect') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'sweetScentFieldEffect') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'pcMenu') {
    session.specialState = null;
    return false;
  }

  if (specialState.kind === 'playerPc') {
    if (specialState.phase === 'playerPcReturnToTopMenu') {
      openBedroomPcMenuChoice(dialogue, session);
      return true;
    }

    if (specialState.phase === 'playerPcReturnToItemStorageMenu') {
      openPlayerPcItemStorageMenuChoice(dialogue, session);
      return true;
    }

    if (specialState.phase === 'playerPcTopMenu' || specialState.phase === 'menu') {
      const result = Number(runtime.vars.VAR_RESULT ?? SCR_MENU_CANCEL);
      if (result === 0) {
        openPlayerPcItemStorageMenuChoice(dialogue, session);
        return true;
      }

      if (result === 1) {
        openPlayerPcMailboxList(dialogue, session, runtime);
        return true;
      }

      session.specialState = null;
      beginPcScreenEffectTurnOff(runtime.pcScreenEffect);
      return false;
    }

    if (specialState.phase === 'playerPcItemStorageMenu') {
      const result = Number(runtime.vars.VAR_RESULT ?? SCR_MENU_CANCEL);
      if (result === 0) {
        openPlayerPcWithdrawList(dialogue, session, runtime);
        return true;
      }

      if (result === 1) {
        openPlayerPcDepositList(dialogue, session, runtime);
        return true;
      }

      openBedroomPcMenuChoice(dialogue, session);
      return true;
    }

    if (specialState.phase === 'playerPcWithdrawList') {
      const slots = getPlayerPcItemSlots(runtime);
      const result = Number(runtime.vars.VAR_RESULT ?? slots.length);
      if (result < 0 || result >= slots.length) {
        openPlayerPcItemStorageMenuChoice(dialogue, session);
        return true;
      }

      const slot = slots[result]!;
      if (!addBagItem(runtime.bag, slot.itemId, 1)) {
        openPlayerPcMessage(dialogue, session, 'The BAG is full.', 'playerPcReturnToItemStorageMenu');
        return true;
      }

      const removed = removePlayerPcItem(runtime, result, 1);
      const itemName = getItemDefinition(removed?.itemId ?? slot.itemId).name;
      openPlayerPcMessage(dialogue, session, `Withdrew ${itemName}.`, 'playerPcReturnToItemStorageMenu');
      return true;
    }

    if (specialState.phase === 'playerPcDepositList') {
      const slots = getBagItemSlotsForPlayerPc(runtime);
      const result = Number(runtime.vars.VAR_RESULT ?? slots.length);
      if (result < 0 || result >= slots.length) {
        openPlayerPcItemStorageMenuChoice(dialogue, session);
        return true;
      }

      const slot = slots[result]!;
      if (!addPlayerPcItem(runtime, slot.itemId, 1)) {
        openPlayerPcMessage(dialogue, session, 'The PC is full.', 'playerPcReturnToItemStorageMenu');
        return true;
      }

      removeBagItem(runtime.bag, slot.itemId, 1);
      openPlayerPcMessage(dialogue, session, `Stored ${getItemDefinition(slot.itemId).name}.`, 'playerPcReturnToItemStorageMenu');
      return true;
    }

    if (specialState.phase === 'playerPcMailboxList') {
      openBedroomPcMenuChoice(dialogue, session);
      return true;
    }

    openBedroomPcMenuChoice(dialogue, session);
    return true;
  }

  if (specialState.kind === 'hallOfFamePc' && specialState.phase === 'hallOfFameMessage') {
    specialState.phase = 'menu';
    beginPcScreenEffectTurnOn(runtime.pcScreenEffect);
    openDialoguePages(dialogue, dialogue.speakerId ?? 'system', ['Which PC should be accessed?']);
    openCenterPcMenuChoice(dialogue, session, runtime);
    return true;
  }

  session.specialState = null;
  return false;
};

const nextCommandOpensChoice = (session: FieldScriptSessionState): boolean => {
  const lines = scriptBlocks.get(session.currentLabel);
  if (!lines) {
    return false;
  }

  for (let index = session.lineIndex; index < lines.length; index += 1) {
    const nextLine = lines[index]?.trim() ?? '';
    if (nextLine.length === 0 || isIgnoredScriptLine(nextLine)) {
      continue;
    }

    if (/^(?:setvar|copyvar|setorcopyvar|addvar|subvar|checkflag|checkitem|checkitemspace|checkmoney|checkplayergender|bufferitemnameplural|bufferitemname|bufferstdstring|buffernumberstring|specialvar)\b/u.test(nextLine)) {
      continue;
    }

    return /^yesnobox\b/u.test(nextLine)
      || /^multichoice(?:default|grid)?\b/u.test(nextLine)
      || nextLine === 'special ListMenu'
      || nextLine === 'special ReturnToListMenu';
  }

  return false;
};

const continueFieldScriptSession = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  player?: PlayerState,
  npcs: readonly NpcState[] = []
): void => {
  const session = dialogue.scriptSession;
  if (!session) {
    return;
  }

  if (continueSpecialState(dialogue, runtime, session)) {
    return;
  }

  while (true) {
    const lines = scriptBlocks.get(session.currentLabel);
    if (!lines) {
      finishDialogueSession(dialogue);
      return;
    }

    if (session.lineIndex >= lines.length) {
      if (!popCallStack(session)) {
        finishDialogueSession(dialogue);
        return;
      }
      continue;
    }

    const line = lines[session.lineIndex]?.trim() ?? '';
    session.lineIndex += 1;

    if (line.length === 0 || isIgnoredScriptLine(line)) {
      continue;
    }

    if (line === 'lockall') {
      freezeObjectsWaitForPlayer(runtime.eventObjectLock, npcs);
      tickEventObjectLock(runtime.eventObjectLock, player, npcs);
      if (!isFreezePlayerFinished(runtime.eventObjectLock, player)) {
        session.waitingFor = 'task';
        return;
      }
      continue;
    }

    if (line === 'lock') {
      if (runtime.eventObjectLock.selectedObjectEventId && npcs.some((npc) => npc.id === runtime.eventObjectLock.selectedObjectEventId)) {
        freezeObjectsWaitForPlayerAndSelected(runtime.eventObjectLock, npcs);
        tickEventObjectLock(runtime.eventObjectLock, player, npcs);
        if (!isFreezeSelectedObjectAndPlayerFinished(runtime.eventObjectLock, player)) {
          session.waitingFor = 'task';
          return;
        }
      } else {
        freezeObjectsWaitForPlayer(runtime.eventObjectLock, npcs);
        tickEventObjectLock(runtime.eventObjectLock, player, npcs);
        if (!isFreezePlayerFinished(runtime.eventObjectLock, player)) {
          session.waitingFor = 'task';
          return;
        }
      }
      continue;
    }

    if (line === 'releaseall') {
      hideFieldMessageBox(dialogue.fieldMessageBox);
      clearPlayerHeldMovementAndUnfreezeObjectEvents(runtime.eventObjectLock, player);
      continue;
    }

    if (line === 'release') {
      hideFieldMessageBox(dialogue.fieldMessageBox);
      unlockPlayerAndSelectedObject(runtime.eventObjectLock, player, npcs);
      continue;
    }

    if (line === 'faceplayer') {
      scriptFacePlayer(runtime.eventObjectLock, player, npcs);
      continue;
    }

    const turnObjectMatch = line.match(/^turnobject\s+([^,]+),\s*(.+)$/u);
    if (turnObjectMatch) {
      const facing = resolveFacingDirection(turnObjectMatch[2], runtime, player);
      if (!facing) {
        finishDialogueSession(dialogue);
        return;
      }

      if (turnObjectMatch[1].trim() === 'LOCALID_PLAYER') {
        if (player) {
          player.facing = facing;
        }
        continue;
      }

      const objectEventId = resolveObjectEventIdToken(turnObjectMatch[1], dialogue, runtime, npcs);
      if (objectEventId) {
        const npc = npcs.find((candidate) => candidate.id === objectEventId);
        if (npc) {
          npc.facing = facing;
        }
      }
      continue;
    }

    const applyMovementMatch = line.match(/^applymovement\s+([^,]+),\s*([A-Za-z0-9_]+)/u);
    if (applyMovementMatch) {
      const targetToken = applyMovementMatch[1].trim();
      const movementLabel = applyMovementMatch[2];
      startDecompScriptMovement(session, targetToken, movementLabel, dialogue, runtime, player, npcs);
      continue;
    }

    const waitMovementMatch = line.match(/^waitmovement\s+(.+)$/u);
    if (waitMovementMatch) {
      const target = resolveMovementTarget(waitMovementMatch[1], dialogue, runtime, player, npcs);
      const localId = target.localId === LOCALID_NONE ? session.movingLocalId : target.localId;
      if (isDecompScriptMovementFinished(runtime, localId)) {
        continue;
      }
      session.waitingMovementLocalId = localId;
      session.waitingFor = 'movement';
      return;
    }

    const waitMovementAtMatch = line.match(/^waitmovementat\s+([^,]+),\s*[^,]+,\s*[^,]+$/u);
    if (waitMovementAtMatch) {
      const target = resolveMovementTarget(waitMovementAtMatch[1], dialogue, runtime, player, npcs);
      const localId = target.localId === LOCALID_NONE ? session.movingLocalId : target.localId;
      if (isDecompScriptMovementFinished(runtime, localId)) {
        continue;
      }
      session.waitingMovementLocalId = localId;
      session.waitingFor = 'movement';
      return;
    }

    const gotoMatch = line.match(/^goto\s+([A-Za-z0-9_]+)/u);
    if (gotoMatch) {
      jumpSession(session, gotoMatch[1]);
      continue;
    }

    const conditionalGoto = tryEvaluateGotoCondition(line, runtime, player);
    if (conditionalGoto.matched) {
      if (conditionalGoto.target) {
        jumpSession(session, conditionalGoto.target);
      }
      continue;
    }

    const callMatch = line.match(/^call\s+([A-Za-z0-9_]+)/u);
    if (callMatch) {
      callScriptLabel(session, callMatch[1]);
      continue;
    }

    const conditionalCall = tryEvaluateCallCondition(line, runtime, player);
    if (conditionalCall.matched) {
      if (conditionalCall.target) {
        callScriptLabel(session, conditionalCall.target);
      }
      continue;
    }

    const callStdMatch = line.match(/^callstd\s+([A-Za-z0-9_]+)/u);
    if (callStdMatch) {
      const stdLabel = resolveStdScriptLabel(callStdMatch[1]);
      if (!stdLabel) {
        finishDialogueSession(dialogue);
        return;
      }
      callScriptLabel(session, stdLabel);
      continue;
    }

    if (line === 'return') {
      if (!popCallStack(session)) {
        finishDialogueSession(dialogue);
        return;
      }
      continue;
    }

    if (line === 'end') {
      finishDialogueSession(dialogue);
      return;
    }

    const trainerBattle = parseTrainerBattleCommand(line);
    if (trainerBattle) {
      session.lastTrainerId = trainerBattle.trainerId;
      if (hasTrainerBeenFought(runtime, trainerBattle.trainerId)) {
        continue;
      }

      if (queueDecompTrainerBattle(runtime, trainerBattle.trainerId, trainerBattle.format) && runtime.pendingTrainerBattle) {
        runtime.pendingTrainerBattle.continueScriptSession = {
          speakerId: dialogue.speakerId ?? 'system',
          session: trainerBattle.postBattleScriptLabel
            ? createFieldScriptSessionAtLabel(session, trainerBattle.postBattleScriptLabel, trainerBattle.trainerId)
            : cloneFieldScriptSession(session)
        };
      }

      if (!trainerBattle.introLabel) {
        finishDialogueSession(dialogue);
        return;
      }

      const pages = getTextPagesForLabel(trainerBattle.introLabel, runtime);
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages);
      finishDialogueSession(dialogue);
      return;
    }

    const msgboxMatch = line.match(/^msgbox\s+([A-Za-z0-9_]+)(?:,\s*([A-Za-z0-9_]+))?/u);
    if (msgboxMatch) {
      session.loadedPointerTextLabel = msgboxMatch[1];
      const stdLabel = resolveStdScriptLabel(msgboxMatch[2] ?? 'MSGBOX_DEFAULT');
      if (!stdLabel) {
        finishDialogueSession(dialogue);
        return;
      }
      if (stdLabel === 'Std_MsgboxSign') {
        session.messageBoxFrame = 'signpost';
      }
      session.messageBoxAutoScroll = stdLabel === 'Std_MsgboxAutoclose';
      callScriptLabel(session, stdLabel);
      continue;
    }

    const autoScrollMessageMatch = line.match(/^messageautoscroll\s+([A-Za-z0-9_x]+)/u);
    if (autoScrollMessageMatch) {
      const messageLabel = resolveMessagePointerLabel(autoScrollMessageMatch[1], session);
      if (!messageLabel) {
        finishDialogueSession(dialogue);
        return;
      }
      const pages = getTextPagesForLabel(messageLabel, runtime);
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      session.messageBoxAutoScroll = true;
      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages, {
        frame: session.messageBoxFrame,
        autoScroll: true,
        textSpeed: runtime.options.textSpeed
      });
      continue;
    }

    const messageMatch = line.match(/^message\s+([A-Za-z0-9_x]+)/u);
    if (messageMatch) {
      const messageLabel = resolveMessagePointerLabel(messageMatch[1], session);
      if (!messageLabel) {
        finishDialogueSession(dialogue);
        return;
      }
      const pages = getTextPagesForLabel(messageLabel, runtime);
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages, {
        frame: session.messageBoxFrame,
        autoScroll: session.messageBoxAutoScroll,
        textSpeed: runtime.options.textSpeed
      });
      continue;
    }

    const brailleMessageMatch = line.match(/^braillemessage(?:_wait)?\s+([A-Za-z0-9_]+)/u);
    if (brailleMessageMatch) {
      const pages = getTextPagesForLabel(brailleMessageMatch[1], runtime);
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      runtime.vars.VAR_0x8004 = Math.max(0, ...pages.map((page) => page.length * 8));
      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages, {
        frame: 'std',
        font: 'braille',
        textSpeed: runtime.options.textSpeed
      });
      if (line.startsWith('braillemessage_wait')) {
        session.waitingFor = 'text';
        return;
      }
      continue;
    }

    const getBrailleStringWidthMatch = line.match(/^getbraillestringwidth\s+([A-Za-z0-9_]+)/u);
    if (getBrailleStringWidthMatch) {
      const pages = getTextPagesForLabel(getBrailleStringWidthMatch[1], runtime) ?? [];
      runtime.vars.VAR_0x8004 = Math.max(0, ...pages.map((page) => page.length * 8));
      continue;
    }

    const yesNoBoxMatch = line.match(/^yesnobox\s+([^,]+),\s*([^,]+)$/u);
    if (yesNoBoxMatch) {
      startChoicePrompt(dialogue, session, ['YES', 'NO'], {
        kind: 'yesno',
        tilemapLeft: resolveNumericExpression(yesNoBoxMatch[1], runtime, player),
        tilemapTop: resolveNumericExpression(yesNoBoxMatch[2], runtime, player)
      });
      return;
    }

    const fadeScreenSpeedMatch = line.match(/^fadescreenspeed\s+([^,]+),\s*(.+)$/u);
    if (fadeScreenSpeedMatch) {
      const mode = resolveFadeMode(fadeScreenSpeedMatch[1], runtime, player);
      if (mode === null) {
        continue;
      }
      beginFieldFadeScreen(runtime, mode, resolveNumericExpression(fadeScreenSpeedMatch[2], runtime, player));
      session.specialState = { kind: 'paletteFade' };
      session.waitingFor = 'task';
      return;
    }

    const fadeScreenMatch = line.match(/^fadescreen\s+(.+)$/u);
    if (fadeScreenMatch) {
      const mode = resolveFadeMode(fadeScreenMatch[1], runtime, player);
      if (mode === null) {
        continue;
      }
      beginFieldFadeScreen(runtime, mode, 0);
      session.specialState = { kind: 'paletteFade' };
      session.waitingFor = 'task';
      return;
    }

    const playFanfareMatch = line.match(/^(?:playfanfare|fanfare)\s+(.+)$/u);
    if (playFanfareMatch) {
      playFieldFanfare(runtime, resolveNumericExpression(playFanfareMatch[1], runtime, player));
      continue;
    }

    if (line === 'waitfanfare') {
      if (runtime.fieldAudio.fanfareTaskActive) {
        session.specialState = { kind: 'fanfare' };
        session.waitingFor = 'task';
        return;
      }
      continue;
    }

    const textColorMatch = line.match(/^textcolor\s+(.+)$/u);
    if (textColorMatch) {
      runtime.vars.VAR_PREV_TEXT_COLOR = runtime.vars.VAR_TEXT_COLOR ?? 255;
      runtime.vars.VAR_TEXT_COLOR = resolveNumericExpression(textColorMatch[1], runtime, player);
      continue;
    }

    const playSeMatch = line.match(/^playse\s+(.+)$/u);
    if (playSeMatch) {
      playFieldSoundEffect(runtime, resolveNumericExpression(playSeMatch[1], runtime, player));
      continue;
    }

    const playBgmMatch = line.match(/^playbgm\s+([^,]+)(?:,\s*(.+))?$/u);
    if (playBgmMatch) {
      playFieldBgm(
        runtime,
        resolveNumericExpression(playBgmMatch[1], runtime, player),
        resolveNumericExpression(playBgmMatch[2] ?? '0', runtime, player) !== 0
      );
      continue;
    }

    const saveBgmMatch = line.match(/^savebgm\s+(.+)$/u);
    if (saveBgmMatch) {
      saveFieldBgm(runtime, resolveNumericExpression(saveBgmMatch[1], runtime, player));
      continue;
    }

    if (line === 'fadedefaultbgm') {
      const defaultMusic = getDefaultMapMusicForScriptSession(session);
      if (defaultMusic !== null) {
        setFieldDefaultMapMusic(runtime, defaultMusic);
      }
      fadeDefaultFieldBgm(runtime);
      continue;
    }

    const fadeOutBgmMatch = line.match(/^fadeoutbgm\s+(.+)$/u);
    if (fadeOutBgmMatch) {
      fadeOutFieldBgm(runtime, resolveNumericExpression(fadeOutBgmMatch[1], runtime, player));
      continue;
    }

    const fadeInBgmMatch = line.match(/^fadeinbgm\s+(.+)$/u);
    if (fadeInBgmMatch) {
      fadeInFieldBgm(runtime, resolveNumericExpression(fadeInBgmMatch[1], runtime, player));
      continue;
    }

    const fadeNewBgmMatch = line.match(/^fadenewbgm\s+([^,]+)(?:,\s*(.+))?$/u);
    if (fadeNewBgmMatch) {
      fadeNewFieldBgm(
        runtime,
        resolveNumericExpression(fadeNewBgmMatch[1], runtime, player),
        resolveNumericExpression(fadeNewBgmMatch[2] ?? '8', runtime, player)
      );
      continue;
    }

    const fameCheckerMatch = line.match(/^famechecker\s+([^,]+),\s*([^,]+)(?:,\s*([A-Za-z0-9_]+))?$/u);
    if (fameCheckerMatch) {
      const person = resolveNumericExpression(fameCheckerMatch[1], runtime, player);
      const value = resolveNumericExpression(fameCheckerMatch[2], runtime, player);
      const special = fameCheckerMatch[3] ?? null;
      runtime.vars.VAR_0x8004 = person;
      runtime.vars.VAR_0x8005 = value;
      runtime.fameChecker.updates.push({ person, value, special });
      if (special === 'SetFlavorTextFlagFromSpecialVars') {
        setFameCheckerFlavorTextFlag(runtime, person, value);
      } else if (special === 'UpdatePickStateFromSpecialVar8005') {
        updateFameCheckerPickState(runtime, person, value);
      }
      continue;
    }

    if (line === 'waitstate') {
      if (dialogue.active || dialogue.choice || session.specialState) {
        session.waitingFor = 'task';
        return;
      }
      continue;
    }

    if (line === 'waitmessage') {
      if (dialogue.active && !nextCommandOpensChoice(session)) {
        session.waitingFor = 'text';
        return;
      }
      continue;
    }

    if (line === 'waitbuttonpress') {
      if (dialogue.active) {
        session.waitingFor = 'text';
        return;
      }
      continue;
    }

    if (line === 'closemessage') {
      clearVisibleDialogue(dialogue);
      continue;
    }

    const delayMatch = line.match(/^delay\s+(.+)$/u);
    if (delayMatch) {
      const frames = Math.max(0, resolveNumericExpression(delayMatch[1], runtime, player));
      if (frames > 0) {
        session.specialState = { kind: 'delay', counter: frames };
        session.waitingFor = 'task';
        return;
      }
      continue;
    }

    if (line === 'waitdooranim') {
      if (runtime.doorAnimationTask.active) {
        session.specialState = { kind: 'doorAnimation' };
        session.waitingFor = 'task';
        return;
      }
      continue;
    }

    const doorMatch = line.match(/^(opendoor|closedoor)\s+([^,]+),\s*(.+)$/u);
    if (doorMatch) {
      const x = resolveNumericExpression(doorMatch[2], runtime, player);
      const y = resolveNumericExpression(doorMatch[3], runtime, player);
      const key = doorAnimationKey(x, y);
      runtime.doorAnimations[key] = doorMatch[1] === 'opendoor' ? 'open' : 'closed';
      if (doorMatch[1] === 'opendoor') {
        playFieldSoundEffect(runtime, resolveNumericExpression('SE_DOOR', runtime, player));
      }
      startDoorAnimationTask(runtime, key);
      continue;
    }

    if (line === 'signmsg') {
      session.messageBoxFrame = 'signpost';
      continue;
    }

    if (line === 'normalmsg') {
      session.messageBoxFrame = 'std';
      session.messageBoxAutoScroll = false;
      continue;
    }

    const multichoiceMatch = line.match(/^multichoice\s+([^,]+),\s*([^,]+),\s*([^,]+),\s*(.+)$/u);
    if (multichoiceMatch) {
      const menuId = resolveNumericExpression(multichoiceMatch[3], runtime, player);
      const options = multichoiceOptionMap.get(menuId);
      if (!options || options.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      startChoicePrompt(dialogue, session, options, {
        kind: 'multichoice',
        tilemapLeft: resolveNumericExpression(multichoiceMatch[1], runtime, player),
        tilemapTop: resolveNumericExpression(multichoiceMatch[2], runtime, player),
        ignoreCancel: (resolveNumericExpression(multichoiceMatch[4], runtime, player) & 1) === 1
      });
      return;
    }

    const multichoiceDefaultMatch = line.match(/^multichoicedefault\s+([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*(.+)$/u);
    if (multichoiceDefaultMatch) {
      const menuId = resolveNumericExpression(multichoiceDefaultMatch[3], runtime, player);
      const options = multichoiceOptionMap.get(menuId);
      if (!options || options.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      startChoicePrompt(dialogue, session, options, {
        kind: 'multichoice',
        tilemapLeft: resolveNumericExpression(multichoiceDefaultMatch[1], runtime, player),
        tilemapTop: resolveNumericExpression(multichoiceDefaultMatch[2], runtime, player),
        ignoreCancel: (resolveNumericExpression(multichoiceDefaultMatch[5], runtime, player) & 1) === 1
      });
      if (dialogue.choice) {
        dialogue.choice.selectedIndex = Math.max(
          0,
          Math.min(options.length - 1, resolveNumericExpression(multichoiceDefaultMatch[4], runtime, player))
        );
      }
      return;
    }

    const multichoiceGridMatch = line.match(/^multichoicegrid\s+([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*(.+)$/u);
    if (multichoiceGridMatch) {
      const menuId = resolveNumericExpression(multichoiceGridMatch[3], runtime, player);
      const options = multichoiceOptionMap.get(menuId);
      if (!options || options.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      startChoicePrompt(dialogue, session, options, {
        kind: 'multichoice',
        tilemapLeft: resolveNumericExpression(multichoiceGridMatch[1], runtime, player),
        tilemapTop: resolveNumericExpression(multichoiceGridMatch[2], runtime, player),
        columns: Math.max(1, resolveNumericExpression(multichoiceGridMatch[4], runtime, player)),
        ignoreCancel: (resolveNumericExpression(multichoiceGridMatch[5], runtime, player) & 1) === 1
      });
      return;
    }

    if (line === 'special ListMenu') {
      const listMenuId = Number(runtime.vars.VAR_0x8004 ?? runtime.vars.VAR_8004 ?? 0);
      const definition = listMenuDefinitionMap.get(listMenuId);
      if (!definition) {
        runtime.vars.VAR_RESULT = SCR_MENU_CANCEL;
        continue;
      }

      startChoicePrompt(dialogue, session, definition.options, {
        kind: 'listmenu',
        tilemapLeft: definition.tilemapLeft,
        tilemapTop: definition.tilemapTop,
        maxVisibleOptions: definition.maxShowed,
        reopenAfterSelection: !definition.closeOnChoose,
        listMenuId: definition.id
      });
      if (nextCommandIsWaitState(session)) {
        continue;
      }
      return;
    }

    if (line === 'special ReturnToListMenu') {
      const suspendedChoice = session.suspendedChoice;
      if (!suspendedChoice) {
        continue;
      }

      dialogue.active = true;
      dialogue.choice = {
        ...suspendedChoice,
        options: [...suspendedChoice.options]
      };
      session.waitingFor = 'choice';
      session.suspendedChoice = null;
      return;
    }

    if (line === 'special AnimatePcTurnOn') {
      beginPcScreenEffectTurnOn(runtime.pcScreenEffect);
      continue;
    }

    if (line === 'special AnimatePcTurnOff') {
      beginPcScreenEffectTurnOff(runtime.pcScreenEffect);
      continue;
    }

    if (line === 'special CreatePCMenu') {
      session.specialState = {
        kind: 'pcMenu',
        phase: 'menu'
      };
      openCenterPcMenuChoice(dialogue, session, runtime);
      if (nextCommandIsWaitState(session)) {
        continue;
      }
      return;
    }

    if (line === 'special BedroomPC' || line === 'special PlayerPC') {
      session.specialState = {
        kind: 'playerPc',
        phase: 'menu'
      };
      openBedroomPcMenuChoice(dialogue, session);
      if (nextCommandIsWaitState(session)) {
        continue;
      }
      return;
    }

    if (line === 'special HallOfFamePCBeginFade') {
      session.specialState = {
        kind: 'hallOfFamePc',
        phase: 'hallOfFameMessage'
      };
      beginPcScreenEffectTurnOff(runtime.pcScreenEffect);
      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', getHallOfFamePcPages(runtime));
      session.waitingFor = 'text';
      if (nextCommandIsWaitState(session)) {
        continue;
      }
      return;
    }

    const pokemartMatch = line.match(/^pokemart\s+([A-Za-z0-9_]+)/u);
    if (pokemartMatch) {
      const items = [...getMartStockForScriptId(session.rootScriptId, runtime)];
      session.specialState = {
        kind: 'mart',
        scriptId: session.rootScriptId,
        items
      };
      dialogue.active = true;
      dialogue.text = '';
      dialogue.queue = [];
      dialogue.queueIndex = 0;
      dialogue.choice = null;
      dialogue.shop = createMartShopState(items, runtime);
      hideFieldMessageBox(dialogue.fieldMessageBox);
      session.waitingFor = 'task';
      return;
    }

    const specialMatch = line.match(/^special\s+([A-Za-z0-9_]+)/u);
    if (specialMatch) {
      const specialResult = runDecompSpecial(specialMatch[1], dialogue, runtime, player, session, npcs);
      if (specialResult === 'continue') {
        continue;
      }
      if (specialResult === 'pause') {
        return;
      }
      finishDialogueSession(dialogue);
      return;
    }

    const switchMatch = line.match(/^switch\s+(.+)$/u);
    if (switchMatch) {
      const switchValue = resolveScriptValue(switchMatch[1], runtime, player);
      evaluateSwitchCases(session, lines, switchValue, runtime, player);
      continue;
    }

    if (/^case\s+/u.test(line)) {
      continue;
    }

    const setVarMatch = line.match(/^setvar\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (setVarMatch) {
      (runtime.vars as Record<string, ScriptValue>)[setVarMatch[1]] = resolveSetVarValue(setVarMatch[2], runtime, player);
      continue;
    }

    const copyVarMatch = line.match(/^copyvar\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (copyVarMatch) {
      (runtime.vars as Record<string, ScriptValue>)[copyVarMatch[1]] = resolveScriptValue(copyVarMatch[2], runtime, player);
      continue;
    }

    const setOrCopyVarMatch = line.match(/^setorcopyvar\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (setOrCopyVarMatch) {
      (runtime.vars as Record<string, ScriptValue>)[setOrCopyVarMatch[1]] = resolveScriptValue(setOrCopyVarMatch[2], runtime, player);
      continue;
    }

    const setDynamicWarpMatch = line.match(/^setdynamicwarp\s+(.+)$/u);
    if (setDynamicWarpMatch) {
      const destination = parseWarpDestinationArgs(setDynamicWarpMatch[1], runtime, player);
      if (destination) {
        runtime.dynamicWarp = destination;
      }
      continue;
    }

    const setWarpMatch = line.match(/^setwarp\s+(.+)$/u);
    if (setWarpMatch) {
      const destination = parseWarpDestinationArgs(setWarpMatch[1], runtime, player);
      if (destination) {
        runtime.dynamicWarp = destination;
      }
      continue;
    }

    const scriptWarpMatch = line.match(/^(warp|warpspinenter)\s+(.+)$/u);
    if (scriptWarpMatch) {
      const destination = parseWarpDestinationArgs(scriptWarpMatch[2], runtime, player);
      if (destination) {
        runtime.pendingScriptWarp = {
          ...destination,
          kind: scriptWarpMatch[1] === 'warpspinenter' ? 'spin' : 'warp'
        };
      }
      continue;
    }

    const addVarMatch = line.match(/^addvar\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (addVarMatch) {
      runtime.vars[addVarMatch[1]] = resolveNumericExpression(addVarMatch[1], runtime, player)
        + resolveNumericExpression(addVarMatch[2], runtime, player);
      continue;
    }

    const subVarMatch = line.match(/^subvar\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (subVarMatch) {
      runtime.vars[subVarMatch[1]] = resolveNumericExpression(subVarMatch[1], runtime, player)
        - resolveNumericExpression(subVarMatch[2], runtime, player);
      continue;
    }

    const specialVarMatch = line.match(/^specialvar\s+([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)/u);
    if (specialVarMatch) {
      switch (specialVarMatch[2]) {
        case 'ShouldTryRematchBattle':
          runtime.vars[specialVarMatch[1]] = 0;
          break;
        case 'Script_HasTrainerBeenFought':
          runtime.vars[specialVarMatch[1]] = session.lastTrainerId && hasTrainerBeenFought(runtime, session.lastTrainerId) ? 1 : 0;
          break;
        case 'BufferTMHMMoveName': {
          const itemId = resolveItemIdToken('VAR_0x8004', runtime, player);
          const moveId = itemId ? getItemDefinition(itemId).moveId : null;
          if (moveId) {
            setBufferedString(runtime, 'STR_VAR_1', formatMoveName(moveId));
            runtime.vars[specialVarMatch[1]] = 1;
          } else {
            runtime.vars[specialVarMatch[1]] = 0;
          }
          break;
        }
        default:
          if (!runDecompSpecialVar(specialVarMatch[1], specialVarMatch[2], runtime, player, session)) {
            finishDialogueSession(dialogue);
            return;
          }
          break;
      }
      continue;
    }

    if (line === 'checkplayergender') {
      runtime.vars.VAR_RESULT = runtime.startMenu.playerGender === 'female' ? 1 : 0;
      continue;
    }

    const getPlayerXYMatch = line.match(/^getplayerxy\s+([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)$/u);
    if (getPlayerXYMatch) {
      const tileSize = 16;
      runtime.vars[getPlayerXYMatch[1]] = player ? Math.round(player.position.x / tileSize) : 0;
      runtime.vars[getPlayerXYMatch[2]] = player ? Math.round(player.position.y / tileSize) : 0;
      continue;
    }

    const getPartySizeMatch = line.match(/^getpartysize$/u);
    if (getPartySizeMatch) {
      runtime.vars.VAR_RESULT = runtime.party.length;
      continue;
    }

    const checkPartyMoveMatch = line.match(/^checkpartymove\s+([A-Za-z0-9_]+)/u);
    if (checkPartyMoveMatch) {
      runtime.vars.VAR_RESULT = checkPartyMove(runtime, checkPartyMoveMatch[1]);
      continue;
    }

    const setFieldEffectArgumentMatch = line.match(/^setfieldeffectargument\s+(\d+),\s*(.+)$/u);
    if (setFieldEffectArgumentMatch) {
      setFieldEffectArgument(
        runtime,
        Number.parseInt(setFieldEffectArgumentMatch[1], 10),
        resolveNumericExpression(setFieldEffectArgumentMatch[2], runtime, player)
      );
      continue;
    }

    const doFieldEffectMatch = line.match(/^dofieldeffect\s+([A-Za-z0-9_]+)/u);
    if (doFieldEffectMatch) {
      switch (doFieldEffectMatch[1]) {
        case 'FLDEFF_POKECENTER_HEAL':
          continue;
        case 'FLDEFF_USE_STRENGTH':
          doFieldEffectStrength(runtime, dialogue, session);
          continue;
        case 'FLDEFF_USE_SURF':
          if (player) forcePlayerToStartSurfing(player);
          continue;
        case 'FLDEFF_USE_WATERFALL':
          runtime.vars.usedWaterfallFieldEffect = 1;
          continue;
        case 'FLDEFF_USE_ROCK_SMASH':
          doFieldEffectRockSmash(runtime, dialogue, session);
          continue;
        case 'FLDEFF_USE_DIG':
          doFieldEffectDig(runtime, session, player);
          continue;
        case 'FLDEFF_USE_TELEPORT':
          doFieldEffectTeleport(runtime, session, player);
          continue;
        case 'FLDEFF_SWEET_SCENT':
          doFieldEffectSweetScent(runtime, session);
          continue;
        default:
          finishDialogueSession(dialogue);
          return;
      }
    }

    const checkFlagMatch = line.match(/^checkflag\s+([A-Za-z0-9_]+)/u);
    if (checkFlagMatch) {
      runtime.vars.VAR_RESULT = runtime.flags.has(checkFlagMatch[1]) ? 1 : 0;
      continue;
    }

    const setFlagMatch = line.match(/^setflag\s+([A-Za-z0-9_]+)/u);
    if (setFlagMatch) {
      runtime.flags.add(setFlagMatch[1]);
      continue;
    }

    const clearFlagMatch = line.match(/^clearflag\s+([A-Za-z0-9_]+)/u);
    if (clearFlagMatch) {
      runtime.flags.delete(clearFlagMatch[1]);
      continue;
    }

    const removeObjectMatch = line.match(/^removeobject\s+(.+)$/u);
    if (removeObjectMatch) {
      const objectEventId = resolveObjectEventIdToken(removeObjectMatch[1], dialogue, runtime, npcs);
      if (objectEventId) {
        const npc = npcs.find((candidate) => candidate.id === objectEventId);
        if (npc) {
          removeObjectEvent(runtime.flags, npc);
        }
      }
      continue;
    }

    const addObjectMatch = line.match(/^addobject\s+(.+)$/u);
    if (addObjectMatch) {
      const objectEventId = resolveObjectEventIdToken(addObjectMatch[1], dialogue, runtime, npcs);
      if (objectEventId) {
        const npc = npcs.find((candidate) => candidate.id === objectEventId);
        if (npc) {
          addObjectEvent(runtime.flags, npc);
        }
      }
      continue;
    }

    const hideObjectAtMatch = line.match(/^hideobjectat\s+(.+)$/u);
    if (hideObjectAtMatch) {
      const args = parseCommandArgs(hideObjectAtMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc) {
        setObjectEventInvisibility(npc, true);
      }
      continue;
    }

    const showObjectAtMatch = line.match(/^showobjectat\s+(.+)$/u);
    if (showObjectAtMatch) {
      const args = parseCommandArgs(showObjectAtMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc) {
        setObjectEventInvisibility(npc, false);
      }
      continue;
    }

    const setObjectXyMatch = line.match(/^setobjectxy\s+(.+)$/u);
    if (setObjectXyMatch) {
      const args = parseCommandArgs(setObjectXyMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc && args[1] && args[2]) {
        moveNpcToScriptTile(
          npc,
          resolveNumericExpression(args[1], runtime, player),
          resolveNumericExpression(args[2], runtime, player),
          false
        );
      }
      continue;
    }

    const setObjectXyPermMatch = line.match(/^setobjectxyperm\s+(.+)$/u);
    if (setObjectXyPermMatch) {
      const args = parseCommandArgs(setObjectXyPermMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc && args[1] && args[2]) {
        moveNpcToScriptTile(
          npc,
          resolveNumericExpression(args[1], runtime, player),
          resolveNumericExpression(args[2], runtime, player),
          true
        );
      }
      continue;
    }

    const setObjectMovementTypeMatch = line.match(/^setobjectmovementtype\s+(.+)$/u);
    if (setObjectMovementTypeMatch) {
      const args = parseCommandArgs(setObjectMovementTypeMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      const movementType = args[1];
      if (npc && movementType) {
        npc.movementType = movementType;
        const facing = facingFromMovementTypeToken(movementType);
        if (facing) {
          npc.facing = facing;
          npc.initialFacing = facing;
        }
      }
      continue;
    }

    const copyObjectXyToPermMatch = line.match(/^copyobjectxytoperm\s+(.+)$/u);
    if (copyObjectXyToPermMatch) {
      const objectEventId = resolveObjectEventIdToken(copyObjectXyToPermMatch[1], dialogue, runtime, npcs);
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc) {
        const tile = npc.currentTile ?? vec2(Math.round(npc.position.x / 16), Math.round(npc.position.y / 16));
        npc.initialTile = vec2(tile.x, tile.y);
      }
      continue;
    }

    const setObjectSubpriorityMatch = line.match(/^setobjectsubpriority\s+(.+)$/u);
    if (setObjectSubpriorityMatch) {
      const args = parseCommandArgs(setObjectSubpriorityMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const subpriorityToken = args[3] ?? args[1];
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc && subpriorityToken) {
        setNpcFixedSubpriority(npc, resolveNumericExpression(subpriorityToken, runtime, player) + 83);
      }
      continue;
    }

    const resetObjectSubpriorityMatch = line.match(/^resetobjectsubpriority\s+(.+)$/u);
    if (resetObjectSubpriorityMatch) {
      const args = parseCommandArgs(resetObjectSubpriorityMatch[1]);
      const objectEventId = args[0] ? resolveObjectEventIdToken(args[0], dialogue, runtime, npcs) : null;
      const npc = objectEventId ? npcs.find((candidate) => candidate.id === objectEventId) : null;
      if (npc) {
        resetNpcFixedSubpriority(npc);
      }
      continue;
    }

    const setTrainerFlagMatch = line.match(/^settrainerflag\s+([A-Za-z0-9_]+)/u);
    if (setTrainerFlagMatch) {
      runtime.flags.add(getDecompTrainerFlag(setTrainerFlagMatch[1]));
      continue;
    }

    const clearTrainerFlagMatch = line.match(/^cleartrainerflag\s+([A-Za-z0-9_]+)/u);
    if (clearTrainerFlagMatch) {
      runtime.flags.delete(getDecompTrainerFlag(clearTrainerFlagMatch[1]));
      continue;
    }

    const checkMoneyMatch = line.match(/^checkmoney\s+(.+)$/u);
    if (checkMoneyMatch) {
      runtime.vars.VAR_RESULT = getMoney(runtime) >= resolveNumericExpression(checkMoneyMatch[1], runtime, player) ? 1 : 0;
      continue;
    }

    const checkCoinsMatch = line.match(/^checkcoins\s+([A-Za-z0-9_]+)/u);
    if (checkCoinsMatch) {
      runtime.vars[checkCoinsMatch[1]] = getCoins(runtime);
      continue;
    }

    const addCoinsMatch = line.match(/^addcoins\s+(.+)$/u);
    if (addCoinsMatch) {
      addCoins(runtime, resolveNumericExpression(addCoinsMatch[1], runtime, player));
      continue;
    }

    const removeCoinsMatch = line.match(/^removecoins\s+(.+)$/u);
    if (removeCoinsMatch) {
      removeCoins(runtime, resolveNumericExpression(removeCoinsMatch[1], runtime, player));
      continue;
    }

    const removeMoneyMatch = line.match(/^removemoney\s+(.+)$/u);
    if (removeMoneyMatch) {
      removeMoney(runtime, resolveNumericExpression(removeMoneyMatch[1], runtime, player));
      continue;
    }

    const checkItemMatch = line.match(/^checkitem\s+(.+)$/u);
    if (checkItemMatch) {
      const args = parseCommandArgs(checkItemMatch[1]);
      const itemId = resolveItemIdToken(args[0] ?? '', runtime, player);
      runtime.vars.VAR_RESULT = itemId && checkBagHasItem(runtime.bag, itemId, resolveItemCount(args[1], runtime, player)) ? 1 : 0;
      continue;
    }

    const checkItemSpaceMatch = line.match(/^checkitemspace\s+(.+)$/u);
    if (checkItemSpaceMatch) {
      const args = parseCommandArgs(checkItemSpaceMatch[1]);
      const itemId = resolveItemIdToken(args[0] ?? '', runtime, player);
      runtime.vars.VAR_RESULT = itemId && checkBagHasSpace(runtime.bag, itemId, resolveItemCount(args[1], runtime, player)) ? 1 : 0;
      continue;
    }

    const addItemMatch = line.match(/^(?:additem|giveitem)\s+(.+)$/u);
    if (addItemMatch) {
      const args = parseCommandArgs(addItemMatch[1]);
      const itemId = resolveItemIdToken(args[0] ?? '', runtime, player);
      runtime.vars.VAR_RESULT = itemId && addBagItem(runtime.bag, itemId, resolveItemCount(args[1], runtime, player)) ? 1 : 0;
      continue;
    }

    const removeItemMatch = line.match(/^removeitem\s+(.+)$/u);
    if (removeItemMatch) {
      const args = parseCommandArgs(removeItemMatch[1]);
      const itemId = resolveItemIdToken(args[0] ?? '', runtime, player);
      runtime.vars.VAR_RESULT = itemId && removeBagItem(runtime.bag, itemId, resolveItemCount(args[1], runtime, player)) ? 1 : 0;
      continue;
    }

    const checkItemTypeMatch = line.match(/^checkitemtype\s+(.+)$/u);
    if (checkItemTypeMatch) {
      const itemId = resolveItemIdToken(checkItemTypeMatch[1], runtime, player);
      runtime.vars.VAR_RESULT = 0;
      if (itemId) {
        const pocket = getItemDefinition(itemId).pocket;
        runtime.vars.VAR_RESULT = resolveNumericExpression(pocket, runtime, player);
      }
      continue;
    }

    const bufferItemNamePluralMatch = line.match(/^bufferitemnameplural\s+([A-Za-z0-9_]+),\s*([^,]+),\s*(.+)$/u);
    if (bufferItemNamePluralMatch) {
      const itemId = resolveItemIdToken(bufferItemNamePluralMatch[2], runtime, player);
      const count = resolveItemCount(bufferItemNamePluralMatch[3], runtime, player);
      if (itemId) {
        const itemName = getItemDefinition(itemId).name;
        setBufferedString(runtime, bufferItemNamePluralMatch[1], count === 1 ? itemName : `${itemName}s`);
      }
      continue;
    }

    const bufferSpeciesNameMatch = line.match(/^bufferspeciesname\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (bufferSpeciesNameMatch) {
      const speciesId = resolveSpeciesIdToken(bufferSpeciesNameMatch[2], runtime, player);
      if (speciesId) {
        setBufferedString(runtime, bufferSpeciesNameMatch[1], getSpeciesDisplayName(speciesId));
      }
      continue;
    }

    const bufferLeadMonSpeciesNameMatch = line.match(/^bufferleadmonspeciesname\s+([A-Za-z0-9_]+)$/u);
    if (bufferLeadMonSpeciesNameMatch) {
      const leadMon = getPartyMonAt(runtime, selectFirstPartyMonSlot(runtime));
      if (leadMon) {
        setBufferedString(runtime, bufferLeadMonSpeciesNameMatch[1], getSpeciesDisplayName(leadMon.species));
      }
      continue;
    }

    const bufferPartyMonNickMatch = line.match(/^bufferpartymonnick\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (bufferPartyMonNickMatch) {
      setBufferedString(
        runtime,
        bufferPartyMonNickMatch[1],
        getMonDisplayNameForBuffer(runtime, resolveNumericExpression(bufferPartyMonNickMatch[2], runtime, player))
      );
      continue;
    }

    const bufferMoveNameMatch = line.match(/^buffermovename\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (bufferMoveNameMatch) {
      const moveValue = resolveScriptValue(bufferMoveNameMatch[2].trim(), runtime, player);
      setBufferedString(
        runtime,
        bufferMoveNameMatch[1],
        formatMoveName(typeof moveValue === 'string' ? moveValue : bufferMoveNameMatch[2].trim())
      );
      continue;
    }

    const bufferBoxNameMatch = line.match(/^bufferboxname\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (bufferBoxNameMatch) {
      setBufferedString(runtime, bufferBoxNameMatch[1], getPcBoxName(runtime, bufferBoxNameMatch[2]));
      continue;
    }

    const bufferItemNameMatch = line.match(/^bufferitemname\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (bufferItemNameMatch) {
      const itemId = resolveItemIdToken(bufferItemNameMatch[2], runtime, player);
      if (itemId) {
        setBufferedString(runtime, bufferItemNameMatch[1], getItemDefinition(itemId).name);
      }
      continue;
    }

    const bufferStdStringMatch = line.match(/^bufferstdstring\s+([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)/u);
    if (bufferStdStringMatch) {
      setBufferedString(
        runtime,
        bufferStdStringMatch[1],
        stdStringMap.get(bufferStdStringMatch[2]) ?? fallbackMenuTextLabel(bufferStdStringMatch[2])
      );
      continue;
    }

    const bufferNumberStringMatch = line.match(/^buffernumberstring\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (bufferNumberStringMatch) {
      setBufferedString(
        runtime,
        bufferNumberStringMatch[1],
        `${resolveNumericExpression(bufferNumberStringMatch[2], runtime, player)}`
      );
      continue;
    }

    const giveItemMatch = line.match(/^giveitem_msg\s+(.+)$/u);
    if (giveItemMatch) {
      const args = parseCommandArgs(giveItemMatch[1]);
      const textLabel = args[0];
      const itemId = resolveItemIdToken(args[1] ?? '', runtime, player);
      if (itemId) {
        runtime.vars.VAR_RESULT = addBagItem(runtime.bag, itemId, resolveItemCount(args[2], runtime, player)) ? 1 : 0;
      } else {
        runtime.vars.VAR_RESULT = 0;
      }
      const pages = textLabel ? getTextPagesForLabel(textLabel, runtime) : null;
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages);
      session.waitingFor = 'text';
      return;
    }

    const msgReceivedItemMatch = line.match(/^msgreceiveditem\s+([A-Za-z0-9_]+),\s*([^,]+)(?:,\s*([^,]+))?(?:,\s*([A-Za-z0-9_]+))?$/u);
    if (msgReceivedItemMatch) {
      const itemId = resolveItemIdToken(msgReceivedItemMatch[2], runtime, player);
      if (itemId) {
        runtime.vars.VAR_0x8000 = itemConstantMaps.byName.get(itemId) ?? 0;
        runtime.vars.VAR_0x8001 = resolveItemCount(msgReceivedItemMatch[3], runtime, player);
      }
      const pages = getTextPagesForLabel(msgReceivedItemMatch[1], runtime);
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages);
      session.waitingFor = 'text';
      return;
    }

    const giveMonMatch = line.match(/^givemon\s+([^,]+),\s*(.+)$/u);
    if (giveMonMatch) {
      const speciesId = resolveSpeciesIdToken(giveMonMatch[1], runtime, player);
      if (!speciesId) {
        runtime.vars.VAR_RESULT = 2;
        continue;
      }
      const result = storeGiftPokemon(
        runtime,
        createFieldPokemonFromSpeciesToken(speciesId, Math.max(1, resolveNumericExpression(giveMonMatch[2], runtime, player)), runtime)
      );
      runtime.vars.VAR_RESULT = result;
      runtime.vars.pcBoxWasFullMessage = result === 1 ? runtime.vars.pcBoxWasFullMessage ?? 0 : 0;
      addPokedexCaughtSpecies(runtime.pokedex, speciesId);
      runtime.startMenu.seenPokemonCount = runtime.pokedex.seenSpecies.length;
      continue;
    }

    const giveEggMatch = line.match(/^giveegg\s+(.+)$/u);
    if (giveEggMatch) {
      const speciesId = resolveSpeciesIdToken(giveEggMatch[1], runtime, player);
      if (!speciesId) {
        runtime.vars.VAR_RESULT = 2;
        continue;
      }
      runtime.vars.VAR_RESULT = storeGiftPokemon(
        runtime,
        createFieldPokemonFromSpeciesToken(speciesId, 5, runtime, { isEgg: true })
      );
      continue;
    }

    const incrementGameStatMatch = line.match(/^incrementgamestat\s+([A-Za-z0-9_]+)/u);
    if (incrementGameStatMatch) {
      runtime.vars[`gameStat.${incrementGameStatMatch[1]}`] = (runtime.vars[`gameStat.${incrementGameStatMatch[1]}`] ?? 0) + 1;
      continue;
    }

    const showMonPicMatch = line.match(/^showmonpic\s+([^,]+),\s*([^,]+),\s*(.+)$/u);
    if (showMonPicMatch) {
      const species = resolveMonPicSpeciesToken(showMonPicMatch[1], runtime, player);
      if (species) {
        dialogue.monPic = {
          species,
          tilemapLeft: resolveNumericExpression(showMonPicMatch[2], runtime, player),
          tilemapTop: resolveNumericExpression(showMonPicMatch[3], runtime, player)
        };
      }
      continue;
    }

    if (line === 'hidemonpic') {
      dialogue.monPic = null;
      continue;
    }

    if (line.startsWith('special ')
      || line.startsWith('buffer')
      || line.startsWith('waitstate')
      || line.startsWith('drawbox ')
      || line.startsWith('erasebox ')) {
      continue;
    }

    finishDialogueSession(dialogue);
    return;
  }
};

const collectTextLabelsForScript = (
  scriptId: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState,
  seen = new Set<string>()
): string[] | null => {
  if (seen.has(scriptId)) {
    return null;
  }
  seen.add(scriptId);

  const lines = scriptBlocks.get(scriptId);
  if (!lines) {
    return null;
  }

  const labels: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0 || isIgnoredScriptLine(line)) {
      continue;
    }

    const gotoMatch = line.match(/^goto\s+([A-Za-z0-9_]+)/u);
    if (gotoMatch) {
      if (labels.length > 0) {
        return labels;
      }
      return collectTextLabelsForScript(gotoMatch[1], runtime, player, seen);
    }

    const conditionalGoto = tryEvaluateGotoCondition(line, runtime, player);
    if (conditionalGoto.matched) {
      if (conditionalGoto.target) {
        if (labels.length > 0) {
          return labels;
        }
        return collectTextLabelsForScript(conditionalGoto.target, runtime, player, seen);
      }
      continue;
    }

    const callMatch = line.match(/^call\s+([A-Za-z0-9_]+)/u);
    if (callMatch) {
      const callLabels = collectTextLabelsForScript(callMatch[1], runtime, player, seen);
      if (callLabels) {
        labels.push(...callLabels);
      }
      continue;
    }

    const conditionalCall = tryEvaluateCallCondition(line, runtime, player);
    if (conditionalCall.matched) {
      if (conditionalCall.target) {
        const callLabels = collectTextLabelsForScript(conditionalCall.target, runtime, player, seen);
        if (callLabels) {
          labels.push(...callLabels);
        }
      }
      continue;
    }

    const trainerBattle = parseTrainerBattleCommand(line);
    if (trainerBattle) {
      if (trainerBattle.introLabel) {
        labels.push(trainerBattle.introLabel);
      }
      return labels.length > 0 ? labels : null;
    }

    const msgboxMatch = line.match(/^(?:msgbox|message|messageautoscroll|braillemessage|braillemessage_wait)\s+([A-Za-z0-9_]+)/u);
    if (msgboxMatch) {
      labels.push(msgboxMatch[1]);
      continue;
    }

    const giveItemMatch = line.match(/^giveitem_msg\s+([A-Za-z0-9_]+)/u);
    if (giveItemMatch) {
      labels.push(giveItemMatch[1]);
      continue;
    }

    const setVarMatch = line.match(/^setvar\s+([A-Za-z0-9_]+),\s*(.+)$/u);
    if (setVarMatch) {
      runtime.vars[setVarMatch[1]] = resolveNumericExpression(setVarMatch[2], runtime, player);
      continue;
    }

    const specialVarMatch = line.match(/^specialvar\s+([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)/u);
    if (specialVarMatch) {
      runtime.vars[specialVarMatch[1]] = 0;
      continue;
    }

    const checkFlagMatch = line.match(/^checkflag\s+([A-Za-z0-9_]+)/u);
    if (checkFlagMatch) {
      runtime.vars.VAR_RESULT = runtime.flags.has(checkFlagMatch[1]) ? 1 : 0;
      continue;
    }

    if (line.startsWith('setflag ')
      || line.startsWith('clearflag ')
      || line.startsWith('special ')
      || line.startsWith('checkitem ')
      || line.startsWith('checkitemspace ')
      || line.startsWith('checkmoney ')
      || line.startsWith('buffer')
      || line.startsWith('removeitem ')
      || line.startsWith('removeobject ')
      || line.startsWith('addobject ')
      || line.startsWith('hideobjectat ')
      || line.startsWith('showobjectat ')
      || line.startsWith('setobjectxy ')
      || line.startsWith('setobjectxyperm ')
      || line.startsWith('copyobjectxytoperm ')
      || line.startsWith('setobjectsubpriority ')
      || line.startsWith('resetobjectsubpriority ')) {
      continue;
    }

    return labels.length > 0 ? labels : null;
  }

  return labels.length > 0 ? labels : null;
};

const moveChoiceSelection = (
  choice: DialogueChoiceState,
  dx: number,
  dy: number
): void => {
  if (choice.kind === 'listmenu') {
    const maxVisible = Math.max(1, Math.min(choice.maxVisibleOptions ?? choice.options.length, choice.options.length));
    const currentIndex = choice.selectedIndex;
    const nextIndex = Math.max(0, Math.min(choice.options.length - 1, currentIndex + dy));
    choice.selectedIndex = nextIndex;

    const currentOffset = choice.scrollOffset ?? 0;
    if (nextIndex < currentOffset) {
      choice.scrollOffset = nextIndex;
    } else if (nextIndex >= currentOffset + maxVisible) {
      choice.scrollOffset = nextIndex - maxVisible + 1;
    }
    return;
  }

  const columnCount = Math.max(1, choice.columns);
  const rowCount = Math.ceil(choice.options.length / columnCount);
  const currentCol = choice.selectedIndex % columnCount;
  const currentRow = Math.floor(choice.selectedIndex / columnCount);

  let nextCol = currentCol;
  let nextRow = currentRow;

  if (columnCount === 1 && choice.wrapAround && dy !== 0) {
    nextRow = (currentRow + dy + choice.options.length) % choice.options.length;
  } else {
    nextCol = Math.max(0, Math.min(columnCount - 1, currentCol + dx));
    nextRow = Math.max(0, Math.min(rowCount - 1, currentRow + dy));
  }

  let nextIndex = nextRow * columnCount + nextCol;
  if (nextIndex >= choice.options.length) {
    nextIndex = choice.options.length - 1;
  }

  choice.selectedIndex = nextIndex;
};

const stepMartShopState = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  session: FieldScriptSessionState,
  input: InputSnapshot,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): boolean => {
  const shop = dialogue.shop;
  if (!shop || session.specialState?.kind !== 'mart') {
    return false;
  }

  const moveBinaryChoice = (): void => {
    if (input.leftPressed || input.upPressed || input.rightPressed || input.downPressed) {
      shop.selectedIndex = shop.selectedIndex === 0 ? 1 : 0;
    }
  };

  switch (shop.mode) {
    case 'mainMenu': {
      if (input.upPressed) {
        shop.selectedIndex = Math.max(0, shop.selectedIndex - 1);
      } else if (input.downPressed) {
        shop.selectedIndex = Math.min(SHOP_MAIN_OPTIONS.length - 1, shop.selectedIndex + 1);
      }

      if (input.cancelPressed) {
        exitMartShop(dialogue, runtime, session, player, npcs);
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      if (shop.selectedIndex === 0) {
        shop.mode = 'buyList';
        shop.prompt = '';
        shop.selectedIndex = 0;
        shop.scrollOffset = 0;
        return true;
      }

      if (shop.selectedIndex === 1) {
        shop.mode = 'sellList';
        shop.prompt = '';
        return true;
      }

      exitMartShop(dialogue, runtime, session, player, npcs);
      return true;
    }

    case 'buyList': {
      const optionCount = shop.items.length + 1;
      if (input.upPressed) {
        shop.selectedIndex = Math.max(0, shop.selectedIndex - 1);
      } else if (input.downPressed) {
        shop.selectedIndex = Math.min(optionCount - 1, shop.selectedIndex + 1);
      }
      ensureMartScrollVisible(shop, optionCount);

      if (input.cancelPressed) {
        enterMartMainMenu(shop, SHOP_PROMPT_ANYTHING_ELSE);
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      if (shop.selectedIndex >= shop.items.length) {
        enterMartMainMenu(shop, SHOP_PROMPT_ANYTHING_ELSE);
        return true;
      }

      const itemId = shop.items[shop.selectedIndex] ?? null;
      if (!itemId) {
        return true;
      }
      const definition = getItemDefinition(itemId);
      if (getMoney(runtime) < definition.price) {
        setShopPrompt(dialogue, shop, SHOP_PROMPT_NO_MONEY, 'buyList');
        return true;
      }

      shop.mode = 'buyQuantity';
      shop.currentItemId = itemId;
      shop.quantity = 1;
      shop.maxQuantity = Math.max(1, Math.min(99, Math.floor(getMoney(runtime) / Math.max(1, definition.price))));
      shop.prompt = `${definition.name}? Certainly.\nHow many would you like?`;
      return true;
    }

    case 'buyQuantity': {
      const itemId = shop.currentItemId;
      if (!itemId) {
        shop.mode = 'buyList';
        return true;
      }

      const adjust = adjustQuantityAccordingToDPadInput(shop.quantity, shop.maxQuantity, input);
      if (adjust.changed) {
        shop.quantity = adjust.quantity;
        return true;
      }
      if (input.cancelPressed) {
        shop.mode = 'buyList';
        shop.prompt = '';
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      shop.mode = 'buyConfirm';
      shop.selectedIndex = 0;
      shop.prompt = `${getItemDefinition(itemId).name}, and you want ${shop.quantity}.\nThat will be ${formatShopMoney(getItemDefinition(itemId).price * shop.quantity)}. Okay?`;
      return true;
    }

    case 'buyConfirm': {
      moveBinaryChoice();
      if (input.cancelPressed) {
        shop.mode = 'buyList';
        shop.prompt = '';
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      if (shop.selectedIndex !== 0 || !shop.currentItemId) {
        shop.mode = 'buyList';
        shop.prompt = '';
        return true;
      }

      const definition = getItemDefinition(shop.currentItemId);
      if (!addBagItem(runtime.bag, shop.currentItemId, shop.quantity)) {
        setShopPrompt(dialogue, shop, SHOP_PROMPT_NO_ROOM, 'buyList');
        return true;
      }
      removeMoney(runtime, definition.price * shop.quantity);
      shop.moneyBox = buyMenuDrawMoneyBox(getMoney(runtime));
      setShopPrompt(dialogue, shop, SHOP_PROMPT_THANK_YOU, 'buyList');
      return true;
    }

    case 'sellList': {
      if (input.upPressed) {
        moveBagSelection(runtime.bag, -1);
      } else if (input.downPressed) {
        moveBagSelection(runtime.bag, 1);
      } else if (input.leftPressed) {
        switchBagPocket(runtime.bag, -1);
      } else if (input.rightPressed) {
        switchBagPocket(runtime.bag, 1);
      }

      if (input.cancelPressed) {
        enterMartMainMenu(shop, SHOP_PROMPT_ANYTHING_ELSE);
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      const entry = getSelectedBagEntry(runtime.bag);
      if (!entry.itemId || entry.isExit) {
        enterMartMainMenu(shop, SHOP_PROMPT_ANYTHING_ELSE);
        return true;
      }

      const definition = getItemDefinition(entry.itemId);
      shop.currentItemId = entry.itemId;
      if (definition.price <= 0) {
        setShopPrompt(dialogue, shop, `${definition.name}? Oh, no.\nI can't buy that.`, 'sellList');
        return true;
      }

      const maxQuantity = Math.max(1, Math.min(99, entry.quantity ?? 1));
      shop.quantity = 1;
      shop.maxQuantity = maxQuantity;
      if (maxQuantity === 1) {
        shop.mode = 'sellConfirm';
        shop.selectedIndex = 0;
        shop.prompt = `I can pay ${formatShopMoney(Math.floor(definition.price / 2) * shop.quantity)}.\nWould that be okay?`;
        return true;
      }

      shop.mode = 'sellQuantity';
      shop.prompt = `${definition.name}?\nHow many would you like to sell?`;
      return true;
    }

    case 'sellQuantity': {
      const itemId = shop.currentItemId;
      if (!itemId) {
        shop.mode = 'sellList';
        return true;
      }

      const adjust = adjustQuantityAccordingToDPadInput(shop.quantity, shop.maxQuantity, input);
      if (adjust.changed) {
        shop.quantity = adjust.quantity;
        return true;
      }
      if (input.cancelPressed) {
        shop.mode = 'sellList';
        shop.prompt = '';
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      shop.mode = 'sellConfirm';
      shop.selectedIndex = 0;
      shop.prompt = `I can pay ${formatShopMoney(Math.floor(getItemDefinition(itemId).price / 2) * shop.quantity)}.\nWould that be okay?`;
      return true;
    }

    case 'sellConfirm': {
      moveBinaryChoice();
      if (input.cancelPressed) {
        shop.mode = 'sellList';
        shop.prompt = '';
        return true;
      }
      if (!input.interactPressed) {
        return true;
      }

      if (shop.selectedIndex !== 0 || !shop.currentItemId) {
        shop.mode = 'sellList';
        shop.prompt = '';
        return true;
      }

      const salePrice = Math.floor(getItemDefinition(shop.currentItemId).price / 2) * shop.quantity;
      removeBagItem(runtime.bag, shop.currentItemId, shop.quantity);
      runtime.bag.selectedIndexByPocket[runtime.bag.selectedPocket] = Math.min(
        runtime.bag.selectedIndexByPocket[runtime.bag.selectedPocket],
        getBagVisibleRows(runtime.bag).length - 1
      );
      runtime.bag.scrollOffsetByPocket[runtime.bag.selectedPocket] = Math.min(
        runtime.bag.scrollOffsetByPocket[runtime.bag.selectedPocket],
        runtime.bag.selectedIndexByPocket[runtime.bag.selectedPocket]
      );
      addMoney(runtime, salePrice);
      shop.moneyBox = buyMenuDrawMoneyBox(getMoney(runtime));
      setShopPrompt(dialogue, shop, formatShopSaleText(getItemDefinition(shop.currentItemId).name, salePrice), 'sellList');
      return true;
    }

    case 'message': {
      if (!input.interactPressed && !input.cancelPressed) {
        return true;
      }

      const pendingMode = shop.pendingMode;
      shop.pendingMode = null;
      if (!pendingMode) {
        enterMartMainMenu(shop, SHOP_PROMPT_ANYTHING_ELSE);
        return true;
      }

      shop.mode = pendingMode;
      if (pendingMode === 'mainMenu') {
        shop.prompt = SHOP_PROMPT_ANYTHING_ELSE;
      } else {
        shop.prompt = '';
      }
      if (pendingMode === 'buyConfirm' || pendingMode === 'sellConfirm') {
        shop.selectedIndex = 0;
      }
      return true;
    }
  }

  return true;
};

export const runDecompFieldScript = (
  scriptId: string,
  {
    runtime,
    player,
    dialogue,
    speakerId,
    hiddenItemFlag,
    npcs = []
  }: {
    runtime: ScriptRuntimeState;
    player?: PlayerState;
    dialogue: DialogueState;
    speakerId: string;
    hiddenItemFlag?: string | null;
    npcs?: NpcState[];
  }
): boolean => {
  if (!scriptBlocks.has(scriptId)) {
    return false;
  }

  clearVisibleDialogue(dialogue);
  dialogue.speakerId = speakerId;
  setSelectedObjectEvent(runtime.eventObjectLock, speakerId === 'system' || speakerId === 'sign' ? null : speakerId);
  dialogue.scriptSession = {
    rootScriptId: scriptId,
    currentLabel: scriptId,
    lineIndex: 0,
    lastTrainerId: null,
    hiddenItemFlag: hiddenItemFlag ?? null,
    loadedPointerTextLabel: null,
    callStack: [],
    waitingFor: null,
    movingLocalId: LOCALID_NONE,
    waitingMovementLocalId: null,
    suspendedChoice: null,
    specialState: null,
    messageBoxFrame: 'std',
    messageBoxAutoScroll: false
  };

  continueFieldScriptSession(dialogue, runtime, player, npcs);
  return true;
};

export const resumeDecompFieldScriptSession = (
  dialogue: DialogueState,
  {
    runtime,
    player,
    speakerId,
    session,
    npcs = []
  }: {
    runtime: ScriptRuntimeState;
    player?: PlayerState;
    speakerId: string;
    session: FieldScriptSessionState;
    npcs?: NpcState[];
  }
): void => {
  clearVisibleDialogue(dialogue);
  dialogue.speakerId = speakerId;
  setSelectedObjectEvent(runtime.eventObjectLock, speakerId === 'system' || speakerId === 'sign' ? null : speakerId);
  dialogue.scriptSession = cloneFieldScriptSession(session);
  continueFieldScriptSession(dialogue, runtime, player, npcs);
};

const saveAndCloseNicknameScreen = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  session: FieldScriptSessionState
): void => {
  const naming = dialogue.namingScreen;
  const specialState = session.specialState?.kind === 'nickname' ? session.specialState : null;
  if (naming && specialState) {
    const pokemon = getPartyMonAt(runtime, specialState.slot);
    if (pokemon) {
      pokemon.nickname = saveNamingScreenInputText(naming).slice(0, naming.maxLength);
      runtime.stringVars.STR_VAR_2 = pokemon.nickname;
    }
  }
  dialogue.namingScreen = null;
};

const stepNicknameScreen = (
  dialogue: DialogueState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState,
  session: FieldScriptSessionState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): boolean => {
  const specialState = session.specialState?.kind === 'nickname' ? session.specialState : null;
  if (!specialState) {
    return false;
  }

  if (specialState.phase === 'returnFadeIn') {
    if (updateFieldPaletteFade(runtime)) {
      return true;
    }
    session.specialState = null;
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  const naming = dialogue.namingScreen;
  if (!naming) {
    return false;
  }

  if (specialState.phase === 'fadeIn') {
    if (updateFieldPaletteFade(runtime)) {
      return true;
    }
    specialState.phase = 'input';
    return true;
  }

  if (specialState.phase === 'fadeOut') {
    if (updateFieldPaletteFade(runtime)) {
      return true;
    }
    saveAndCloseNicknameScreen(dialogue, runtime, session);
    beginFieldFadeScreen(runtime, FADE_FROM_BLACK, 0);
    specialState.phase = 'returnFadeIn';
    return true;
  }

  if (stepNamingScreen(naming, input) === 'finished') {
    beginFieldFadeScreen(runtime, FADE_TO_BLACK, 0);
    specialState.phase = 'fadeOut';
  }

  return true;
};

export const stepDecompFieldDialogue = (
  dialogue: DialogueState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState,
  player?: PlayerState,
  npcs: readonly NpcState[] = []
): boolean => {
  const session = dialogue.scriptSession;
  if (!session) {
    return false;
  }

  if (session.specialState?.kind === 'paletteFade') {
    if (updateFieldPaletteFade(runtime)) {
      return true;
    }
    session.specialState = null;
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  if (session.specialState?.kind === 'fanfare') {
    if (updateFieldFanfare(runtime)) {
      return true;
    }
    session.specialState = null;
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  if (session.specialState?.kind === 'delay') {
    if (session.specialState.counter > 1) {
      session.specialState.counter -= 1;
      return true;
    }
    session.specialState = null;
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  if (session.specialState?.kind === 'doorAnimation') {
    if (updateDoorAnimationTask(runtime)) {
      return true;
    }
    session.specialState = null;
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  if (stepNicknameScreen(dialogue, input, runtime, session, player, npcs)) {
    return true;
  }

  if (dialogue.shop && session.specialState?.kind === 'mart') {
    return stepMartShopState(dialogue, runtime, session, input, player, npcs);
  }

  if (session.waitingFor !== 'movement') {
    tickDecompScriptMovement(runtime, player);
  }

  if (session.waitingFor === 'task' && !dialogue.active && !dialogue.choice && !session.specialState) {
    const taskKind = runtime.eventObjectLock.task?.kind ?? null;
    tickEventObjectLock(runtime.eventObjectLock, player, npcs);
    const taskFinished = taskKind === 'waitPlayerAndSelected'
      ? isFreezeSelectedObjectAndPlayerFinished(runtime.eventObjectLock, player)
      : isFreezePlayerFinished(runtime.eventObjectLock, player);
    if (!taskFinished) {
      return true;
    }

    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  if (session.waitingFor === 'movement' && !dialogue.active && !dialogue.choice && !session.specialState) {
    tickDecompScriptMovement(runtime, player);
    const localId = session.waitingMovementLocalId ?? session.movingLocalId;
    if (!isDecompScriptMovementFinished(runtime, localId)) {
      return true;
    }

    session.waitingMovementLocalId = null;
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  const choice = dialogue.choice;
  if (choice) {
    if (input.upPressed) {
      moveChoiceSelection(choice, 0, -1);
    } else if (input.downPressed) {
      moveChoiceSelection(choice, 0, 1);
    } else if (input.leftPressed && choice.columns > 1) {
      moveChoiceSelection(choice, -1, 0);
    } else if (input.rightPressed && choice.columns > 1) {
      moveChoiceSelection(choice, 1, 0);
    }

    let result: number | null = null;
    if (input.interactPressed) {
      result = choice.kind === 'yesno'
        ? choice.selectedIndex === 0 ? 1 : 0
        : choice.selectedIndex;
    } else if (input.cancelPressed && !choice.ignoreCancel) {
      result = choice.cancelValue;
    }

    if (result === null) {
      return true;
    }

    runtime.vars.VAR_RESULT = result;
    if (choice.kind === 'listmenu' && choice.reopenAfterSelection && result !== choice.cancelValue) {
      const maxVisible = Math.max(1, Math.min(choice.maxVisibleOptions ?? choice.options.length, choice.options.length));
      const nextScrollOffset = Math.max(
        0,
        Math.min(choice.options.length - maxVisible, choice.scrollOffset ?? 0)
      );
      session.suspendedChoice = {
        ...choice,
        options: [...choice.options],
        scrollOffset: nextScrollOffset
      };
    } else {
      session.suspendedChoice = null;
    }
    clearVisibleDialogue(dialogue);
    session.waitingFor = null;
    continueFieldScriptSession(dialogue, runtime, player, npcs);
    return true;
  }

  if (!input.interactPressed && !input.cancelPressed) {
    return true;
  }

  if (dialogue.active) {
    if (requestFieldTextPrinterSpeedUp(dialogue.fieldMessageBox)) {
      return true;
    }

    const nextIndex = dialogue.queueIndex + 1;
    if (nextIndex < dialogue.queue.length) {
      dialogue.queueIndex = nextIndex;
      dialogue.text = dialogue.queue[nextIndex] ?? '';
      startFieldTextPrinter(dialogue.fieldMessageBox, dialogue.text, runtime.options.textSpeed);
      return true;
    }

    clearVisibleDialogue(dialogue);
  }

  session.waitingFor = null;
  continueFieldScriptSession(dialogue, runtime, player, npcs);
  return true;
};

export const resolveSimpleDecompDialogue = (
  scriptId: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string[] | null => {
  const dialogue: DialogueState = {
    active: false,
    speakerId: null,
    text: '',
    queue: [],
    queueIndex: 0,
    choice: null,
    shop: null,
    monPic: null,
    namingScreen: null,
    scriptSession: null,
    fieldMessageBox: createFieldMessageBoxState()
  };
  const pages: string[] = [];
  const seenQueues = new Set<string>();
  const neutralInput: InputSnapshot = {
    up: false,
    down: false,
    left: false,
    right: false,
    upPressed: false,
    downPressed: false,
    leftPressed: false,
    rightPressed: false,
    run: false,
    interact: false,
    interactPressed: false,
    start: false,
    startPressed: false,
    cancel: false,
    cancelPressed: false
  };
  const confirmInput: InputSnapshot = {
    ...neutralInput,
    interact: true,
    interactPressed: true
  };

  if (!runDecompFieldScript(scriptId, {
    runtime,
    player,
    dialogue,
    speakerId: 'system'
  })) {
    return null;
  }

  for (let step = 0; step < 128; step += 1) {
    if (dialogue.queue.length > 0) {
      const signature = dialogue.queue.join('\n\f\n');
      if (!seenQueues.has(signature)) {
        seenQueues.add(signature);
        pages.push(...dialogue.queue);
      }
    }

    if (!dialogue.scriptSession) {
      break;
    }

    if (runtime.pendingTrainerBattle || dialogue.shop) {
      break;
    }

    if (dialogue.choice || dialogue.active) {
      stepDecompFieldDialogue(dialogue, confirmInput, runtime, player);
      continue;
    }

    stepDecompFieldDialogue(dialogue, neutralInput, runtime, player);
  }

  return pages.length > 0 ? pages : null;
};
