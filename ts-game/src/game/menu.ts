import type { InputSnapshot } from '../input/inputState';
import { closeDialogue, type DialogueState } from './interaction';
import { createBagPanelState, stepBagPanel, type BagPanelState } from './bag';
import {
  findPokedexCategoryLocation,
  getFirstSelectablePokedexTopMenuIndex,
  getPokedexAreaMarkers,
  getPokedexCategoryLabel,
  getPokedexCategoryPageSpecies,
  getPokedexCounts,
  getPokedexEntryCategoryLabel,
  getPokedexOrderLabel,
  getPokedexOrderedEntries,
  getPokedexTopMenuRows,
  getUnlockedPokedexCategoryPageIndices,
  isNationalDexEnabled,
  listMenuStepFireRed,
  type PokedexAreaMarker,
  type PokedexOrderedEntry,
  type PokedexCategoryId,
  type PokedexOrderId,
  type PokedexTopMenuRow
} from './decompPokedexUi';
import { formatTypeLabel } from './decompSpecies';
import { getSpeciesDisplayName } from './pokemonStorage';
import type { ScriptRuntimeState } from './scripts';

export type StartMenuOptionId =
  | 'POKEDEX'
  | 'POKEMON'
  | 'BAG'
  | 'PLAYER'
  | 'SAVE'
  | 'OPTION'
  | 'EXIT'
  | 'RETIRE';

interface StartMenuEntry {
  id: StartMenuOptionId;
  label: string;
}

export interface PartyMenuMember {
  species: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  types: string[];
  status: string;
  isActive?: boolean;
}

export interface PlayerMenuSummary {
  name: string;
  money: number;
  badges: number;
  playTimeMinutes: number;
  location: string;
  saveCount: number;
  profileLines?: string[];
}

export interface PokedexPanelState {
  kind: 'pokedex';
  id: 'POKEDEX';
  title: string;
  description: string;
  dexMode: 'KANTO' | 'NATIONAL';
  seen: number;
  owned: number;
  screen: 'topMenu' | 'orderedList' | 'categoryPage' | 'entry' | 'area';
  topMenuRows: PokedexTopMenuRow[];
  topMenuSelectedIndex: number;
  /** `ListMenuInit` cursor scroll (`modeSelectCursorPos`). */
  topMenuListCursorPos: number;
  /** `ListMenuInit` row within window (`modeSelectItemsAbove`, initial 1 in `sDexScreenDataInitialState`). */
  topMenuListItemsAbove: number;
  orderedListMode: 'numerical' | 'characteristic';
  orderId: PokedexOrderId;
  orderEntries: PokedexOrderedEntry[];
  orderSelectedIndex: number;
  /** Ordered list `ListMenu` scroll — replaces centered `orderScrollOffset`. */
  orderListCursorPos: number;
  orderListItemsAbove: number;
  categoryId: PokedexCategoryId | null;
  categoryReturnScreen: 'topMenu' | 'orderedList';
  categoryPageIndex: number;
  categoryCursorIndex: number;
  categorySpecies: string[];
  entrySpecies: string | null;
  entryPageIndex: 0 | 1;
  entryReturnScreen: 'orderedList' | 'categoryPage';
  areaMarkers: PokedexAreaMarker[];
  returnToMenuOnClose: boolean;
}

export interface PlayerSummaryPanelState {
  kind: 'summary';
  id: 'PLAYER';
  title: string;
  description: string;
  rows: string[];
  pageIndex: 0 | 1;
  profileLines: string[];
  returnToMenuOnClose: boolean;
}

export type SummaryPanelState = PlayerSummaryPanelState;

export type PartyActionId = 'SUMMARY' | 'SWITCH' | 'CANCEL';

/** FireRed `PARTY_SIZE` — fixed slots on the party screen. */
export const PARTY_SCREEN_SLOT_COUNT = 6;

export interface PartyPanelState {
  kind: 'party';
  id: 'POKEMON';
  title: string;
  description: string;
  rows: string[];
  selectedIndex: number;
  members: PartyMenuMember[];
  mode: 'list' | 'actions' | 'switch' | 'summary';
  summaryPage: 0 | 1;
  actionRows: PartyActionId[];
  actionIndex: number;
  switchingIndex: number | null;
  summaryLines: string[];
  returnToMenuOnClose: boolean;
}

export interface SavePanelState {
  kind: 'save';
  id: 'SAVE';
  title: string;
  stage: 'ask' | 'overwrite' | 'result';
  prompt: string;
  description: string;
  selectedIndex: 0 | 1;
  returnToMenuOnClose: boolean;
}

const textSpeedValues = ['slow', 'mid', 'fast'] as const;
const battleStyleValues = ['shift', 'set'] as const;
const soundValues = ['mono', 'stereo'] as const;
const buttonModeValues = ['help', 'lr', 'lEqualsA'] as const;

type OptionSettingId =
  | 'textSpeed'
  | 'battleScene'
  | 'battleStyle'
  | 'sound'
  | 'buttonMode'
  | 'frameType'
  | 'cancel';

export interface OptionPanelState {
  kind: 'options';
  id: 'OPTION';
  title: string;
  description: string;
  rows: string[];
  selectedIndex: number;
  settingOrder: OptionSettingId[];
  returnToMenuOnClose: boolean;
}

export interface RetirePanelState {
  kind: 'retire';
  id: 'RETIRE';
  title: string;
  description: string;
  rows: ['YES', 'NO'];
  selectedIndex: 0 | 1;
  returnToMenuOnClose: boolean;
}

export type MenuPanelState =
  | PokedexPanelState
  | SummaryPanelState
  | PartyPanelState
  | SavePanelState
  | OptionPanelState
  | RetirePanelState
  | BagPanelState;

export interface StartMenuCallbacks {
  onSaveConfirmed?: () => {
    ok: boolean;
    summary: string;
  };
  onSafariRetireConfirmed?: () => {
    ok: boolean;
    summary: string;
  };
  getPartyMembers?: () => PartyMenuMember[];
  onPartySwap?: (fromIndex: number, toIndex: number) => void;
  getPlayerSummary?: () => PlayerMenuSummary;
}

export interface StartMenuState {
  active: boolean;
  options: StartMenuEntry[];
  selectedIndex: number;
  panel: MenuPanelState | null;
}

const optionLabel = (id: StartMenuOptionId, playerName: string): string => {
  switch (id) {
    case 'POKEDEX':
      return 'POKéDEX';
    case 'POKEMON':
      return 'POKéMON';
    case 'PLAYER':
      return playerName;
    default:
      return id;
  }
};

const panelTitle = (id: Exclude<StartMenuOptionId, 'EXIT'>): string => optionLabel(id, 'PLAYER');

export const getStartMenuDescription = (id: StartMenuOptionId): string => {
  switch (id) {
    case 'POKEDEX':
      return 'A device that records POKéMON secrets upon meeting or catching them.';
    case 'POKEMON':
      return 'Check and organize POKéMON that are traveling with you in your party.';
    case 'BAG':
      return 'Equipped with pockets for storing items you bought, received, or found.';
    case 'PLAYER':
      return 'Check your money and other game data.';
    case 'SAVE':
      return 'Save your game with a complete record of your progress to take a break.';
    case 'OPTION':
      return 'Adjust various game settings such as text speed, game rules, etc.';
    case 'EXIT':
      return 'Close this MENU window.';
    case 'RETIRE':
      return 'Retire from the SAFARI GAME and return to the registration counter.';
  }
};

export const getSelectedStartMenuDescription = (menu: StartMenuState): string | null => {
  if (!menu.active) {
    return null;
  }

  const selected = menu.options[menu.selectedIndex];
  return selected ? getStartMenuDescription(selected.id) : null;
};

export interface SafariZoneStats {
  currentSteps: number;
  totalSteps: number;
  balls: number;
}

export const getSafariZoneStats = (runtime: ScriptRuntimeState): SafariZoneStats => {
  const totalSteps = 600;
  const stepsTaken = Math.max(0, Math.trunc(runtime.vars.safariStepsTaken ?? 0));
  const currentSteps = Math.max(0, totalSteps - Math.min(stepsTaken, totalSteps));
  const balls = Math.max(0, Math.trunc(runtime.vars.safariBalls ?? 30));
  return { currentSteps, totalSteps, balls };
};

const buildOptions = (runtime: ScriptRuntimeState): StartMenuEntry[] => {
  const { mode, hasPokedex, hasPokemon, playerName } = runtime.startMenu;
  const append = (ids: StartMenuOptionId[]): StartMenuEntry[] =>
    ids.map((id) => ({ id, label: optionLabel(id, playerName) }));

  switch (mode) {
    case 'link':
      return append(['POKEMON', 'BAG', 'PLAYER', 'OPTION', 'EXIT']);
    case 'unionRoom':
      return append(['POKEMON', 'BAG', 'PLAYER', 'OPTION', 'EXIT']);
    case 'safari':
      return append(['RETIRE', 'POKEDEX', 'POKEMON', 'BAG', 'PLAYER', 'OPTION', 'EXIT']);
    case 'normal':
      return append([
        ...(hasPokedex ? (['POKEDEX'] as const) : []),
        ...(hasPokemon ? (['POKEMON'] as const) : []),
        'BAG',
        'PLAYER',
        'SAVE',
        'OPTION',
        'EXIT'
      ]);
  }
};

const getTextSpeedLabel = (value: ScriptRuntimeState['options']['textSpeed']): string => {
  switch (value) {
    case 'slow':
      return 'SLOW';
    case 'mid':
      return 'MID';
    case 'fast':
      return 'FAST';
  }
};

const getBattleStyleLabel = (value: ScriptRuntimeState['options']['battleStyle']): string => {
  switch (value) {
    case 'shift':
      return 'SHIFT';
    case 'set':
      return 'SET';
  }
};

const getSoundLabel = (value: ScriptRuntimeState['options']['sound']): string => {
  switch (value) {
    case 'mono':
      return 'MONO';
    case 'stereo':
      return 'STEREO';
  }
};

const getButtonModeLabel = (value: ScriptRuntimeState['options']['buttonMode']): string => {
  switch (value) {
    case 'help':
      return 'HELP';
    case 'lr':
      return 'LR';
    case 'lEqualsA':
      return 'L=A';
  }
};

const cycleIndex = (current: number, count: number, direction: -1 | 1): number =>
  (current + direction + count) % count;

const formatSpeciesLabel = (species: string): string => getSpeciesDisplayName(species);

const formatPlayTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const createDefaultPartyMembers = (): PartyMenuMember[] => [
  {
    species: 'CHARMANDER',
    level: 8,
    hp: 23,
    maxHp: 23,
    attack: 13,
    defense: 11,
    speed: 14,
    spAttack: 15,
    spDefense: 12,
    types: ['fire'],
    status: 'OK',
    isActive: true
  },
  {
    species: 'PIDGEY',
    level: 7,
    hp: 21,
    maxHp: 21,
    attack: 11,
    defense: 10,
    speed: 13,
    spAttack: 10,
    spDefense: 10,
    types: ['normal', 'flying'],
    status: 'OK'
  }
];

const POKEDEX_MODE_LIST_MAX_SHOWED = 9;
const POKEDEX_ORDERED_LIST_MAX_SHOWED = 9;

const updatePokedexCounts = (panel: PokedexPanelState, runtime: ScriptRuntimeState): void => {
  const counts = getPokedexCounts(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies);
  panel.seen = panel.dexMode === 'NATIONAL' ? counts.seenNational : counts.seenKanto;
  panel.owned = panel.dexMode === 'NATIONAL' ? counts.ownedNational : counts.ownedKanto;
};

const syncTopMenuListScrollFromFlat = (panel: PokedexPanelState, flat: number): void => {
  const rows = panel.topMenuRows;
  if (rows.length === 0) {
    panel.topMenuListCursorPos = 0;
    panel.topMenuListItemsAbove = 0;
    panel.topMenuSelectedIndex = 0;
    return;
  }
  const max = Math.min(POKEDEX_MODE_LIST_MAX_SHOWED, rows.length);
  const maxCp = Math.max(0, rows.length - max);
  const f = Math.max(0, Math.min(flat, rows.length - 1));
  let ia = Math.min(f, max - 1);
  let cp = f - ia;
  if (cp < 0) {
    cp = 0;
    ia = f;
  }
  if (cp > maxCp) {
    cp = maxCp;
    ia = f - cp;
  }
  panel.topMenuListCursorPos = cp;
  panel.topMenuListItemsAbove = ia;
  panel.topMenuSelectedIndex = f;
};

const clampTopMenuListScroll = (panel: PokedexPanelState): void => {
  const rows = panel.topMenuRows;
  if (rows.length === 0) {
    return;
  }
  let flat = panel.topMenuListCursorPos + panel.topMenuListItemsAbove;
  if (flat >= rows.length || rows[flat]?.kind === 'header') {
    const fs = getFirstSelectablePokedexTopMenuIndex(rows);
    flat = fs >= 0 ? fs : 0;
  }
  syncTopMenuListScrollFromFlat(panel, flat);
};

const clampPokedexOrderSelection = (panel: PokedexPanelState, runtime: ScriptRuntimeState): void => {
  const len = panel.orderEntries.length;
  if (len === 0) {
    panel.orderSelectedIndex = 0;
    panel.orderListCursorPos = 0;
    panel.orderListItemsAbove = 0;
    runtime.pokedex.orderListCursorPos = 0;
    runtime.pokedex.orderListItemsAbove = 0;
    panel.entrySpecies = null;
    return;
  }

  const max = Math.min(POKEDEX_ORDERED_LIST_MAX_SHOWED, len);
  const maxCp = Math.max(0, len - max);
  panel.orderSelectedIndex = Math.max(0, Math.min(panel.orderSelectedIndex, len - 1));
  const target = panel.orderSelectedIndex;
  let cp = panel.orderListCursorPos;
  let ia = panel.orderListItemsAbove;
  if (cp + ia !== target || cp > maxCp || ia >= max) {
    ia = Math.min(target, max - 1);
    cp = target - ia;
    if (cp < 0) {
      cp = 0;
      ia = target;
    }
    if (cp > maxCp) {
      cp = maxCp;
      ia = target - cp;
    }
  }
  panel.orderListCursorPos = cp;
  panel.orderListItemsAbove = ia;
  panel.orderSelectedIndex = cp + ia;
  runtime.pokedex.selectedIndex = panel.orderSelectedIndex;
  runtime.pokedex.orderListCursorPos = cp;
  runtime.pokedex.orderListItemsAbove = ia;
  panel.entrySpecies = panel.orderEntries[panel.orderSelectedIndex]?.species ?? null;
};

const updatePokedexTopMenu = (panel: PokedexPanelState, runtime: ScriptRuntimeState): void => {
  const nationalEnabled = isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies);
  panel.topMenuRows = getPokedexTopMenuRows(nationalEnabled, runtime.pokedex.seenSpecies, panel.dexMode);
  clampTopMenuListScroll(panel);
};

const setPokedexOrderedList = (
  panel: PokedexPanelState,
  runtime: ScriptRuntimeState,
  orderId: PokedexOrderId
): void => {
  panel.screen = 'orderedList';
  panel.orderId = orderId;
  panel.orderedListMode = orderId === 'NUMERICAL_KANTO' || orderId === 'NUMERICAL_NATIONAL'
    ? 'numerical'
    : 'characteristic';
  panel.orderEntries = getPokedexOrderedEntries(
    orderId,
    panel.dexMode,
    runtime.pokedex.seenSpecies,
    runtime.pokedex.caughtSpecies
  );
  panel.orderListCursorPos = runtime.pokedex.orderListCursorPos;
  panel.orderListItemsAbove = runtime.pokedex.orderListItemsAbove;
  panel.orderSelectedIndex = Math.max(0, Math.min(runtime.pokedex.selectedIndex, panel.orderEntries.length - 1));
  panel.description = getPokedexOrderLabel(
    orderId,
    isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies)
  );
  clampPokedexOrderSelection(panel, runtime);
};

const setPokedexCategoryPage = (
  panel: PokedexPanelState,
  runtime: ScriptRuntimeState,
  categoryId: PokedexCategoryId,
  pageIndex: number,
  cursorIndex: number,
  returnScreen: 'topMenu' | 'orderedList'
): void => {
  panel.screen = 'categoryPage';
  panel.categoryId = categoryId;
  panel.categoryReturnScreen = returnScreen;

  const unlockedPageIndices = getUnlockedPokedexCategoryPageIndices(
    categoryId,
    panel.dexMode,
    runtime.pokedex.seenSpecies
  );
  const clampedPageIndex = unlockedPageIndices.includes(pageIndex)
    ? pageIndex
    : unlockedPageIndices[0] ?? 0;
  panel.categoryPageIndex = clampedPageIndex;
  panel.categorySpecies = getPokedexCategoryPageSpecies(
    categoryId,
    clampedPageIndex,
    panel.dexMode,
    runtime.pokedex.seenSpecies
  );
  panel.categoryCursorIndex = Math.max(
    0,
    Math.min(cursorIndex, Math.max(0, panel.categorySpecies.length - 1))
  );
  panel.entrySpecies = panel.categorySpecies[panel.categoryCursorIndex] ?? null;
  panel.description = getPokedexCategoryLabel(categoryId);
};

const createPokedexPanel = (runtime: ScriptRuntimeState): PokedexPanelState => {
  const panel: PokedexPanelState = {
    kind: 'pokedex',
    id: 'POKEDEX',
    title: panelTitle('POKEDEX'),
    description: '',
    dexMode: isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies)
      ? runtime.pokedex.dexMode
      : 'KANTO',
    seen: 0,
    owned: 0,
    screen: 'topMenu',
    topMenuRows: [],
    topMenuSelectedIndex: 0,
    topMenuListCursorPos: 0,
    topMenuListItemsAbove: 1,
    orderedListMode: 'numerical',
    orderId: 'NUMERICAL_KANTO',
    orderEntries: [],
    orderSelectedIndex: Math.max(0, runtime.pokedex.selectedIndex),
    orderListCursorPos: runtime.pokedex.orderListCursorPos,
    orderListItemsAbove: runtime.pokedex.orderListItemsAbove,
    categoryId: null,
    categoryReturnScreen: 'topMenu',
    categoryPageIndex: 0,
    categoryCursorIndex: 0,
    categorySpecies: [],
    entrySpecies: null,
    entryPageIndex: 0,
    entryReturnScreen: 'orderedList',
    areaMarkers: [],
    returnToMenuOnClose: true
  };

  updatePokedexCounts(panel, runtime);
  updatePokedexTopMenu(panel, runtime);
  const romDefaultFlat = Math.min(1, Math.max(0, panel.topMenuRows.length - 1));
  if (panel.topMenuRows[romDefaultFlat]?.kind === 'item') {
    syncTopMenuListScrollFromFlat(panel, romDefaultFlat);
  } else {
    const fs = getFirstSelectablePokedexTopMenuIndex(panel.topMenuRows);
    syncTopMenuListScrollFromFlat(panel, Math.max(0, fs));
  }
  return panel;
};

const partyMemberAtSlot = (members: PartyMenuMember[], slot: number): PartyMenuMember | undefined =>
  slot < members.length ? members[slot] : undefined;

/** `ShouldUseChooseMonText` — alive means HP ≠ 0 or egg (we omit egg). */
const countAlivePartyMons = (members: PartyMenuMember[]): number =>
  members.filter((mon) => mon.hp > 0).length;

const createPartySummaryLines = (
  member: PartyMenuMember | undefined,
  page: 0 | 1
): string[] => {
  if (!member) {
    return ['No data.'];
  }

  if (page === 0) {
    return [
      `${formatSpeciesLabel(member.species)} Lv${member.level.toString().padStart(2, '0')}`,
      `HP      ${member.hp}/${member.maxHp}`,
      `STATUS  ${member.status}`,
      `TYPE    ${member.types.map((type) => formatTypeLabel(type)).join('/')}`
    ];
  }

  return [
    `ATTACK  ${member.attack}`,
    `DEFENSE ${member.defense}`,
    `SP ATK  ${member.spAttack}`,
    `SP DEF  ${member.spDefense}`,
    `SPEED   ${member.speed}`
  ];
};

const updatePartyPanelContent = (panel: PartyPanelState): void => {
  panel.rows = Array.from({ length: PARTY_SCREEN_SLOT_COUNT }, (_, slot) => {
    const member = partyMemberAtSlot(panel.members, slot);
    if (!member) {
      return '';
    }
    const activeMarker = member.isActive ? ' IN USE' : '';
    return `${formatSpeciesLabel(member.species)} Lv${member.level.toString().padStart(2, '0')}${activeMarker}`;
  });

  const selectedMember = partyMemberAtSlot(panel.members, panel.selectedIndex);
  panel.summaryLines = createPartySummaryLines(selectedMember, panel.summaryPage);

  switch (panel.mode) {
    case 'actions':
      panel.description = 'Do what with this POKéMON?';
      break;
    case 'switch':
      panel.description = 'Move to where?';
      break;
    case 'summary':
      panel.description = selectedMember
        ? `${formatSpeciesLabel(selectedMember.species)} INFO ${panel.summaryPage + 1}/2`
        : 'There is no POKéMON.';
      break;
    case 'list':
      panel.description =
        countAlivePartyMons(panel.members) > 1
          ? 'Choose POKéMON or CANCEL.'
          : 'Choose a POKéMON.';
      break;
  }
};

const createPartyPanel = (members: PartyMenuMember[]): PartyPanelState => {
  const panel: PartyPanelState = {
    kind: 'party',
    id: 'POKEMON',
    title: panelTitle('POKEMON'),
    description: '',
    rows: [],
    selectedIndex: 0,
    members,
    mode: 'list',
    summaryPage: 0,
    actionRows: ['SUMMARY', 'SWITCH', 'CANCEL'],
    actionIndex: 0,
    switchingIndex: null,
    summaryLines: [],
    returnToMenuOnClose: true
  };
  updatePartyPanelContent(panel);
  return panel;
};

const createPlayerSummaryPanel = (summary: PlayerMenuSummary): SummaryPanelState => ({
  kind: 'summary',
  id: 'PLAYER',
  title: summary.name,
  description: `LOCATION ${summary.location}`,
  rows: [
    `MONEY   $${summary.money}`,
    `BADGES  ${summary.badges}`,
    `TIME    ${formatPlayTime(summary.playTimeMinutes)}`,
    `SAVES   ${summary.saveCount}`
  ],
  pageIndex: 0,
  profileLines: summary.profileLines ?? ['KANTO TRAINER', 'ADVENTURE IN PROGRESS'],
  returnToMenuOnClose: true
});

const updatePlayerSummaryPanel = (
  panel: PlayerSummaryPanelState,
  summary: PlayerMenuSummary
): void => {
  panel.title = summary.name;
  panel.profileLines = summary.profileLines ?? panel.profileLines;
  if (panel.pageIndex === 0) {
    panel.description = `LOCATION ${summary.location}`;
    panel.rows = [
      `MONEY   $${summary.money}`,
      `BADGES  ${summary.badges}`,
      `TIME    ${formatPlayTime(summary.playTimeMinutes)}`,
      `SAVES   ${summary.saveCount}`
    ];
    return;
  }

  panel.description = 'PROFILE';
  panel.rows = panel.profileLines;
};

const stepOptionPanel = (
  panel: OptionPanelState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState
): { close: boolean; consumed: boolean } => {
  if (input.upPressed) {
    panel.selectedIndex = cycleIndex(panel.selectedIndex, panel.settingOrder.length, -1);
    return { close: false, consumed: true };
  }

  if (input.downPressed) {
    panel.selectedIndex = cycleIndex(panel.selectedIndex, panel.settingOrder.length, 1);
    return { close: false, consumed: true };
  }

  const selected = panel.settingOrder[panel.selectedIndex];
  const adjustDirection: -1 | 1 | null = input.leftPressed ? -1 : input.rightPressed ? 1 : null;
  if (adjustDirection) {
    if (selected === 'textSpeed') {
      const currentIndex = textSpeedValues.indexOf(runtime.options.textSpeed);
      runtime.options.textSpeed =
        textSpeedValues[cycleIndex(currentIndex, textSpeedValues.length, adjustDirection)];
      panel.description = `TEXT SPEED: ${getTextSpeedLabel(runtime.options.textSpeed)}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'battleScene') {
      runtime.options.battleScene = !runtime.options.battleScene;
      panel.description = `BATTLE SCENE: ${runtime.options.battleScene ? 'ON' : 'OFF'}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'battleStyle') {
      const currentIndex = battleStyleValues.indexOf(runtime.options.battleStyle);
      runtime.options.battleStyle =
        battleStyleValues[cycleIndex(currentIndex, battleStyleValues.length, adjustDirection)];
      panel.description = `BATTLE STYLE: ${getBattleStyleLabel(runtime.options.battleStyle)}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'sound') {
      const currentIndex = soundValues.indexOf(runtime.options.sound);
      runtime.options.sound =
        soundValues[cycleIndex(currentIndex, soundValues.length, adjustDirection)];
      panel.description = `SOUND: ${getSoundLabel(runtime.options.sound)}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'buttonMode') {
      const currentIndex = buttonModeValues.indexOf(runtime.options.buttonMode);
      runtime.options.buttonMode =
        buttonModeValues[cycleIndex(currentIndex, buttonModeValues.length, adjustDirection)];
      panel.description = `BUTTON MODE: ${getButtonModeLabel(runtime.options.buttonMode)}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'frameType') {
      runtime.options.frameType = cycleIndex(runtime.options.frameType, 10, adjustDirection);
      panel.description = `FRAME: TYPE ${runtime.options.frameType + 1}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }
  }

  if (input.interactPressed || input.cancelPressed || input.startPressed) {
    panel.description = 'Closed OPTIONS.';
    return { close: true, consumed: true };
  }

  return { close: false, consumed: false };
};

const stepRetirePanel = (
  panel: RetirePanelState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState,
  callbacks: StartMenuCallbacks
): { close: boolean; consumed: boolean; returnToMenu: boolean } => {
  if (input.upPressed || input.downPressed) {
    panel.selectedIndex = panel.selectedIndex === 0 ? 1 : 0;
    return { close: false, consumed: true, returnToMenu: false };
  }

  if (input.interactPressed) {
    if (panel.selectedIndex === 0) {
      const result = callbacks.onSafariRetireConfirmed?.() ?? {
        ok: true,
        summary: 'Retired from the SAFARI GAME and returned to the counter.'
      };
      panel.description = result.summary;
      runtime.lastScriptId = result.ok ? 'menu.retire.success' : 'menu.retire.failed';
      return { close: true, consumed: true, returnToMenu: false };
    }

    runtime.lastScriptId = 'menu.retire.cancelled';
    return { close: true, consumed: true, returnToMenu: true };
  }

  if (input.cancelPressed || input.startPressed) {
    runtime.lastScriptId = 'menu.retire.cancelled';
    return { close: true, consumed: true, returnToMenu: true };
  }

  return { close: false, consumed: false, returnToMenu: false };
};

const stepPartyPanel = (
  panel: PartyPanelState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState
): { close: boolean; consumed: boolean; swap?: { fromIndex: number; toIndex: number } } => {
  const occupied = (index: number): boolean => !!partyMemberAtSlot(panel.members, index);

  if (panel.mode === 'summary') {
    if (input.leftPressed || input.rightPressed) {
      panel.summaryPage = panel.summaryPage === 0 ? 1 : 0;
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.summary.page';
      return { close: false, consumed: true };
    }

    if (input.interactPressed || input.cancelPressed || input.startPressed) {
      panel.mode = 'actions';
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.summary.close';
      return { close: false, consumed: true };
    }
    return { close: false, consumed: false };
  }

  if (panel.mode === 'actions') {
    if (input.upPressed) {
      panel.actionIndex = cycleIndex(panel.actionIndex, panel.actionRows.length, -1);
      runtime.lastScriptId = 'menu.party.action.move';
      return { close: false, consumed: true };
    }

    if (input.downPressed) {
      panel.actionIndex = cycleIndex(panel.actionIndex, panel.actionRows.length, 1);
      runtime.lastScriptId = 'menu.party.action.move';
      return { close: false, consumed: true };
    }

    if (input.interactPressed) {
      const selectedAction = panel.actionRows[panel.actionIndex];
      if (selectedAction === 'SUMMARY') {
        panel.mode = 'summary';
        panel.summaryPage = 0;
        updatePartyPanelContent(panel);
        runtime.lastScriptId = 'menu.party.summary.open';
        return { close: false, consumed: true };
      }

      if (selectedAction === 'SWITCH') {
        panel.mode = 'switch';
        panel.switchingIndex = panel.selectedIndex;
        updatePartyPanelContent(panel);
        runtime.lastScriptId = 'menu.party.switch.begin';
        return { close: false, consumed: true };
      }

      panel.mode = 'list';
      panel.actionIndex = 0;
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.action.cancel';
      return { close: false, consumed: true };
    }

    if (input.cancelPressed || input.startPressed) {
      panel.mode = 'list';
      panel.actionIndex = 0;
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.action.cancel';
      return { close: false, consumed: true };
    }

    return { close: false, consumed: false };
  }

  if (panel.mode === 'switch') {
    const advanceSwitchCursor = (direction: -1 | 1): void => {
      let next = panel.selectedIndex;
      for (let step = 0; step < PARTY_SCREEN_SLOT_COUNT; step += 1) {
        next = cycleIndex(next, PARTY_SCREEN_SLOT_COUNT, direction);
        if (occupied(next)) {
          panel.selectedIndex = next;
          return;
        }
      }
    };

    if (input.upPressed) {
      advanceSwitchCursor(-1);
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.move';
      return { close: false, consumed: true };
    }

    if (input.downPressed) {
      advanceSwitchCursor(1);
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.move';
      return { close: false, consumed: true };
    }

    if (input.interactPressed) {
      const fromIndex = panel.switchingIndex ?? panel.selectedIndex;
      const toIndex = panel.selectedIndex;
      if (!occupied(toIndex)) {
        runtime.lastScriptId = 'menu.party.switch.cancel';
        return { close: false, consumed: true };
      }
      if (fromIndex !== toIndex) {
        [panel.members[fromIndex], panel.members[toIndex]] = [panel.members[toIndex], panel.members[fromIndex]];
      }
      panel.switchingIndex = null;
      panel.mode = 'list';
      updatePartyPanelContent(panel);
      runtime.lastScriptId = fromIndex === toIndex ? 'menu.party.switch.cancel' : 'menu.party.switch.commit';
      return {
        close: false,
        consumed: true,
        ...(fromIndex !== toIndex ? { swap: { fromIndex, toIndex } } : {})
      };
    }

    if (input.cancelPressed || input.startPressed) {
      if (panel.switchingIndex !== null) {
        panel.selectedIndex = panel.switchingIndex;
      }
      panel.switchingIndex = null;
      panel.mode = 'list';
      updatePartyPanelContent(panel);
      runtime.lastScriptId = 'menu.party.switch.cancel';
      return { close: false, consumed: true };
    }

    return { close: false, consumed: false };
  }

  if (input.upPressed) {
    panel.selectedIndex = cycleIndex(panel.selectedIndex, PARTY_SCREEN_SLOT_COUNT, -1);
    updatePartyPanelContent(panel);
    runtime.lastScriptId = 'menu.party.move';
    return { close: false, consumed: true };
  }

  if (input.downPressed) {
    panel.selectedIndex = cycleIndex(panel.selectedIndex, PARTY_SCREEN_SLOT_COUNT, 1);
    updatePartyPanelContent(panel);
    runtime.lastScriptId = 'menu.party.move';
    return { close: false, consumed: true };
  }

  if (input.interactPressed) {
    if (!occupied(panel.selectedIndex)) {
      return { close: false, consumed: true };
    }
    panel.mode = 'actions';
    panel.actionIndex = 0;
    updatePartyPanelContent(panel);
    runtime.lastScriptId = 'menu.party.actions.open';
    return { close: false, consumed: true };
  }

  if (input.cancelPressed || input.startPressed) {
    runtime.lastScriptId = 'menu.panel.close.pokemon';
    return { close: true, consumed: true };
  }

  return { close: false, consumed: false };
};

const openPokedexEntry = (
  panel: PokedexPanelState,
  species: string,
  returnScreen: 'orderedList' | 'categoryPage'
): void => {
  panel.screen = 'entry';
  panel.entrySpecies = species;
  panel.entryReturnScreen = returnScreen;
  panel.entryPageIndex = 0;
  panel.areaMarkers = getPokedexAreaMarkers(species);
  panel.description = getPokedexEntryCategoryLabel(species);
};

const stepPokedexPanel = (
  panel: PokedexPanelState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState
): { close: boolean; consumed: boolean } => {
  updatePokedexCounts(panel, runtime);
  updatePokedexTopMenu(panel, runtime);

  if (panel.screen === 'topMenu') {
    if (input.upPressed) {
      const total = panel.topMenuRows.length;
      const isHeader = (i: number): boolean => panel.topMenuRows[i]?.kind === 'header';
      const r = listMenuStepFireRed(
        total,
        POKEDEX_MODE_LIST_MAX_SHOWED,
        panel.topMenuListCursorPos,
        panel.topMenuListItemsAbove,
        false,
        isHeader
      );
      if (r.moved) {
        panel.topMenuListCursorPos = r.cursorPos;
        panel.topMenuListItemsAbove = r.itemsAbove;
        panel.topMenuSelectedIndex = r.cursorPos + r.itemsAbove;
      }
      runtime.lastScriptId = 'menu.pokedex.top.move';
      return { close: false, consumed: true };
    }

    if (input.downPressed) {
      const total = panel.topMenuRows.length;
      const isHeader = (i: number): boolean => panel.topMenuRows[i]?.kind === 'header';
      const r = listMenuStepFireRed(
        total,
        POKEDEX_MODE_LIST_MAX_SHOWED,
        panel.topMenuListCursorPos,
        panel.topMenuListItemsAbove,
        true,
        isHeader
      );
      if (r.moved) {
        panel.topMenuListCursorPos = r.cursorPos;
        panel.topMenuListItemsAbove = r.itemsAbove;
        panel.topMenuSelectedIndex = r.cursorPos + r.itemsAbove;
      }
      runtime.lastScriptId = 'menu.pokedex.top.move';
      return { close: false, consumed: true };
    }

    if (input.interactPressed) {
      const selected = panel.topMenuRows[panel.topMenuSelectedIndex];
      if (!selected || selected.kind !== 'item' || !selected.actionId) {
        return { close: false, consumed: true };
      }

      if (!selected.enabled) {
        runtime.lastScriptId = 'menu.pokedex.top.locked';
        return { close: false, consumed: true };
      }

      if (selected.actionId === 'CLOSE') {
        runtime.lastScriptId = 'menu.panel.close.pokedex';
        return { close: true, consumed: true };
      }

      if (selected.actionId === 'NUMERICAL_KANTO' || selected.actionId === 'NUMERICAL_NATIONAL'
        || selected.actionId === 'ATOZ' || selected.actionId === 'TYPE'
        || selected.actionId === 'LIGHTEST' || selected.actionId === 'SMALLEST') {
        setPokedexOrderedList(panel, runtime, selected.actionId);
        runtime.lastScriptId = 'menu.pokedex.order.open';
        return { close: false, consumed: true };
      }

      setPokedexCategoryPage(panel, runtime, selected.actionId, 0, 0, 'topMenu');
      runtime.lastScriptId = 'menu.pokedex.category.open';
      return { close: false, consumed: true };
    }

    if (input.cancelPressed || input.startPressed) {
      runtime.lastScriptId = 'menu.panel.close.pokedex';
      return { close: true, consumed: true };
    }
  }

  if (panel.screen === 'orderedList') {
    if (panel.orderEntries.length > 0) {
      if (input.upPressed) {
        const len = panel.orderEntries.length;
        const r = listMenuStepFireRed(
          len,
          POKEDEX_ORDERED_LIST_MAX_SHOWED,
          panel.orderListCursorPos,
          panel.orderListItemsAbove,
          false,
          () => false
        );
        if (r.moved) {
          panel.orderListCursorPos = r.cursorPos;
          panel.orderListItemsAbove = r.itemsAbove;
          panel.orderSelectedIndex = r.cursorPos + r.itemsAbove;
          runtime.pokedex.selectedIndex = panel.orderSelectedIndex;
          runtime.pokedex.orderListCursorPos = r.cursorPos;
          runtime.pokedex.orderListItemsAbove = r.itemsAbove;
        }
        runtime.lastScriptId = 'menu.pokedex.order.move';
        return { close: false, consumed: true };
      }

      if (input.downPressed) {
        const len = panel.orderEntries.length;
        const r = listMenuStepFireRed(
          len,
          POKEDEX_ORDERED_LIST_MAX_SHOWED,
          panel.orderListCursorPos,
          panel.orderListItemsAbove,
          true,
          () => false
        );
        if (r.moved) {
          panel.orderListCursorPos = r.cursorPos;
          panel.orderListItemsAbove = r.itemsAbove;
          panel.orderSelectedIndex = r.cursorPos + r.itemsAbove;
          runtime.pokedex.selectedIndex = panel.orderSelectedIndex;
          runtime.pokedex.orderListCursorPos = r.cursorPos;
          runtime.pokedex.orderListItemsAbove = r.itemsAbove;
        }
        runtime.lastScriptId = 'menu.pokedex.order.move';
        return { close: false, consumed: true };
      }
    }

    if (input.interactPressed && panel.orderEntries.length > 0) {
      const selectedEntry = panel.orderEntries[panel.orderSelectedIndex];
      if (!selectedEntry?.seen) {
        return { close: false, consumed: true };
      }

      if (panel.orderedListMode === 'numerical') {
        openPokedexEntry(panel, selectedEntry.species, 'orderedList');
        runtime.lastScriptId = 'menu.pokedex.entry.open';
        return { close: false, consumed: true };
      }

      const location = findPokedexCategoryLocation(
        selectedEntry.species,
        panel.dexMode,
        runtime.pokedex.seenSpecies
      );
      if (!location) {
        runtime.lastScriptId = 'menu.pokedex.search.unmapped';
        return { close: false, consumed: true };
      }

      setPokedexCategoryPage(
        panel,
        runtime,
        location.categoryId,
        location.pageIndex,
        location.cursorIndex,
        'orderedList'
      );
      runtime.lastScriptId = 'menu.pokedex.search.category';
      return { close: false, consumed: true };
    }

    if (input.cancelPressed || input.startPressed) {
      panel.screen = 'topMenu';
      panel.description = '';
      runtime.lastScriptId = 'menu.pokedex.order.close';
      return { close: false, consumed: true };
    }
  }

  if (panel.screen === 'categoryPage') {
    if (panel.categorySpecies.length > 0 && input.interactPressed) {
      openPokedexEntry(panel, panel.categorySpecies[panel.categoryCursorIndex] ?? panel.categorySpecies[0], 'categoryPage');
      runtime.lastScriptId = 'menu.pokedex.entry.open';
      return { close: false, consumed: true };
    }

    if (input.cancelPressed || input.startPressed) {
      panel.screen = panel.categoryReturnScreen;
      runtime.lastScriptId = 'menu.pokedex.category.close';
      return { close: false, consumed: true };
    }

    const unlockedPageIndices = panel.categoryId
      ? getUnlockedPokedexCategoryPageIndices(panel.categoryId, panel.dexMode, runtime.pokedex.seenSpecies)
      : [];
    const currentPagePosition = unlockedPageIndices.indexOf(panel.categoryPageIndex);

    if (input.leftPressed) {
      if (panel.categoryCursorIndex > 0) {
        panel.categoryCursorIndex -= 1;
        panel.entrySpecies = panel.categorySpecies[panel.categoryCursorIndex] ?? null;
        runtime.lastScriptId = 'menu.pokedex.category.move';
        return { close: false, consumed: true };
      }

      if (currentPagePosition > 0 && panel.categoryId) {
        setPokedexCategoryPage(
          panel,
          runtime,
          panel.categoryId,
          unlockedPageIndices[currentPagePosition - 1] ?? panel.categoryPageIndex,
          Number.MAX_SAFE_INTEGER,
          panel.categoryReturnScreen
        );
        runtime.lastScriptId = 'menu.pokedex.category.page';
        return { close: false, consumed: true };
      }
    }

    if (input.rightPressed) {
      if (panel.categoryCursorIndex < panel.categorySpecies.length - 1) {
        panel.categoryCursorIndex += 1;
        panel.entrySpecies = panel.categorySpecies[panel.categoryCursorIndex] ?? null;
        runtime.lastScriptId = 'menu.pokedex.category.move';
        return { close: false, consumed: true };
      }

      if (currentPagePosition >= 0 && currentPagePosition < unlockedPageIndices.length - 1 && panel.categoryId) {
        setPokedexCategoryPage(
          panel,
          runtime,
          panel.categoryId,
          unlockedPageIndices[currentPagePosition + 1] ?? panel.categoryPageIndex,
          0,
          panel.categoryReturnScreen
        );
        runtime.lastScriptId = 'menu.pokedex.category.page';
        return { close: false, consumed: true };
      }
    }
  }

  if (panel.screen === 'entry') {
    if (input.leftPressed || input.rightPressed) {
      panel.entryPageIndex = panel.entryPageIndex === 0 ? 1 : 0;
      runtime.lastScriptId = 'menu.pokedex.entry.page';
      return { close: false, consumed: true };
    }

    if (panel.entryReturnScreen === 'orderedList' && panel.orderEntries.length > 0 && (input.upPressed || input.downPressed)) {
      const len = panel.orderEntries.length;
      const r = listMenuStepFireRed(
        len,
        POKEDEX_ORDERED_LIST_MAX_SHOWED,
        panel.orderListCursorPos,
        panel.orderListItemsAbove,
        input.downPressed,
        () => false
      );
      if (r.moved) {
        panel.orderListCursorPos = r.cursorPos;
        panel.orderListItemsAbove = r.itemsAbove;
        panel.orderSelectedIndex = r.cursorPos + r.itemsAbove;
        runtime.pokedex.selectedIndex = panel.orderSelectedIndex;
        runtime.pokedex.orderListCursorPos = r.cursorPos;
        runtime.pokedex.orderListItemsAbove = r.itemsAbove;
      }
      openPokedexEntry(panel, panel.orderEntries[panel.orderSelectedIndex]?.species ?? panel.entrySpecies ?? '', 'orderedList');
      runtime.lastScriptId = 'menu.pokedex.entry.move';
      return { close: false, consumed: true };
    }

    if (input.interactPressed && panel.entrySpecies) {
      panel.screen = 'area';
      panel.areaMarkers = getPokedexAreaMarkers(panel.entrySpecies);
      runtime.lastScriptId = 'menu.pokedex.area.open';
      return { close: false, consumed: true };
    }

    if (input.cancelPressed || input.startPressed) {
      panel.screen = panel.entryReturnScreen;
      runtime.lastScriptId = 'menu.pokedex.entry.close';
      return { close: false, consumed: true };
    }
  }

  if (panel.screen === 'area') {
    if (input.interactPressed) {
      panel.screen = panel.entryReturnScreen;
      runtime.lastScriptId = 'menu.pokedex.area.previous';
      return { close: false, consumed: true };
    }

    if (input.cancelPressed || input.startPressed) {
      panel.screen = 'entry';
      runtime.lastScriptId = 'menu.pokedex.area.close';
      return { close: false, consumed: true };
    }
  }

  return { close: false, consumed: false };
};

const stepSummaryPanel = (
  panel: SummaryPanelState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState,
  callbacks: StartMenuCallbacks
): { close: boolean; consumed: boolean } => {
  const summary = callbacks.getPlayerSummary?.() ?? {
    name: runtime.startMenu.playerName,
    money: Math.max(0, Math.trunc(runtime.vars.money ?? 3000)),
    badges: Math.max(0, Math.trunc(runtime.vars.badges ?? 0)),
    playTimeMinutes: Math.max(0, Math.floor((runtime.vars.playTimeSeconds ?? 0) / 60)),
    location: 'FIELD',
    saveCount: runtime.saveCounter,
    profileLines: ['KANTO TRAINER', 'ADVENTURE IN PROGRESS']
  };

  /** `Task_TrainerCard` (`trainer_card.c`): front — A flips; B closes. Back — B flips; A closes. */
  if (panel.pageIndex === 0) {
    if (input.interactPressed) {
      panel.pageIndex = 1;
      updatePlayerSummaryPanel(panel, summary);
      runtime.lastScriptId = 'menu.player.flip';
      return { close: false, consumed: true };
    }
  } else if (input.cancelPressed) {
    panel.pageIndex = 0;
    updatePlayerSummaryPanel(panel, summary);
    runtime.lastScriptId = 'menu.player.flip';
    return { close: false, consumed: true };
  } else if (input.interactPressed) {
    runtime.lastScriptId = `menu.panel.close.${panel.id.toLowerCase()}`;
    return { close: true, consumed: true };
  }

  if (input.cancelPressed || input.startPressed) {
    runtime.lastScriptId = `menu.panel.close.${panel.id.toLowerCase()}`;
    return { close: true, consumed: true };
  }

  return { close: false, consumed: false };
};

export const createStartMenuState = (): StartMenuState => ({
  active: false,
  options: [],
  selectedIndex: 0,
  panel: null
});

export const openStartMenu = (menu: StartMenuState, runtime: ScriptRuntimeState): void => {
  menu.options = buildOptions(runtime);
  menu.active = true;
  menu.selectedIndex = 0;
};

const reopenStartMenu = (menu: StartMenuState, runtime: ScriptRuntimeState): void => {
  const selectedId = menu.options[menu.selectedIndex]?.id ?? null;
  menu.options = buildOptions(runtime);
  menu.active = true;
  if (!selectedId) {
    menu.selectedIndex = Math.max(0, Math.min(menu.selectedIndex, menu.options.length - 1));
    return;
  }

  const nextIndex = menu.options.findIndex((entry) => entry.id === selectedId);
  menu.selectedIndex = nextIndex >= 0 ? nextIndex : Math.max(0, Math.min(menu.selectedIndex, menu.options.length - 1));
};

export const closeStartMenu = (menu: StartMenuState): void => {
  menu.active = false;
};

export const closeMenuPanel = (menu: StartMenuState): void => {
  menu.panel = null;
};

export const isStartMenuBlockingWorld = (menu: StartMenuState): boolean => menu.active || !!menu.panel;

const moveSelection = (menu: StartMenuState, direction: -1 | 1): void => {
  const optionCount = menu.options.length;
  if (optionCount === 0) {
    menu.selectedIndex = 0;
    return;
  }

  menu.selectedIndex = (menu.selectedIndex + direction + optionCount) % optionCount;
};

export const getOptionPanelRows = (runtime: ScriptRuntimeState): string[] => [
  `TEXT SPEED   ${getTextSpeedLabel(runtime.options.textSpeed)}`,
  `BATTLE SCENE ${runtime.options.battleScene ? 'ON' : 'OFF'}`,
  `BATTLE STYLE ${getBattleStyleLabel(runtime.options.battleStyle)}`,
  `SOUND        ${getSoundLabel(runtime.options.sound)}`,
  `BUTTON MODE  ${getButtonModeLabel(runtime.options.buttonMode)}`,
  `FRAME        TYPE ${runtime.options.frameType + 1}`,
  'CANCEL'
];

const updateOptionPanelRows = (panel: OptionPanelState, runtime: ScriptRuntimeState): void => {
  panel.rows = getOptionPanelRows(runtime);
};

export const stepStartMenu = (
  menu: StartMenuState,
  input: InputSnapshot,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  callbacks: StartMenuCallbacks = {}
): void => {
  if (menu.panel) {
    if (menu.panel.kind === 'bag') {
      const bagStep = stepBagPanel(menu.panel, runtime.bag, input);
      if (bagStep.scriptId) {
        runtime.lastScriptId = bagStep.scriptId;
      }

      if (bagStep.close) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
      }
      return;
    }

    if (menu.panel.kind === 'save') {
      if (menu.panel.stage !== 'result' && (input.upPressed || input.downPressed)) {
        menu.panel.selectedIndex = menu.panel.selectedIndex === 0 ? 1 : 0;
        runtime.lastScriptId = 'menu.save.choice.move';
        return;
      }

      if (input.interactPressed && menu.panel.stage !== 'result') {
        const choseYes = menu.panel.selectedIndex === 0;
        if (!choseYes) {
          const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
          runtime.lastScriptId = 'menu.save.cancelled';
          closeMenuPanel(menu);
          if (shouldReturnToMenu) {
            reopenStartMenu(menu, runtime);
          }
          return;
        }

        if (menu.panel.stage === 'ask') {
          if (runtime.saveCounter > 0) {
            menu.panel.stage = 'overwrite';
            menu.panel.prompt = 'There is already a save file. Overwrite it?';
            menu.panel.description = menu.panel.prompt;
            menu.panel.selectedIndex = 0;
          } else {
            const result = callbacks.onSaveConfirmed?.();
            if (result) {
              menu.panel.stage = 'result';
              menu.panel.description = result.summary;
              runtime.lastScriptId = result.ok ? 'menu.save.success' : 'menu.save.failed';
            }
          }
          return;
        }

        if (menu.panel.stage === 'overwrite') {
          const result = callbacks.onSaveConfirmed?.();
          if (result) {
            menu.panel.stage = 'result';
            menu.panel.description = result.summary;
            runtime.lastScriptId = result.ok ? 'menu.save.success' : 'menu.save.failed';
          }
          return;
        }
      }

      if (input.cancelPressed || input.startPressed || (input.interactPressed && menu.panel.stage === 'result')) {
        const shouldReturnToMenu = menu.panel.stage === 'result' ? false : menu.panel.returnToMenuOnClose;
        runtime.lastScriptId = `menu.panel.close.${menu.panel.id.toLowerCase()}`;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
      }
      return;
    }

    if (menu.panel.kind === 'options') {
      const optionStep = stepOptionPanel(menu.panel, input, runtime);
      if (optionStep.close) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        runtime.lastScriptId = `menu.panel.close.${menu.panel.id.toLowerCase()}`;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
        return;
      }

      if (optionStep.consumed) {
        return;
      }
    }

    if (menu.panel.kind === 'retire') {
      const retireStep = stepRetirePanel(menu.panel, input, runtime, callbacks);
      if (retireStep.close) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose || retireStep.returnToMenu;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
      }
      if (retireStep.consumed) {
        return;
      }
    }

    if (menu.panel.kind === 'party') {
      const partyStep = stepPartyPanel(menu.panel, input, runtime);
      if (partyStep.swap) {
        callbacks.onPartySwap?.(partyStep.swap.fromIndex, partyStep.swap.toIndex);
      }
      if (partyStep.close) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
      }
      if (partyStep.consumed) {
        return;
      }
    }

    if (menu.panel.kind === 'pokedex') {
      const pokedexStep = stepPokedexPanel(menu.panel, input, runtime);
      if (pokedexStep.close) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
      }
      if (pokedexStep.consumed) {
        return;
      }
    }

    if (menu.panel.kind === 'summary') {
      const summaryStep = stepSummaryPanel(menu.panel, input, runtime, callbacks);
      if (summaryStep.close) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          reopenStartMenu(menu, runtime);
        }
      }
      if (summaryStep.consumed) {
        return;
      }
    }
    return;
  }

  if (!menu.active) {
    if (!input.startPressed) {
      return;
    }

    // In field_control_avatar.c, START during a text script first cancels message flow
    // before returning control. We mimic that by closing our dialogue stub first.
    if (dialogue.active) {
      closeDialogue(dialogue);
    }

    openStartMenu(menu, runtime);
    runtime.lastScriptId = 'menu.open.start';
    return;
  }

  if (input.startPressed || input.cancelPressed) {
    closeStartMenu(menu);
    runtime.lastScriptId = 'menu.close.start';
    return;
  }

  if (input.upPressed) {
    moveSelection(menu, -1);
  } else if (input.downPressed) {
    moveSelection(menu, 1);
  }

  if (!input.interactPressed) {
    return;
  }

  const selected = menu.options[menu.selectedIndex];
  if (!selected) {
    return;
  }

  if (selected.id === 'POKEDEX' && runtime.startMenu.seenPokemonCount === 0) {
    runtime.lastScriptId = 'menu.pokedex.locked.empty';
    return;
  }

  if (selected.id === 'EXIT') {
    closeStartMenu(menu);
    runtime.lastScriptId = 'menu.exit';
    return;
  }

  closeStartMenu(menu);

  if (selected.id === 'SAVE') {
    menu.panel = {
      kind: 'save',
      id: 'SAVE',
      title: panelTitle('SAVE'),
      stage: 'ask',
      prompt: 'Would you like to save the game?',
      description: 'Would you like to save the game?',
      selectedIndex: 0,
      returnToMenuOnClose: true
    };
    runtime.lastScriptId = 'menu.open.save';
    return;
  }

  if (selected.id === 'OPTION') {
    menu.panel = {
      kind: 'options',
      id: 'OPTION',
      title: panelTitle('OPTION'),
      description: `TEXT SPEED: ${getTextSpeedLabel(runtime.options.textSpeed)}`,
      rows: getOptionPanelRows(runtime),
      selectedIndex: 0,
      settingOrder: ['textSpeed', 'battleScene', 'battleStyle', 'sound', 'buttonMode', 'frameType', 'cancel'],
      returnToMenuOnClose: true
    };
    runtime.lastScriptId = 'menu.open.option';
    return;
  }

  if (selected.id === 'RETIRE') {
    menu.panel = {
      kind: 'retire',
      id: 'RETIRE',
      title: panelTitle('RETIRE'),
      description: 'Retire from the SAFARI GAME and return to the counter?',
      rows: ['YES', 'NO'],
      selectedIndex: 1,
      returnToMenuOnClose: false
    };
    runtime.lastScriptId = 'menu.open.retire';
    return;
  }

  if (selected.id === 'BAG') {
    menu.panel = createBagPanelState(true);
    runtime.lastScriptId = 'menu.open.bag';
    return;
  }

  if (selected.id === 'POKEDEX') {
    menu.panel = createPokedexPanel(runtime);
    runtime.lastScriptId = 'menu.open.pokedex';
    return;
  }

  if (selected.id === 'POKEMON') {
    menu.panel = createPartyPanel(callbacks.getPartyMembers?.() ?? createDefaultPartyMembers());
    runtime.lastScriptId = 'menu.open.pokemon';
    return;
  }

  menu.panel = createPlayerSummaryPanel(callbacks.getPlayerSummary?.() ?? {
    name: runtime.startMenu.playerName,
    money: Math.max(0, Math.trunc(runtime.vars.money ?? 3000)),
    badges: Math.max(0, Math.trunc(runtime.vars.badges ?? 0)),
    playTimeMinutes: Math.max(0, Math.trunc(runtime.vars.playTimeMinutes ?? 0)),
    location: 'FIELD',
    saveCount: runtime.saveCounter,
    profileLines: ['KANTO TRAINER', 'ADVENTURE IN PROGRESS']
  });
  runtime.lastScriptId = `menu.open.${selected.id.toLowerCase()}`;
};
