import type { InputSnapshot } from '../input/inputState';
import {
  createBattlePokemonFromSpecies,
  createBattlePokemonFromSpeciesWithMoves
} from './battle';
import { getDecompTrainerDefinition, getDecompTrainerFlag } from './decompTrainerData';
import type { DialogueState } from './interaction';
import type { PlayerState } from './player';
import type { ScriptRuntimeState } from './scripts';

const COUNTER_PAGE_BREAK = '\f';
const SCR_MENU_CANCEL = 127;

const rawMapScriptFiles = import.meta.glob('../../../data/maps/*/scripts.inc', {
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

const LABEL_RE = /^([A-Za-z0-9_]+)::/u;
const STRING_RE = /"((?:[^"\\]|\\.)*)"/gu;
const MULTICHOICE_CONSTANT_RE = /^#define\s+(MULTICHOICE_[A-Z0-9_]+)\s+(\d+)/gmu;
const LISTMENU_CONSTANT_RE = /^#define\s+(LISTMENU_[A-Z0-9_]+)\s+(\d+)/gmu;
const MULTICHOICE_LIST_RE = /static const struct MenuAction ([A-Za-z0-9_]+)\[\] = \{([\s\S]*?)\};/gu;
const MENU_ACTION_RE = /\{\s*([A-Za-z0-9_]+)\s*\}/gu;
const MULTICHOICE_TABLE_RE = /\[(MULTICHOICE_[A-Z0-9_]+)\]\s*=\s*MULTICHOICE\(([A-Za-z0-9_]+)\)/gu;
const STRING_CONSTANT_RE = /(?:ALIGNED\(\d+\)\s+)?const u8 ([A-Za-z0-9_]+)\[\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\);/gu;
const LISTMENU_CONFIG_CASE_RE = /case\s+(LISTMENU_[A-Z0-9_]+):([\s\S]*?)break;/gu;
const LISTMENU_LABELS_RE = /\[(LISTMENU_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\},/gu;

const IGNORED_SCRIPT_COMMANDS = [
  'lock',
  'lockall',
  'faceplayer',
  'waitmovement',
  'waitse',
  'waitmoncry',
  'release',
  'releaseall',
  'famechecker',
  '.align'
] as const;

const PASS_THROUGH_SCRIPT_PREFIXES = [
  'applymovement ',
  'playmoncry ',
  'textcolor ',
  'lockfacing ',
  'showmoneybox',
  'hidemoneybox',
  'updatemoneybox',
  'fanfare ',
  'waitfanfare',
  'playse ',
  'playbgm ',
  'fadedefaultbgm',
  'setorcopyvar ',
  'compare ',
  'copyvar '
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
  loadedPointerTextLabel: string | null;
  callStack: Array<{
    label: string;
    lineIndex: number;
  }>;
  waitingFor: 'text' | 'choice' | null;
  suspendedChoice: DialogueChoiceState | null;
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
  MSGBOX_NPC: 'Std_MsgboxNPC',
  MSGBOX_SIGN: 'Std_MsgboxSign',
  MSGBOX_DEFAULT: 'Std_MsgboxDefault',
  MSGBOX_YESNO: 'Std_MsgboxYesNo',
  MSGBOX_AUTOCLOSE: 'Std_MsgboxAutoclose',
  STD_RECEIVED_ITEM: 'Std_ReceivedItem',
  '2': 'Std_MsgboxNPC',
  '3': 'Std_MsgboxSign',
  '4': 'Std_MsgboxDefault',
  '5': 'Std_MsgboxYesNo',
  '6': 'Std_MsgboxAutoclose',
  '9': 'Std_ReceivedItem'
};

interface ParsedTrainerBattleCommand {
  trainerId: string;
  introLabel: string | null;
  postBattleScriptLabel: string | null;
  format: 'singles' | 'doubles';
}

const SCRIPT_VALUE_CONSTANTS: Record<string, ScriptValue> = {
  TRUE: 1,
  FALSE: 0,
  YES: 1,
  NO: 0,
  SCR_MENU_CANCEL
};

const PLAYER_FACING_TO_DIR: Record<PlayerState['facing'], string> = {
  up: 'DIR_NORTH',
  down: 'DIR_SOUTH',
  left: 'DIR_WEST',
  right: 'DIR_EAST'
};

const stripComment = (line: string): string => {
  const commentIndex = line.indexOf('@');
  return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
};

const decodeTextValue = (value: string, runtime: ScriptRuntimeState): string =>
  value
    .replace(/\{PLAYER\}/gu, runtime.startMenu.playerName)
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
  let currentLabel: string | null = null;
  let currentLines: string[] = [];

  for (const rawLine of source.split(/\r?\n/gu)) {
    const line = stripComment(rawLine);
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
      currentLines.push(line);
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
    if (!line.startsWith('.string')) {
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

const parseMenuStringConstantMap = (): Map<string, string> => {
  const strings = new Map<string, string>();
  for (const source of Object.values(rawStringSourceFiles)) {
    for (const match of source.matchAll(STRING_CONSTANT_RE)) {
      strings.set(match[1], decodeMenuStringValue(match[2]));
    }
  }
  return strings;
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
registerTextSources(rawMapScriptFiles);
registerTextSources(rawGlobalScriptFiles);
registerTextSources(rawMapTextFiles);
registerTextSources(rawGlobalTextFiles);
registerTextSources(rawEventScriptsFiles);

const multichoiceConstantMap = parseMultichoiceConstantMap();
const listMenuConstantMap = parseListMenuConstantMap();
const multichoiceOptionMap = parseMultichoiceOptionMap();

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

const getScriptVarValue = (
  runtime: ScriptRuntimeState,
  key: string,
  player?: PlayerState
): ScriptValue | undefined => {
  if (key === 'VAR_FACING' && player) {
    return PLAYER_FACING_TO_DIR[player.facing];
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
  pages: string[]
): void => {
  dialogue.active = pages.length > 0;
  dialogue.speakerId = speakerId;
  dialogue.queue = [...pages];
  dialogue.queueIndex = 0;
  dialogue.text = dialogue.queue[0] ?? '';
  dialogue.choice = null;
};

const clearVisibleDialogue = (dialogue: DialogueState): void => {
  dialogue.active = false;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
  dialogue.choice = null;
};

const finishDialogueSession = (dialogue: DialogueState): void => {
  dialogue.scriptSession = null;
  dialogue.choice = null;
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
  loadedPointerTextLabel: session.loadedPointerTextLabel,
  callStack: session.callStack.map((frame) => ({ ...frame })),
  waitingFor: session.waitingFor,
  suspendedChoice: session.suspendedChoice ? {
    ...session.suspendedChoice,
    options: [...session.suspendedChoice.options]
  } : null
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
  loadedPointerTextLabel: session.loadedPointerTextLabel,
  callStack: [],
  waitingFor: null,
  suspendedChoice: null
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

const continueFieldScriptSession = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): void => {
  const session = dialogue.scriptSession;
  if (!session) {
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
      callScriptLabel(session, stdLabel);
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

      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages);
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

    if (line === 'waitmessage') {
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
      runtime.vars[setVarMatch[1]] = resolveNumericExpression(setVarMatch[2], runtime, player);
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
        default:
          runtime.vars[specialVarMatch[1]] = 0;
          break;
      }
      continue;
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

    const giveItemMatch = line.match(/^giveitem_msg\s+([A-Za-z0-9_]+)/u);
    if (giveItemMatch) {
      const pages = getTextPagesForLabel(giveItemMatch[1], runtime);
      if (!pages || pages.length === 0) {
        finishDialogueSession(dialogue);
        return;
      }

      openDialoguePages(dialogue, dialogue.speakerId ?? 'system', pages);
      session.waitingFor = 'text';
      return;
    }

    if (line.startsWith('special ')
      || line.startsWith('checkitem ')
      || line.startsWith('checkitemspace ')
      || line.startsWith('checkmoney ')
      || line.startsWith('buffer')
      || line.startsWith('removeitem ')
      || line.startsWith('removeobject ')
      || line.startsWith('addobject ')
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

    const msgboxMatch = line.match(/^(?:msgbox|message)\s+([A-Za-z0-9_]+)/u);
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
      || line.startsWith('addobject ')) {
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

export const runDecompFieldScript = (
  scriptId: string,
  {
    runtime,
    player,
    dialogue,
    speakerId
  }: {
    runtime: ScriptRuntimeState;
    player?: PlayerState;
    dialogue: DialogueState;
    speakerId: string;
  }
): boolean => {
  if (!scriptBlocks.has(scriptId)) {
    return false;
  }

  clearVisibleDialogue(dialogue);
  dialogue.speakerId = speakerId;
  dialogue.scriptSession = {
    rootScriptId: scriptId,
    currentLabel: scriptId,
    lineIndex: 0,
    lastTrainerId: null,
    loadedPointerTextLabel: null,
    callStack: [],
    waitingFor: null,
    suspendedChoice: null
  };

  continueFieldScriptSession(dialogue, runtime, player);
  return true;
};

export const resumeDecompFieldScriptSession = (
  dialogue: DialogueState,
  {
    runtime,
    player,
    speakerId,
    session
  }: {
    runtime: ScriptRuntimeState;
    player?: PlayerState;
    speakerId: string;
    session: FieldScriptSessionState;
  }
): void => {
  clearVisibleDialogue(dialogue);
  dialogue.speakerId = speakerId;
  dialogue.scriptSession = cloneFieldScriptSession(session);
  continueFieldScriptSession(dialogue, runtime, player);
};

export const stepDecompFieldDialogue = (
  dialogue: DialogueState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): boolean => {
  const session = dialogue.scriptSession;
  if (!session) {
    return false;
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
    continueFieldScriptSession(dialogue, runtime, player);
    return true;
  }

  if (!input.interactPressed && !input.cancelPressed) {
    return true;
  }

  if (dialogue.active) {
    const nextIndex = dialogue.queueIndex + 1;
    if (nextIndex < dialogue.queue.length) {
      dialogue.queueIndex = nextIndex;
      dialogue.text = dialogue.queue[nextIndex] ?? '';
      return true;
    }

    clearVisibleDialogue(dialogue);
  }

  session.waitingFor = null;
  continueFieldScriptSession(dialogue, runtime, player);
  return true;
};

export const resolveSimpleDecompDialogue = (
  scriptId: string,
  runtime: ScriptRuntimeState,
  player?: PlayerState
): string[] | null => {
  const labels = collectTextLabelsForScript(scriptId, runtime, player);
  if (!labels) {
    return null;
  }

  const pages: string[] = [];
  for (const label of labels) {
    const resolvedPages = getTextPagesForLabel(label, runtime);
    if (!resolvedPages || resolvedPages.length === 0) {
      return null;
    }
    pages.push(...resolvedPages);
  }

  return pages.length > 0 ? pages : null;
};
